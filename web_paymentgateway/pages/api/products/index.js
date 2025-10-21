import dbConnect from "../../../lib/dbConnect";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const sample = [
    { name: "Espresso", description: "Strong black coffee", price: 20000, category: "Coffee", image: "https://bubblebeecoffeehouse.ca/wp-content/uploads/2023/04/Expresso1.jpg" },
    { name: "Cappuccino", description: "Coffee with steamed milk and foam", price: 25000, category: "Coffee", image: "https://noir.web.id/wp-content/uploads/2022/04/jual-cappucino-terdekat.jpg" },
    { name: "Latte", description: "Creamy milk coffee with a smooth finish", price: 25000, category: "Coffee", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Latte_with_winged_tulip_art.jpg/1200px-Latte_with_winged_tulip_art.jpg" },
    { name: "Chocolate Cake", description: "Rich chocolate cake slice", price: 30000, category: "Dessert", image: "https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/chelsweets.com/wp-content/uploads/2021/09/death-by-chocolate-cakev4-4-1024x1024.jpg" },
  ];

  switch (req.method) {
    // 📍 GET all products
    case "GET": {
      let products = await Product.find();

      // if empty, seed automatically
      if (products.length === 0) {
        await Product.insertMany(sample);
        products = await Product.find();
      }

      return res.status(200).json({ data: products });
    }

    // 📍 POST new product (for admin)
    case "POST": {
      try {
        const { name, description, price, category, image } = req.body;
        const product = new Product({ name, description, price, category, image });
        await product.save();
        return res.status(201).json({ message: "Product added", product });
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    // invalid method
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
