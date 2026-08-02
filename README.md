# Magnifico

A dropshipping storefront: import products from Shopify/AliExpress, set your own
price, publish to a public store, and take payments with Paystack. Built to be
set up and deployed entirely from dashboards — no CLI, no terminal required.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style components,
Supabase (Auth, Postgres, Storage), Paystack, TanStack Query. Hosted on Vercel.

Everything below is done through web dashboards (Supabase, Paystack, Vercel,
GitHub) — you don't need Node, npm, or a terminal on your own machine.

## 1. Push the code to GitHub

If you haven't already: unzip the project, create a new GitHub repo, and
upload the whole folder through the GitHub web upload screen.

## 2. Set up Supabase

1. supabase.com → sign up → **New project**. Pick a name and a database password
   (save the password somewhere — you won't need it day-to-day, but keep it).
2. Once the project is ready: **SQL Editor** → **New query** → open
   `supabase/schema.sql` from this project, paste it in.
3. Before running it, find this line near the top and replace the placeholder
   with your real email:
   ```sql
   select auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER';
   ```
4. Click **Run**. This creates the `products` and `orders` tables plus the
   security rules that lock writes to your admin account.
5. **Storage** (left sidebar) → **New bucket** → name it exactly `products` →
   toggle **Public bucket** ON → Create.
6. Back in **SQL Editor** → **New query** → paste `supabase/storage.sql` → Run.
   This lets anyone view product images but only your admin account upload/delete them.
7. **Authentication** → **Users** → **Add user** → create yourself with the
   same email you put in step 3.
8. **Project Settings → API** — you'll need three values for step 4 below:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — keep this one secret)

## 3. Set up Paystack

1. paystack.com → sign up (Nigerian business details) → complete verification
   so you can receive payouts.
2. **Settings → API Keys & Webhooks** — copy your **Secret Key** and **Public Key**
   (use the Test keys while you're setting things up, switch to Live keys when ready).
3. On the same page, under **Webhooks**, add an endpoint once you've deployed
   (step 5) — you'll come back to this.
4. **Settings → Preferences** → turn on **Email Receipts** if you want Paystack
   to automatically email customers a receipt after a successful payment — no
   extra code needed for that.
5. If you want customers to pay in a currency other than NGN, check
   **Settings → Preferences → Settlement Currencies** — you may need to reach
   out to Paystack support to enable additional currencies on your account.

## 4. Deploy to Vercel

1. vercel.com → sign up with GitHub → **Add New → Project** → import your
   `magnifico` repo → **Import**.
2. Vercel auto-detects Next.js — leave build settings as-is.
3. Before clicking Deploy, open **Environment Variables** and add each of these
   (values from steps 2 and 3 above):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | your admin email (same as schema.sql) |
   | `NEXT_PUBLIC_CURRENCY` | `NGN` (or another currency you've enabled) |
   | `PAYSTACK_SECRET_KEY` | your Paystack secret key |
   | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | your Paystack public key |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now — see step 5 |

4. Click **Deploy**. In a couple of minutes you'll get a live URL like
   `magnifico.vercel.app`.

## 5. Wire up the webhook and finish the URL

1. Copy your live Vercel URL.
2. Back in Vercel: **Project → Settings → Environment Variables** → edit
   `NEXT_PUBLIC_SITE_URL` to your real URL (e.g. `https://magnifico.vercel.app`)
   → **Redeploy** (Vercel will prompt you, or use **Deployments → ⋯ → Redeploy**).
3. In Paystack: **Settings → API Keys & Webhooks** → add webhook URL:
   `https://your-vercel-url.vercel.app/api/paystack-webhook`.

That's it — visit `/dashboard`, sign in with the admin account you created,
and import your first product.

## 6. Custom domain

**Vercel → Project → Settings → Domains** → add your domain → follow the DNS
instructions (usually one A record or CNAME at your registrar). SSL is
provisioned automatically. Afterward, update `NEXT_PUBLIC_SITE_URL` and your
Paystack webhook URL to the new domain, same as step 5.

## Notes & known limitations

- **AliExpress importing is best-effort.** AliExpress has no public product API
  like Shopify's `/products/x.json`; the importer scrapes Open Graph tags and an
  embedded pricing blob from the page HTML, which AliExpress changes without
  notice and often blocks from server IPs. Shopify imports are reliable; treat
  AliExpress imports as "usually works, verify before publishing." For
  production-grade reliability, apply for AliExpress's official Affiliate API.
- **Shipping address** is collected on the cart page before checkout (Paystack's
  hosted payment page doesn't collect it the way Stripe's did), and stored with
  each order for fulfillment.
- **Receipt emails** are handled by Paystack itself — turn on "Email Receipts"
  in Paystack's dashboard (step 3.4). No extra email service needed.
- **Single admin only**, enforced by comparing the signed-in email to
  `NEXT_PUBLIC_ADMIN_EMAIL` on the client and to the same value baked into
  the Postgres RLS policies (`supabase/schema.sql` and `storage.sql`). To add
  more admins, change the `is_admin()` SQL function to check a list or a
  table instead of a single hardcoded email.
- **Local development**: if you ever do want to run this on a computer,
  `npm install`, copy `.env.example` to `.env.local` and fill it in, then
  `npm run dev`. Use the Paystack CLI or a tunnel (e.g. ngrok) to test webhooks
  locally, forwarding to `/api/paystack-webhook`.
