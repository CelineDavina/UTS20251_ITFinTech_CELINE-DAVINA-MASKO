import dbConnect from "../../../lib/dbConnect";
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    const checkout = await Checkout.findById(id).populate("user");
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    return res.status(200).json({ checkout });
  }

  res.status(405).json({ message: "Method not allowed" });
}
