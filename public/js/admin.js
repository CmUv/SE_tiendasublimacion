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
  