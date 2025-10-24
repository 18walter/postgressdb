const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Cargar datos del producto
async function cargarProducto() {
  try {
    const res = await fetch(`http://localhost:3000/api/productos/${id}`);
    if (!res.ok) throw new Error("No se pudo cargar el producto");
    const producto = await res.json();

    document.getElementById("id").value = producto.id;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("cantidad").value = producto.cantidad;
  } catch (error) {
    alert("Error al cargar el producto: " + error.message);
  }
}

document.getElementById("editarForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productoEditado = {
    nombre: document.getElementById("nombre").value,
    precio: parseFloat(document.getElementById("precio").value),
    cantidad: parseInt(document.getElementById("cantidad").value)
  };

  try {
    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoEditado)
    });

    if (!res.ok) throw new Error("No se pudo actualizar");

    alert("Producto actualizado con éxito ✅");
    window.location.href = "index.html";
  } catch (error) {
    alert("Error al actualizar: " + error.message);
  }
});

cargarProducto();
