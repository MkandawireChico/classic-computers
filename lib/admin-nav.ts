export interface AdminNavItem {
  href: string;
  label: string;
  /** Permission key required to see this link. `null` means any staff
   * member (anyone who reaches the admin area at all) can see it. */
  permission: string | null;
  anyPermissions?: string[];
}

export interface AdminNavGroup {
  label: string | null; // null = ungrouped (Dashboard)
  items: AdminNavItem[];
}

/**
 * Grouped per the Phase 6 brief. This is a UI/navigation convenience
 * only — grouping items here does not grant or restrict anything; each
 * item still only renders if the current user holds its `permission`
 * (see AdminSidebar), and every underlying route still enforces its own
 * requirePermission()/RLS regardless of whether it's reachable from the
 * sidebar at all.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Dashboard", permission: null }],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/products", label: "Products", permission: "products.read" },
      { href: "/admin/categories", label: "Categories", permission: "products.read" },
      { href: "/admin/brands", label: "Brands", permission: "products.read" },
      { href: "/admin/inventory", label: "Inventory", permission: "inventory.read" },
      { href: "/admin/orders", label: "Orders", permission: "orders.read" },
      { href: "/admin/documents", label: "Quotations & Invoices", permission: null, anyPermissions: ["orders.read", "repairs.read", "rentals.read"] },
      { href: "/admin/discounts", label: "Discounts", permission: "settings.write" },
      { href: "/admin/customers", label: "Customers", permission: "customers.read" },
      { href: "/admin/analytics", label: "Customer interest analytics", permission: "reports.read" },
      { href: "/admin/reviews", label: "Reviews", permission: "reviews.read" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/repairs", label: "Repairs", permission: "repairs.read" },
      { href: "/admin/rentals", label: "Rentals", permission: "rentals.read" },
      { href: "/admin/students", label: "Student Verification", permission: "students.read" },
      { href: "/admin/enquiries", label: "Corporate Enquiries", permission: "customers.read" },
      { href: "/admin/referrals", label: "Referrals", permission: "settings.write" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/site-media", label: "Site Media", permission: "settings.write" },
      { href: "/admin/settings", label: "Settings", permission: "settings.read" },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        href: "/admin/email-notifications",
        label: "Email notifications",
        permission: "email.notifications.read",
        anyPermissions: ["customers.read", "rentals.read", "repairs.read", "students.read", "orders.read"],
      },
      { href: "/admin/users", label: "Staff & Roles", permission: "users.manage" },
      { href: "/admin/activity", label: "Activity log", permission: "audit_logs.read" },
    ],
  },
];

// Flat view, kept for any code that still wants "all nav items" without
// caring about grouping (e.g. a future breadcrumb builder).
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
