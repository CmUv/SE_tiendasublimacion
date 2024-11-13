document.addEventListener("DOMContentLoaded", () => {
  // Función para cargar opciones en un elemento select desde la API
  function loadOptions(selectId, endpoint) {
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById(selectId);
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.id; // o item.nombre si el valor debe ser el nombre
          option.textContent = item.nombre; // usa el nombre o descripción adecuada
          select.appendChild(option);
        });
      })
      .catch(error => console.error("Error al cargar opciones:", error));
  }

  // Cargar opciones para cada select
  loadOptions("tipo", "/api/tipos");         // Endpoint para obtener los tipos
  loadOptions("estilo", "/api/estilos");     // Endpoint para obtener los estilos
  loadOptions("categoria", "/api/categorias"); // Endpoint para obtener las categorías
});




document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const data = {
      nombre: document.getElementById('nombre').value,
      tipo: document.getElementById('tipo').value,
      estilo: document.getElementById('estilo').value,
      categoria: document.getElementById('categoria').value,
      descripcion: document.getElementById('descripcion').value,
      precio: parseFloat(document.getElementById('precio').value),
      stock: parseInt(document.getElementById('stock').value)
    };
  
    const response = await fetch('/addProduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  
    if (response.ok) alert("Producto agregado exitosamente");
    else alert("Error al agregar el producto");
  });
  
  document.addEventListener("DOMContentLoaded", () => {
  // Función para cargar opciones en un elemento select desde la API
  function loadOptions(selectId, endpoint) {
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById(selectId);
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.id; // o item.nombre si el valor debe ser el nombre
          option.textContent = item.nombre; // usa el nombre o descripción adecuada
          select.appendChild(option);
        });
      })
      .catch(error => console.error("Error al cargar opciones:", error));
  }

  // Cargar opciones para cada select
  loadOptions("tipo", "/api/tipos");         // Endpoint para obtener los tipos
  loadOptions("estilo", "/api/estilos");     // Endpoint para obtener los estilos
  loadOptions("categoria", "/api/categorias"); // Endpoint para obtener las categorías
});

document.addEventListener('DOMContentLoaded', () => {
  const viewProductsButton = document.getElementById('viewProductsButton');
  const productsTable = document.getElementById('productsTable');
  const productsTableBody = productsTable.querySelector('tbody');

  // Maneja el clic en el botón de "Ver Todos los Productos"
  viewProductsButton.addEventListener('click', () => {
    fetch('/api/getProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Enviar vacío para obtener todos los productos
    })
      .then(response => response.json())
      .then(data => {
        // Limpia la tabla antes de llenarla
        productsTableBody.innerHTML = '';
        
        // Rellena la tabla con los productos obtenidos
        data.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>${product.descripcion}</td>
            <td>${product.precio}</td>
            <td>${product.stock}</td>
            <td>${product.categoria}</td>
            <td>${product.tipo}</td>
            <td>${product.estilo}</td>
          `;
          productsTableBody.appendChild(row);
        });
        
        // Muestra la tabla después de llenarla
        productsTable.style.display = 'table';
      })
      .catch(error => console.error('Error al obtener productos:', error));
  });
});
