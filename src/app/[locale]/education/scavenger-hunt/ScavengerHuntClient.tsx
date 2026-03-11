"use client";
/* eslint-disable security/detect-object-injection -- scavenger-hunt uses constrained ids/keys in typed mission and team dictionaries */

import { useEffect, useReducer, useState } from "react";
import { triggerConfetti, injectEducationStyles } from "@/lib/education";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  ScavengerHuntLessonData,
  MissionDisplayData,
} from "./scavenger-hunt-data";
import {
  MISSION_VALIDATORS,
  STORAGE_KEY,
  AVATARS,
  TEAM_COLORS,
  type ScavengerHuntTree,
} from "./scavenger-hunt-validators";
import { SetupView } from "./SetupView";
import { HuntView } from "./HuntView";
import { MissionView } from "./MissionView";
import { ResultsView } from "./ResultsView";

type Tree = ScavengerHuntTree;

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface CompletedMission {
  missionId: string;
  treeSlug?: string;
  answer?: string;
  timestamp: string;
  pointsEarned: number;
  bonusPoints: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
  completedMissions: CompletedMission[];
  totalPoints: number;
  streak: number;
}

interface HuntSession {
  teams: Team[];
  currentTeamIndex: number;
  startTime: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  activeMissions: string[];
  completedMissions: string[];
}

interface ScavengerHuntClientProps {
  trees: Tree[];
  locale: string;
  lessonData: ScavengerHuntLessonData;
}

// State and Action types for reducer
interface SetupState {
  teamCount: number;
  teamNames: string[];
  teamMembers: TeamMember[][];
  difficulty: "easy" | "medium" | "hard" | "mixed";
  missionCount: number;
  newMemberName: string;
  editingTeam: number | null;
}

interface AppState {
  view: "setup" | "hunt" | "mission" | "results";
  session: HuntSession | null;
  selectedMission: string | null;
  missionTimer: number | null;
  showHint: boolean;
  setup: SetupState;
}

type Action =
  | { type: "LOAD_SESSION"; payload: HuntSession }
  | { type: "SET_VIEW"; payload: "setup" | "hunt" | "mission" | "results" }
  | { type: "SET_TEAM_COUNT"; payload: number }
  | {
      type: "ADD_TEAM_MEMBER";
      payload: { teamIndex: number; member: TeamMember };
    }
  | {
      type: "REMOVE_TEAM_MEMBER";
      payload: { teamIndex: number; memberId: string };
    }
  | { type: "SET_EDITING_TEAM"; payload: number | null }
  | { type: "SET_NEW_MEMBER_NAME"; payload: string }
  | { type: "UPDATE_TEAM_NAME"; payload: { index: number; name: string } }
  | { type: "UPDATE_SETUP"; payload: Partial<SetupState> }
  | { type: "START_SESSION"; payload: HuntSession }
  | { type: "SELECT_MISSION"; payload: string }
  | { type: "SET_TIMER"; payload: number | null }
  | { type: "TOGGLE_HINT" }
  | {
      type: "COMPLETE_MISSION";
      payload: { missionId: string; treeSlug: string; points: number };
    }
  | { type: "SKIP_MISSION" }
  | { type: "END_SESSION" }
  | { type: "RESET" };

const initialState: AppState = {
  view: "setup",
  session: null,
  selectedMission: null,
  missionTimer: null,
  showHint: false,
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

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_SESSION":
      return {
        ...state,
        session: action.payload,
        view: "hunt",
      };

    case "SET_VIEW":
      return {
        ...state,
        view: action.payload,
      };

    case "SET_TEAM_COUNT": {
      const count = Math.max(2, Math.min(4, action.payload));
      return {
        ...state,
        setup: {
          ...state.setup,
          teamCount: count,
          teamNames: Array.from(
            { length: count },
            (_, i) => state.setup.teamNames[i] || ""
          ),
          teamMembers: Array.from(
            { length: count },
            (_, i) => state.setup.teamMembers[i] || []
          ),
        },
      };
    }

    case "ADD_TEAM_MEMBER": {
      const { teamIndex, member } = action.payload;
      const newMembers = [...state.setup.teamMembers];
      newMembers[teamIndex] = [...newMembers[teamIndex], member];
      return {
        ...state,
        setup: {
          ...state.setup,
          teamMembers: newMembers,
          newMemberName: "",
        },
      };
    }

    case "REMOVE_TEAM_MEMBER": {
      const { teamIndex, memberId } = action.payload;
      const newMembers = [...state.setup.teamMembers];
      newMembers[teamIndex] = newMembers[teamIndex].filter(
        (m) => m.id !== memberId
      );
      return {
        ...state,
        setup: {
          ...state.setup,
          teamMembers: newMembers,
        },
      };
    }

    case "SET_EDITING_TEAM":
      return {
        ...state,
        setup: {
          ...state.setup,
          editingTeam: action.payload,
          newMemberName: "",
        },
      };

    case "SET_NEW_MEMBER_NAME":
      return {
        ...state,
        setup: {
          ...state.setup,
          newMemberName: action.payload,
        },
      };

    case "UPDATE_TEAM_NAME": {
      const { index, name } = action.payload;
      const newNames = [...state.setup.teamNames];
      newNames[index] = name;
      return {
        ...state,
        setup: {
          ...state.setup,
          teamNames: newNames,
        },
      };
    }

    case "UPDATE_SETUP":
      return {
        ...state,
        setup: {
          ...state.setup,
          ...action.payload,
        },
      };

    case "START_SESSION":
      return {
        ...state,
        session: action.payload,
        view: "hunt",
      };

    case "SELECT_MISSION":
      return {
        ...state,
        selectedMission: action.payload,
        view: "mission",
        showHint: false,
      };

    case "SET_TIMER":
      return {
        ...state,
        missionTimer: action.payload,
      };

    case "TOGGLE_HINT":
      return {
        ...state,
        showHint: !state.showHint,
      };

    case "COMPLETE_MISSION": {
      if (!state.session) return state;

      const { missionId, treeSlug, points } = action.payload;

      // Add completed mission to team
      const completedMission: CompletedMission = {
        missionId,
        treeSlug,
        timestamp: new Date().toISOString(),
        pointsEarned: points,
        bonusPoints: state.showHint ? 0 : 20, // Bonus if no hint used
      };

      const updatedTeams = state.session.teams.map((team, index) =>
        index === state.session?.currentTeamIndex
          ? {
              ...team,
              completedMissions: [...team.completedMissions, completedMission],
              totalPoints:
                team.totalPoints + points + completedMission.bonusPoints,
              streak: team.streak + 1,
            }
          : team
      );

      return {
        ...state,
        session: {
          ...state.session,
          teams: updatedTeams,
          completedMissions: [...state.session.completedMissions, missionId],
        },
        view: "hunt",
        selectedMission: null,
        missionTimer: null,
        showHint: false,
      };
    }

    case "SKIP_MISSION":
      return {
        ...state,
        view: "hunt",
        selectedMission: null,
        missionTimer: null,
        showHint: false,
      };

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

export default function ScavengerHuntClient({
  trees,
  locale,
  lessonData,
}: ScavengerHuntClientProps) {
  // Use reducer for complex state management
  const [state, dispatch] = useReducer(reducer, initialState);

  // Local state that doesn't need to be in reducer
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Destructure server-provided lesson data (labels + mission display data)
  const { labels: t, missions } = lessonData;

  // Load saved session
  useEffect(() => {
    injectEducationStyles();
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        dispatch({ type: "LOAD_SESSION", payload: data });
      }
    } catch (e) {
      console.error("Failed to load session:", e);
    }
  }, []);

  // Save session
  useEffect(() => {
    if (state.session) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    }
  }, [state.session]);

  // Mission timer
  useEffect(() => {
    if (state.missionTimer === null || state.missionTimer <= 0) return;

    const interval = setInterval(() => {
      dispatch({
        type: "SET_TIMER",
        payload: state.missionTimer !== null ? state.missionTimer - 1 : null,
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [state.missionTimer]);

  const handleTeamCountChange = (count: number) => {
    dispatch({ type: "SET_TEAM_COUNT", payload: count });
  };

  const addTeamMember = (teamIndex: number) => {
    if (!state.setup.newMemberName.trim()) return;

    const member = {
      id: Date.now().toString(),
      name: state.setup.newMemberName.trim(),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    };

    dispatch({ type: "ADD_TEAM_MEMBER", payload: { teamIndex, member } });
  };

  const removeTeamMember = (teamIndex: number, memberId: string) => {
    dispatch({ type: "REMOVE_TEAM_MEMBER", payload: { teamIndex, memberId } });
  };

  const startHunt = () => {
    // Filter missions by difficulty
    const availableMissions = missions.filter(
      (m) =>
        state.setup.difficulty === "mixed" ||
        m.difficulty === state.setup.difficulty
    );

    // Randomly select missions
    const shuffled = [...availableMissions].sort(() => Math.random() - 0.5);
    const selectedMissions = shuffled.slice(0, state.setup.missionCount);

    const newSession: HuntSession = {
      teams: state.setup.teamNames.map((name, i) => ({
        id: `team-${i}`,
        name: name || `${locale === "es" ? "Equipo" : "Team"} ${i + 1}`,
        color: TEAM_COLORS[i % TEAM_COLORS.length].name,
        members: state.setup.teamMembers[i],
        completedMissions: [],
        totalPoints: 0,
        streak: 0,
      })),
      currentTeamIndex: 0,
      startTime: new Date().toISOString(),
      difficulty: state.setup.difficulty,
      activeMissions: selectedMissions.map((m) => m.id),
      completedMissions: [],
    };

    dispatch({ type: "START_SESSION", payload: newSession });
  };

  const selectMissionHandler = (mission: MissionDisplayData) => {
    dispatch({ type: "SELECT_MISSION", payload: mission.id });
    dispatch({
      type: "SET_TIMER",
      payload: mission.timeLimit ? mission.timeLimit * 60 : null,
    });
  };

  const submitMissionAnswer = (treeSlug: string) => {
    if (!state.session || !state.selectedMission) return;

    const mission = missions.find((m) => m.id === state.selectedMission);
    if (!mission) return;

    const validator = MISSION_VALIDATORS[mission.id];
    const validTrees = validator ? validator(trees) : [];
    const isCorrect = validTrees.some((t: Tree) => t.slug === treeSlug);

    if (isCorrect) {
      dispatch({
        type: "COMPLETE_MISSION",
        payload: {
          missionId: mission.id,
          treeSlug,
          points: mission.points,
        },
      });
      triggerConfetti();
    }
  };

  const skipMission = () => {
    dispatch({ type: "SKIP_MISSION" });
  };

  const endHunt = () => {
    dispatch({ type: "END_SESSION" });
  };

  const resetHunt = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear hunt data:", e);
    }
    dispatch({ type: "RESET" });
  };

  // Setup view
  if (state.view === "setup") {
    return (
      <SetupView
        locale={locale}
        labels={t}
        setup={state.setup}
        onTeamCountChange={handleTeamCountChange}
        onTeamNameChange={(index, name) =>
          dispatch({ type: "UPDATE_TEAM_NAME", payload: { index, name } })
        }
        onAddMember={addTeamMember}
        onRemoveMember={removeTeamMember}
        onSetEditingTeam={(teamIndex) =>
          dispatch({ type: "SET_EDITING_TEAM", payload: teamIndex })
        }
        onSetNewMemberName={(name) =>
          dispatch({ type: "SET_NEW_MEMBER_NAME", payload: name })
        }
        onUpdateSetup={(updates) =>
          dispatch({ type: "UPDATE_SETUP", payload: updates })
        }
        onStartHunt={startHunt}
      />
    );
  }

  // Hunt view (mission selection)
  if (state.view === "hunt" && state.session) {
    return (
      <HuntView
        session={state.session}
        missions={missions}
        labels={t}
        onSelectMission={selectMissionHandler}
        onEndHunt={endHunt}
      />
    );
  }

  // Mission view
  if (state.view === "mission" && state.session && state.selectedMission) {
    const mission = missions.find((m) => m.id === state.selectedMission);
    if (!mission) return null;

    const validator = MISSION_VALIDATORS[mission.id];
    const validTrees = validator ? validator(trees) : [];
    const filteredTrees = trees.filter(
      (tree) =>
        tree.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tree.scientificName
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
    );

    return (
      <MissionView
        mission={mission}
        trees={trees}
        filteredTrees={filteredTrees}
        validTrees={validTrees}
        searchQuery={searchQuery}
        missionTimer={state.missionTimer}
        showHint={state.showHint}
        labels={t}
        onSearchChange={setSearchQuery}
        onSubmitAnswer={submitMissionAnswer}
        onToggleHint={() => dispatch({ type: "TOGGLE_HINT" })}
        onSkip={skipMission}
        onBack={() => dispatch({ type: "SET_VIEW", payload: "hunt" })}
      />
    );
  }

  // Results view
  if (state.view === "results" && state.session) {
    return (
      <ResultsView
        teams={state.session.teams}
        labels={t}
        onPlayAgain={resetHunt}
      />
    );
  }

  return null;
}
