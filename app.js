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
        categoria_id INTEGER,
        tipo_id INTEGER,
        estilo_id INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
        FOREIGN KEY (tipo_id) REFERENCES tipos(id),
        FOREIGN KEY (estilo_id) REFERENCES estilos(id)
      );
    `;
    
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
    console.log('Categorías obtenidas:', rows);
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
    console.log('Tipos obtenidos:', rows);
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
    console.log('Estilos obtenidos:', rows);
    res.json(rows);
  });
});

// Ruta para obtener productos filtrados
app.post('/api/getProducts', (req, res) => {
  const { categoria_id, tipo_id, estilo_id } = req.body;

  let query = `
    SELECT p.id, p.nombre, p.descripcion, p.precio, c.nombre AS categoria, t.nombre AS tipo, e.nombre AS estilo
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    JOIN tipos t ON p.tipo_id = t.id
    JOIN estilos e ON p.estilo_id = e.id
    WHERE 1=1`;

  const params = [];

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

  console.log('Consulta SQL:', query);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }

    console.log('Productos obtenidos:', rows);
    res.json(rows);
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
