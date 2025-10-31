// ================================
// 🔹 DEPENDENCIAS E IMPORTS
// ================================
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// ================================
// 🔹 CONFIGURACIÓN BASE
// ================================
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // sirve index.html
app.use("/images", express.static("images")); // sirve imágenes locales

console.log("✅ CORS configurado y archivos estáticos servidos correctamente");

// ================================
// 🔹 VARIABLES DE ENTORNO
// ================================
const PORT = process.env.PORT || 3000;
const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api"
    : "https://waltersistemasweb.onrender.com/api"; // tu URL en Render

// ================================
// 🔹 RUTA BASE
// ================================
app.get("/", (req, res) => {
  res.send("🚀 ¡API funcionando correctamente!");
});

// ================================
// 🔹 CRUD PRODUCTOS
// ================================
app.get("/api/productos", async (req, res) => {
  try {
    const { categoria } = req.query;
    let sql = `
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
    `;
    const params = [];

    if (categoria) {
      sql += " WHERE p.categoria_id = $1";
      params.push(categoria);
    }

    const result = await pool.query(sql, params);

    const productos = result.rows.map((p) => ({
      ...p,
      imagen: p.imagen.startsWith("http")
        ? p.imagen
        : `${baseUrl}/images/${p.imagen}`,
    }));

    res.json(productos);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    let { nombre, descripcion, precio, categoria_id, categoria_nombre, imagen } =
      req.body;

    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Crear categoría si no existe
    if (!categoria_id && categoria_nombre) {
      const resultadoCat = await pool.query(
        "INSERT INTO categorias (nombre) VALUES ($1) RETURNING id",
        [categoria_nombre]
      );
      categoria_id = resultadoCat.rows[0].id;
    }

    if (!categoria_id) {
      return res
        .status(400)
        .json({ error: "Debes seleccionar una categoría o escribir una nueva" });
    }

    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, descripcion, precio, categoria_id, imagen || null]
    );

    res.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Error al guardar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, imagen } = req.body;

    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, precio = $3, categoria_id = $4, imagen = $5
       WHERE id = $6 RETURNING *`,
      [nombre, descripcion, precio, categoria_id, imagen || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ ok: true, message: "🗑️ Producto eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ================================
// 🔹 CRUD CATEGORÍAS
// ================================
app.get("/api/categorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener categorias:", err);
    res.status(500).json({ error: "Error al obtener categorias" });
  }
});

app.put("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const result = await pool.query(
      "UPDATE categorias SET nombre = $1 WHERE id = $2",
      [nombre, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ ok: true, message: "Categoría actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar categoría:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.delete("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ ok: true, message: "🗑️ Categoría eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar categoría:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ================================
// 🔹 USUARIOS (Registro / Login / Reset)
// ================================
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "Faltan datos obligatorios" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3)",
      [nombre, correo, hashed]
    );

    res.json({ message: "✅ Usuario registrado correctamente" });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [
      correo,
    ]);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const usuario = result.rows[0];
    const valid = await bcrypt.compare(password, usuario.password);

    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "✅ Inicio de sesión exitoso",
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    const { correo } = req.body;
    const nuevaPassword = await bcrypt.hash("123456", 10);
    const result = await pool.query(
      "UPDATE usuarios SET password = $1 WHERE correo = $2",
      [nuevaPassword, correo]
    );

    if (result.rowCount === 0)
      return res.status(400).json({ error: "Correo no encontrado" });

    res.json({ message: "🔑 Contraseña restablecida a '123456'" });
  } catch (err) {
    console.error("❌ Error en reset:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ================================
// 🔹 INICIAR SERVIDOR
// ================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
