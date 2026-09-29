"use server";

import { submitRentalBooking, checkRentalAvailability } from "@/lib/services/rentals";
import { trackRentalAsGuest } from "@/lib/data/rental-tracking";

export async function submitRentalBookingAction(input: unknown) {
  return submitRentalBooking(input);
}

export async function checkAvailabilityAction(rentalProductId: string, startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  return checkRentalAvailability(rentalProductId, startDate, endDate);
}

export async function trackRentalAction(input: unknown) {
  return trackRentalAsGuest(input);
}
