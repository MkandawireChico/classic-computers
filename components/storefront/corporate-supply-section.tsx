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
  const promoMedia = await getSiteMedia("corporate_promo", 1);
  const promo = promoMedia[0] ?? null;
  const promoUrl = promo ? getPublicStorageUrl("site-media", promo.storage_path) : null;

  return (
    <section aria-labelledby="corporate-supply-heading" className="border-y border-slate-200 bg-[#f1f5f7]">
      <div className="section-shell grid gap-9 py-14 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-800">For businesses and institutions</p>
          <h2 id="corporate-supply-heading" className="mt-4 max-w-xl text-3xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#10243a] sm:text-4xl lg:text-5xl">
            Technology for the work your team needs to do.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
            Sourcing computers for an organisation, school or project? Tell us what your team needs and request a quotation from Classic Computers.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/corporate/enquire" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#123653] px-6 text-sm font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
              Request a quotation <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
              Contact our team
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_1fr] sm:items-stretch">
          {promoUrl ? (
            <div className="relative min-h-[230px] overflow-hidden rounded-xl border border-slate-200 bg-white sm:min-h-[340px]">
              <Image
                src={promoUrl}
                alt={promo?.alt_text || "Corporate technology supply from Classic Computers"}
                fill
                sizes="(max-width: 639px) 100vw, 28vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className={promoUrl ? "divide-y divide-slate-200 border-y border-slate-200" : "divide-y divide-slate-200 border-y border-slate-200 sm:col-span-2"}>
            {OFFERINGS.map((item) => (
              <div key={item.number} className="grid grid-cols-[38px_1fr] gap-3 py-5 first:pt-2 last:pb-2">
                <span className="pt-1 font-mono text-xs font-bold text-brand-700">{item.number}</span>
                <div>
                  <h3 className="text-base font-bold text-[#10243a]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
