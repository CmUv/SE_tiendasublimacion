document.addEventListener("DOMContentLoaded", () => {
  // Función para cargar opciones en un elemento select desde la API
  function loadOptions(selectId, endpoint) {
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById(selectId);
        data.forEach(item => {
          const option = document.createElement("option");
          option.value = item.id; // Usar el ID como valor
          option.textContent = item.nombre; // Mostrar el nombre en la lista
          select.appendChild(option);
        });
      })
      .catch(error => console.error("Error al cargar opciones:", error));
  }

  // Cargar opciones para los select
  loadOptions("tipo", "/api/tipos");
  loadOptions("estilo", "/api/estilos");
  loadOptions("categoria", "/api/categorias");

  // Manejar el formulario de agregar productos
  document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      precio: parseFloat(document.getElementById('precio').value),
      id_categoria: document.getElementById('categoria').value, 
      id_tipo: document.getElementById('tipo').value,          
      id_estilo: document.getElementById('estilo').value,      
      stock: parseInt(document.getElementById('stock').value)
    };
    console.log("Datos enviados:", data);
    const response = await fetch('/addProduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) alert("Producto agregado exitosamente");
    else alert("Error al agregar el producto");
  });

  // Manejar la visualización de productos
  const viewProductsButton = document.getElementById('viewProductsButton');
  const productsTable = document.getElementById('productsTable');
  const productsTableBody = productsTable.querySelector('tbody');
  const saveChangesButton = document.getElementById('saveChangesButton');

  viewProductsButton.addEventListener('click', () => {
    fetch('/api/getProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categoria: document.getElementById('categoria').value,
        id_tipo: document.getElementById('tipo').value,
        id_estilo: document.getElementById('estilo').value
      })
    })
    .then(response => response.json())
    .then(data => {
      productsTableBody.innerHTML = '';
      data.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.productId = product.id_producto;
        row.innerHTML = `
          <td>${product.id_producto}</td>
          <td contenteditable="true">${product.nombre}</td>
          <td contenteditable="true">${product.descripcion}</td>
          <td contenteditable="true">${product.precio}</td>
          <td contenteditable="true">${product.stock}</td>
          <td contenteditable="true">${product.categoria}</td>
          <td contenteditable="true">${product.tipo}</td>
          <td contenteditable="true">${product.estilo}</td>
          <td><button class="editButton">Guardar</button></td>
        `;
        productsTableBody.appendChild(row);
      });

      productsTable.style.display = 'table';
      saveChangesButton.style.display = 'block'; // Mostrar botón de guardar cambios
    })
    .catch(error => console.error('Error al obtener productos:', error));
  });

  saveChangesButton.addEventListener('click', async () => {
    const rows = productsTableBody.querySelectorAll('tr');
    const updatedProducts = [];
  
    rows.forEach(row => {
      const productId = row.dataset.productId;
      const cells = row.querySelectorAll('td');
      
      const updatedProduct = {
        id_producto: productId,
        nombre: cells[1].textContent.trim(), // Asegúrate de que la celda contiene el valor correcto
        descripcion: cells[2].textContent.trim(),
        precio: parseFloat(cells[3].textContent.trim()),
        cantidad: parseInt(cells[4].textContent.trim()),
        categoria: cells[5].textContent.trim(),
        tipo: cells[6].textContent.trim(),
        estilo: cells[7].textContent.trim()
      };
      
      updatedProducts.push(updatedProduct);
    });
  
    try {
      const response = await fetch('/updateProducts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedProducts })
      });
  
      if (response.ok) {
        alert("Productos actualizados exitosamente");
      } else {
        alert("Error al actualizar los productos");
      }
    } catch (error) {
      console.error('Error al enviar los cambios:', error);
      alert('Hubo un problema al guardar los cambios');
    }
  });
  

});
