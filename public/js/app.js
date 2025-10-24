document.addEventListener("DOMContentLoaded", async () => {
  const menu = document.getElementById("menu-categorias");
  const lista = document.getElementById("lista-productos");

  // cargar categorías
  const categorias = await api.obtenerCategorias();
  categorias.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" class="nav-link" data-id="${cat.id}">${cat.nombre}</a>`;
    menu.appendChild(li);
  });

  // función para mostrar productos
  async function mostrarProductos(categoriaId = null) {
    lista.innerHTML = "";
    const productos = await api.obtenerProductos(categoriaId);

    productos.forEach(prod => {
      // aquí tomamos la primera imagen, si no hay mostramos "no-image.png"
      const img = prod.imagen.length > 0 ? prod.imagen[0].url : "img/no-image.png";

      // aquí va el <img> dentro del card
      lista.innerHTML += `
        <div class="col-md-3">
          <div class="card h-100 shadow-sm">
            <img src="${prod.imagen}" class="card-img-top img-fluid rounded shadow" alt="${prod.nombre}">
            <div class="card-body">
              <h5 class="card-title">${prod.nombre}</h5>
              <p class="card-text">${prod.descripcion || ""}</p>
              <a href="detalle.html?id=${prod.id}" class="btn btn-primary">Ver detalle</a>
            </div>
          </div>
        </div>
      `;
    });
  }

  // eventos menú
  menu.addEventListener("click", e => {
    if (e.target.dataset.id) {
      mostrarProductos(e.target.dataset.id);
    }
  });

  // cargar productos al inicio
  mostrarProductos();
});

