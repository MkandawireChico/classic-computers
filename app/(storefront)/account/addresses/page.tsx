import { listAddresses } from "@/lib/services/addresses";
import { Badge } from "@/components/ui/badge";
import { NewAddressForm } from "./new-address-form";
import { DeleteAddressButton } from "./delete-address-button";

export default async function AddressesPage() {
  const addresses = await listAddresses();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Addresses</h1>

      {addresses.length === 0 ? (
        <p className="mb-4 text-sm text-gray-500">You haven&apos;t saved any addresses yet.</p>
      ) : (
        <div className="mb-4 space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between rounded-card border border-surface-border p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  {address.label ? <span className="text-sm font-medium text-gray-900">{address.label}</span> : null}
                  {address.is_default ? <Badge variant="info">Default</Badge> : null}
                </div>
                <p className="text-sm text-gray-600">{address.line1}</p>
                {address.line2 ? <p className="text-sm text-gray-600">{address.line2}</p> : null}
                <p className="text-sm text-gray-600">{address.city}</p>
              </div>
              <DeleteAddressButton addressId={address.id} />
            </div>
          ))}
        </div>
      )}

      <NewAddressForm />
    </div>
  );
}
