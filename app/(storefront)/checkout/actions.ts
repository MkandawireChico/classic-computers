"use server";

import { submitCheckout, type CheckoutResult } from "@/lib/services/checkout";

export async function submitCheckoutAction(input: unknown): Promise<CheckoutResult> {
  return submitCheckout(input);
}
