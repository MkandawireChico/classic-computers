"use server";

import { submitRepairBooking } from "@/lib/services/repairs";

export async function submitRepairBookingAction(input: unknown, submissionKey: string) {
  return submitRepairBooking(input, submissionKey);
}
