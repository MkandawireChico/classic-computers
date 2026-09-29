"use server";

import { submitCorporateEnquiry } from "@/lib/services/enquiries";

export async function submitCorporateEnquiryAction(input: unknown) {
  return submitCorporateEnquiry(input);
}
