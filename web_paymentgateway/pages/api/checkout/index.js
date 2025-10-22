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
  if (!items || !total)
    return res.status(400).json({ message: "Invalid payload" });

  // ✅ Set status to "PENDING" first — payment not made yet
  const checkout = new Checkout({
    user: user._id,
    items,
    subtotal,
    tax,
    total,
    status: "PENDING",
  });
  await checkout.save();

  // ✅ No WhatsApp yet — only after payment confirmation
  return res.status(201).json({
    message: "Checkout created successfully. Awaiting payment.",
    checkoutId: checkout._id,
  });
}
