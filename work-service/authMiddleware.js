import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey"; // same as auth-service

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, email }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}
