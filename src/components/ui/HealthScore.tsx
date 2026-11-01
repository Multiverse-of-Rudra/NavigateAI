interface Health {
  documentation: number;
  maintainability: number;
  beginnerFriendly: number;
  communitySupport: number;
}

interface HealthScoreProps {
  health: Health;
}

const metrics = [
  { key: "documentation", label: "Documentation", color: "bg-cyan-300" },
  { key: "maintainability", label: "Maintainability", color: "bg-violet-300" },
  { key: "beginnerFriendly", label: "Beginner Friendly", color: "bg-amber-300" },
  { key: "communitySupport", label: "Community Support", color: "bg-emerald-300" },
] as const;

export default function HealthScore({ health }: HealthScoreProps) {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-slate-100 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
            Repository health
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Project snapshot</h2>
        </div>
        <span className="hidden text-xs text-slate-500 sm:block">Based on repository signals</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {metrics.map(({ key, label, color }) => {
          const value = Math.max(0, Math.min(100, health[key]));

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">{label}</span>
                <span className="font-mono text-slate-400">{value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
                <div
                  className={`h-full rounded-full ${color} transition-[width] duration-700`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}