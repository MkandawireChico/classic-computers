"use server";

import { revalidatePath } from "next/cache";
import { toggleCompare as toggleCompareService, clearCompare as clearCompareService } from "@/lib/services/compare";

export async function toggleCompareAction(productId: string): Promise<string[]> {
  const result = toggleCompareService(productId);
  revalidatePath("/compare");
  return result;
}

export async function clearCompareAction(): Promise<void> {
  clearCompareService();
  revalidatePath("/compare");
}
