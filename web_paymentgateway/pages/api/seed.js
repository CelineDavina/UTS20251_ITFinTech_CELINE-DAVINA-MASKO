import dbConnect from "../../lib/dbConnect";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const existing = await Product.findOne();
  if (existing) {
    return res.status(200).json({ message: "Products already seeded" });
  }

  const sample = [
    { name: "Coffee Latte", description: "Creamy milk coffee", price: 25000, category: "Drinks" },
    { name: "Chocolate Bar", description: "Delicious snack", price: 15000, category: "Snacks" },
    { name: "Bottled Water", description: "500ml", price: 8000, category: "Drinks" },
    { name: "Burger", description: "Beef burger", price: 45000, category: "Bundle" },
  ];

  await Product.insertMany(sample);

  return res.status(201).json({ message: "Products seeded successfully" });
}
