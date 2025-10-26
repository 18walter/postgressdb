// db.js
const mysql = require("mysql2/promise");

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",        // localhost para desarrollo local
  user: process.env.DB_USER || "root",            // usuario local o el de Railway
  password: process.env.DB_PASS || "",            // contraseña local o de Railway
  database: process.env.DB_NAME || "tienda",      // nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
});

// Exportar pool para usar en todo el proyecto
module.exports = pool;
