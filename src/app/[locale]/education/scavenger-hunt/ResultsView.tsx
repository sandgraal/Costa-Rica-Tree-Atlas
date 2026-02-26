"use client";

import { Link } from "@i18n/navigation";
import type { ScavengerHuntLessonData } from "./scavenger-hunt-data";
import { TEAM_COLORS } from "./scavenger-hunt-validators";

interface Team {
  id: string;
  name: string;
  color: string;
  members: { id: string; name: string; avatar: string }[];
  completedMissions: { missionId: string }[];
  totalPoints: number;
}

interface ResultsViewProps {
  teams: Team[];
  labels: ScavengerHuntLessonData["labels"];
  onPlayAgain: () => void;
}

export function ResultsView({
  teams,
  labels: t,
  onPlayAgain,
}: ResultsViewProps) {
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);
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
            onClick={onPlayAgain}
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
