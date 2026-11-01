"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidFlowchartProps {
  chart: string;
}

export default function MermaidFlowchart({ chart }: MermaidFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      if (!containerRef.current || !chart.trim()) {
        return;
      }

      setError("");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          darkMode: true,
          background: "#0b1728",
          primaryColor: "#12344a",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#67e8f9",
          lineColor: "#94a3b8",
          secondaryColor: "#1e1b4b",
          tertiaryColor: "#172554",
        },
      });

      try {
        const id = `architecture-flow-${Date.now()}`;
        const { svg } = await mermaid.render(id, cleanChart(chart));

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          try {
            const fallbackId = `architecture-flow-fallback-${Date.now()}`;
            const { svg } = await mermaid.render(fallbackId, fallbackChart);
            containerRef.current.innerHTML = svg;
            setError("");
          } catch {
            setError("The architecture flowchart could not be rendered.");
          }
        }
      }
    }

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (!chart.trim()) {
    return <p className="text-sm text-slate-400">No architecture flowchart was generated.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-300/10 bg-[#0b1728] p-4">
      {error ? (
        <p className="text-sm text-amber-200">{error}</p>
      ) : (
        <div ref={containerRef} className="flex min-h-48 min-w-[560px] items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full" />
      )}
    </div>
  );
}

function cleanChart(chart: string) {
  const withoutFence = chart
    .replace(/^```(?:mermaid)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const flowchartStart = withoutFence.search(/\bflowchart\s+(?:TD|TB|LR|RL|BT)\b/i);
  const source = flowchartStart >= 0 ? withoutFence.slice(flowchartStart) : withoutFence;

  return source
    .split(/\r?\n/)
    .filter(
      (line) =>
        !/^\s*(?:[-*_])(?:\s*[-*_]){2,}\s*$/.test(line) &&
        !/^\s*[A-Za-z0-9_]+\s*---\s*(?:[-_]{3,})?\s*$/.test(line),
    )
    .map((line) => line.replace(/\s+[-_]{4,}\s*$/, ""))
    .filter((line) => line.trim().length > 0)
    .join("\n")
    .trim();
}

const fallbackChart = `flowchart TD
  Repository[Repository] --> Source[Source files]
  Source --> Components[Project components]
  Components --> Runtime[Application runtime]
  Runtime --> Users[Users]`;
