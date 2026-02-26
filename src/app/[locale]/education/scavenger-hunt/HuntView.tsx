"use client";

import { Link } from "@i18n/navigation";
import type {
  MissionDisplayData,
  ScavengerHuntLessonData,
} from "./scavenger-hunt-data";
import { TEAM_COLORS } from "./scavenger-hunt-validators";

interface Team {
  id: string;
  name: string;
  color: string;
  members: { id: string; name: string; avatar: string }[];
  completedMissions: { missionId: string }[];
  totalPoints: number;
  streak: number;
}

interface HuntSession {
  teams: Team[];
  currentTeamIndex: number;
  activeMissions: string[];
  completedMissions: string[];
}

interface HuntViewProps {
  session: HuntSession;
  missions: MissionDisplayData[];
  labels: ScavengerHuntLessonData["labels"];
  onSelectMission: (mission: MissionDisplayData) => void;
  onEndHunt: () => void;
}

export function HuntView({
  session,
  missions,
  labels: t,
  onSelectMission,
  onEndHunt,
}: HuntViewProps) {
  const currentTeam = session.teams[session.currentTeamIndex];
  const teamColor =
    TEAM_COLORS.find((c) => c.name === currentTeam.color) || TEAM_COLORS[0];
  const availableMissions = missions.filter((m) =>
    session.activeMissions.includes(m.id)
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
        <div className={`${teamColor.light} rounded-2xl p-6 mb-6 border`}>
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
            {[...session.teams]
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
                onSelectMission(mission);
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
              {t.missionsCompleted}: {session.completedMissions.length}/
              {session.activeMissions.length + session.completedMissions.length}
            </span>
            <button
              onClick={onEndHunt}
              className="text-red-500 hover:text-red-600"
            >
              {t.endHunt}
            </button>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
              style={{
                width: `${(session.completedMissions.length / (session.activeMissions.length + session.completedMissions.length)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
