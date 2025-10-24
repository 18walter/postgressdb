const express = require("express");
const router = express.Router();
const db = require("../db");

// GET todas las categorías
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categorias");
  res.json(rows);
});

// POST nueva categoría
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  await db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
  res.json({ mensaje: "Categoría creada" });
});

module.exports = router;
