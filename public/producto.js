const API_URL = "http://localhost:3000/api/productos";

// Mostrar/Ocultar sección productos
document.getElementById("btn-ver-productos").addEventListener("click", () => {
  const seccion = document.getElementById("seccion-productos");
  if (seccion.style.display === "none") {
    seccion.style.display = "block";
    cargarProductos();
  } else {
    seccion.style.display = "none";
  }
});

// Cargar lista de productos
async function cargarProductos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener productos");
    const productos = await res.json();

    const lista = document.getElementById("productos-lista");
    lista.innerHTML = "";

    productos.forEach((prod) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${prod.id}</td>
        <td>${prod.nombre}</td>
        <td>S/ ${prod.precio}</td>
        <td>${prod.categoria_id}</td>
        <td>
          <button onclick="editarProducto(${prod.id})" class="btn btn-warning btn-sm">✏️ Editar</button>
          <button onclick="eliminarProducto(${prod.id})" class="btn btn-danger btn-sm">🗑️ Eliminar</button>
        </td>
      `;
      lista.appendChild(fila);
    });
  } catch (err) {
    console.error(err);
    alert("No se pudieron cargar los productos.");
  }
}

// Eliminar producto
async function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    alert("✅ Producto eliminado");
    cargarProductos();
  } catch (err) {
    console.error(err);
    alert("❌ No se pudo eliminar el producto.");
  }
}

// Editar producto (redirigir a otra página o modal)
function editarProducto(id) {
  window.location.href = `editar.html?id=${id}`;
}
