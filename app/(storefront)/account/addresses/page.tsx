import { listAddresses } from "@/lib/services/addresses";
import { Badge } from "@/components/ui/badge";
import { NewAddressForm } from "./new-address-form";
import { DeleteAddressButton } from "./delete-address-button";
import { EditAddressForm } from "./edit-address-form";

export default async function AddressesPage() {
  const addresses = await listAddresses();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Checkout details</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Addresses</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Manage the delivery addresses saved to your account.</p>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm sm:p-10">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">No saved addresses</h3>
          <p className="mt-2 text-sm text-slate-600">Add a delivery address for faster checkout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  {address.label ? <span className="text-base font-bold text-slate-900">{address.label}</span> : null}
                  {address.is_default ? <Badge variant="info" className="text-xs">Default</Badge> : null}
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>{address.city}</p>
                </div>
              </div>
                <div className="flex shrink-0 gap-2">
                  <DeleteAddressButton addressId={address.id} />
                </div>
              </div>
              <EditAddressForm address={address} />
            </div>
          ))}
        </div>
      )}

      <section className="border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-slate-950">Add an address</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Save another delivery address for checkout.</p>
        <NewAddressForm />
      </section>
    </div>
  );
}
