import dbConnect from "../../../lib/dbConnect";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;

  switch (method) {
    case "GET":
      try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Not found" });
        res.status(200).json(product);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
      break;

    case "PUT":
      try {
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Not found" });
        res.status(200).json(updated);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
      break;

    case "DELETE":
      try {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Product deleted" });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}
