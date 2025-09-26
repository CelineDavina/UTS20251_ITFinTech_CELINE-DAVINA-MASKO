import dbConnect from "../../lib/dbConnect";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";

const XENDIT_API = "https://api.xendit.co/v2/invoices";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { checkoutId } = req.body;
  if (!checkoutId) return res.status(400).json({ error: "checkoutId required" });

  const checkout = await Checkout.findById(checkoutId);
  if (!checkout) return res.status(404).json({ error: "checkout not found" });

  const external_id = `checkout-${checkoutId}`;
  const amount = checkout.total;
  const invoicePayload = {
    external_id,
    amount,
    payer_email: "customer@example.com", // optional, replace if you collect an email
    description: `Payment for checkout ${checkoutId}`,
    success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?checkoutId=${checkoutId}`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?checkoutId=${checkoutId}&status=failed`,
    // callback_url can be set here if Xendit supports it for your account:
    callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
  };

  try {
    const auth = Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString("base64");
    const r = await fetch(XENDIT_API, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoicePayload),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("Xendit create invoice error", data);
      return res.status(500).json({ error: "Xendit error", details: data });
    }

    // Save payment record
    const payment = new Payment({
      external_id,
      checkout: checkout._id,
      amount,
      invoice_id: data.id || data.invoice_id || data.external_id || "",
      invoice_url: data.invoice_url,
      raw: data,
      status: "PENDING",
    });
    await payment.save();

    return res.status(201).json({ invoice_url: data.invoice_url, paymentId: payment._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal" });
  }
}
