import dbConnect from "../../lib/dbConnect";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Please login first to view your history." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const payments = await Payment.find()
      .populate({
        path: "checkout",
        match: { user: decoded.id }, // only checkouts owned by this user
      })
      .sort({ createdAt: -1 });

    const userPayments = payments.filter((p) => p.checkout !== null);

    return res.status(200).json({ payments: userPayments });
  } catch (err) {
    console.error("Error fetching user payments:", err);
    return res.status(500).json({ payments: [] });
  }
}

