import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addressSchema, addressUpdateSchema } from "@/schemas/address";

export type AddressActionResult = { success: true } | { success: false; error: string };

export interface AddressRecord {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  is_default: boolean;
}

async function requireCustomerId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function listAddresses(): Promise<AddressRecord[]> {
  const customerId = await requireCustomerId();
  if (!customerId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("id, label, line1, line2, city, is_default")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("listAddresses failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function unsetExistingDefault(customerId: string): Promise<void> {
  const supabase = createClient();
  await (supabase.from("addresses") as any).update({ is_default: false }).eq("customer_id", customerId).eq("is_default", true);
}

export async function createAddress(input: unknown): Promise<AddressActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };

  const customerId = await requireCustomerId();
  if (!customerId) return { success: false, error: "Sign in required." };

  if (parsed.data.isDefault) await unsetExistingDefault(customerId);

  const supabase = createClient();
  const { error } = await (supabase.from("addresses") as any).insert({
    customer_id: customerId,
    label: parsed.data.label || null,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    is_default: parsed.data.isDefault ?? false,
  });
  if (error) return { success: false, error: "Could not save address." };
  return { success: true };
}

export async function updateAddress(input: unknown): Promise<AddressActionResult> {
  const parsed = addressUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };

  const customerId = await requireCustomerId();
  if (!customerId) return { success: false, error: "Sign in required." };

  if (parsed.data.isDefault) await unsetExistingDefault(customerId);

  const supabase = createClient();
  // RLS (0006) already restricts this update to rows owned by the caller;
  // the .eq("customer_id", ...) below is defense in depth, not the
  // boundary itself.
  const { error } = await (supabase.from("addresses") as any)
    .update({
      label: parsed.data.label || null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      is_default: parsed.data.isDefault ?? false,
    })
    .eq("id", parsed.data.id)
    .eq("customer_id", customerId);
  if (error) return { success: false, error: "Could not update address." };
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<AddressActionResult> {
  const customerId = await requireCustomerId();
  if (!customerId) return { success: false, error: "Sign in required." };

  const supabase = createClient();
  const { error } = await (supabase.from("addresses") as any)
    .delete()
    .eq("id", addressId)
    .eq("customer_id", customerId);
  if (error) return { success: false, error: "Could not delete address." };
  return { success: true };
}
