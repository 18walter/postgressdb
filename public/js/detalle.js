document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("No se especificó el ID del producto");
    return;
  }

  try {
    const prod = await api.obtenerProductoPorId(id);

    if (!prod) {
      alert("Producto no encontrado");
      return;
    }

    // Mostrar datos del producto
    document.getElementById("nombre-producto").textContent = prod.nombre || "Nombre no disponible";
    document.getElementById("descripcion-producto").textContent = prod.descripcion || "Sin descripción disponible.";
    
    const precioFormateado = prod.precio ? `Precio: S/ ${prod.precio.toFixed(2)}` : "";
    document.getElementById("precio-producto").textContent = precioFormateado;

    // Contenedor del carrusel
    const cont = document.getElementById("carousel-items");
    cont.innerHTML = "";

    // Imágenes extras según nombre del producto (minusculas)
    let imagenesExtras = [];

    if (prod.nombre.toLowerCase().includes("fanta")) {
      imagenesExtras = [
        "imagenes/fanta1.png",
        "imagenes/fanta2.png",
        "imagenes/fanta4.png",
        "imagenes/fanta3.png"
      ];
    } else if (prod.nombre.toLowerCase().includes("papas")) {
      imagenesExtras = [
        "imagenes/papas1.png",
        "imagenes/papas2.png"
      ];
    } else if (prod.nombre.toLowerCase().includes("coca")) {
      imagenesExtras = [
        "imagenes/coca1.png",
        "imagenes/coca2.png"
      ];
    }

    // Combinar imágenes del producto + extras
    const imagenesBD = Array.isArray(prod.imagenes) ? prod.imagenes.map(img => img.url) : [];
    const todasLasImagenes = [...imagenesBD, ...imagenesExtras];

    // Renderizar el carrusel o imagen por defecto
    if (todasLasImagenes.length > 0) {
      todasLasImagenes.forEach((img, index) => {
        const div = document.createElement("div");
        div.className = `carousel-item${index === 0 ? " active" : ""}`;

        const image = document.createElement("img");
        image.src = img;
        image.className = "d-block w-100 img-fluid rounded shadow";
        image.alt = prod.nombre;

        div.appendChild(image);
        cont.appendChild(div);
      });
    } else {
      cont.innerHTML = `
        <div class="carousel-item active">
          <img src="img/no-image.png" class="d-block w-100 img-fluid rounded shadow" alt="Sin imagen">
        </div>
      `;
    }
  } catch (error) {
    console.error("Error cargando el producto:", error);
    alert("Hubo un error cargando el producto");
  }
});
