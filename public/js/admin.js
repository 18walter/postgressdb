// admin.js (versión corregida)
document.addEventListener("DOMContentLoaded", async () => {
  const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://sistemaweb-4mwj.onrender.com/api";// tu backend en Railway
 // ajusta si usas otra URL
  const formProducto = document.getElementById("form-producto");
  const categoriaSelect = document.getElementById("categoriaExistente");
  const categoriaInput = document.getElementById("categoriaNueva");
  const btnVerProductos = document.getElementById("btn-ver-productos");
  const seccionProductos = document.getElementById("seccion-productos");
  const tbodyProductos = document.getElementById("productos-lista");
  const btnLogout = document.getElementById("btn-logout");

  let isSubmitting = false;

  /* ---------------------------
     Cargar categorías (limpia antes)
     --------------------------- */
  async function cargarCategorias() {
    try {
      const res = await fetch(`${baseUrl}/api/categorias`);
      if (!res.ok) throw new Error("Error al obtener categorías");
      const categorias = await res.json();

      if (!categoriaSelect) return;

      categoriaSelect.innerHTML =
        "<option value=''>-- Selecciona una categoría --</option>";

      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        categoriaSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error en fetch (categorías):", error);
    }
  }

  /* ---------------------------
     Crear fila de producto
     --------------------------- */
  function crearFilaProducto(p) {
    const tr = document.createElement("tr");
    tr.dataset.id = p.id;
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.categoria || ""}</td>
      <td>
        <button class="btn-editar btn btn-sm btn-warning">✏️</button>
        <button class="btn-eliminar btn btn-sm btn-danger">🗑️</button>
      </td>
    `;

    tr.querySelector(".btn-editar").addEventListener("click", () => {
      window.location.href = `editar.html?id=${tr.dataset.id}`;
    });

    tr.querySelector(".btn-eliminar").addEventListener("click", async () => {
      const id = tr.dataset.id;
      if (!confirm("¿Estás seguro de eliminar este producto?")) return;
      try {
        const res = await fetch(`${baseUrl}/api/productos/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar el producto");
        tr.remove();
        alert("Producto eliminado correctamente");
      } catch (err) {
        alert(err.message);
      }
    });

    return tr;
  }

  /* ---------------------------
     Cargar productos
     --------------------------- */
  async function cargarProductos() {
    if (!tbodyProductos) return;
    try {
      const res = await fetch(`${baseUrl}/api/productos`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const productos = await res.json();

      tbodyProductos.innerHTML = "";
      const frag = document.createDocumentFragment();
      productos.forEach(p => frag.appendChild(crearFilaProducto(p)));
      tbodyProductos.appendChild(frag);
    } catch (error) {
      console.error("Error en fetch (productos):", error);
    }
  }

  /* ---------------------------
     Submit del formulario
     --------------------------- */
  if (formProducto) {
    formProducto.addEventListener("submit", async e => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const submitBtn =
        formProducto.querySelector('button[type="submit"]') ||
        formProducto.querySelector("button");

      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Guardando...";

        try {
          const form = e.target;
          const datos = {
            nombre: form.nombre.value.trim(),
            descripcion: form.descripcion.value.trim(),
            precio: parseFloat(form.precio.value),
            categoria_nombre: form.categoria_nueva.value.trim() || "",
            categoria_id: form.categoria_existente.value
              ? parseInt(form.categoria_existente.value)
              : null,
            imagen: form.imagen.value.trim()
          };

          const respuesta = await api.crearProducto(datos);

          if (respuesta && !respuesta.error && respuesta.id) {
            try {
              const resProd = await fetch(`${baseUrl}/api/productos/${respuesta.id}`);
              if (resProd.ok) {
                const productoCreado = await resProd.json();
                if (tbodyProductos) {
                  tbodyProductos.appendChild(crearFilaProducto(productoCreado));
                }
              }

              alert("✅ Producto guardado correctamente con ID: " + respuesta.id);

              // 🔹 Resetear y recargar categorías después de guardar
              formProducto.reset();
              categoriaSelect.disabled = false;
              categoriaInput.disabled = false;
              await cargarCategorias();

            } catch (errProd) {
              console.error("Error al obtener producto creado:", errProd);
              alert("Producto guardado pero falló la actualización automática en UI.");
              await cargarProductos();
              await cargarCategorias();
            }
          } else {
            alert("❌ Error al guardar: " + (respuesta.error || "Desconocido"));
          }
        } catch (err) {
          console.error("Error:", err);
          alert("⚠️ No se pudo conectar con la base de datos");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "💾 Guardar Producto";
          }
          isSubmitting = false;
        }
      }
    });

    // 🔹 Si se resetea manualmente, habilitamos y recargamos categorías
    formProducto.addEventListener("reset", async () => {
      categoriaSelect.disabled = false;
      categoriaInput.disabled = false;
      await cargarCategorias();
    });
  }

  /* ---------------------------
     Mostrar / ocultar sección productos
     --------------------------- */
  if (btnVerProductos) {
    btnVerProductos.addEventListener("click", async () => {
      if (seccionProductos.style.display === "none" || seccionProductos.style.display === "") {
        await cargarProductos();
        seccionProductos.style.display = "block";
      } else {
        seccionProductos.style.display = "none";
      }
    });
  }

  /* ---------------------------
     Logout
     --------------------------- */
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }

  /* ---------------------------
     Input/category toggle (UX)
     --------------------------- */
  if (categoriaInput && categoriaSelect) {
    categoriaInput.addEventListener("input", () => {
      categoriaSelect.disabled = categoriaInput.value.trim() !== "";
    });

    categoriaSelect.addEventListener("change", () => {
      categoriaInput.disabled = categoriaSelect.value !== "";
    });
  }

  // Carga inicial
  await Promise.all([cargarCategorias(), cargarProductos()]);
});



// FUNCIONES PARA LISTAR CATEGORIA Y ELIMINAR Y EDITAR //
/********************************************
 admin.js - Listar / Editar / Eliminar categorías
 ********************************************/

// Ajusta si tu backend está en otra URL/puerto
const baseUrl = "http://localhost:3000";

/* ===========================
   Inicialización cuando DOM
   esté listo (seguro)
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  const btnVerCategorias = document.getElementById("btn-ver-categorias");
  const seccionCategorias = document.getElementById("seccion-categorias");

  // Mostrar/ocultar sección y cargar lista
  if (btnVerCategorias) {
    btnVerCategorias.addEventListener("click", async () => {
      if (!seccionCategorias) return;
      const isHidden = seccionCategorias.style.display === "none" || seccionCategorias.style.display === "";
      seccionCategorias.style.display = isHidden ? "block" : "none";
      if (isHidden) await cargarCategorias();
    });
  }

  // Si quieres cargar automáticamente al entrar:
  // cargarCategorias();
});

/* ===========================
   Cargar categorías desde API
   =========================== */
async function cargarCategorias() {
  try {
    const res = await fetch(`${baseUrl}/api/categorias`);
    console.log("GET /api/categorias →", res.status);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const categorias = await res.json();

    const tbody = document.getElementById("categorias-lista");
    if (!tbody) {
      console.warn("No se encontró #categorias-lista en el DOM");
      return;
    }
    tbody.innerHTML = ""; // limpiar

    // Creamos filas dinámicamente y añadimos event listeners (sin usar onclick inline)
    categorias.forEach((cat) => {
      const tr = document.createElement("tr");

      // Columna ID
      const tdId = document.createElement("td");
      tdId.textContent = cat.id;

      // Columna Nombre
      const tdNombre = document.createElement("td");
      tdNombre.textContent = cat.nombre;

      // Columna Acciones (botones con listeners)
      const tdAcc = document.createElement("td");

      // Botón Editar
      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.className = "btn btn-warning btn-sm me-2";
      btnEditar.textContent = "✏️ Editar";
      btnEditar.addEventListener("click", () => editarCategoria(cat.id, cat.nombre));

      // Botón Eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.className = "btn btn-danger btn-sm";
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.addEventListener("click", () => eliminarCategoria(cat.id));

      tdAcc.appendChild(btnEditar);
      tdAcc.appendChild(btnEliminar);

      tr.appendChild(tdId);
      tr.appendChild(tdNombre);
      tr.appendChild(tdAcc);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Error cargando categorías:", err);
    alert("Error cargando categorías. Revisa la consola para más detalles.");
  }
}

/* ===========================
   Eliminar categoría (robusto)
   =========================== */
async function eliminarCategoria(id) {
  if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;

  try {
    const res = await fetch(`${baseUrl}/api/categorias/${id}`, { method: "DELETE" });

    // Leemos como texto y tratamos de parsear JSON (evita crashes si backend devuelve HTML)
    const text = await res.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // no es JSON
      console.warn("Respuesta DELETE no es JSON:", text);
    }

    console.log("DELETE /api/categorias/%s → %s", id, res.status, data || text);

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || text || `Error ${res.status}`;
      alert("No se pudo eliminar: " + msg);
      return;
    }

    alert((data && (data.message || "Categoría eliminada")) || "Categoría eliminada");
    await cargarCategorias();
  } catch (err) {
    console.error("❌ Error eliminando categoría:", err);
    alert("Error eliminando categoría. Revisa la consola.");
  }
}

/* ===========================
   Editar categoría (prompt simple)
   =========================== */
async function editarCategoria(id, nombreActual) {
  const nuevoNombre = prompt("Nuevo nombre de categoría:", nombreActual);
  if (!nuevoNombre || nuevoNombre.trim() === "" || nuevoNombre === nombreActual) return;

  try {
    const res = await fetch(`${baseUrl}/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoNombre.trim() }),
    });

    const text = await res.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Respuesta PUT no es JSON:", text);
    }

    console.log("PUT /api/categorias/%s → %s", id, res.status, data || text);

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || text || `Error ${res.status}`;
      alert("No se pudo actualizar: " + msg);
      return;
    }

    alert((data && (data.message || "Categoría actualizada")) || "Categoría actualizada");
    await cargarCategorias();
  } catch (err) {
    console.error("❌ Error editando categoría:", err);
    alert("Error editando categoría. Revisa la consola.");
  }
}
// modal para lista producto y lista categoria tres rayitas //
document.addEventListener("DOMContentLoaded", async () => {
  const btnMenu = document.getElementById("btn-menu");
  const modalGestion = document.getElementById("modal-gestion");

  const btnModalProductos = document.getElementById("btn-modal-productos");
  const btnModalCategorias = document.getElementById("btn-modal-categorias");

  const seccionProductos = document.getElementById("modal-seccion-productos");
  const seccionCategorias = document.getElementById("modal-seccion-categorias");

  const tbodyProductos = document.getElementById("modal-productos-lista");
  const tbodyCategorias = document.getElementById("modal-categorias-lista");

  const baseUrl = "http://localhost:3000";

  // Abrir modal
  btnMenu.addEventListener("click", () => {
    modalGestion.style.display = "block";
    seccionProductos.style.display = "none";
    seccionCategorias.style.display = "none";
  });

  // Cerrar al hacer click fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === modalGestion) {
      modalGestion.style.display = "none";
    }
  });

  // Mostrar productos
  btnModalProductos.addEventListener("click", async () => {
    seccionProductos.style.display = "block";
    seccionCategorias.style.display = "none";
    await cargarProductos();
  });

  // Mostrar categorías
  btnModalCategorias.addEventListener("click", async () => {
    seccionCategorias.style.display = "block";
    seccionProductos.style.display = "none";
    await cargarCategorias();
  });

  /* =======================
     Cargar productos
  ======================= */
  async function cargarProductos() {
    try {
      const res = await fetch(`${baseUrl}/api/productos`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const productos = await res.json();

      tbodyProductos.innerHTML = "";
      productos.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id;
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.nombre}</td>
          <td>${p.precio}</td>
          <td>${p.categoria || ""}</td>
          <td>
            <button class="btn-editar btn btn-warning btn-sm">✏️</button>
            <button class="btn-eliminar btn btn-danger btn-sm">🗑️</button>
          </td>
        `;
        // Editar producto
        tr.querySelector(".btn-editar").addEventListener("click", () => {
          window.location.href = `editar.html?id=${p.id}`;
        });
        // Eliminar producto
        tr.querySelector(".btn-eliminar").addEventListener("click", async () => {
          if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
          const res = await fetch(`${baseUrl}/api/productos/${p.id}`, { method: "DELETE" });
          if (res.ok) tr.remove();
        });

        tbodyProductos.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      alert("Error cargando productos");
    }
  }

  /* =======================
     Cargar categorías
  ======================= */
  async function cargarCategorias() {
    try {
      const res = await fetch(`${baseUrl}/api/categorias`);
      if (!res.ok) throw new Error("Error al cargar categorías");
      const categorias = await res.json();

      tbodyCategorias.innerHTML = "";
      categorias.forEach(c => {
        const tr = document.createElement("tr");
        tr.dataset.id = c.id;
        tr.innerHTML = `
          <td>${c.id}</td>
          <td>${c.nombre}</td>
          <td>
            <button class="btn-editar btn btn-warning btn-sm">✏️</button>
            <button class="btn-eliminar btn btn-danger btn-sm">🗑️</button>
          </td>
        `;
        // Editar categoría
        tr.querySelector(".btn-editar").addEventListener("click", () => {
          const nuevoNombre = prompt("Nuevo nombre:", c.nombre);
          if (!nuevoNombre) return;
          fetch(`${baseUrl}/api/categorias/${c.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
          }).then(() => cargarCategorias());
        });
        // Eliminar categoría
        tr.querySelector(".btn-eliminar").addEventListener("click", async () => {
          if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
          await fetch(`${baseUrl}/api/categorias/${c.id}`, { method: "DELETE" });
          tr.remove();
        });

        tbodyCategorias.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      alert("Error cargando categorías");
    }
  }
});
