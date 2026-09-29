import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { randomUUID } from "crypto";

const GUEST_CART_COOKIE = "cc_guest_cart";

/**
 * Cart identity resolution.
 *
 * Authenticated customers: their cart is looked up/created through the
 * normal RLS-bound server client — `carts` RLS (0016) already lets a
 * customer read/insert/update only their own cart, so no privileged
 * access is needed here.
 *
 * Guests: an anon Supabase session has no stable `auth.uid()` for RLS to
 * key off, so `carts` intentionally has no anon policy (see 0016). Guest
 * cart reads/writes are brokered here, server-side, using the
 * service-role client — scoped by a random, httpOnly `session_token`
 * cookie that only this server can read or set. This is one of the
 * narrow, documented, sanctioned uses of `server-admin.ts`.
 */

async function getAuthenticatedCustomerId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Read-only cart id lookup — safe to call from Server Components (never
 * sets cookies, never creates a cart). Returns null if no cart exists yet.
 */
export async function getCartIdReadOnly(): Promise<string | null> {
  const customerId = await getAuthenticatedCustomerId();

  if (customerId) {
    const supabase = createClient();
    const { data } = await (supabase
      .from("carts") as any)
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();
    return data?.id ?? null;
  }

  const token = cookies().get(GUEST_CART_COOKIE)?.value;
  if (!token) return null;

  const admin = createAdminClient();
  const { data } = await (admin.from("carts") as any)
    .select("id")
    .eq("session_token", token)
    .eq("status", "active")
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Get-or-create — only safe to call from a Server Action or Route Handler
 * (it may set the guest cart cookie, which Next.js forbids during Server
 * Component render).
 */
export async function getOrCreateCartId(): Promise<string> {
  const customerId = await getAuthenticatedCustomerId();

  if (customerId) {
    const supabase = createClient();
    const { data: existing } = await (supabase
      .from("carts") as any)
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created, error } = await (supabase
      .from("carts") as any)
      .insert({ customer_id: customerId })
      .select("id")
      .single();
    if (error || !created) throw new Error("Could not create cart.");
    return created.id;
  }

  const cookieStore = cookies();
  const existingToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  const admin = createAdminClient();

  if (existingToken) {
    const { data: existing } = await (admin.from("carts") as any)
      .select("id")
      .eq("session_token", existingToken)
      .eq("status", "active")
      .maybeSingle();
    if (existing) return existing.id;
  }

  const token = randomUUID();
  const { data: created, error } = await (admin.from("carts") as any)
    .insert({ session_token: token })
    .select("id")
    .single();
  if (error || !created) throw new Error("Could not create guest cart.");

  cookieStore.set(GUEST_CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return created.id;
}

/** Returns the Supabase client appropriate for the CURRENT cart owner —
 * the RLS-bound client for an authenticated customer, the privileged
 * client for a guest cart. Every cart-mutation function below uses this
 * so guest and authenticated flows share one code path. */
async function getCartClient(): Promise<SupabaseClient<Database>> {
  const customerId = await getAuthenticatedCustomerId();
  return customerId ? createClient() : createAdminClient();
}

export async function clearGuestCartCookie(): Promise<void> {
  cookies().delete(GUEST_CART_COOKIE);
}

/**
 * Called once, right after a successful sign-in. Moves any items sitting
 * in the visitor's guest cart into their (possibly newly-created)
 * customer cart, merging quantities where the same product/variant
 * appears in both, then retires the guest cart and its cookie.
 *
 * Deliberately best-effort: if anything here fails, sign-in still
 * succeeds — a lost guest cart is a UX annoyance, not a security or data
 * integrity issue, so this never blocks or fails the sign-in flow itself.
 */
export async function mergeGuestCartIntoCustomerCart(customerId: string): Promise<void> {
  try {
    const cookieStore = cookies();
    const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
    if (!guestToken) return;

    const admin = createAdminClient();
    const { data: guestCart } = await (admin.from("carts") as any)
      .select("id")
      .eq("session_token", guestToken)
      .eq("status", "active")
      .maybeSingle();
    if (!guestCart) {
      cookieStore.delete(GUEST_CART_COOKIE);
      return;
    }

    const { data: guestItems } = await (admin.from("cart_items") as any)
      .select("product_id, variant_id, quantity")
      .eq("cart_id", guestCart.id);
    if (!guestItems || guestItems.length === 0) {
      await (admin.from("carts") as any).update({ status: "converted" }).eq("id", guestCart.id);
      cookieStore.delete(GUEST_CART_COOKIE);
      return;
    }

    const supabase = createClient();
    let { data: customerCart } = await (supabase
      .from("carts") as any)
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();

    if (!customerCart) {
      const { data: created } = await (supabase.from("carts") as any).insert({ customer_id: customerId }).select("id").single();
      customerCart = created ?? null;
    }
    if (!customerCart) return;

    for (const item of guestItems) {
      const { data: existing } = await (supabase.from("cart_items") as any)
        .select("id, quantity")
        .eq("cart_id", customerCart.id)
        .eq("product_id", item.product_id)
        .is("variant_id", item.variant_id)
        .maybeSingle();

      if (existing) {
        await (supabase.from("cart_items") as any)
          .update({ quantity: Math.min(existing.quantity + item.quantity, 20) })
          .eq("id", existing.id);
      } else {
        await (supabase.from("cart_items") as any).insert({
          cart_id: customerCart.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        });
      }
    }

    await (admin.from("carts") as any).update({ status: "converted" }).eq("id", guestCart.id);
    cookieStore.delete(GUEST_CART_COOKIE);
  } catch (err) {
    console.error("mergeGuestCartIntoCustomerCart failed (non-fatal):", err);
  }
}

export { GUEST_CART_COOKIE, getCartClient };
