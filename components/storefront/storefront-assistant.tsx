"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type SuggestedProduct = {
  name: string;
  slug: string;
  price: number;
  inventoryStatus: string;
  condition: string;
};

const QUICK_PROMPTS = [
  "Help me find a laptop",
  "How do rentals work?",
  "I need help with a repair",
];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
    discontinued: "Discontinued",
    coming_soon: "Coming soon",
    not_confirmed: "Stock not confirmed",
  };
  return labels[status] ?? "Stock not confirmed";
}

export function StorefrontAssistant() {
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I’m the Classic Computers assistant. Ask me about products, prices, rentals, repairs or your order.",
    },
  ]);
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, isOpen]);

  async function sendMessage(value: string) {
    const content = value.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }].slice(-10);
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, pagePath: pathname }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "The assistant is unavailable. Please contact our team.");
        return;
      }
      setProducts(data.products ?? []);
      setMessages((current) => [...current, { role: "assistant", content: data.message }].slice(-12));
    } catch {
      setError("We could not reach the assistant. Please try again or contact our team.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function startNewChat() {
    setMessages([{
      role: "assistant",
      content: "Hello! I’m the Classic Computers assistant. Ask me about products, prices, rentals, repairs or your order.",
    }]);
    setProducts([]);
    setError(null);
    setDraft("");
  }

  return (
    <>
      {isOpen ? (
        <section
          role="dialog"
          aria-label="Classic Computers chat assistant"
          className="fixed inset-x-3 bottom-3 z-[90] flex h-[min(680px,calc(100dvh-6rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_-28px_rgba(2,6,23,0.55)] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(680px,calc(100dvh-8rem))] sm:w-[390px]"
        >
          <header className="flex items-center justify-between gap-3 bg-navy-950 px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-sm font-black text-white">CC</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">Classic Computers</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Website assistant
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={startNewChat} aria-label="Start a new chat" title="New chat" className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M7 4 4 7l3 3M17 14l3 3-3 3M20 17H4" /></svg>
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
          </header>

          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-[11px] leading-5 text-slate-500">Product details and stock are checked against the website catalogue. Please do not share passwords, PINs or payment details.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={message.role === "user" ? "max-w-[88%] rounded-2xl rounded-br-md bg-brand-700 px-3.5 py-3 text-sm leading-6 text-white shadow-sm" : "max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 shadow-sm"}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="rounded-full border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
                  <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" /><span>Preparing a reply…</span></span>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p>{error}</p>
                <Link href="/contact" className="mt-2 inline-flex font-bold text-brand-800 underline underline-offset-2">Contact our team</Link>
              </div>
            ) : null}

            {products.length > 0 ? (
              <div className="space-y-2">
                <p className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Catalogue matches</p>
                {products.map((product) => (
                  <Link key={product.slug} href={"/product/" + product.slug} onClick={() => setIsOpen(false)} className="block rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:shadow-sm">
                    <span className="block text-sm font-semibold text-slate-900">{product.name}</span>
                    <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-brand-800">{formatMoney(product.price)}</span>
                      <span className="text-[11px] font-medium text-slate-500">{statusLabel(product.inventoryStatus)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <Link href="/contact" onClick={() => setIsOpen(false)} className="text-xs font-semibold text-brand-800 hover:text-brand-900">Talk to our team</Link>
              <span className="text-[10px] text-slate-400">Replies are AI-assisted</span>
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="classic-chat-message">Your message</label>
              <input
                id="classic-chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={1200}
                placeholder="Ask us anything about Classic Computers…"
                className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                disabled={isSending}
              />
              <button type="submit" disabled={isSending || !draft.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" /></svg>
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          aria-expanded={false}
          className="fixed bottom-4 right-4 z-[91] flex h-14 items-center gap-2 rounded-full bg-navy-950 px-4 text-white shadow-[0_14px_34px_-12px_rgba(2,6,23,0.65)] transition hover:-translate-y-0.5 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:bottom-6 sm:right-6"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.1a8.5 8.5 0 1 1 16.1-4.4Z" /><path d="M8 11h8M8 15h5" /></svg>
          <span className="text-sm font-bold">Ask us</span>
        </button>
      ) : null}
    </>
  );
}
