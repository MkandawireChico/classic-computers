import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";
import { ProductEnquiry } from "@/components/product/product-enquiry";

export const metadata: Metadata = {
  title: "Corporate & Bulk Supply",
  description: "ICT equipment supply for organisations, from Classic Computers LLC, Blantyre.",
};

export default async function CorporatePage() {
  const [businessInfo, promoMedia] = await Promise.all([
    getBusinessInfo(),
    getSiteMedia("corporate_promo", 1),
  ]);
  const promo = promoMedia[0] ?? null;
  const promoUrl = promo ? getPublicStorageUrl("site-media", promo.storage_path) : null;

  return (
    <div className="section-shell pb-16 pt-5 sm:pt-8">
      <header className={`relative isolate overflow-hidden rounded-[2rem] bg-[#17344d] px-6 py-12 text-white shadow-panel sm:px-10 sm:py-16 lg:px-14 ${promoUrl ? "grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12" : ""}`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.28),transparent_46%),linear-gradient(125deg,#081827_10%,#102d42_100%)]"
        />
        <div className="relative z-10">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
            Business solutions
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Corporate &amp; Bulk ICT Supply
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Classic Computers LLC supplies reliable ICT equipment to organisations in Blantyre. Tell
            us your requirements, and our team will prepare a tailored quotation for you.
          </p>
        </div>
        {promoUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/20 bg-[#244760] shadow-2xl shadow-black/25">
            <Image
              src={promoUrl}
              alt={promo?.alt_text ?? "Corporate ICT equipment supply from Classic Computers"}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="object-cover"
            />
            {promo?.title ? (
              <p className="absolute bottom-4 left-4 rounded-lg border border-white/25 bg-[#10243a]/90 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                {promo.title}
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 md:gap-6">
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M8 5h8M8 9h8M8 13h5m-8 8V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17l-7-4-7 4Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-slate-950 sm:text-2xl">
            Submit Your Requirements
          </h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">
            Share the equipment, quantities, and delivery details you have in mind. Our team will
            get back to you within 1–2 business days.
          </p>
          <Link
            href="/corporate/enquire"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-cyan-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 sm:w-auto"
          >
            Start Enquiry
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-2 h-4 w-4">
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </Link>
        </section>

        <section className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-panel sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 4.09 4.09l1.46-1.26a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-slate-950 sm:text-2xl">
            Need a Faster Answer?
          </h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">
            Get direct assistance with your corporate enquiry by contacting us on WhatsApp or by
            phone.
          </p>
          {businessInfo ? (
            <div className="mt-2">
              <ProductEnquiry
                product={{ name: "Corporate enquiry", sku: "CORPORATE" }}
                businessInfo={businessInfo}
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              Contact options are currently unavailable. Please use the enquiry form.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
