"use server";

import { revalidatePath } from "next/cache";
import * as repairService from "@/lib/services/admin/repairs";

export async function updateRepairStatusAction(input: unknown) {
  const result = await repairService.updateRepairStatus(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
    revalidatePath("/admin/repairs");
  }
  return result;
}

export async function assignTechnicianAction(input: unknown) {
  const result = await repairService.assignTechnician(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
  }
  return result;
}

export async function setRepairQuoteAction(input: unknown) {
  const result = await repairService.setRepairQuote(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
  }
  return result;
}

export async function addRepairUpdateAction(input: unknown) {
  const result = await repairService.addRepairUpdate(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
  }
  return result;
}

export async function addRepairPartAction(input: unknown) {
  const result = await repairService.addRepairPart(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
    revalidatePath("/admin/inventory");
  }
  return result;
}

export async function removeRepairPartAction(partId: string, ticketId: string) {
  const result = await repairService.removeRepairPart(partId, ticketId);
  if (result.success) {
    revalidatePath(`/admin/repairs/${ticketId}`);
    revalidatePath("/admin/inventory");
  }
  return result;
}
