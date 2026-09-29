import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Reads a single public site_settings row by key. Only ever reads keys
 * marked is_public — RLS enforces that boundary too, but this function
 * exists so storefront components never accidentally reach for a
 * staff-only settings key.
 */
const getPublicSettingValue = cache(async (key: string): Promise<unknown | null> => {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from("site_settings") as any)
    .select("value")
    .eq("key", key)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.error(`getPublicSetting(${key}) failed:`, error.message);
    return null;
  }
  return data?.value ?? null;
});

export async function getPublicSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  return (await getPublicSettingValue(key)) as T | null;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string | null;
  phone_alt?: string | null;
  whatsapp: string | null;
  email: string | null;
}

export interface HoursSetting {
  enabled: boolean;
  schedule: string | null;
}

export interface SiteStatistics {
  enabled: boolean;
  products: number | null;
  years: number | null;
  happy_clients: number | null;
}

export interface PaymentMethodsSetting {
  pay_at_shop?: boolean;
  bank_transfer?: boolean;
  mobile_money?: boolean;
  cash_on_delivery?: boolean;
}

export async function getPaymentMethods(): Promise<PaymentMethodsSetting> {
  return (await getPublicSetting<PaymentMethodsSetting>("payment_methods")) ?? {};
}

export async function getBusinessInfo(): Promise<BusinessInfo | null> {
  return getPublicSetting<BusinessInfo>("business_info");
}

export async function getHours(): Promise<HoursSetting | null> {
  return getPublicSetting<HoursSetting>("hours");
}

export async function getSiteStatistics(): Promise<SiteStatistics | null> {
  return getPublicSetting<SiteStatistics>("site_statistics");
}
