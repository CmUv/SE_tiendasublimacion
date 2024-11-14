document.addEventListener('DOMContentLoaded', () => {
  // Cargar categorías desde la API
  fetch('/api/getCategories')
    .then(response => response.json())
    .then(data => {
      const categoriaSelect = document.getElementById('categoria');
      // Llenar el select de categorías con los datos obtenidos
      data.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        categoriaSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al cargar categorías:', error));

  // Cargar tipos desde la API
  fetch('/api/getTypes')
    .then(response => response.json())
    .then(data => {
      const tipoSelect = document.getElementById('tipo');
      // Llenar el select de tipos con los datos obtenidos
      data.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nombre;
        tipoSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al cargar tipos:', error));

  // Cargar estilos desde la API
  fetch('/api/getStyles')
    .then(response => response.json())
    .then(data => {
      const estiloSelect = document.getElementById('estilo');
      // Llenar el select de estilos con los datos obtenidos
      data.forEach(estilo => {
        const option = document.createElement('option');
        option.value = estilo.id;
        option.textContent = estilo.nombre;
        estiloSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al cargar estilos:', error));

  // Manejar el formulario de recomendaciones
  const form = document.getElementById('recommendForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevenir el envío del formulario

    // Obtener los valores seleccionados por el usuario en el formulario
    const categoria_id = document.getElementById('categoria').value;
    const tipo_id = document.getElementById('tipo').value;
    const estilo_id = document.getElementById('estilo').value;

    // Crear un objeto con los datos de la solicitud
    const requestData = { categoria_id, tipo_id, estilo_id };

    // Realizar la solicitud POST a la API para obtener los productos recomendados
    fetch('/api/getProducts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData) // Enviar los datos de la solicitud en el cuerpo de la petición
    })
      .then(response => response.json()) // Parsear la respuesta a JSON
      .then(products => {
        const recommendationsDiv = document.getElementById('recommendations');
        recommendationsDiv.innerHTML = ''; // Limpiar las recomendaciones anteriores

        // Si no se encontraron productos, mostrar un mensaje
        if (products.length === 0) {
          recommendationsDiv.innerHTML = '<p>No se encontraron productos que coincidan con los filtros seleccionados.</p>';
        } else {
          // Mostrar los productos recomendados
          products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.innerHTML = `
              <h2>${product.nombre}</h2>
              <p>${product.descripcion}</p>
              <p>Precio: $${product.precio}</p>
              <p>Categoría: ${product.categoria}</p>
              <p>Tipo: ${product.tipo}</p>
              <p>Estilo: ${product.estilo}</p>
            `;
            recommendationsDiv.appendChild(productDiv);
          });
        }
      })
      .catch(error => console.error('Error al obtener productos:', error));
  });
});