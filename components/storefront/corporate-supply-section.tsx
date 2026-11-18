import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

const OFFERINGS = [
  { number: "01", title: "Equipment supply", detail: "Computers and ICT equipment for teams and organisations." },
  { number: "02", title: "Quotation requests", detail: "Share your requirements with our team for a tailored quotation." },
  { number: "03", title: "Rental enquiries", detail: "Ask about equipment rental options for your organisation." },
];

export async function CorporateSupplySection() {
  const [promo] = await getSiteMedia("corporate_promo", 1);
  const promoUrl = promo ? getPublicStorageUrl("site-media", promo.storage_path) : null;
  return (
    <section aria-labelledby="corporate-supply-heading" className="relative isolate overflow-hidden bg-[#17344d] text-white">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(ellipse_at_80%_50%,rgba(8,130,177,0.24),transparent_60%)]" />
      <div className="section-shell relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="flex flex-col items-start">
            <p className="inline-flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-300">
              <span className="h-px w-9 bg-cyan-300" /> For business and institutions
            </p>
            <h2 id="corporate-supply-heading" className="mt-6 max-w-xl text-3xl font-semibold leading-[1.04] tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
              Equip your team.
              <span className="block text-cyan-300">Move work forward.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Sourcing computers for an organisation, school or project? Tell us what your team needs and request a quotation from Classic Computers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/corporate" className="inline-flex min-h-14 items-center justify-center gap-4 bg-cyan-400 px-6 text-sm font-extrabold text-[#081827] transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Request a quotation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/contact" className="inline-flex min-h-14 items-center justify-center border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                Contact our team
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            {promoUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/20 bg-[#244760] shadow-2xl shadow-black/20">
                <Image
                  src={promoUrl}
                  alt={promo.alt_text || "Corporate technology supply from Classic Computers"}
                  fill
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#071a2b]/35 via-transparent to-transparent" />
                {promo.title ? (
                  <p className="absolute bottom-4 left-4 rounded-lg border border-white/25 bg-[#10243a]/90 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    {promo.title}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="border-y border-white/15">
              {OFFERINGS.map((item) => (
                <div key={item.number} className="grid grid-cols-[42px_1fr] gap-4 border-b border-white/15 py-6 last:border-b-0 sm:grid-cols-[54px_1fr] sm:gap-6 sm:py-7">
                  <span className="pt-1 font-mono text-xs text-cyan-300">{item.number}</span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{item.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}