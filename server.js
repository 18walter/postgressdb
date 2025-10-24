const express = require("express");
const cors = require("cors");
const pool = require("./db");  // 👈 tu pool de conexión existente
const bcrypt = require("bcryptjs");

const app = express();

require('dotenv').config();

app.use(express.json());
app.use(express.static("public")); // sirve index.html automáticamente

/* ===============================
   🔹 Configuración de CORS
   Permite cualquier origen para desarrollo
================================= */
app.use(cors()); // ✅ permite todas las solicitudes desde cualquier origen
console.log("✅ CORS configurado para permitir cualquier origen");

/* ===============================
   🔹 Iniciar servidor
================================= */
const PORT = process.env.PORT || 3000;
const baseUrl =
  process.env.NODE_ENV === "production"
    ? `https://sistemaweb-4mwj.onrender.com`
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("¡API funcionando correctamente!");
});/*==========================
   🔹 CRUD de Productos
================================= */

// Obtener producto por ID (con JOIN a categorías)
app.get("/api/productos", async (req, res) => {
  const { categoria } = req.query;
  let sql = `
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
  `;
  const params = [];
  if (categoria) {
    sql += " WHERE p.categoria_id = ?";
    params.push(categoria);
  }
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});


// Listar productos (con filtro por categoría opcional + JOIN a categorías)
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
      sql += " WHERE p.categoria_id = ?";
      params.push(categoria);
    }

    const [rows] = await pool.query(sql, params);

    // Generar URLs completas de imágenes solo si son locales
    const productos = rows.map(p => ({
      ...p,
      imagen: p.imagen.startsWith("http") ? p.imagen : `${baseUrl}/images/${p.imagen}`
    }));

    res.json(productos);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Crear producto
app.post("/api/productos", async (req, res) => {
  try {
    let { nombre, descripcion, precio, categoria_id, categoria_nombre, imagen } = req.body;

    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Si no se pasa categoria_id pero sí categoria_nombre => crear la categoría
    if (!categoria_id && categoria_nombre) {
      const [resultadoCat] = await pool.execute(
        "INSERT INTO categorias (nombre) VALUES (?)",
        [categoria_nombre]
      );
      categoria_id = resultadoCat.insertId; // usamos el id de la nueva categoría
    }

    // Si aún no hay categoria_id => error
    if (!categoria_id) {
      return res
        .status(400)
        .json({ error: "Debes seleccionar una categoría o escribir una nueva" });
    }

    const sql = `
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen || null,
    ]);

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Error al guardar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Editar producto
app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, imagen } = req.body;

    const sql = `
      UPDATE productos 
      SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen || null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({
      ...rows[0],
      imagen: rows[0].imagen.startsWith("http") ? rows[0].imagen : `${baseUrl}/images/${rows[0].imagen}`
    });
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Eliminar producto
app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ ok: true, message: "🗑️ Producto eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ===============================
   🔹 Categorías
================================= */
app.get("/api/categorias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categorias");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener categorias:", err);
    res.status(500).json({ error: "Error al obtener categorias" });
  }
});

// Editar categoría
app.put("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const [result] = await pool.execute("UPDATE categorias SET nombre = ? WHERE id = ?", [
      nombre,
      id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json({ ok: true, message: "Categoría actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar categoría:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Eliminar categoría
app.delete("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM categorias WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json({ ok: true, message: "🗑️ Categoría eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar categoría:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ===============================
   🔹 Usuarios
================================= */
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "Faltan datos obligatorios" });

    const hashed = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)";
    await pool.execute(sql, [nombre, correo, hashed]);

    res.json({ message: "✅ Usuario registrado correctamente" });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);

    if (rows.length === 0) return res.status(400).json({ error: "Usuario no encontrado" });

    const usuario = rows[0];
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

    const [result] = await pool.query("UPDATE usuarios SET password = ? WHERE correo = ?", [
      nuevaPassword,
      correo,
    ]);
    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Correo no encontrado" });

    res.json({ message: "🔑 Contraseña restablecida a '123456'" });
  } catch (err) {
    console.error("❌ Error en reset:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ===============================
   🔹 Servir imágenes
================================= */
app.use("/images", express.static("images"));
