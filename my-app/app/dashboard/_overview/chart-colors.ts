/** The dashboard's chart colours, used in this order. */
export const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#84cc16",
];

export const chartColor = (index: number) =>
  CHART_COLORS[index % CHART_COLORS.length];

/** Each project category keeps its own colour wherever it appears. */
export const PROJECT_CATEGORY_COLORS: Record<string, string> = {
  fullstack: "#6366f1",
  frontend: "#f59e0b",
  backend: "#ef4444",
  mobile: "#ec4899",
  devops: "#06b6d4",
  ai: "#10b981",
};
