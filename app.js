const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

// Conexión a la base de datos SQLite
let db = new sqlite3.Database('./database/database.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    
    // Crear las tablas si no existen
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tipos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS estilos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        stock INTEGER DEFAULT 0,  // Columna de stock para la cantidad disponible del producto
        categoria_id INTEGER,
        tipo_id INTEGER,
        estilo_id INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
        FOREIGN KEY (tipo_id) REFERENCES tipos(id),
        FOREIGN KEY (estilo_id) REFERENCES estilos(id)
      );
    `;
    
    // Ejecuta el comando para crear las tablas si no existen
    db.exec(createTablesQuery, (err) => {
      if (err) {
        console.error('Error al crear las tablas:', err.message);
      } else {
        console.log('Tablas creadas o verificadas correctamente.');
      }
    });
  }
});

// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Rutas para obtener categorías, tipos y estilos
app.get('/api/categorias', (req, res) => {
  db.all('SELECT * FROM categorias', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener categorías:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/tipos', (req, res) => {
  db.all('SELECT * FROM tipos', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener tipos:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/estilos', (req, res) => {
  db.all('SELECT * FROM estilos', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener estilos:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Ruta para agregar un nuevo producto a la base de datos
app.post('/addProduct', (req, res) => {
  // Extrae los datos del producto enviados en el cuerpo de la solicitud
  const { nombre, descripcion, precio, categoria, tipo, estilo, stock } = req.body;
  
  // Consulta SQL para insertar el nuevo producto en la tabla productos
  const query = `
    INSERT INTO productos (nombre, descripcion, precio, categoria_id, tipo_id, estilo_id, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Define los parámetros que se usarán en la consulta
  const params = [nombre, descripcion, precio, categoria, tipo, estilo, stock];

  // Ejecuta la consulta para insertar el producto en la base de datos
  db.run(query, params, function (err) {
    if (err) {
      console.error('Error al insertar producto:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    // Si la inserción es exitosa, devuelve una respuesta con el ID del nuevo producto
    res.status(201).json({ message: 'Producto agregado exitosamente', id: this.lastID });
  });
});

// Ruta para obtener productos filtrados según categoría, tipo y estilo
app.post('/api/getProducts', (req, res) => {
  const { categoria_id, tipo_id, estilo_id } = req.body;

  // Construye la consulta base con joins para obtener nombres descriptivos de cada relación
  let query = `
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, c.nombre AS categoria, t.nombre AS tipo, e.nombre AS estilo
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    JOIN tipos t ON p.tipo_id = t.id
    JOIN estilos e ON p.estilo_id = e.id
    WHERE 1=1`;

  const params = [];

  // Agrega condiciones a la consulta en base a los filtros recibidos
  if (categoria_id) {
    query += ' AND p.categoria_id = ?';
    params.push(categoria_id);
  }
  if (tipo_id) {
    query += ' AND p.tipo_id = ?';
    params.push(tipo_id);
  }
  if (estilo_id) {
    query += ' AND p.estilo_id = ?';
    params.push(estilo_id);
  }

  // Ejecuta la consulta con los filtros aplicados
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Iniciar el servidor en el puerto especificado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
