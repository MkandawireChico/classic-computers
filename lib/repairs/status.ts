export type RepairStatusVariant = "neutral" | "success" | "warning" | "danger" | "info";

export const REPAIR_STATUS_DETAILS: Record<
  string,
  { label: string; description: string; variant: RepairStatusVariant }
> = {
  checked_in: {
    label: "Device received",
    description: "Your repair request is recorded. The team will begin reviewing the device.",
    variant: "warning",
  },
  diagnosing: {
    label: "Assessment in progress",
    description: "The team is checking the reported fault and assessing the work required.",
    variant: "info",
  },
  quoted: {
    label: "Estimate prepared",
    description: "A repair estimate has been prepared. Our team will contact you with the details.",
    variant: "info",
  },
  awaiting_approval: {
    label: "Awaiting your approval",
    description: "The team is waiting for your approval before proceeding with the repair.",
    variant: "warning",
  },
  in_progress: {
    label: "Repair in progress",
    description: "Work on your device is underway.",
    variant: "info",
  },
  ready_for_pickup: {
    label: "Ready for collection",
    description: "The repair is marked ready. Please contact the team to confirm collection arrangements before travelling.",
    variant: "success",
  },
  completed: {
    label: "Repair completed",
    description: "The repair ticket has been marked as completed.",
    variant: "success",
  },
  cancelled: {
    label: "Repair cancelled",
    description: "This repair ticket has been cancelled. Contact the team if you need clarification.",
    variant: "danger",
  },
};

export function getRepairStatusDetails(status: string) {
  return REPAIR_STATUS_DETAILS[status] ?? {
    label: status.replace(/_/g, " "),
    description: "The repair status has been updated. Contact our team if you need more information.",
    variant: "neutral" as const,
  };
}
