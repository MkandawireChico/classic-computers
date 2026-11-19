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
      <header className={`relative isolate overflow-hidden rounded-[2rem] bg-[#f4f7f9] px-6 py-12 text-[#10243a] shadow-sm sm:px-10 sm:py-16 lg:px-14 ${promoUrl ? "grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12" : ""}`}>
        
        <div className="relative z-10">
          <p className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-800">
            Business solutions
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#10243a] sm:text-5xl lg:text-6xl">
            Corporate &amp; Bulk ICT Supply
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Classic Computers LLC supplies reliable ICT equipment to organisations in Blantyre. Tell
            us your requirements, and our team will prepare a tailored quotation for you.
          </p>
        </div>
        {promoUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
            review your requirements and contact you about pricing, availability and next steps.
          </p>
          <Link
            href="/corporate/enquire"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#123653] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 sm:w-auto"
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

      <section aria-labelledby="corporate-supply-heading" className="mt-14 border-t border-slate-200 pt-12 sm:mt-16 sm:pt-14">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">What we supply</p>
          <h2 id="corporate-supply-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#10243a] sm:text-3xl">
            ICT equipment for your organisation
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Share the products and specifications your team needs. We will review the request and discuss suitable options, availability and pricing.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { number: "01", title: "Computers", detail: "Business laptops, desktops and workstation requirements." },
            { number: "02", title: "Printing", detail: "Printers, scanners and related office equipment." },
            { number: "03", title: "Networking", detail: "Routers, network equipment and connectivity requirements." },
            { number: "04", title: "Accessories", detail: "Monitors, storage, peripherals and supporting equipment." },
          ].map((item) => (
            <article key={item.number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-extrabold tracking-[0.14em] text-brand-700">{item.number}</p>
              <h3 className="mt-3 text-base font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="corporate-process-heading" className="mt-14 rounded-3xl bg-[#102f49] px-6 py-9 text-white sm:mt-16 sm:px-9 sm:py-11">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">How enquiries work</p>
            <h2 id="corporate-process-heading" className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">A clear route from request to quotation.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">Give us the information you have. Our team will follow up to clarify the rest.</p>
            <Link href="/corporate/enquire" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#102f49] transition-colors hover:bg-cyan-50">
              Start a corporate enquiry
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              { number: "01", title: "Send requirements", detail: "Tell us the equipment, quantities and delivery location." },
              { number: "02", title: "Review and clarify", detail: "We review your request and contact you about specifications or availability." },
              { number: "03", title: "Receive a quotation", detail: "We discuss pricing and the next steps before any order is confirmed." },
            ].map((item) => (
              <li key={item.number} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs font-extrabold tracking-[0.14em] text-cyan-200">{item.number}</p>
                <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <p className="mt-6 text-center text-xs leading-5 text-slate-500">
        A submitted enquiry is a request for information or a quotation. Pricing, stock availability and order acceptance are confirmed separately.
      </p>
    </div>
  );
}
