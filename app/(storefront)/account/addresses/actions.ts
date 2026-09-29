"use server";

import { revalidatePath } from "next/cache";
import * as addressService from "@/lib/services/addresses";

export async function createAddressAction(formData: FormData) {
  const result = await addressService.createAddress({
    label: formData.get("label")?.toString() || undefined,
    line1: formData.get("line1")?.toString() || "",
    line2: formData.get("line2")?.toString() || undefined,
    city: formData.get("city")?.toString() || "",
    isDefault: formData.get("isDefault") === "on",
  });
  if (result.success) revalidatePath("/account/addresses");
  return result;
}

export async function deleteAddressAction(addressId: string) {
  const result = await addressService.deleteAddress(addressId);
  if (result.success) revalidatePath("/account/addresses");
  return result;
}
