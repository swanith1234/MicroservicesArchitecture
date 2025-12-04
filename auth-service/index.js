import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = "supersecret"; // later move to Kubernetes secret

app.get("/", (req, res) => {
  res.json({ status: "auth service running" });
});

// Change the listen line to:
app.listen(3000, "0.0.0.0", () => console.log("Auth service running on port 3000"));

// REGISTER USER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // check email exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hashed }
    });

    res.json({ message: "User registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN USER
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// VERIFY TOKEN
app.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

