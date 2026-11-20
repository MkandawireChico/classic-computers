"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ProductVariantContextValue {
  selectedVariantId: string | null;
  setSelectedVariantId: (variantId: string | null) => void;
}

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

export function ProductVariantProvider({
  initialVariantId,
  children,
}: {
  initialVariantId: string | null;
  children: ReactNode;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariantId);

  return (
    <ProductVariantContext.Provider value={{ selectedVariantId, setSelectedVariantId }}>
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  const context = useContext(ProductVariantContext);
  if (!context) {
    throw new Error("Product variant components must be rendered inside ProductVariantProvider.");
  }
  return context;
}
