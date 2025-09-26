import dbConnect from "../../lib/dbConnect";
import Checkout from "../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "POST") {
    const { items, subtotal, tax, total } = req.body;
    if (!items || !total) return res.status(400).json({ error: "Invalid payload" });

    const checkout = new Checkout({ items, subtotal, tax, total });
    await checkout.save();
    return res.status(201).json({ checkoutId: checkout._id, checkout });
  }
  res.status(405).json({ message: "Method not allowed" });
}
