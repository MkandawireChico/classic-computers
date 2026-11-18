import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Classic Computers LLC, our technology products and services in Blantyre, Malawi.",
};

const services = [
  {
    number: "01",
    title: "Laptop sales",
    description:
      "New and quality pre-owned laptops for students, professionals, businesses and everyday use.",
    tone: "border-brand-200 bg-brand-50 text-brand-800",
  },
  {
    number: "02",
    title: "Laptop rentals",
    description:
      "Rental options for organisations, training programmes, conferences, projects and other temporary needs.",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  {
    number: "03",
    title: "Desktops and accessories",
    description:
      "Desktop computers, monitors, chargers, keyboards, storage devices and other computing essentials.",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    number: "04",
    title: "Printers and office equipment",
    description:
      "Printing solutions and office technology for individuals, businesses and institutions.",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
  },
  {
    number: "05",
    title: "Corporate ICT supply",
    description: "ICT equipment supply for businesses, institutions and organisations.",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  },
  {
    number: "06",
    title: "Technical support and repairs",
    description: "Practical troubleshooting, repair services and after-sales support.",
    tone: "border-slate-200 bg-slate-100 text-slate-800",
  },
];

export default async function AboutPage() {
  const [businessInfo, storePhotos] = await Promise.all([
    getBusinessInfo(),
    getSiteMedia("store_photo", 1),
  ]);
  const storePhoto = storePhotos[0] ?? null;
  const storePhotoUrl = storePhoto ? getPublicStorageUrl("site-media", storePhoto.storage_path) : null;

  return (
    <ContentPage
      eyebrow="About Classic Computers"
      title="Technology that works for you"
      description="Classic Computers LLC is a technology and electronics business based in Blantyre, Malawi. We help individuals, students, businesses and organisations find practical computing products and support."
    >
      {storePhotoUrl ? (
        <section aria-label="Classic Computers store in Blantyre" className="grid items-center gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1.1fr_0.9fr] sm:gap-7 sm:p-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={storePhotoUrl}
              alt={storePhoto?.alt_text ?? "Classic Computers store in Blantyre"}
              fill
              sizes="(max-width: 639px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="px-2 py-3 sm:px-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Visit our store</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-slate-950">A local technology team in Blantyre.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Visit Classic Computers for product enquiries, equipment support and service assistance.
            </p>
            {businessInfo?.address ? <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{businessInfo.address}</p> : null}
            <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-sm font-bold text-white transition hover:bg-brand-800">
              Contact our team
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="what-we-do-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">
              What we do
            </p>
            <h2
              id="what-we-do-heading"
              className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl"
            >
              Products and services
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900"
          >
            Browse products
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.number}
              className="group rounded-2xl border-slate-200 p-5 transition-shadow hover:shadow-md sm:p-6"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-extrabold ${service.tone}`}
              >
                {service.number}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-slate-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          aria-labelledby="approach-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
            Our approach
          </p>
          <h2 id="approach-heading" className="mt-2 text-2xl font-black text-slate-900">
            Helpful advice, practical options
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            We aim to make reliable technology more accessible through practical product options,
            competitive pricing and customer-focused service.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Understand what you need before suggesting equipment.",
              "Help you compare suitable technology options.",
              "Provide clear information about products and their condition.",
              "Support customers after a purchase or service request.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-cyan-800"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="visit-heading"
          className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-5 shadow-sm sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Visit us</p>
          <h2 id="visit-heading" className="mt-2 text-2xl font-black text-slate-900">
            Find us in Blantyre
          </h2>
          <p className="mt-4 font-bold text-slate-800">
            {businessInfo?.name ?? "Classic Computers LLC"}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {businessInfo?.address ??
              "Shree Satyanarayan Building, Glyn Jones Road, opposite First Capital Bank, Blantyre, Malawi."}
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-sm hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Contact our team
          </Link>
        </section>
      </div>
    </ContentPage>
  );
}
