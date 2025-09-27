import dbConnect from "../../lib/dbConnect";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout"; // ✅ add this

export default async function handler(req, res) {
  try {
    await dbConnect();

    const payments = await Payment.find()
      .populate("checkout") 
      .sort({ createdAt: -1 });

    return res.status(200).json({ payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    return res.status(500).json({ payments: [] });
  }
}

