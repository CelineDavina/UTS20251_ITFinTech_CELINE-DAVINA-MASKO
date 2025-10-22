import dbConnect from "../../../lib/dbConnect";
import Checkout from "../../../models/Checkout";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import axios from "axios";

export const runtime = "nodejs";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { items, subtotal, tax, total } = req.body;
  if (!items || !total) return res.status(400).json({ message: "Invalid payload" });

  const checkout = new Checkout({
    user: user._id,
    items,
    subtotal,
    tax,
    total,
    status: "PAID",
  });
  await checkout.save();

  // ✅ WhatsApp Notification
  try {
    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: user.phone,
        message: `✅ Pembayaran Anda sebesar Rp ${total.toLocaleString()} telah diterima. Terima kasih telah berbelanja di Stem's Coffee Shop ☕`,
      },
      { headers: { Authorization: process.env.FONNTE_TOKEN } }
    );
  } catch (err) {
    console.error("❌ Gagal kirim WhatsApp:", err.response?.data || err.message);
  }

  return res.status(201).json({
    message: "Checkout berhasil dan notifikasi WhatsApp telah dikirim.",
    checkoutId: checkout._id,
  });
}
