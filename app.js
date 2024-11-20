const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();

// Consultas de creación de tablas
const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tipos (
    id_tipo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS estilos (
    id_estilo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    id_categoria INTEGER,
    id_tipo INTEGER,
    id_estilo INTEGER,
    cantidad INTEGER NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id),
    FOREIGN KEY (id_tipo) REFERENCES tipos(id),
    FOREIGN KEY (id_estilo) REFERENCES estilos(id)
  );
`;

// Conexión a la base de datos SQLite
let db = new sqlite3.Database("./database/database.sqlite", (err) => {
  if (err) console.error("Error al conectar a la base de datos:", err.message);
  else {
    console.log("Conectado a la base de datos SQLite.");

    // Ejecuta el comando para crear las tablas si no existen
    db.exec(createTablesQuery, (err) => {
      if (err) {
        console.error("Error al crear las tablas:", err.message);
      } else {
        console.log("Tablas creadas o verificadas correctamente.");
      }
    });
  }
});

// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Rutas para obtener categorías, tipos y estilos
app.get("/api/categorias", (req, res) => {
  db.all("SELECT * FROM categorias", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener categorías:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/api/tipos", (req, res) => {
  db.all("SELECT * FROM tipos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/estilos", (req, res) => {
  db.all("SELECT * FROM estilos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ruta para agregar un producto
app.post("/addProduct", (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    id_categoria,
    id_tipo,
    id_estilo,
    stock,
  } = req.body;
  console.log("Datos recibidos:", { nombre, descripcion, precio, id_categoria, id_tipo, id_estilo, stock });
  const query = `
    INSERT INTO productos (nombre, descripcion, precio, id_categoria, id_tipo, id_estilo, cantidad)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(
    query,
    [nombre, descripcion, precio, id_categoria, id_tipo, id_estilo, stock],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Producto agregado exitosamente", id: this.lastID });
    }
  );
});

// Ruta para obtener productos con filtros
app.post("/api/getProducts", (req, res) => {
  const { id_categoria, id_tipo, id_estilo } = req.body;

  let query = `
    SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.cantidad, 
           c.nombre AS categoria, t.nombre AS tipo, e.nombre AS estilo
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    JOIN tipos t ON p.id_tipo = t.id_tipo
    JOIN estilos e ON p.id_estilo = e.id_estilo
    WHERE 1=1
  `;
  const params = [];

  if (id_categoria) {
    query += " AND p.id_categoria = ?";
    params.push(id_categoria);
  }
  if (id_tipo) {
    query += " AND p.id_tipo = ?";
    params.push(id_tipo);
  }
  if (id_estilo) {
    query += " AND p.id_estilo = ?";
    params.push(id_estilo);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ruta para actualizar productos
app.post("/updateProducts", (req, res) => {
  const { products } = req.body;

  // Iterar sobre los productos y actualizar cada uno
  products.forEach((product) => {
    // Utilizar el método adecuado de sqlite3 para actualizar
    const sql = `
      UPDATE productos 
      SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, id_categoria = ?, id_tipo = ?, id_estilo = ? 
      WHERE id_producto = ?
    `;

    db.run(
      sql,
      [
        product.nombre,
        product.descripcion,
        product.precio,
        product.cantidad,
        product.categoria,
        product.tipo,
        product.estilo,
        product.id_producto,
      ],
      function (err) {
        if (err) {
          console.error("Error al actualizar producto", err);
          return res.status(500).send("Error al actualizar productos");
        }
      }
    );
  });

  res.status(200).send("Productos actualizados");
});

/*// Iniciar el servidor
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto http://192.168.70.45:${port}`);
});*/

// Iniciar el servidor en el puerto especificado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
