import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { categorySchema, categoryUpdateSchema, brandSchema, brandUpdateSchema } from "@/schemas/admin/taxonomy";

export type ServiceResult<T = undefined> = { success: true; data: T } | { success: false; error: string };
function fail(error: string): ServiceResult<never> {
  return { success: false, error };
}
async function guard(permission: string) {
  try {
    return await requirePermission(permission);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }
}

// ---- Categories ----

export async function createCategory(input: unknown): Promise<ServiceResult> {
  if (!(await guard("products.write"))) return fail("You don't have permission to manage categories.");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid category.");
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("categories") as any).insert({
    name: d.name,
    slug: d.slug,
    parent_id: d.parentId || null,
    display_order: d.displayOrder,
  });
  if (error) return fail(error.code === "23505" ? "A category with that slug already exists." : "Could not create category.");
  return { success: true, data: undefined };
}

export async function updateCategory(input: unknown): Promise<ServiceResult> {
  if (!(await guard("products.write"))) return fail("You don't have permission to manage categories.");
  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid category.");
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("categories") as any)
    .update({ name: d.name, slug: d.slug, parent_id: d.parentId || null, display_order: d.displayOrder })
    .eq("id", d.id);
  if (error) return fail(error.code === "23505" ? "A category with that slug already exists." : "Could not update category.");
  return { success: true, data: undefined };
}

/** categories.category_id on products is ON DELETE RESTRICT (0008) — a
 * category referenced by any product can never be silently deleted, so
 * this checks first and returns a clear reason instead of a raw FK error. */
export async function deleteCategory(id: string): Promise<ServiceResult> {
  if (!(await guard("products.delete"))) return fail("You don't have permission to delete categories.");
  const supabase = createClient();

  const { count } = await (supabase.from("products") as any)
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (count && count > 0) {
    return fail(`Cannot delete: ${count} product(s) still use this category. Reassign them first.`);
  }

  const { error } = await (supabase.from("categories") as any).delete().eq("id", id);
  if (error) return fail("Could not delete category.");
  return { success: true, data: undefined };
}

// ---- Brands ----

export async function createBrand(input: unknown): Promise<ServiceResult> {
  if (!(await guard("products.write"))) return fail("You don't have permission to manage brands.");
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid brand.");
  const supabase = createClient();
  const { error } = await (supabase.from("brands") as any).insert(parsed.data);
  if (error) return fail(error.code === "23505" ? "A brand with that name or slug already exists." : "Could not create brand.");
  return { success: true, data: undefined };
}

export async function updateBrand(input: unknown): Promise<ServiceResult> {
  if (!(await guard("products.write"))) return fail("You don't have permission to manage brands.");
  const parsed = brandUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid brand.");
  const { id, ...rest } = parsed.data;
  const supabase = createClient();
  const { error } = await (supabase.from("brands") as any).update(rest).eq("id", id);
  if (error) return fail(error.code === "23505" ? "A brand with that name or slug already exists." : "Could not update brand.");
  return { success: true, data: undefined };
}

/** products.brand_id is ON DELETE SET NULL (0008) — unlike categories, a
 * hard delete here wouldn't fail, it would just silently orphan every
 * referencing product's brand. Still warn first rather than let that
 * happen silently, since section 12 of the brief asks brands referenced
 * by products to be protected. */
export async function deleteBrand(id: string): Promise<ServiceResult> {
  if (!(await guard("products.delete"))) return fail("You don't have permission to delete brands.");
  const supabase = createClient();

  const { count } = await (supabase.from("products") as any).select("id", { count: "exact", head: true }).eq("brand_id", id);
  if (count && count > 0) {
    return fail(`Cannot delete: ${count} product(s) still use this brand. Reassign them first.`);
  }

  const { error } = await (supabase.from("brands") as any).delete().eq("id", id);
  if (error) return fail("Could not delete brand.");
  return { success: true, data: undefined };
}
