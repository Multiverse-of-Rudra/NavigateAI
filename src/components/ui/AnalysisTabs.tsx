import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  BookOpen,
  Compass,
  GitPullRequest,
  Map,
  Route,
  Workflow,
} from "lucide-react";
import MermaidFlowchart from "@/components/ui/MermaidFlowchart";

interface Analysis {
  summary: string;
  architecture: string;
  roadmap: string;
  contribution: string;
  startHere: string;
  architectureFlow?: string;
  bugScan?: string;
}

interface AnalysisTabsProps {
  analysis: Analysis;
}

export default function AnalysisTabs({
  analysis,
}: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [showFlowchart, setShowFlowchart] = useState(false);

  const tabs = [
    { value: "summary", label: "Summary", icon: BookOpen, content: analysis?.summary },
    { value: "architecture", label: "Architecture", icon: Compass, content: analysis?.architecture },
    { value: "roadmap", label: "Roadmap", icon: Route, content: analysis?.roadmap },
    { value: "contribute", label: "Contribute", icon: GitPullRequest, content: analysis?.contribution },
    { value: "start", label: "Start here", icon: Map, content: analysis?.startHere },
    { value: "bugs", label: "Find bugs", icon: AlertTriangle, content: analysis?.bugScan },
  ];

  const activeContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <section className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Repository analysis sections"
        className="grid h-auto w-full grid-cols-2 gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.045] p-1 sm:grid-cols-3 lg:grid-cols-6"
      >
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={activeTab === value}
            aria-controls={`${value}-panel`}
            onClick={() => setActiveTab(value)}
            className="h-10 gap-2 rounded-lg px-3 text-xs text-slate-400 data-active:bg-cyan-300/10 data-active:text-cyan-200 sm:text-sm"
            data-active={activeTab === value ? "true" : undefined}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      <div
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-label={`${tabs.find((tab) => tab.value === activeTab)?.label} analysis`}
        className="min-h-64 rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8"
      >
        {activeTab === "architecture" ? (
          <>
            <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">System architecture</h2>
                <p className="mt-1 text-sm text-slate-400">Explore the components and how they connect.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFlowchart((visible) => !visible)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-300/20"
              >
                <Workflow className="size-4" />
                {showFlowchart ? "Hide flowchart" : "Show flowchart"}
              </button>
            </div>
            <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-slate-300 prose-p:leading-7 prose-li:text-slate-300 prose-strong:text-white prose-code:text-cyan-200">
              <ReactMarkdown>{activeContent || "No analysis available for this section."}</ReactMarkdown>
            </div>
            {showFlowchart && (
              <div className="mt-8">
                <MermaidFlowchart chart={analysis.architectureFlow || ""} />
              </div>
            )}
          </>
        ) : activeTab === "bugs" ? (
          <>
            <div className="mb-6 flex items-start gap-3 border-b border-amber-300/10 pb-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Repository health scan</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  AI-assisted findings based on the sampled source files and README. Review every finding before acting on it.
                </p>
              </div>
            </div>
            <div className="prose prose-invert prose-amber max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-slate-300 prose-p:leading-7 prose-li:text-slate-300 prose-strong:text-white prose-code:text-cyan-200">
              <ReactMarkdown>{activeContent || "No bug scan is available."}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-slate-300 prose-p:leading-7 prose-li:text-slate-300 prose-strong:text-white prose-code:text-cyan-200">
            <ReactMarkdown>{activeContent || "No analysis available for this section."}</ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
}
