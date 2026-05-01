import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./Card";

type Trend = {
  delta: string;
  positive: boolean;
};

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  trend?: Trend;
  target?: string;
  targetMet?: boolean;
};

export function MetricCard({ label, value, detail, trend, target, targetMet }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${value === "—" ? "text-stone-300" : "text-ink"}`}>{value}</div>

      {(trend || detail) && (
        <div className="mt-2">
          {trend ? (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-snug ${
              trend.positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}>
              {trend.positive ? <TrendingUp size={11} className="shrink-0" /> : <TrendingDown size={11} className="shrink-0" />}
              {trend.delta}
            </span>
          ) : (
            <span className="text-xs text-muted">{detail}</span>
          )}
        </div>
      )}
    </Card>
  );
}
