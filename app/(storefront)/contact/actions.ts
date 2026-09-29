"use server";

import { submitGeneralEnquiry } from "@/lib/services/enquiries";

export async function submitGeneralEnquiryAction(input: unknown) {
  return submitGeneralEnquiry(input);
}
