import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ message: "Authenticated", user: decoded });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
