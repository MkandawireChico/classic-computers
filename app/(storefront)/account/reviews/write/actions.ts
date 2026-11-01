"use server";

import { revalidatePath } from "next/cache";
import { submitReview } from "@/lib/services/reviews";

export async function submitReviewAction(formData: FormData) {
  const rawReview = formData.get("review");
  if (typeof rawReview !== "string") {
    return { success: false as const, error: "Review details are missing." };
  }

  let input: unknown;
  try {
    input = JSON.parse(rawReview);
  } catch {
    return { success: false as const, error: "Review details are invalid. Please try again." };
  }

  const images = formData.getAll("images").filter((value): value is File => value instanceof File);
  const result = await submitReview(input, images);
  if (result.success) {
    revalidatePath("/account", "layout");
    revalidatePath("/account/reviews/write");
    revalidatePath("/");
    revalidatePath("/reviews");
  }
  return result;
}
