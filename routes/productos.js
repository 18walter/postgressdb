const express = require("express");
const router = express.Router();
const db = require("../db");

// GET productos (todos o por categoría)
router.get("/", async (req, res) => {
  const { categoria } = req.query;
  let query = "SELECT * FROM productos";
  let params = [];
  if (categoria) {
    query += " WHERE categoria_id = ?";
    params.push(categoria);
  }
  const [rows] = await db.query(query, params);

  // traer imágenes (solo primera para listado)
  for (let prod of rows) {
    const [imgs] = await db.query("SELECT * FROM imagenes WHERE producto_id = ? LIMIT 1", [prod.id]);
    prod.imagenes = imgs;
  }
  res.json(rows);
});

// GET producto por id (con todas las imágenes)
router.get("/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ mensaje: "Producto no encontrado" });

  const [imgs] = await db.query("SELECT * FROM imagenes WHERE producto_id = ?", [req.params.id]);
  rows[0].imagenes = imgs;
  res.json(rows[0]);
});

// POST nuevo producto
router.post("/", async (req, res) => {
  const { nombre, descripcion, precio, categoria_id } = req.body;
  await db.query("INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?,?,?,?)", 
    [nombre, descripcion, precio, categoria_id]);
  res.json({ mensaje: "Producto creado" });
});

module.exports = router;
