// Server-only Paystack REST helpers. Paystack doesn't ship an official
// Node SDK worth depending on — their API is simple enough to call directly
// with fetch. Import only from API routes (uses the secret key).
const PAYSTACK_BASE = "https://api.paystack.co";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

interface InitializeParams {
  email: string;
  amount: number; // in the base currency unit (e.g. naira), NOT kobo — converted below
  currency?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

interface InitializeResponse {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
}

/** Starts a Paystack Checkout transaction and returns the hosted payment page URL. */
export async function initializeTransaction(params: InitializeParams): Promise<InitializeResponse["data"]> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Paystack expects the lowest currency unit (kobo/cents)
      currency: params.currency || process.env.NEXT_PUBLIC_CURRENCY || "NGN",
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  });

  const json: InitializeResponse = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Couldn't start a Paystack transaction.");
  }
  return json.data;
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string; first_name?: string; last_name?: string };
    metadata: Record<string, any>;
  };
}

/** Confirms a transaction's real status directly with Paystack (belt-and-suspenders alongside webhook signature verification). */
export async function verifyTransaction(reference: string): Promise<VerifyResponse["data"]> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
  });
  const json: VerifyResponse = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Couldn't verify that transaction.");
  }
  return json.data;
}
