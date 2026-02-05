const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

/* =========================
   Ruta segura de datos
========================= */
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, "kapp.db");

/* =========================
   Crear / abrir BD
========================= */
const db = new Database(dbPath);

/* =========================
   TABLA RESTAURANTES
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`).run();

/* =========================
   TABLA EMPLEADOS
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    restaurant TEXT NOT NULL,
    status TEXT NOT NULL,
    photo TEXT
  )
`).run();

/* =========================
   FUNCIONES RESTAURANTES
========================= */
function getRestaurants() {
  return db.prepare(
    "SELECT * FROM restaurants ORDER BY name ASC"
  ).all();
}

function addRestaurant(name) {
  return db.prepare(
    "INSERT INTO restaurants (name) VALUES (?)"
  ).run(name);
}

function deleteRestaurant(id) {
  return db.prepare(
    "DELETE FROM restaurants WHERE id = ?"
  ).run(id);
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  db,
  getRestaurants,
  addRestaurant,
  deleteRestaurant,
};
