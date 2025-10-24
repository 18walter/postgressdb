const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://waltersistemasweb.onrender.com/api"; // backend en producción


const api = {
  async obtenerCategorias() {
    const res = await fetch(`${API_URL}/categorias`);
    return res.json();
  },

  async obtenerProductos(categoriaId = null) {
    const url = categoriaId 
      ? `${API_URL}/productos?categoria=${categoriaId}` 
      : `${API_URL}/productos`;
    const res = await fetch(url);
    return res.json();
  },

  async obtenerProductoPorId(id) {
    const res = await fetch(`${API_URL}/productos/${id}`);
    return res.json();
  },

  async crearCategoria(data) {
    const res = await fetch(`${API_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ✅ función corregida
  async crearProducto(producto) {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto)
    });
    return res.json();
  },

  async crearImagen(data) {
    const res = await fetch(`${API_URL}/imagenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
// FUNCION PARA LISTAR CATEGORIA Y ELIMINAR //
// =======================
// CATEGORIAS
// =======================

app.get("/api/categorias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categorias");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

app.put("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const [result] = await pool.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ success: true, message: "Categoría actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
});

app.delete("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM categorias WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ success: true, message: "Categoría eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});
