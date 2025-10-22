import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  try {
    const { username, password, phone, role, email} = req.body;
    const user = new User({ username, password, phone, role, email});
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
