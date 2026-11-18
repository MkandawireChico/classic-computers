# Classic Computers website assistant

The storefront assistant uses the OpenAI Responses API from a server-side Next.js route. The browser never receives the provider API key.

## Environment variables

Set these in the cPanel Node.js application environment. Do not commit real values.

- OPENAI_API_KEY: API key created in the OpenAI API platform.
- OPENAI_MODEL: optional model override. Defaults to gpt-6-astra.

The OpenAI API is billed separately from a ChatGPT subscription. Configure an API project budget and usage alerts before enabling the assistant for customers.

## Behaviour and data boundaries

- Product recommendations use the published storefront catalogue and current inventory status.
- Product-page questions include the product's current description, specifications, warranty text and variants.
- Order status is retrieved only for a signed-in customer, through the customer's Supabase session and existing row-level security.
- Guest users are directed to the normal tracking pages. The assistant never asks for a tracking code, password, payment PIN or card details.
- Rental requests are not described as confirmed bookings.
- Repair prices, diagnoses and completion dates are never invented.
- The chat history lives in component memory and is not written to the database or browser storage.
- OpenAI requests set store to false. The application does not persist chat transcripts.
- A process-local rate limiter allows 12 messages per 10 minutes per observed IP. This is a basic guard, not a distributed rate limiter. Before running multiple app instances, replace it with a shared rate-limit store.
- Human support is available through /contact.

## Enablement

1. Create an API key in the OpenAI API platform.
2. Add OPENAI_API_KEY to the cPanel Node.js application environment.
3. Optionally set OPENAI_MODEL to a model enabled for the API project.
4. Restart the Node.js application.
5. Test catalogue questions, product warranty questions, rental and repair questions, signed-in order status, signed-out order requests, provider outage handling and rate limiting.

If OPENAI_API_KEY is absent, the chat interface stays visible but replies direct visitors to the Contact page.
