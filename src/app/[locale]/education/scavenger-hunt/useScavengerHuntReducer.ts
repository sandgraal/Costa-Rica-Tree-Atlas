import { useReducer } from "react";

// Types
export type ViewMode = "setup" | "hunt" | "mission" | "results";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface CompletedMission {
  missionId: string;
  treeSlug?: string;
  answer?: string;
  timestamp: string;
  pointsEarned: number;
  bonusPoints: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
  completedMissions: CompletedMission[];
  totalPoints: number;
  streak: number;
}

export interface HuntSession {
  teams: Team[];
  currentTeamIndex: number;
  startTime: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  activeMissions: string[];
  completedMissions: string[];
}

export interface ScavengerHuntState {
  view: ViewMode;
  session: HuntSession | null;
  selectedMission: string | null;
  searchQuery: string;
  missionAnswer: string;
  showHint: boolean;
  missionTimer: number | null;

  // Setup state
  setup: {
    teamCount: number;
    teamNames: string[];
    teamMembers: TeamMember[][];
    difficulty: "easy" | "medium" | "hard" | "mixed";
    missionCount: number;
    newMemberName: string;
    editingTeam: number | null;
  };
}

// Action types
export type ScavengerHuntAction =
  | { type: "SET_VIEW"; payload: ViewMode }
  | { type: "START_SESSION"; payload: HuntSession }
  | { type: "LOAD_SESSION"; payload: HuntSession }
  | { type: "SELECT_MISSION"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_MISSION_ANSWER"; payload: string }
  | { type: "TOGGLE_HINT" }
  | { type: "SET_TIMER"; payload: number | null }
  | { type: "UPDATE_SETUP"; payload: Partial<ScavengerHuntState["setup"]> }
  | {
      type: "SET_TEAM_COUNT";
      payload: number;
    }
  | {
      type: "UPDATE_TEAM_NAME";
      payload: { index: number; name: string };
    }
  | {
      type: "ADD_TEAM_MEMBER";
      payload: { teamIndex: number; member: TeamMember };
    }
  | {
      type: "REMOVE_TEAM_MEMBER";
      payload: { teamIndex: number; memberId: string };
    }
  | { type: "SET_NEW_MEMBER_NAME"; payload: string }
  | { type: "SET_EDITING_TEAM"; payload: number | null }
  | {
      type: "COMPLETE_MISSION";
      payload: { missionId: string; treeSlug: string; points: number };
    }
  | { type: "SKIP_MISSION" }
  | { type: "END_SESSION" }
  | { type: "RESET" };

// Initial state
const initialState: ScavengerHuntState = {
  view: "setup",
  session: null,
  selectedMission: null,
  searchQuery: "",
  missionAnswer: "",
  showHint: false,
  missionTimer: null,
  setup: {
    teamCount: 2,
    teamNames: ["", ""],
    teamMembers: [[], []],
    difficulty: "mixed",
    missionCount: 5,
    newMemberName: "",
    editingTeam: null,
  },
};

// Reducer
function scavengerHuntReducer(
  state: ScavengerHuntState,
  action: ScavengerHuntAction
): ScavengerHuntState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload };

    case "START_SESSION":
      return {
        ...state,
        view: "hunt",
        session: action.payload,
        searchQuery: "",
      };

    case "LOAD_SESSION":
      return {
        ...state,
        view: "hunt",
        session: action.payload,
      };

    case "SELECT_MISSION":
      return {
        ...state,
        view: action.payload ? "mission" : "hunt",
        selectedMission: action.payload,
        missionAnswer: "",
        showHint: false,
        searchQuery: "",
      };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_MISSION_ANSWER":
      return { ...state, missionAnswer: action.payload };

    case "TOGGLE_HINT":
      return { ...state, showHint: !state.showHint };

    case "SET_TIMER":
      return { ...state, missionTimer: action.payload };

    case "UPDATE_SETUP":
      return {
        ...state,
        setup: { ...state.setup, ...action.payload },
      };

    case "SET_TEAM_COUNT": {
      const count = action.payload;
      const newTeamNames = [...state.setup.teamNames];
      const newTeamMembers = [...state.setup.teamMembers];

      while (newTeamNames.length < count) newTeamNames.push("");
      while (newTeamMembers.length < count) newTeamMembers.push([]);

      return {
        ...state,
        setup: {
          ...state.setup,
          teamCount: count,
          teamNames: newTeamNames.slice(0, count),
          teamMembers: newTeamMembers.slice(0, count),
        },
      };
    }

    case "UPDATE_TEAM_NAME": {
      const newTeamNames = [...state.setup.teamNames];
      newTeamNames[action.payload.index] = action.payload.name;
      return {
        ...state,
        setup: { ...state.setup, teamNames: newTeamNames },
      };
    }

    case "ADD_TEAM_MEMBER": {
      const newTeamMembers = [...state.setup.teamMembers];
      newTeamMembers[action.payload.teamIndex] = [
        ...newTeamMembers[action.payload.teamIndex],
        action.payload.member,
      ];
      return {
        ...state,
        setup: {
          ...state.setup,
          teamMembers: newTeamMembers,
          newMemberName: "",
        },
      };
    }

    case "REMOVE_TEAM_MEMBER": {
      const newTeamMembers = [...state.setup.teamMembers];
      newTeamMembers[action.payload.teamIndex] = newTeamMembers[
        action.payload.teamIndex
      ].filter((m) => m.id !== action.payload.memberId);
      return {
        ...state,
        setup: { ...state.setup, teamMembers: newTeamMembers },
      };
    }

    case "SET_NEW_MEMBER_NAME":
      return {
        ...state,
        setup: { ...state.setup, newMemberName: action.payload },
      };

    case "SET_EDITING_TEAM":
      return {
        ...state,
        setup: { ...state.setup, editingTeam: action.payload },
      };

    case "COMPLETE_MISSION": {
      if (!state.session) return state;

      const currentTeam = state.session.teams[state.session.currentTeamIndex];
      const bonusPoints =
        currentTeam.streak > 0 ? Math.min(currentTeam.streak * 10, 50) : 0;
      const hintPenalty = state.showHint ? 20 : 0;
      const pointsEarned = action.payload.points - hintPenalty + bonusPoints;

      const completedMission: CompletedMission = {
        missionId: action.payload.missionId,
        treeSlug: action.payload.treeSlug,
        timestamp: new Date().toISOString(),
        pointsEarned,
        bonusPoints,
      };

      const updatedTeams = state.session.teams.map((team, i) => {
        if (i === state.session!.currentTeamIndex) {
          return {
            ...team,
            completedMissions: [...team.completedMissions, completedMission],
            totalPoints: team.totalPoints + pointsEarned,
            streak: team.streak + 1,
          };
        }
        return team;
      });

      const updatedSession = {
        ...state.session,
        teams: updatedTeams,
        completedMissions: [
          ...state.session.completedMissions,
          action.payload.missionId,
        ],
        activeMissions: state.session.activeMissions.filter(
          (id) => id !== action.payload.missionId
        ),
      };

      // Check if hunt is complete
      if (updatedSession.activeMissions.length === 0) {
        return {
          ...state,
          session: updatedSession,
          view: "results",
          selectedMission: null,
          missionAnswer: "",
          showHint: false,
        };
      } else {
        // Move to next team
        const nextTeamIndex =
          (state.session.currentTeamIndex + 1) % state.session.teams.length;
        return {
          ...state,
          session: { ...updatedSession, currentTeamIndex: nextTeamIndex },
          view: "hunt",
          selectedMission: null,
          missionAnswer: "",
          showHint: false,
        };
      }
    }

    case "SKIP_MISSION": {
      if (!state.session) return state;

      // Reset streak for current team
      const updatedTeams = state.session.teams.map((team, i) => {
        if (i === state.session!.currentTeamIndex) {
          return { ...team, streak: 0 };
        }
        return team;
      });

      // Move to next team
      const nextTeamIndex =
        (state.session.currentTeamIndex + 1) % state.session.teams.length;

      return {
        ...state,
        session: {
          ...state.session,
          teams: updatedTeams,
          currentTeamIndex: nextTeamIndex,
        },
        selectedMission: null,
        view: "hunt",
      };
    }

    case "END_SESSION":
      return {
        ...state,
        view: "results",
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// Custom hook
export function useScavengerHuntReducer() {
  return useReducer(scavengerHuntReducer, initialState);
}
