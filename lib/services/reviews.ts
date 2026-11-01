import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { deliverAdminEmailForRequest } from "@/lib/services/admin-email-outbox";
import { getPublicStorageUrl } from "@/lib/storage";

export type ReviewResult =
  | { success: true; reviewId: string; warning?: string }
  | { success: false; error: string };

const ALLOWED_REVIEW_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REVIEW_IMAGES = 5;

const reviewSubmissionSchema = z.object({
  review_type: z.enum(["product", "rental", "repair"]),
  product_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  rental_booking_id: z.string().uuid().optional(),
  repair_ticket_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(10).max(2000),
}).refine((data) => {
  // Validate that the correct transaction reference is provided based on review type
  if (data.review_type === "product") {
    return !!data.product_id && !!data.order_id && !data.rental_booking_id && !data.repair_ticket_id;
  }
  if (data.review_type === "rental") {
    return !!data.rental_booking_id && !data.product_id && !data.order_id && !data.repair_ticket_id;
  }
  if (data.review_type === "repair") {
    return !!data.repair_ticket_id && !data.product_id && !data.order_id && !data.rental_booking_id;
  }
  return false;
}, {
  message: "Invalid transaction reference for the review type",
  path: ["review_type"],
});

export async function submitReview(input: unknown, images: File[] = []): Promise<ReviewResult> {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  if (images.length > MAX_REVIEW_IMAGES) {
    return { success: false, error: `You can attach up to ${MAX_REVIEW_IMAGES} photos.` };
  }
  for (const image of images) {
    if (!ALLOWED_REVIEW_IMAGE_TYPES.has(image.type)) {
      return { success: false, error: "Review photos must be JPEG, PNG, or WebP images." };
    }
    if (image.size === 0 || image.size > MAX_REVIEW_IMAGE_BYTES) {
      return { success: false, error: "Each review photo must be smaller than 5MB." };
    }
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to submit a review." };
  }

  const d = parsed.data;

  let productId: string | null = null;
  if (d.review_type === "product") {
    const { data: order, error: orderError } = await (supabase.from("orders") as any)
      .select("id, order_status")
      .eq("id", d.order_id)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (orderError) {
      console.error("Review order verification failed:", orderError.message);
      return { success: false, error: "Could not verify this order. Please try again." };
    }
    if (!order) return { success: false, error: "This order does not belong to your account." };
    if (order.order_status !== "completed") {
      return { success: false, error: "Only completed orders can be reviewed." };
    }

    const { data: orderItem, error: orderItemError } = await (supabase.from("order_items") as any)
      .select("product_id")
      .eq("order_id", d.order_id)
      .eq("product_id", d.product_id)
      .limit(1)
      .maybeSingle();

    if (orderItemError) {
      console.error("Review order item verification failed:", orderItemError.message);
      return { success: false, error: "Could not verify the product in this order." };
    }
    if (!orderItem) return { success: false, error: "This product is not part of the selected order." };
    productId = orderItem.product_id;
  } else if (d.review_type === "rental") {
    const { data: rental, error: rentalError } = await (supabase.from("rental_bookings") as any)
      .select("id, status")
      .eq("id", d.rental_booking_id)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (rentalError) {
      console.error("Review rental verification failed:", rentalError.message);
      return { success: false, error: "Could not verify this rental. Please try again." };
    }
    if (!rental) return { success: false, error: "This rental does not belong to your account." };
    if (rental.status !== "returned") {
      return { success: false, error: "Only returned rentals can be reviewed." };
    }
  } else {
    const { data: repair, error: repairError } = await (supabase.from("repair_tickets") as any)
      .select("id, status")
      .eq("id", d.repair_ticket_id)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (repairError) {
      console.error("Review repair verification failed:", repairError.message);
      return { success: false, error: "Could not verify this repair. Please try again." };
    }
    if (!repair) return { success: false, error: "This repair does not belong to your account." };
    if (repair.status !== "completed") {
      return { success: false, error: "Only completed repairs can be reviewed." };
    }
  }

  const uploadedPaths: string[] = [];
  if (images.length > 0) {
    try {
      const storage = createAdminClient().storage.from("review-images");
      for (const image of images) {
        const extension = image.type === "image/jpeg" ? "jpg" : image.type === "image/png" ? "png" : "webp";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await storage.upload(path, image, {
          contentType: image.type,
          upsert: false,
        });
        if (uploadError) {
          console.error("Review photo upload failed:", uploadError.message);
          if (uploadedPaths.length > 0) {
            const { error: cleanupError } = await storage.remove(uploadedPaths);
            if (cleanupError) console.error("Review photo cleanup failed:", cleanupError.message);
          }
          return { success: false, error: "Could not upload review photos. Please try again." };
        }
        uploadedPaths.push(path);
      }
    } catch (err) {
      console.error("Review photo upload error:", err instanceof Error ? err.message : String(err));
      return { success: false, error: "Could not upload review photos. Please try again." };
    }
  }

  try {
    const { data: review, error: reviewError } = await (supabase.from("reviews") as any).insert({
      customer_id: user.id,
      review_type: d.review_type,
      product_id: productId,
      order_id: d.order_id || null,
      rental_booking_id: d.rental_booking_id || null,
      repair_ticket_id: d.repair_ticket_id || null,
      rating: d.rating,
      title: d.title || null,
      comment: d.comment,
    }).select("id").single();

    if (reviewError) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await createAdminClient().storage.from("review-images").remove(uploadedPaths);
        if (cleanupError) console.error("Review photo cleanup failed:", cleanupError.message);
      }
      if (
        reviewError.code === "23505" ||
        reviewError.message?.includes("already submitted a review")
      ) {
        return { success: false, error: "You have already submitted a review for this transaction." };
      }
      if (reviewError.message?.includes("review transaction")) {
        return { success: false, error: "This transaction is not eligible for a review." };
      }
      console.error("Review insert error:", reviewError.message, reviewError.code, reviewError.details);
      return { success: false, error: "Could not submit your review. Please try again." };
    }

    let warning: string | undefined;
    if (uploadedPaths.length > 0) {
      const imageInserts = uploadedPaths.map((imagePath) => ({
        review_id: review.id,
        image_url: imagePath,
        alt_text: null,
      }));

      const { error: imagesError } = await (supabase as any).from("review_images").insert(imageInserts);
      if (imagesError) {
        console.error("Review image records insert failed:", imagesError.message);
        const { error: cleanupError } = await createAdminClient().storage.from("review-images").remove(uploadedPaths);
        if (cleanupError) console.error("Review photo cleanup failed:", cleanupError.message);
        warning = "Your review was submitted, but the photos could not be attached.";
      }
    }

    await deliverAdminEmailForRequest("review_submitted", review.id);
    return { success: true, reviewId: review.id, warning };
  } catch (err) {
    console.error("Review submission error:", err instanceof Error ? err.message : String(err));
    if (uploadedPaths.length > 0) {
      try {
        const { error: cleanupError } = await createAdminClient().storage.from("review-images").remove(uploadedPaths);
        if (cleanupError) console.error("Review photo cleanup failed:", cleanupError.message);
      } catch (cleanupErr) {
        console.error("Review photo cleanup error:", cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr));
      }
    }
    return { success: false, error: "Could not submit your review. Please try again." };
  }
}

export async function getCustomerReviewableTransactions(customerId: string) {
  const supabase = createClient();

  const [orders, rentals, repairs] = await Promise.all([
    (supabase.from("orders") as any)
      .select("id, order_number, created_at")
      .eq("customer_id", customerId)
      .eq("order_status", "completed")
      .order("created_at", { ascending: false }),
    (supabase.from("rental_bookings") as any)
      .select("id, created_at, rental_products!inner(product_id, products!inner(name, product_images(storage_path, is_primary, display_order, variant_id)))")
      .eq("customer_id", customerId)
      .eq("status", "returned")
      .order("created_at", { ascending: false }),
    (supabase.from("repair_tickets") as any)
      .select("id, ticket_number, created_at, device_type, brand, model")
      .eq("customer_id", customerId)
      .eq("status", "completed")
      .order("created_at", { ascending: false }),
  ]);

  for (const result of [orders, rentals, repairs]) {
    if (result.error) {
      console.error("Could not load reviewable transactions:", result.error.message);
      throw new Error("Could not load your completed transactions for review.");
    }
  }

  const completedOrders = orders.data ?? [];
  const orderIds = completedOrders.map((order: any) => order.id);
  const { data: orderItems, error: orderItemsError } = orderIds.length
      ? await (supabase.from("order_items") as any)
          .select("order_id, product_id, product_name_snapshot, product:products(product_images(storage_path, is_primary, display_order, variant_id))")
          .in("order_id", orderIds)
      : { data: [], error: null };
  if (orderItemsError) {
      console.error("Could not load items for reviewable orders:", orderItemsError.message);
      throw new Error("Could not load the products from your completed orders.");
  }

  const itemsByOrder = new Map<string, any[]>();
  for (const item of orderItems ?? []) {
      const images = item.product?.product_images ?? [];
      const primaryImage = images.find((image: any) => image.is_primary && image.variant_id === null)
        ?? images.find((image: any) => image.variant_id === null)
        ?? images.find((image: any) => image.is_primary)
        ?? images[0];
      const reviewItem = {
        ...item,
        image_url: primaryImage ? getPublicStorageUrl("product-images", primaryImage.storage_path) : null,
      };
      const items = itemsByOrder.get(reviewItem.order_id) ?? [];
      items.push(reviewItem);
      itemsByOrder.set(reviewItem.order_id, items);
  }

  const { data: submittedReviews, error: reviewsError } = await (supabase.from("reviews") as any)
      .select("review_type, order_id, product_id, rental_booking_id, repair_ticket_id, status")
    .eq("customer_id", customerId)
    .neq("status", "rejected");
  if (reviewsError) {
    console.error("Could not load existing customer reviews:", reviewsError.message);
    throw new Error("Could not check which transactions you have already reviewed.");
  }

  const existing = submittedReviews ?? [];
  const reviewedOrders = new Set(
    existing.filter((r: any) => r.review_type === "product").map((r: any) => `${r.order_id}:${r.product_id}`),
  );
  const reviewedRentals = new Set(
    existing.filter((r: any) => r.review_type === "rental").map((r: any) => r.rental_booking_id),
  );
  const reviewedRepairs = new Set(
    existing.filter((r: any) => r.review_type === "repair").map((r: any) => r.repair_ticket_id),
  );

  return {
    orders: completedOrders.map((order: any) => {
      const seenProducts = new Set<string>();
      return {
        ...order,
        order_items: (itemsByOrder.get(order.id) ?? []).filter((item: any) => {
          if (reviewedOrders.has(`${order.id}:${item.product_id}`) || seenProducts.has(item.product_id)) {
            return false;
          }
          seenProducts.add(item.product_id);
          return true;
        }),
      };
    }).filter((order: any) => order.order_items.length > 0),
    rentals: (rentals.data ?? []).filter((rental: any) => !reviewedRentals.has(rental.id)).map((rental: any) => {
      const images = rental.rental_products?.products?.product_images ?? [];
      const primaryImage = images.find((image: any) => image.is_primary && image.variant_id === null)
        ?? images.find((image: any) => image.variant_id === null)
        ?? images.find((image: any) => image.is_primary)
        ?? images[0];
      return {
        ...rental,
        image_url: primaryImage ? getPublicStorageUrl("product-images", primaryImage.storage_path) : null,
      };
    }),
    repairs: (repairs.data ?? []).filter((repair: any) => !reviewedRepairs.has(repair.id)),
  };
}
