import { Badge } from "./Badge";

type StatusChipProps = {
  status: string;
};

export function StatusChip({ status }: StatusChipProps) {
  const tone =
    status === "Live" || status === "Healthy" || status === "Allowed" || status === "Stable" || status === "Complete"
      ? "success"
      : status === "Restricted" || status === "Blocked" || status === "At Risk"
        ? "danger"
        : status === "Watching" ||
            status === "Review" ||
            status === "Approval required" ||
            status === "Need Attention" ||
            status === "Needs attention" ||
            status === "Attention" ||
            status === "In Progress" ||
            status === "Waiting"
          ? "warning"
          : "neutral";

  return <Badge tone={tone}>{status}</Badge>;
}
