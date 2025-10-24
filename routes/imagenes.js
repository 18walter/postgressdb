const express = require("express");
const router = express.Router();
const db = require("../db");

// POST nueva imagen
router.post("/", async (req, res) => {
  const { url, producto_id } = req.body;
  await db.query("INSERT INTO imagenes (url, producto_id) VALUES (?,?)", [url, producto_id]);
  res.json({ mensaje: "Imagen agregada" });
});

module.exports = router;

