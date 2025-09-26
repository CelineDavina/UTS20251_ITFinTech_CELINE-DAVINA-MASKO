import dbConnect from "../../lib/dbConnect";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).end();

  // Optional: verify token header - set the same token in Xendit dashboard as callback token
  const tokenHeader = req.headers["x-callback-token"] || req.headers["x-callback-token".toLowerCase()];
  if (process.env.XENDIT_CALLBACK_TOKEN && tokenHeader !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.warn("Invalid callback token", tokenHeader);
    return res.status(401).json({ message: "Invalid token" });
  }

  const payload = req.body;

  // Xendit's webhook payload structure may differ. Common fields:
  // payload.data.external_id  or payload.external_id
  // payload.data.status or payload.status
  let externalId = payload?.data?.external_id || payload?.external_id || payload?.data?.id;
  let status = payload?.data?.status || payload?.status || null;

  // As fallback, try to read invoice id and match Payment.raw.external_id
  try {
    let payment;
    if (externalId) {
      payment = await Payment.findOne({ external_id: externalId });
    }

    // fallback: try by invoice id
    if (!payment) {
      const invoiceId = payload?.data?.id || payload?.id;
      if (invoiceId) payment = await Payment.findOne({ invoice_id: invoiceId });
    }

    if (!payment) {
      console.warn("Payment record not found for webhook payload", externalId, payload);
      return res.status(200).json({ ok: true, message: "No matching payment (ok)" });
    }

    // Typical paid statuses from Xendit: "PAID" or "SETTLED" (verify with your account docs)
    if (status && status.toLowerCase() === "paid" || status === "SETTLED" || status === "PAID") {
      payment.status = "PAID";
      await payment.save();

      // update checkout too
      if (payment.checkout) {
        await Checkout.findByIdAndUpdate(payment.checkout, { status: "PAID" });
      }
      return res.status(200).json({ ok: true });
    }

    // for other statuses, update raw data
    payment.raw = payload;
    await payment.save();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "webhook error" });
  }
}
