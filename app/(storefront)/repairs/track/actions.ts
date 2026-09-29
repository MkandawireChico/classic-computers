"use server";

import { trackRepairAsGuest } from "@/lib/data/repair-tracking";

export async function trackRepairAction(input: unknown) {
  return trackRepairAsGuest(input);
}
