const { ipcRenderer } = require("electron");

console.log("Renderer cargado");

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initNavigation();
});

/* ===== Sidebar ===== */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

/* ===== Navegación ===== */
function initNavigation() {
  const content = document.getElementById("content");

  document.querySelectorAll(".menu-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const section = btn.dataset.section;
      if (!section) return;

      const res = await fetch(`./views/${section}.html`);
      content.innerHTML = await res.text();
      // Quitar landing al cambiar de vista
      document.body.classList.remove("landing");

      if (section === "home") {
        document.body.classList.add("landing");
      }

      if (section === "config") initConfig();
      if (section === "empleados") initEmployees();
    });
  });
}

/* ===== Config ===== */
function initConfig() {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.onclick = () => {
      document.body.classList.toggle("dark");
      document.body.classList.toggle("light");
    };
  }

  const input = document.getElementById("restaurantName");
  const addBtn = document.getElementById("addRestaurantBtn");
  const list = document.getElementById("restaurantsList");

  if (!input || !addBtn || !list) return;

  async function loadRestaurants() {
    list.innerHTML = "";
    const restaurants = await ipcRenderer.invoke("restaurants:get");

    if (!restaurants.length) {
      list.innerHTML = "<li>No hay restaurantes registrados</li>";
      return;
    }

    restaurants.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${r.name}</span>
        <button>Eliminar</button>
      `;

      li.querySelector("button").onclick = async () => {
        await ipcRenderer.invoke("restaurants:delete", r.id);
        loadRestaurants();
      };

      list.appendChild(li);
    });
  }

  addBtn.onclick = async () => {
    const name = input.value.trim();
    if (!name) return;

    await ipcRenderer.invoke("restaurants:add", name);
    input.value = "";
    loadRestaurants();
  };

  loadRestaurants();
}

/* ===== Empleados ===== */
let editingEmployeeId = null;

function initEmployees() {
  const modal = document.getElementById("employeeModal");
  const openBtn = document.getElementById("openEmployeeModal");
  const closeBtn = document.getElementById("closeEmployeeModal");
  const form = document.getElementById("employeeForm");
  const grid = document.getElementById("employeesGrid");

  /* ===== Modal Ver Datos ===== */
  const detailsModal = document.getElementById("employeeDetailsModal");
  const closeDetailsBtn = document.getElementById("closeDetailsModal");

  const detailsPhoto = document.getElementById("detailsPhoto");
  const detailsIcon = document.getElementById("detailsIcon");
  const detailsName = document.getElementById("detailsName");
  const detailsRestaurant = document.getElementById("detailsRestaurant");
  const detailsStatus = document.getElementById("detailsStatus");
  const detailsContent = document.getElementById("detailsContent");

  const tabs = document.querySelectorAll(".details-tabs .tab");

  // inputs
  const empName = document.getElementById("empName");
  const empRestaurant = document.getElementById("empRestaurant");
  const empStatus = document.getElementById("empStatus");
  const empPhoto = document.getElementById("empPhoto");

  openBtn.onclick = () => {
    editingEmployeeId = null;
    form.reset();
    modal.classList.remove("hidden");
  };

  closeBtn.onclick = () => modal.classList.add("hidden");
  closeDetailsBtn.onclick = () => detailsModal.classList.add("hidden");

  async function loadRestaurants() {
    empRestaurant.innerHTML = "";

    const restaurants = await ipcRenderer.invoke("restaurants:get");

    if (!restaurants.length) {
      const option = document.createElement("option");
      option.textContent = "No hay restaurantes";
      option.disabled = true;
      empRestaurant.appendChild(option);
      return;
    }

    restaurants.forEach((r) => {
      const option = document.createElement("option");
      option.value = r.name;
      option.textContent = r.name;
      empRestaurant.appendChild(option);
    });
  }

  /* ===== Tabs ===== */
  function switchDetailsTab(tabName) {
    tabs.forEach((t) => t.classList.remove("active"));

    const activeTab = document.querySelector(
      `.details-tabs .tab[data-tab="${tabName}"]`,
    );
    if (activeTab) activeTab.classList.add("active");

    switch (tabName) {
      case "payments":
        detailsContent.innerHTML = `
          <h3>Historial de pagos</h3>
          <p>Aquí se mostrará el historial de pagos.</p>
        `;
        break;

      case "vacations":
        detailsContent.innerHTML = `
          <h3>Vacaciones</h3>
          <p>Aquí se gestionarán las vacaciones.</p>
        `;
        break;

      case "marks":
        detailsContent.innerHTML = `
          <h3>Marcas</h3>
          <p>Aquí se mostrarán las marcas.</p>
        `;
        break;

      case "absences":
        detailsContent.innerHTML = `
          <h3>Ausencias</h3>
          <p>Aquí se manejarán las ausencias.</p>
        `;
        break;
    }
  }

  tabs.forEach((tab) => {
    tab.onclick = () => switchDetailsTab(tab.dataset.tab);
  });

  function openEmployeeDetails(emp) {
    if (emp.photo) {
      detailsPhoto.src = emp.photo;
      detailsPhoto.style.display = "block";
      detailsIcon.style.display = "none";
    } else {
      detailsPhoto.style.display = "none";
      detailsIcon.style.display = "block";
    }

    detailsName.textContent = emp.name;
    detailsRestaurant.textContent = emp.restaurant;
    detailsStatus.textContent = emp.status;

    switchDetailsTab("payments");

    detailsModal.classList.remove("hidden");
  }

  async function renderEmployees() {
    grid.innerHTML = "";
    const employees = await ipcRenderer.invoke("employees:get");

    if (!employees.length) {
      grid.innerHTML = "<p>No hay empleados</p>";
      return;
    }

    employees.forEach((emp) => {
      const card = document.createElement("div");
      card.className = "employee-card";

      card.innerHTML = `
        <div class="employee-avatar">
          ${
            emp.photo
              ? `<img src="${emp.photo}">`
              : `<i class="fa-solid fa-user"></i>`
          }
        </div>

        <div class="employee-info">
          <h3>${emp.name}</h3>
          <p>${emp.restaurant}</p>
          <span class="employee-status">${emp.status}</span>
        </div>

        <div class="employee-actions-right">
          <button class="view-btn">Ver datos</button>

          <div class="stack-actions">
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
          </div>
        </div>
      `;

      card.querySelector(".view-btn").onclick = () => openEmployeeDetails(emp);

      card.querySelector(".edit-btn").onclick = () => {
        editingEmployeeId = emp.id;
        empName.value = emp.name;
        empRestaurant.value = emp.restaurant;
        empStatus.value = emp.status;
        modal.classList.remove("hidden");
      };

      card.querySelector(".delete-btn").onclick = async () => {
        if (!confirm("¿Eliminar empleado?")) return;
        await ipcRenderer.invoke("employees:delete", emp.id);
        renderEmployees();
      };

      grid.appendChild(card);
    });
  }

  form.onsubmit = async (e) => {
    e.preventDefault();

    const emp = {
      name: empName.value.trim(),
      restaurant: empRestaurant.value,
      status: empStatus.value,
      photo: null,
    };

    if (empPhoto.files[0]) {
      emp.photo = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(empPhoto.files[0]);
      });
    }

    if (editingEmployeeId) {
      await ipcRenderer.invoke("employees:update", {
        id: editingEmployeeId,
        ...emp,
      });
    } else {
      await ipcRenderer.invoke("employees:add", emp);
    }

    editingEmployeeId = null;
    form.reset();
    modal.classList.add("hidden");
    renderEmployees();
  };

  loadRestaurants();
  renderEmployees();
}
