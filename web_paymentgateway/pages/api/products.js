import dbConnect from "../../lib/dbConnect";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "GET") {
    const products = await Product.find();
    return res.status(200).json({ success: true, data: products });
  }
  res.status(405).json({ success: false, message: "Method not allowed" });
}
