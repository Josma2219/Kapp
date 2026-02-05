const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const {
  db,
  getRestaurants,
  addRestaurant,
  deleteRestaurant,
} = require("./database");

Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "src/index.html"));
}

/* =========================
   IPC RESTAURANTES
========================= */
ipcMain.handle("restaurants:get", () => getRestaurants());

ipcMain.handle("restaurants:add", (e, name) => addRestaurant(name));

ipcMain.handle("restaurants:delete", (e, id) => deleteRestaurant(id));

/* =========================
   IPC EMPLEADOS
========================= */
ipcMain.handle("employees:get", () => {
  return db.prepare("SELECT * FROM employees ORDER BY id DESC").all();
});

ipcMain.handle("employees:add", (e, emp) => {
  return db
    .prepare(
      `
    INSERT INTO employees (name, restaurant, status, photo)
    VALUES (?, ?, ?, ?)
  `,
    )
    .run(emp.name, emp.restaurant, emp.status, emp.photo);
});

ipcMain.handle("employees:update", (e, emp) => {
  db.prepare(
    `
    UPDATE employees
    SET name = ?, restaurant = ?, status = ?, photo = ?
    WHERE id = ?
  `,
  ).run(emp.name, emp.restaurant, emp.status, emp.photo, emp.id);
});

ipcMain.handle("employees:delete", (e, id) => {
  db.prepare("DELETE FROM employees WHERE id = ?").run(id);
});

/* =========================
   APP
========================= */
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
