import dbConnect from "../../../lib/dbConnect";
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  const checkouts = await Checkout.find().populate("items.productId");
  const total = checkouts.reduce((sum, c) => sum + (c.status === "PAID" ? c.total : 0), 0);

  res.status(200).json({ checkouts, total });
}
