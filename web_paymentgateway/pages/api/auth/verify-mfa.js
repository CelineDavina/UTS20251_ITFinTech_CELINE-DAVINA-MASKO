import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  const { username, code } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: "User not found" });
  if (user.mfaCode !== code)
    return res.status(400).json({ message: "Invalid code" });
  if (Date.now() > user.mfaExpires)
    return res.status(400).json({ message: "Code expired" });

  user.mfaCode = null;
  user.mfaExpires = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );

  res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

  return res.status(200).json({
    message: "Login success",
    user: { username: user.username, role: user.role },
  });
}
