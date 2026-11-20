"use server";

import { revalidatePath } from "next/cache";
import * as rentalService from "@/lib/services/admin/rentals";

export async function updateRentalStatusAction(input: unknown) {
  const result = await rentalService.updateRentalStatus(input);
  if (result.success && typeof input === "object" && input && "bookingId" in input) {
    revalidatePath(`/admin/rentals/${(input as any).bookingId}`);
    revalidatePath("/admin/rentals");
    revalidatePath("/admin/inventory");
  }
  return result;
}

export async function updateRentalInternalNotesAction(input: unknown) {
  const result = await rentalService.updateRentalInternalNotes(input);
  if (result.success && typeof input === "object" && input && "bookingId" in input) {
    revalidatePath(`/admin/rentals/${(input as any).bookingId}`);
  }
  return result;
}

export async function setRentalChargeAction(input: unknown) {
  const result = await rentalService.setRentalCharge(input);
  if (result.success && typeof input === "object" && input && "bookingId" in input) {
    revalidatePath(`/admin/rentals/${(input as any).bookingId}`);
  }
  return result;
}

export async function recordRentalPaymentAction(input: unknown) {
  const result = await rentalService.recordRentalPayment(input);
  if (result.success && typeof input === "object" && input && "bookingId" in input) {
    revalidatePath(`/admin/rentals/${(input as any).bookingId}`);
    revalidatePath("/admin/rentals");
  }
  return result;
}

export async function recordRentalConditionAction(input: unknown) {
  const result = await rentalService.recordRentalCondition(input);
  if (result.success && typeof input === "object" && input && "bookingId" in input) {
    revalidatePath(`/admin/rentals/${(input as any).bookingId}`);
  }
  return result;
}
