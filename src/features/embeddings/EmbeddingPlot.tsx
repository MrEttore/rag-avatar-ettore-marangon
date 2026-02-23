"use client";

import dynamic from "next/dynamic";
import type { Config, Data, Layout } from "plotly.js";

import type { EmbeddingPlotData } from "@/lib/ai/rag";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Props = {
  data: EmbeddingPlotData;
};

export default function EmbeddingPlot({ data }: Props) {
  const { dims, x, y, z, colors, text } = data;
  const fallbackTitle = `${x.length.toLocaleString()} embeddings in ${dims}D`;

  const trace: Data =
    dims === 2
      ? {
          type: "scattergl",
          mode: "markers",
          x,
          y,
          text,
          hoverinfo: "text",
          marker: {
            size: 5,
            color: colors,
            opacity: 0.8,
          },
        }
      : {
          type: "scatter3d",
          mode: "markers",
          x,
          y,
          z,
          text,
          hoverinfo: "text",
          marker: {
            size: 3,
            color: colors,
            opacity: 0.8,
          },
        };

  const layout: Partial<Layout> =
    dims === 2
      ? {
          title: { text: fallbackTitle },
          paper_bgcolor: "#09090b",
          plot_bgcolor: "#09090b",
          font: { color: "#d4d4d8" },
          xaxis: {
            title: { text: "x" },
            gridcolor: "#27272a",
            zerolinecolor: "#3f3f46",
          },
          yaxis: {
            title: { text: "y" },
            gridcolor: "#27272a",
            zerolinecolor: "#3f3f46",
          },
          margin: { l: 40, r: 20, t: 60, b: 40 },
          hovermode: "closest",
        }
      : {
          title: { text: fallbackTitle },
          paper_bgcolor: "#09090b",
          font: { color: "#d4d4d8" },
          scene: {
            bgcolor: "#09090b",
            xaxis: { title: { text: "x" }, gridcolor: "#27272a", zerolinecolor: "#3f3f46" },
            yaxis: { title: { text: "y" }, gridcolor: "#27272a", zerolinecolor: "#3f3f46" },
            zaxis: { title: { text: "z" }, gridcolor: "#27272a", zerolinecolor: "#3f3f46" },
          },
          margin: { l: 0, r: 0, t: 60, b: 0 },
        };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ["select2d", "lasso2d"],
  };

  return (
    <div className="h-full w-full">
      <Plot
        data={[trace]}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
