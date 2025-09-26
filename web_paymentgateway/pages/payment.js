import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkoutId) return;
    fetch(`/api/checkout/${checkoutId}`)
      .then((r) => r.json())
      .then((d) => setCheckout(d.checkout));
  }, [checkoutId]);

  async function payNow() {
    setLoading(true);
    const res = await fetch("/api/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.invoice_url) {
      // redirect user to xendit invoice page
      window.location.href = data.invoice_url;
    } else {
      alert("Failed to create invoice: " + JSON.stringify(data));
    }
  }

  if (!checkout) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Secure Checkout</h2>
      <div>Subtotal: Rp {checkout.subtotal}</div>
      <div>Tax: Rp {checkout.tax}</div>
      <div><strong>Total: Rp {checkout.total}</strong></div>
      <div style={{ marginTop: 15 }}>
        <button onClick={payNow} disabled={loading}>{loading ? "Processing..." : "Pay with Xendit"}</button>
      </div>

      <div style={{ marginTop: 30 }}>
        <div>After payment completes you will be redirected here. The server will also receive a webhook from Xendit to automatically mark the order LUNAS (PAID).</div>
      </div>
    </div>
  );
}
