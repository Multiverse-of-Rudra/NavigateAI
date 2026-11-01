import { Card, CardContent } from "@/components/ui/card";
import { Code2, GitFork, GitBranch, Star } from "lucide-react";

interface Repo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

interface RepoCardProps {
  repo: Repo;
}

export default function RepoCard({
  repo,
}: RepoCardProps) 

 {

  return (
    <Card className="mb-6 border-white/10 bg-white/[0.045] text-white shadow-xl shadow-black/10 backdrop-blur-xl">
      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-cyan-200 ring-1 ring-white/10">
              <GitBranch className="size-5" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
                Repository analyzed
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">{repo.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {repo.description || "No description provided for this repository."}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Public project
          </span>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={<Star />} label="Stars" value={repo.stars} />
          <Stat icon={<GitFork />} label="Forks" value={repo.forks} />
          <Stat icon={<Code2 />} label="Primary language" value={repo.language || "Not specified"} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/35 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-cyan-300/80 [&_svg]:size-4">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}