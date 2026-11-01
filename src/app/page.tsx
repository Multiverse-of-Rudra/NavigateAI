"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Code2,
  FileText,
  GitBranch,
  GitFork,
  GitPullRequest,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  PanelLeft,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Terminal,
  Users,
  X,
} from "lucide-react";

interface Repo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

interface Health {
  documentation: number;
  maintainability: number;
  beginnerFriendly: number;
  communitySupport: number;
}

interface Analysis {
  summary: string;
  architecture: string;
  roadmap: string;
  contribution: string;
  startHere: string;
}

interface AnalysisResponse {
  repo: Repo;
  analysis: Analysis;
  health: Health;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GitHubItem {
  id: number;
  title?: string;
  name?: string;
  path?: string;
  html_url: string;
  state?: string;
  user?: { login: string };
  created_at?: string;
  body?: string | null;
}

const explorerItems = [
  { label: "Repository Overview", icon: LayoutDashboard },
  { label: "README.md", icon: BookOpen },
  { label: "Source Code", icon: Code2 },
  { label: "Components", icon: KanbanSquare },
  { label: "APIs", icon: Network },
  { label: "Issues", icon: CircleDot, count: 18 },
  { label: "Pull Requests", icon: GitPullRequest, count: 6 },
];

const roadmap = [
  ["DAY 1", "Read the README", "Understand the project goals and local setup."],
  ["DAY 2", "Setup environment", "Run the project locally and verify the test suite."],
  ["DAY 3", "Explore core files", "Trace the main entry points and data flow."],
  ["DAY 4", "Fix your first issue", "Pick a good-first-issue and open a draft."],
  ["DAY 5", "Open your first PR", "Share your change with the maintainers."],
];

const tabs = ["Summary", "Architecture", "Learning Path", "Contribution Guide", "Start Here"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Summary");
  const [activeNav, setActiveNav] = useState("Repository Overview");
  const [chatMessage, setChatMessage] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [githubItems, setGithubItems] = useState<GitHubItem[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Enter a GitHub repository URL to get started.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.repo?.description || "Analysis failed. Try again.");
      setData(result);
      setActiveNav("Repository Overview");
      setChatMessages([]);
      setChatMessage("");
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const startNewAnalysis = () => {
    setData(null);
    setUrl("");
    setError("");
    setChatMessage("");
    setChatMessages([]);
    setActiveNav("Repository Overview");
    setActiveTab("Summary");
    setSettingsOpen(false);
    setSidebarOpen(false);
  };

  const handleAsk = async () => {
    const question = chatMessage.trim();
    if (!question || !data || chatLoading) return;

    setChatMessage("");
    setChatMessages((messages) => [...messages, { role: "user", content: question }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          repo: data.repo,
          analysis: data.analysis,
        }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.answer !== "string") {
        throw new Error(result.error || "The repository assistant could not answer.");
      }
      setChatMessages((messages) => [...messages, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setChatMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "The repository assistant could not answer.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExplorerSelect = (label: string) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "Issues" || label === "Pull Requests" || label === "APIs") {
      void loadGitHubItems(label);
    }
    const tabForNav: Record<string, string> = {
      "Repository Overview": "Summary",
      "README.md": "Summary",
      "Source Code": "Architecture",
      Components: "Architecture",
      APIs: "Architecture",
      Issues: "Contribution Guide",
      "Pull Requests": "Contribution Guide",
    };
    const nextTab = tabForNav[label];
    if (nextTab) setActiveTab(nextTab);
  };

  const loadGitHubItems = async (label: string) => {
    if (!data) {
      setGithubError("Analyze a repository before opening this section.");
      return;
    }

    const coordinates = getRepositoryCoordinates(url);
    if (!coordinates) {
      setGithubError("The analyzed repository URL is not available.");
      return;
    }

    const resource = label === "Issues" ? "issues" : label === "Pull Requests" ? "pulls" : "apis";
    setGithubLoading(true);
    setGithubError("");
    try {
      const response = await fetch(`/api/github?owner=${encodeURIComponent(coordinates.owner)}&repo=${encodeURIComponent(coordinates.repo)}&resource=${resource}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Unable to load ${label.toLowerCase()}.`);
      setGithubItems(Array.isArray(result.items) ? result.items : []);
    } catch (err) {
      setGithubItems([]);
      setGithubError(err instanceof Error ? err.message : `Unable to load ${label.toLowerCase()}.`);
    } finally {
      setGithubLoading(false);
    }
  };

  const repo = data?.repo;
  const health = data?.health;
  const activeContent = data?.analysis
    ? {
        Summary: data.analysis.summary,
        Architecture: data.analysis.architecture,
        "Learning Path": data.analysis.roadmap,
        "Contribution Guide": data.analysis.contribution,
        "Start Here": data.analysis.startHere,
      }[activeTab]
    : "";
  const isGitHubPanel = activeNav === "APIs" || activeNav === "Issues" || activeNav === "Pull Requests";

  return (
    <main className={isDark ? "app-shell" : "app-shell light-shell"}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Terminal size={16} /></div>
          <span><strong>Navigate</strong> <em>AI</em></span>
        </div>
        <div className="topbar-actions">
          <span className="workspace-label">WORKSPACE / REPOSITORY ANALYSIS</span>
          <button className="icon-button" aria-label="Toggle theme" onClick={() => setIsDark(!isDark)}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a className="icon-button" href="https://github.com" aria-label="GitHub"><GitBranch size={17} /></a>
          <button className="avatar" aria-label="Account">R</button>
        </div>
      </header>

      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-heading">
            <span>EXPLORER</span>
            <button className="icon-button small" onClick={() => setSidebarOpen(false)} aria-label="Close explorer"><X size={14} /></button>
          </div>
          <button className="repo-switcher" onClick={() => data ? startNewAnalysis() : document.getElementById("repository-url")?.focus()}>
            <span className="repo-avatar"><GitBranch size={14} /></span>
            <span><b>{repo?.name || "Choose a repository"}</b><small>{repo ? "public / analyzed" : "paste a GitHub URL"}</small></span>
            <ChevronDown size={14} />
          </button>
          <nav className="explorer-nav" aria-label="Repository explorer">
            {explorerItems.map(({ label, icon: Icon, count }) => (
              <button key={label} className={activeNav === label ? "explorer-item active" : "explorer-item"} onClick={() => handleExplorerSelect(label)}>
                <Icon size={15} /><span>{label}</span>{count && <small>{count}</small>}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="explorer-item" onClick={() => setSettingsOpen((open) => !open)}><Settings2 size={15} /><span>Workspace settings</span></button>
            {settingsOpen && <div className="settings-popover"><strong>Workspace settings</strong><small>Theme: {isDark ? "Dark" : "Light"}</small><small>Layout: {compactLayout ? "Compact" : "Comfortable"}</small></div>}
            <div className="connection-status"><span className="status-dot" /> GitHub connected</div>
          </div>
        </aside>

        <section className="workspace">
          <div className="workspace-toolbar">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open explorer"><Menu size={17} /></button>
            <div className="breadcrumbs"><span>Navigator</span><span>/</span><strong>{repo?.name || "New analysis"}</strong></div>
            <span className="toolbar-spacer" />
            <button className="toolbar-button" onClick={() => setCompactLayout((compact) => !compact)}><PanelLeft size={14} /> {compactLayout ? "Comfortable" : "Compact"}</button>
            <button className="toolbar-button" onClick={() => chatInputRef.current?.focus()}><Sparkles size={14} /> AI assist</button>
            {data && <button className="toolbar-button" onClick={startNewAnalysis}><Search size={14} /> New analysis</button>}
          </div>

          {!data && !loading ? (
            <section className="empty-workspace">
              <div className="empty-kicker"><span className="status-dot" /> OPEN SOURCE NAVIGATOR</div>
              <h1>From confusion<br /><span>to contribution.</span></h1>
              <p>Understand unfamiliar repositories, find your starting point, and make your first contribution with confidence.</p>
              <RepoInput url={url} setUrl={setUrl} loading={loading} onAnalyze={handleAnalyze} />
              {error && <ErrorMessage message={error} />}
              <div className="shortcut-hint"><span>Tip</span> Analyze any public GitHub repository to open its developer workspace.</div>
            </section>
          ) : loading ? (
            <div className="loading-state"><div className="loader" /><h2>Indexing repository</h2><p>Reading the project structure and preparing your workspace...</p></div>
          ) : (
            <div className={`workspace-content ${compactLayout ? "compact-layout" : ""}`}>
              <div className="repo-heading">
                <div>
                  <div className="section-eyebrow">REPOSITORY OVERVIEW <span className="live-dot" /> LIVE ANALYSIS</div>
                  <h1>{repo?.name}</h1>
                  <p>{repo?.description || "No description provided for this repository."}</p>
                </div>
                <a className="outline-button" href={url} target="_blank" rel="noreferrer"><GitBranch size={15} /> View on GitHub <ArrowUpRight size={14} /></a>
              </div>
              <div className="stats-strip">
                <Stat icon={<Star />} label="Stars" value={repo?.stars || 0} />
                <Stat icon={<GitFork />} label="Forks" value={repo?.forks || 0} />
                <Stat icon={<Code2 />} label="Language" value={repo?.language || "Not specified"} />
                <Stat icon={<Users />} label="Contributors" value="—" />
              </div>
              <div className="analysis-layout">
                <div className="main-panel">
                  <div className="panel-tabs" role="tablist">
                    {tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "panel-tab active" : "panel-tab"} onClick={() => setActiveTab(tab)}>{tab}</button>)}
                  </div>
                  <div className="analysis-copy">
                    {isGitHubPanel ? (
                      <GitHubPanel label={activeNav} items={githubItems} loading={githubLoading} error={githubError} />
                    ) : (
                      <>
                        <div className="analysis-title"><FileText size={17} /><span>{activeTab}</span><span className="muted-badge">AI GENERATED</span></div>
                        <div className="markdown-copy"><ReactMarkdown>{activeContent || "No analysis available for this section."}</ReactMarkdown></div>
                        {activeTab === "Learning Path" && <Roadmap />}
                      </>
                    )}
                  </div>
                </div>
                <aside className="insights-panel">
                  <div className="panel-title"><Bot size={16} /> AI INSIGHTS <span className="live-dot" /></div>
                  <Score label="Difficulty score" value="Beginner friendly" percent={health?.beginnerFriendly || 72} color="amber" />
                  <Score label="Documentation score" value={`${health?.documentation || 0}%`} percent={health?.documentation || 0} color="green" />
                  <Score label="Community activity" value="Active" percent={health?.communitySupport || 64} color="purple" />
                  <div className="time-estimate"><span>Estimated learning time</span><strong>4–6 hours</strong><small>to make your first contribution</small></div>
                  <div className="insight-callout"><ShieldCheck size={16} /><span>Start with the README and follow the setup steps before exploring source files.</span></div>
                </aside>
              </div>
              <div className="lower-grid">
                <section className="health-panel">
                  <div className="panel-title"><ShieldCheck size={16} /> REPOSITORY HEALTH <span className="muted-badge">SIGNALS</span></div>
                  <div className="health-grid">
                    <HealthMetric label="Documentation quality" value={health?.documentation || 0} color="amber" />
                    <HealthMetric label="Beginner friendliness" value={health?.beginnerFriendly || 0} color="green" />
                    <HealthMetric label="Contribution readiness" value={health?.communitySupport || 0} color="purple" />
                    <HealthMetric label="Maintainability" value={health?.maintainability || 0} color="blue" />
                  </div>
                </section>
                <section className="chat-panel">
                  <div className="panel-title"><Bot size={16} /> ASK REPOSITORY <span className="muted-badge">AI</span></div>
                  {chatMessages.length > 0 && <div className="chat-messages" aria-live="polite">{chatMessages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "user" ? "You" : "Navigator AI"}</span><ReactMarkdown>{message.content}</ReactMarkdown></div>)}{chatLoading && <div className="chat-message assistant"><span>Navigator AI</span><p>Thinking...</p></div>}</div>}
                  <div className="suggested-prompts"><button onClick={() => { setChatMessage("Explain the architecture"); chatInputRef.current?.focus(); }}>Explain architecture</button><button onClick={() => { setChatMessage("Where should I begin?"); chatInputRef.current?.focus(); }}>Where should I begin?</button><button onClick={() => { setChatMessage("Which file controls authentication?"); chatInputRef.current?.focus(); }}>Find authentication</button></div>
                  <div className="chat-input"><input ref={chatInputRef} aria-label="Ask repository" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAsk()} placeholder="Ask about this repository..." /><button aria-label="Send question" onClick={handleAsk} disabled={!chatMessage.trim() || chatLoading}><Send size={15} /></button></div>
                </section>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function RepoInput({ url, setUrl, loading, onAnalyze }: { url: string; setUrl: (value: string) => void; loading: boolean; onAnalyze: () => void }) {
  return <div className="repo-input-wrap"><div className="repo-input"><Search size={16} /><input id="repository-url" aria-label="GitHub repository URL" placeholder="https://github.com/owner/repository" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAnalyze()} /><button onClick={onAnalyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze repository"} <ArrowUpRight size={15} /></button></div></div>;
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="error-message"><AlertCircle size={15} /> {message}</div>;
}

function getRepositoryCoordinates(value: string) {
  try {
    const parsed = new URL(value);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (parsed.hostname !== "github.com" || segments.length < 2) return null;
    return { owner: segments[0], repo: segments[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

function GitHubPanel({ label, items, loading, error }: { label: string; items: GitHubItem[]; loading: boolean; error: string }) {
  if (loading) {
    return <div className="github-panel-state"><div className="loader small-loader" /><p>Loading {label.toLowerCase()}...</p></div>;
  }
  if (error) return <div className="github-panel-state"><AlertCircle size={17} /><p>{error}</p></div>;
  if (items.length === 0) {
    return <div className="github-panel-state"><CheckCircle2 size={18} /><p>No {label.toLowerCase()} found for this repository.</p></div>;
  }

  return (
    <div className="github-results">
      <div className="analysis-title"><FileText size={17} /><span>{label}</span><span className="muted-badge">GITHUB DATA</span></div>
      <div className="github-list">
        {items.map((item) => (
          <a className="github-list-item" href={item.html_url} target="_blank" rel="noreferrer" key={item.id}>
            <div className="github-item-icon">{label === "APIs" ? <Network size={15} /> : label === "Issues" ? <CircleDot size={15} /> : <GitPullRequest size={15} />}</div>
            <div className="github-item-copy">
              <strong>{item.title || item.path || item.name}</strong>
              <small>{item.user?.login ? `by ${item.user.login}` : item.path || "Open in GitHub"}{item.created_at ? ` · ${new Date(item.created_at).toLocaleDateString()}` : ""}</small>
            </div>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="stat"><span className="stat-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>;
}

function Score({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return <div className="score-row"><div><span>{label}</span><strong>{value}</strong></div><div className="progress"><i className={`progress-${color}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div></div>;
}

function HealthMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="health-metric"><div><span>{label}</span><strong>{value}%</strong></div><div className="progress"><i className={`progress-${color}`} style={{ width: `${value}%` }} /></div></div>;
}

function Roadmap() {
  return <div className="roadmap">{roadmap.map(([day, title, description], index) => <div className="roadmap-step" key={day}><div className={`step-marker ${index === 0 ? "current" : ""}`}>{index === 0 ? <CircleDot size={13} /> : index + 1}</div><div><small>{day}</small><strong>{title}</strong><p>{description}</p></div>{index === 0 && <CheckCircle2 className="step-check" size={16} />}</div>)}</div>;
}
