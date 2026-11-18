# Classic Computers website assistant

The floating storefront assistant uses Groq's OpenAI-compatible Chat Completions API from a server-side Next.js route. The browser never receives the provider API key.

## Free provider configuration

The assistant defaults to Groq's free-tier model `openai/gpt-oss-20b`. Groq publishes free-tier limits for this model. Current documented limits are 30 requests per minute and 1,000 requests per day per organisation, alongside token limits. Limits are subject to change and the exact limits for your account appear in the Groq Console.

- Create a free account at https://console.groq.com.
- Create an API key at https://console.groq.com/keys.
- Add `GROQ_API_KEY` to the cPanel Node.js application environment.
- `GROQ_MODEL` is optional. The default is `openai/gpt-oss-20b`.

Do not upgrade to a paid plan or add a payment method for this setup. The application makes requests only to the free-tier model configured above. If Groq changes its free-tier availability or limits, the assistant should fail safely and direct visitors to Contact rather than silently switching to a paid service.

## Behaviour and data boundaries

- Product recommendations use the published storefront catalogue and current inventory status.
- Product-page questions include the product's current description, specifications, warranty text and variants.
- Order status is retrieved only for a signed-in customer, through the customer's Supabase session and existing row-level security.
- The assistant sends only selected order fields to Groq when a signed-in customer asks an order question. Do not ask customers to enter passwords, payment PINs, card details or one-time codes.
- Guest users are directed to the normal tracking pages.
- Rental requests are not described as confirmed bookings.
- Repair prices, diagnoses and completion dates are never invented.
- The chat history lives in component memory and is not written to the database or browser storage.
- The application does not persist chat transcripts. Groq's service terms state that inputs and outputs are not used for model training unless the customer explicitly grants permission. Groq notes limited access or retention may occur when needed for service reliability, legal compliance or abuse monitoring. Review Groq's current terms before enabling customer order context.
- A process-local rate limiter allows 12 messages per 10 minutes per observed IP. This is a basic guard, not a distributed rate limiter. Groq's organisation-level limits also apply. Before running multiple app instances, replace the local limiter with a shared rate-limit store.
- Human support is available through /contact.

## Enablement and testing

1. Create a free Groq account and generate an API key.
2. Add `GROQ_API_KEY` to the cPanel Node.js application environment. Keep the key private and never paste it into chat or commit it to GitHub.
3. Leave `GROQ_MODEL` unset to use the default free-tier model.
4. Restart the Node.js application.
5. Test catalogue questions, product warranty questions, rental and repair questions, signed-in order status, signed-out order requests, provider outage handling and rate limiting.
6. Check usage and model limits in the Groq Console. Do not enable a paid plan.

If `GROQ_API_KEY` is absent, the chat interface stays visible but replies direct visitors to the Contact page.
