# Magnifico

A dropshipping storefront: import products from Shopify/AliExpress, set your own
price, publish to a public store, and take international payments with Stripe.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style components,
Firebase (Auth, Firestore, Storage, Hosting), Stripe Checkout, TanStack Query.

## 1. Local setup

```bash
cd magnifico
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- **Firebase client config** — Firebase Console → Project Settings → General → your web app's config.
- **NEXT_PUBLIC_ADMIN_EMAIL** — the one email allowed into `/dashboard`.
- **Firebase Admin SDK** — Project Settings → Service Accounts → Generate new private key.
  Copy `project_id`, `client_email`, and `private_key` (keep the `\n` escapes, wrap in quotes).
- **Stripe** — Stripe Dashboard → Developers → API keys, and a webhook signing secret (step 4 below).

## 2. Firebase project setup

```bash
npm install -g firebase-tools
firebase login
firebase projects:create   # or use an existing project
cp .firebaserc.example .firebaserc   # then edit the project id inside
```

Enable in the Firebase Console:
- **Authentication → Sign-in method → Email/Password**
- **Authentication → Users → Add user** — create yourself with the same email as `NEXT_PUBLIC_ADMIN_EMAIL`
- **Firestore Database → Create database**
- **Storage → Get started**

Before deploying rules, replace the placeholder in both rule files with your real admin email:

```bash
sed -i '' "s/ADMIN_EMAIL_PLACEHOLDER/you@example.com/" firestore.rules storage.rules
# (Linux: drop the '' after -i)
```

Deploy the rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/dashboard`
to sign in and import your first product.

## 4. Stripe webhook (for orders)

Local testing with the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

For production, add a webhook endpoint in the Stripe Dashboard pointing to
`https://YOUR_DOMAIN/api/stripe-webhook`, subscribed to `checkout.session.completed`,
and put that endpoint's signing secret into your deployed environment config (step 5).

## 5. Deploy to Firebase Hosting

Firebase's Next.js integration (the "web frameworks" feature) builds and deploys
the app — including API routes — as a Cloud Function automatically. You don't
need to `next export` or hand-write rewrites.

```bash
firebase experiments:enable webframeworks
firebase init hosting
# When prompted:
#  - "Detected an existing Next.js codebase" -> yes, use it
#  - Set up automatic builds/deploys with GitHub -> optional, say no for a manual deploy
```

Set your server-side environment variables (Stripe secret key, webhook secret,
Firebase Admin credentials) for the deployed function:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set FIREBASE_ADMIN_PRIVATE_KEY
# Non-secret values (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
# and all NEXT_PUBLIC_* values) get baked in at build time from .env.production —
# create that file the same way as .env.local before deploying.
```

Then:

```bash
npm run build
firebase deploy
```

Firebase will print your live Hosting URL. Update `NEXT_PUBLIC_SITE_URL` and your
Stripe webhook endpoint to point at it, then redeploy.

## 6. Custom images

Beyond the photos pulled in from the supplier, you can upload your own from
both the importer (`/dashboard/import`) and the product editor
(`/dashboard/products/[id]`) — click "Add photo," pick one or more images, and
remove any image (including scraped ones) with the × that appears on hover.
Uploads go to Firebase Storage under `products/{productId}/`; `storage.rules`
already restricts writes there to your admin email, so no extra setup is
needed beyond what you did in step 2.

## 7. Order receipt emails

The webhook queues a receipt for every paid order into a `mail` Firestore
collection. To actually send it, install Firebase's official **Trigger Email**
extension, which watches that collection and sends via SMTP:

```bash
firebase ext:install firebase/firestore-send-email
```

During setup, accept the default collection path (`mail`) and provide SMTP
credentials (e.g. a SendGrid or Mailgun API key — Gmail SMTP works for testing
but isn't reliable for production volume). If you skip this step, orders and
checkout still work fine — the `mail` documents are just never picked up.

## 8. Custom domain

Once you've deployed at least once (`firebase deploy`), point your own domain
at the store:

1. Firebase Console → **Hosting** → **Add custom domain**.
2. Enter your domain (e.g. `shop.yourbrand.com` or `yourbrand.com`) and follow
   the prompts — Firebase will ask you to add a TXT record to verify ownership,
   then an A record (or two) to route traffic to Hosting.
3. Add those records at your domain registrar/DNS provider. Propagation is
   usually minutes, occasionally up to 24 hours; Firebase auto-provisions an
   SSL certificate once it verifies the A records.
4. Update `NEXT_PUBLIC_SITE_URL` in your production env to the new domain and
   redeploy — this is what Stripe Checkout uses for success/cancel redirects.
5. In the Stripe Dashboard, update (or add) your webhook endpoint URL to
   `https://yourdomain.com/api/stripe-webhook`, and put its signing secret in
   `STRIPE_WEBHOOK_SECRET` for the deployed environment.

You can attach multiple domains (e.g. both `www.` and the bare domain) to the
same Hosting site the same way — no code or `firebase.json` changes needed.

## Notes & known limitations

- **AliExpress importing is best-effort.** AliExpress has no public product API
  like Shopify's `/products/x.json`; the importer scrapes Open Graph tags and an
  embedded pricing blob from the page HTML, which AliExpress changes without
  notice and often blocks from server IPs. Shopify imports are reliable; treat
  AliExpress imports as "usually works, verify before publishing." For
  production-grade reliability, apply for AliExpress's official Affiliate API.
- **Cart size in Stripe metadata.** The checkout session stores cart contents in
  Stripe's `metadata` field (500-char limit per key), which comfortably fits a
  typical cart. For very large carts, switch to storing the cart in Firestore
  keyed by a generated ID and pass just that ID in metadata.
- **Single admin only**, enforced by comparing the signed-in email to
  `NEXT_PUBLIC_ADMIN_EMAIL` on the client and to the same value baked into
  `firestore.rules` / `storage.rules`. To add more admins, extend that check
  (e.g. an `isAdmin` boolean on a `users/{uid}` doc) rather than hardcoding a
  second email.
