import dbConnect from "../../../lib/dbConnect";
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  await dbConnect();
  const {
    query: { id },
    method,
  } = req;

  if (method === "GET") {
    const checkout = await Checkout.findById(id);
    if (!checkout) return res.status(404).json({ message: "Not found" });
    return res.status(200).json({ checkout });
  }
  res.status(405).json({ message: "Method not allowed" });
}
