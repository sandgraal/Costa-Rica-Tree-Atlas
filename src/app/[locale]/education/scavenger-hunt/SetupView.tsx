"use client";

import { Link } from "@i18n/navigation";
import type { ScavengerHuntLessonData } from "./scavenger-hunt-data";
import { TEAM_COLORS } from "./scavenger-hunt-validators";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface SetupState {
  teamCount: number;
  teamNames: string[];
  teamMembers: TeamMember[][];
  difficulty: "easy" | "medium" | "hard" | "mixed";
  missionCount: number;
  newMemberName: string;
  editingTeam: number | null;
}

interface SetupViewProps {
  locale: string;
  labels: ScavengerHuntLessonData["labels"];
  setup: SetupState;
  onTeamCountChange: (count: number) => void;
  onTeamNameChange: (index: number, name: string) => void;
  onAddMember: (teamIndex: number) => void;
  onRemoveMember: (teamIndex: number, memberId: string) => void;
  onSetEditingTeam: (teamIndex: number | null) => void;
  onSetNewMemberName: (name: string) => void;
  onUpdateSetup: (updates: Partial<SetupState>) => void;
  onStartHunt: () => void;
}

export function SetupView({
  locale,
  labels: t,
  setup,
  onTeamCountChange,
  onTeamNameChange,
  onAddMember,
  onRemoveMember,
  onSetEditingTeam,
  onSetNewMemberName,
  onUpdateSetup,
  onStartHunt,
}: SetupViewProps) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
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
                    onTeamCountChange(count);
                  }}
                  className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                    setup.teamCount === count
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
            {Array.from({ length: setup.teamCount }).map((_, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${TEAM_COLORS[i % TEAM_COLORS.length].light}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-4 h-4 rounded-full ${TEAM_COLORS[i % TEAM_COLORS.length].bg}`}
                  />
                  <input
                    type="text"
                    placeholder={`${t.teamNamePlaceholder} ${i + 1}`}
                    value={setup.teamNames[i]}
                    onChange={(e) => {
                      onTeamNameChange(i, e.target.value);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                  />
                </div>

                {/* Members */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {setup.teamMembers[i].map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1 px-3 py-1 bg-background rounded-full border border-border"
                    >
                      <span>{member.avatar}</span>
                      <span className="text-sm">{member.name}</span>
                      <button
                        onClick={() => {
                          onRemoveMember(i, member.id);
                        }}
                        className="ml-1 text-muted-foreground hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {setup.editingTeam === i ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.memberPlaceholder}
                      value={setup.newMemberName}
                      onChange={(e) => onSetNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onAddMember(i)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        onAddMember(i);
                      }}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        onSetEditingTeam(null);
                      }}
                      className="px-3 py-2 border border-border rounded-lg text-sm"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSetEditingTeam(i);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    + {t.addMember}
                  </button>
                )}

                <div className="text-xs text-muted-foreground mt-2">
                  {setup.teamMembers[i].length} {t.members}
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
                  onClick={() => onUpdateSetup({ difficulty: d })}
                  className={`py-3 rounded-lg border transition-all text-sm font-medium ${
                    setup.difficulty === d
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
                  onClick={() => onUpdateSetup({ missionCount: count })}
                  className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                    setup.missionCount === count
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
            onClick={onStartHunt}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t.startHunt}
          </button>
        </div>
      </div>
    </div>
  );
}
