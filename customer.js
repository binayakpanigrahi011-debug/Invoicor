document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selection ---
  const addCustomerBtn = document.querySelector(".add-customer-btn");
  const addCustomerModal = document.getElementById("add-customer-modal");
  const closeBtn = document.querySelector(".close-btn");
  const addCustomerForm = document.getElementById("add-customer-form");
  const editCustomerModal = document.getElementById("edit-customer-modal");
  const closeEditBtn = document.querySelector(".close-edit-btn");
  const editCustomerForm = document.getElementById("edit-customer-form");
  const customerTableBody = document.getElementById("customer-table-body");
  const customerSearchInput = document.getElementById("customer-search");

  const totalCustomersElem = document.getElementById("total-customers");
  const customerCountElem = document.getElementById("customer-count");
  const activeCustomersElem = document.getElementById("active-customers");
  const avgOrdersElem = document.getElementById("avg-orders");

  let customers = [];

  const getCustomers = () =>
    JSON.parse(localStorage.getItem("customers")) || [];
  const saveCustomers = () =>
    localStorage.setItem("customers", JSON.stringify(customers));

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    const day = String(adjustedDate.getDate()).padStart(2, "0");
    const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const year = adjustedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const updateSummaryCards = () => {
    const totalCount = customers.length;
    totalCustomersElem.textContent = totalCount;
    customerCountElem.textContent = `Customers (${totalCount})`;

    const now = new Date();
    const activeCount = customers.filter((c) => {
      if (!c.lastOrder) return false;
      const orderDate = new Date(c.lastOrder);
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }).length;
    activeCustomersElem.textContent = activeCount;

    if (totalCount === 0) {
      avgOrdersElem.textContent = "0.0";
    } else {
      const totalOrders = customers.reduce(
        (sum, c) => sum + (c.totalOrders || 0),
        0
      );
      avgOrdersElem.textContent = (totalOrders / totalCount).toFixed(1);
    }
  };

  const renderCustomers = (customerList = customers) => {
    customerTableBody.innerHTML = "";
    customerList.forEach((customer) => {
      const row = customerTableBody.insertRow();
      row.setAttribute("data-id", customer.id);
      row.innerHTML = `
        <td><strong>${customer.name}</strong><br>${customer.address || ""}</td>
        <td>${customer.email}<br>${customer.phone || ""}</td>
        <td>${customer.company || ""}</td>
        <td>${customer.totalOrders}</td>
        <td>${formatDateForDisplay(customer.lastOrder)}</td>
        <td class="actions">
          <i class="fas fa-edit edit-btn" title="Edit"></i>
          <i class="fas fa-trash-alt delete-btn" title="Delete"></i>
        </td>
      `;
    });
    updateSummaryCards();
  };

  const showModal = (modal) => (modal.style.display = "block");
  const closeModal = (modal) => (modal.style.display = "none");

  addCustomerBtn.addEventListener("click", () => showModal(addCustomerModal));
  closeBtn.addEventListener("click", () => closeModal(addCustomerModal));
  closeEditBtn.addEventListener("click", () => closeModal(editCustomerModal));
  window.addEventListener("click", (e) => {
    if (e.target === addCustomerModal) closeModal(addCustomerModal);
    if (e.target === editCustomerModal) closeModal(editCustomerModal);
  });

  addCustomerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    customers.push({
      id: Date.now(),
      name: document.getElementById("customer-name").value,
      email: document.getElementById("email").value,
      phone,
      company: document.getElementById("company").value,
      address: document.getElementById("address").value,
      totalOrders:
        parseInt(document.getElementById("total-orders").value, 10) || 0,
      lastOrder: document.getElementById("last-order-date").value,
    });

    saveCustomers();
    renderCustomers();
    addCustomerForm.reset();
    closeModal(addCustomerModal);
  });

  customerTableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    const customerId = Number(row.getAttribute("data-id"));

    if (e.target.classList.contains("edit-btn")) {
      const c = customers.find((c) => c.id === customerId);
      if (c) {
        document.getElementById("edit-customer-id").value = c.id;
        document.getElementById("edit-customer-name").value = c.name;
        document.getElementById("edit-email").value = c.email;
        document.getElementById("edit-phone").value = c.phone;
        document.getElementById("edit-company").value = c.company;
        document.getElementById("edit-address").value = c.address;
        document.getElementById("edit-total-orders").value = c.totalOrders;
        document.getElementById("edit-last-order-date").value = c.lastOrder;
        showModal(editCustomerModal);
      }
    }

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this customer?")) {
        customers = customers.filter((c) => c.id !== customerId);
        saveCustomers();
        renderCustomers();
      }
    }
  });

  editCustomerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = document.getElementById("edit-phone").value.trim();
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const customerId = Number(
      document.getElementById("edit-customer-id").value
    );
    const index = customers.findIndex((c) => c.id === customerId);

    if (index !== -1) {
      customers[index] = {
        id: customerId,
        name: document.getElementById("edit-customer-name").value,
        email: document.getElementById("edit-email").value,
        phone,
        company: document.getElementById("edit-company").value,
        address: document.getElementById("edit-address").value,
        totalOrders:
          parseInt(document.getElementById("edit-total-orders").value, 10) || 0,
        lastOrder: document.getElementById("edit-last-order-date").value,
      };
      saveCustomers();
      renderCustomers();
      closeModal(editCustomerModal);
    }
  });

  customerSearchInput.addEventListener("input", () => {
    const filter = customerSearchInput.value.toLowerCase();
    const filtered = customers.filter((c) =>
      (c.name + c.email + (c.company || "")).toLowerCase().includes(filter)
    );
    renderCustomers(filtered);
  });

  function initializeApp() {
    customers = getCustomers();
    renderCustomers();
  }

  initializeApp();
});
