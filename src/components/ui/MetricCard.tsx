import { Card } from "./Card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{detail}</div>
    </Card>
  );
}
