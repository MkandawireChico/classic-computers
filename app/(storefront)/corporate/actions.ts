"use server";

import { submitCorporateEnquiry } from "@/lib/services/enquiries";

export async function submitCorporateEnquiryAction(input: unknown, submissionKey: string) {
  return submitCorporateEnquiry(input, submissionKey);
}
