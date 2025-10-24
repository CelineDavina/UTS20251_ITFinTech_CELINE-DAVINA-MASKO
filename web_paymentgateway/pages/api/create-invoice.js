import dbConnect from "../../lib/dbConnect";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import User from "../../models/User";
import axios from "axios";
import jwt from "jsonwebtoken";

const XENDIT_API = "https://api.xendit.co/v2/invoices";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { checkoutId } = req.body;
  if (!checkoutId) return res.status(400).json({ error: "checkoutId required" });

  const checkout = await Checkout.findById(checkoutId);
  if (!checkout) return res.status(404).json({ error: "checkout not found" });


    const existingPayment = await Payment.findOne({ checkout: checkout._id });
  if (existingPayment && existingPayment.invoice_url) {
    console.log("⚠️ Existing invoice found, returning existing link...");
    return res.status(200).json({
      invoice_url: existingPayment.invoice_url,
      paymentId: existingPayment._id,
    });
  }
  
  // ✅ Ambil user setelah checkout ditemukan
  const user = await User.findById(checkout.user);

  const external_id = `checkout-${checkoutId}`;
  const amount = checkout.total;
  const invoicePayload = {
    external_id,
    amount,
    payer_email: "customer@example.com",
    description: `Payment for checkout ${checkoutId}`,
    success_redirect_url: process.env.NEXT_PUBLIC_BASE_URL,
    failure_redirect_url: process.env.NEXT_PUBLIC_BASE_URL,
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

    // ✅ Kirim notifikasi WhatsApp (hanya kalau user ditemukan dan ada nomor)
    if (user?.phone) {
      try {
        await axios.post(
          "https://api.fonnte.com/send",
          {
            target: user.phone,
            message: `🧾 *Order Created!*

☕ *STEM's Coffee Shop* ☕

Hi ${user.username || "Customer"} 👋  
Your order has been created and is awaiting payment.

🛍️ Total: *Rp ${checkout.total.toLocaleString()}*  
📦 Items: ${checkout.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}

💳 *Pay now:* ${data.invoice_url}

Please continue to payment to complete your order.`,
          },
          { headers: { Authorization: process.env.FONNTE_TOKEN } }
        );
        console.log("✅ WhatsApp payment link sent to:", user.phone);
      } catch (err) {
        console.error("❌ Failed to send notification:", err.response?.data || err.message);
      }
    }

    return res.status(201).json({ invoice_url: data.invoice_url, paymentId: payment._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal" });
  }
}
