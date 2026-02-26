"use client";

import { useEffect, useReducer, useState } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { triggerConfetti, injectEducationStyles } from "@/lib/education";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  ScavengerHuntLessonData,
  MissionDisplayData,
} from "./scavenger-hunt-data";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  tags?: string[];
  conservationStatus?: string;
  nativeRegion?: string;
  maxHeight?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
  uses?: string[];
}

type MissionValidator = (trees: Tree[], answer?: string) => Tree[];

/**
 * Validator functions for each mission. These are NOT serializable and must
 * live in the client bundle. The display data (title, description, etc.)
 * comes from the server via lessonData prop.
 */
const MISSION_VALIDATORS: Record<string, MissionValidator> = {
  "tall-tree": (trees) =>
    trees.filter((t) => {
      const height = parseInt(t.maxHeight || "0");
      return height >= 30;
    }),
  "flowering-tree": (trees) => {
    const month = new Date().getMonth() + 1;
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const currentMonth = monthNames[month - 1];
    return trees.filter((t) =>
      t.floweringSeason?.some((s) => s.toLowerCase().includes(currentMonth))
    );
  },
  "fruit-tree": (trees) =>
    trees.filter((t) => t.tags?.includes("edible-fruit")),
  "endangered-tree": (trees) =>
    trees.filter((t) => {
      if (!t.conservationStatus) return false;
      const statusCode = t.conservationStatus.toUpperCase().trim();
      return ["VU", "EN", "CR", "NT"].includes(statusCode);
    }),
  "medicinal-tree": (trees) =>
    trees.filter((t) => t.tags?.includes("medicinal")),
  "three-families": (trees) => trees, // Special handling in component
  "native-tree": (trees) => trees.filter((t) => t.tags?.includes("native")),
  "timber-tree": (trees) => trees.filter((t) => t.tags?.includes("timber")),
  "shade-tree": (trees) => trees.filter((t) => t.tags?.includes("shade-tree")),
  "wildlife-tree": (trees) =>
    trees.filter(
      (t) =>
        t.tags?.includes("wildlife-habitat") ||
        t.tags?.includes("attracts-birds")
    ),
  "compound-leaves": (trees) =>
    trees.filter((t) => t.tags?.includes("compound-leaves")),
  "buttress-roots": (trees) =>
    trees.filter((t) => t.tags?.includes("buttress-roots")),
  "dry-forest": (trees) => trees.filter((t) => t.tags?.includes("dry-forest")),
  "fast-growing": (trees) =>
    trees.filter(
      (t) => t.tags?.includes("fast-growing") || t.tags?.includes("pioneer")
    ),
  "nitrogen-fixer": (trees) =>
    trees.filter((t) => t.tags?.includes("nitrogen-fixing")),
};

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

const STORAGE_KEY = "costa-rica-tree-atlas-scavenger-hunt";

const AVATARS = [
  "🦜",
  "🦋",
  "🐸",
  "🦎",
  "🐒",
  "🦥",
  "🐦",
  "🦆",
  "🦢",
  "🦚",
  "🌺",
  "🌸",
];

const TEAM_COLORS = [
  {
    name: "green",
    bg: "bg-green-500",
    text: "text-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
  },
  {
    name: "blue",
    bg: "bg-blue-500",
    text: "text-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "orange",
    bg: "bg-orange-500",
    text: "text-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    name: "purple",
    bg: "bg-purple-500",
    text: "text-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
  },
];

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup view
  if (state.view === "setup") {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg space-y-8">
            {/* Team Count */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.teamCount}
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      handleTeamCountChange(count);
                    }}
                    className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                      state.setup.teamCount === count
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {count} {locale === "es" ? "Equipos" : "Teams"}
                  </button>
                ))}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              {Array.from({ length: state.setup.teamCount }).map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${TEAM_COLORS[i % TEAM_COLORS.length].light} border-${TEAM_COLORS[i % TEAM_COLORS.length].name}-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-4 h-4 rounded-full ${TEAM_COLORS[i % TEAM_COLORS.length].bg}`}
                    />
                    <input
                      type="text"
                      placeholder={`${t.teamNamePlaceholder} ${i + 1}`}
                      value={state.setup.teamNames[i]}
                      onChange={(e) => {
                        dispatch({
                          type: "UPDATE_TEAM_NAME",
                          payload: { index: i, name: e.target.value },
                        });
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  {/* Members */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {state.setup.teamMembers[i].map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-1 px-3 py-1 bg-background rounded-full border border-border"
                      >
                        <span>{member.avatar}</span>
                        <span className="text-sm">{member.name}</span>
                        <button
                          onClick={() => {
                            removeTeamMember(i, member.id);
                          }}
                          className="ml-1 text-muted-foreground hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {state.setup.editingTeam === i ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.memberPlaceholder}
                        value={state.setup.newMemberName}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_NEW_MEMBER_NAME",
                            payload: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && addTeamMember(i)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          addTeamMember(i);
                        }}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          dispatch({ type: "SET_EDITING_TEAM", payload: null });
                        }}
                        className="px-3 py-2 border border-border rounded-lg text-sm"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch({ type: "SET_EDITING_TEAM", payload: i });
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      + {t.addMember}
                    </button>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {state.setup.teamMembers[i].length} {t.members}
                  </div>
                </div>
              ))}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.difficulty}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_SETUP",
                        payload: { difficulty: d },
                      })
                    }
                    className={`py-3 rounded-lg border transition-all text-sm font-medium ${
                      state.setup.difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {d === "easy" && "🟢"} {d === "medium" && "🟡"}{" "}
                    {d === "hard" && "🔴"} {d === "mixed" && "🎲"}
                    <br />
                    {t[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Count */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.missionCount}
              </label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_SETUP",
                        payload: { missionCount: count },
                      })
                    }
                    className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                      state.setup.missionCount === count
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startHunt}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.startHunt}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hunt view (mission selection)
  if (state.view === "hunt" && state.session) {
    const currentTeam = state.session.teams[state.session.currentTeamIndex];
    const teamColor =
      TEAM_COLORS.find((c) => c.name === currentTeam.color) || TEAM_COLORS[0];
    const availableMissions = missions.filter((m) =>
      state.session?.activeMissions.includes(m.id)
    );

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          {/* Current Team Banner */}
          <div
            className={`${teamColor.light} rounded-2xl p-6 mb-6 border border-${currentTeam.color}-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.currentTeam}</p>
                <h2 className={`text-2xl font-bold ${teamColor.text}`}>
                  {currentTeam.name}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>
                    🏆 {currentTeam.totalPoints} {t.points}
                  </span>
                  {currentTeam.streak > 0 && (
                    <span className="text-orange-500">
                      🔥 {t.streak}: {currentTeam.streak}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {currentTeam.members.slice(0, 4).map((m) => (
                  <span key={m.id} className="text-2xl" title={m.name}>
                    {m.avatar}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Mini */}
          <div className="bg-card rounded-xl p-4 mb-6 border border-border">
            <h3 className="text-sm font-medium mb-3">{t.leaderboard}</h3>
            <div className="flex gap-4">
              {[...state.session.teams]
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((team, i) => {
                  const color = TEAM_COLORS.find((c) => c.name === team.color);
                  return (
                    <div key={team.id} className="flex items-center gap-2">
                      <span className="font-bold">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${color?.bg}`} />
                      <span className="text-sm">{team.name}</span>
                      <span className="text-sm font-medium">
                        {team.totalPoints}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Mission Selection */}
          <h2 className="text-xl font-semibold mb-4">{t.selectMission}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {availableMissions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => {
                  selectMissionHandler(mission);
                }}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{mission.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {mission.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          mission.difficulty === "easy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : mission.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {t[mission.difficulty as keyof typeof t]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      +{mission.points} {t.points}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-8 bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between text-sm">
              <span>
                {t.missionsCompleted}: {state.session.completedMissions.length}/
                {state.session.activeMissions.length +
                  state.session.completedMissions.length}
              </span>
              <button
                onClick={endHunt}
                className="text-red-500 hover:text-red-600"
              >
                {t.endHunt}
              </button>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{
                  width: `${(state.session.completedMissions.length / (state.session.activeMissions.length + state.session.completedMissions.length)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
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
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => {
              dispatch({ type: "SET_VIEW", payload: "hunt" });
            }}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            ← {t.backToMissions}
          </button>

          {/* Mission Header */}
          <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
            <div className="flex items-start gap-4">
              <span className="text-5xl">{mission.icon}</span>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{mission.title}</h1>
                <p className="text-muted-foreground mb-3">
                  {mission.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                    +{mission.points} {t.points}
                  </span>
                  {state.missionTimer !== null && (
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        state.missionTimer < 60
                          ? "bg-red-100 text-red-700"
                          : "bg-muted"
                      }`}
                    >
                      ⏱️ {t.timeLeft}: {formatTime(state.missionTimer)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hint */}
            {!state.showHint ? (
              <button
                onClick={() => {
                  dispatch({ type: "TOGGLE_HINT" });
                }}
                className="mt-4 text-sm text-muted-foreground hover:text-primary"
              >
                💡 {t.showHint}
              </button>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 {mission.hint}
                </p>
              </div>
            )}
          </div>

          {/* Tree Selection */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="mb-4">
              <input
                type="text"
                placeholder={t.searchTrees}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {validTrees.length} {t.matchingTrees}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredTrees.map((tree) => {
                const isValid = validTrees.some(
                  (vt: Tree) => vt.slug === tree.slug
                );
                return (
                  <button
                    key={tree.slug}
                    onClick={() => {
                      submitMissionAnswer(tree.slug);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isValid
                        ? "border-green-300 bg-green-50/50 dark:bg-green-900/10 hover:border-green-500"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {tree.featuredImage && (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={tree.featuredImage}
                            alt={tree.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {tree.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate italic">
                          {tree.scientificName}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTrees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t.noResults}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={skipMission}
              className="text-sm text-muted-foreground hover:text-red-500"
            >
              {t.skipMission}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (state.view === "results" && state.session) {
    const sortedTeams = [...state.session.teams].sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
    const winner = sortedTeams[0];

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">🏆 {t.finalResults}</h1>
            <div className="text-6xl mb-4">
              {sortedTeams.length > 1 &&
              sortedTeams[0].totalPoints > sortedTeams[1].totalPoints
                ? "🎉"
                : "🤝"}
            </div>
          </div>

          {/* Winner */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl p-8 mb-8 border-2 border-amber-300 dark:border-amber-700 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
              {t.winner}
            </p>
            <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              {winner.name}
            </h2>
            <p className="text-4xl font-bold text-amber-600">
              {winner.totalPoints} {t.points}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {winner.members.map((m) => (
                <span key={m.id} className="text-3xl" title={m.name}>
                  {m.avatar}
                </span>
              ))}
            </div>
          </div>

          {/* All Teams */}
          <div className="space-y-4 mb-8">
            {sortedTeams.map((team, i) => {
              const color = TEAM_COLORS.find((c) => c.name === team.color);
              return (
                <div
                  key={team.id}
                  className={`${color?.light} rounded-xl p-4 border border-border flex items-center gap-4`}
                >
                  <span className="text-3xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                  </span>
                  <div className={`w-4 h-4 rounded-full ${color?.bg}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.completedMissions.length} {t.missionsCompleted}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{team.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">{t.points}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetHunt}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              {t.playAgain}
            </button>
            <Link
              href="/education"
              className="px-8 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-all"
            >
              {t.backToEducation}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
