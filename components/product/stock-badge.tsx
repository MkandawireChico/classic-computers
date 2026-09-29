import { Badge } from "@/components/ui/badge";
import type { InventoryStatus } from "@/types/catalog";

/**
 * Translates the internal inventory_status enum into customer-friendly
 * language. Deliberately never displays quantity_on_hand or any other raw
 * inventory number — that stays internal (section 14 of the brief).
 */
export function StockBadge({ status }: { status: InventoryStatus | null }) {
  switch (status) {
    case "in_stock":
      return <Badge variant="success">In stock</Badge>;
    case "low_stock":
      return <Badge variant="warning">Limited stock</Badge>;
    case "out_of_stock":
      return <Badge variant="danger">Out of stock</Badge>;
    case "coming_soon":
      return <Badge variant="info">Coming soon</Badge>;
    case "discontinued":
      return <Badge variant="neutral">Discontinued</Badge>;
    default:
      return <Badge variant="neutral">Available on request</Badge>;
  }
}
