import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import axios from "axios";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.mfaCode = code;
  user.mfaExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  try {
    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: user.phone,
      message: `STEM's Coffee Shop - Kode verifikasi Anda: ${code}. Kode ini berlaku selama 5 menit. Jangan bagikan kepada siapa pun.`
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );

    console.log("✅ Fonnte response:", response.data);
    res.status(200).json({ message: "OTP sent to WhatsApp" });
  } catch (err) {
    console.error("❌ Fonnte error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to send OTP",
      error: err.response?.data || err.message,
    });
  }
}
