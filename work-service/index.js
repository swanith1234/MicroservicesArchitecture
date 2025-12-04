import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./authMiddleware.js";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ status: "work service running" });
});

// Change the listen line to:
app.listen(3001, "0.0.0.0", () => console.log("work service running on port 3000"));

app.post("/dreams",authMiddleware, async (req, res) => {
  try {
    const { userId, title } = req.body;

    const dream = await prisma.dream.create({
      data: { userId, title }
    });

    res.json(dream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create dream" });
  }
});

app.post("/tasks",authMiddleware, async (req, res) => {
  try {
    const { userId, title, deadline, dreamId } = req.body;

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        deadline: new Date(deadline),
        dreamId
      }
    });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});
app.get("/tasks/:userId",authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { userId: Number(userId) },
      include: {
        checkpoints: true,
        Dream: true
      }
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
app.post("/tasks/:taskId/checkpoints",authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const checkpoint = await prisma.checkpoint.create({
      data: {
        taskId: Number(taskId),
        title
      }
    });

    res.json(checkpoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add checkpoint" });
  }
});
app.patch("/checkpoints/:id/complete",authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoint = await prisma.checkpoint.update({
      where: { id: Number(id) },
      data: { completed: true }
    });

    res.json(checkpoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to complete checkpoint" });
  }
});
