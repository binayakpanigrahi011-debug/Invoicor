// DOM Elements
const modal = document.getElementById("modal");
const addCustomerBtn = document.getElementById("addCustomerBtn");
const cancelBtn = document.getElementById("cancelBtn");
const customerForm = document.getElementById("customerForm");
const customerTableBody = document.getElementById("customerTableBody");
const searchInput = document.getElementById("searchInput");
const backButton = document.querySelector(".back-button");

// Initialize customers from localStorage or use demo data if empty
let customers = JSON.parse(localStorage.getItem("customers")) || [
  {
    name: "John Smith",
    address: "123 Main St, Anytown, USA 12345",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Solutions Inc.",
    orders: 5,
    lastOrder: "2024-09-20"
  },
  {
    name: "Sarah Johnson",
    address: "456 Oak Ave, Another City, USA 67890",
    email: "sarah@example.com",
    phone: "+1 (555) 987-6543",
    company: "Design Studio",
    orders: 3,
    lastOrder: "2024-09-18"
  }
];

function updateStats() {
  document.getElementById("totalCustomers").textContent = customers.length;
  document.getElementById("activeThisMonth").textContent = customers.filter(c => {
    const orderDate = new Date(c.lastOrder);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;
  const avg = customers.length ? (customers.reduce((sum, c) => sum + c.orders, 0) / customers.length).toFixed(1) : "0.0";
  document.getElementById("avgOrders").textContent = avg;
}

function renderCustomers(data = customers) {
  customerTableBody.innerHTML = "";
  data.forEach((c, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="customer-cell">
        <div class="customer-name">${c.name}</div>
        <div class="customer-address">${c.address}</div>
      </td>
      <td class="contact-cell">
        <div class="contact-info">
          <a href="mailto:${c.email}" title="Send email">${c.email}</a>
          <a href="tel:${c.phone.replace(/\D/g, '')}" title="Call customer">${c.phone}</a>
        </div>
      </td>
      <td class="company-cell">${c.company}</td>
      <td class="orders-cell">${c.orders}</td>
      <td class="date-cell">${formatDate(c.lastOrder)}</td>
      <td class="actions-cell">
        <button class="action-button" data-index="${index}" aria-label="Actions">
          <span class="more-icon">…</span>
        </button>
      </td>
    `;
    customerTableBody.appendChild(row);
  });
  updateStats();
  
  // Add event listeners for action buttons
  document.querySelectorAll('.action-button').forEach(button => {
    button.addEventListener('click', showActionsMenu);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
}

function showActionsMenu(event) {
  // Remove any existing menus
  const existingMenu = document.querySelector('.actions-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const button = event.currentTarget;
  const index = button.dataset.index;
  
  const menu = document.createElement('div');
  menu.className = 'actions-menu';
  menu.innerHTML = `
    <button class="menu-item" data-action="edit">Edit</button>
    <button class="menu-item" data-action="delete">Delete</button>
    <button class="menu-item" data-action="view">View Details</button>
  `;

  // Position the menu
  const rect = button.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = rect.bottom + 5 + 'px';
  menu.style.left = rect.left - 100 + 'px';

  // Add event listeners for menu items
  menu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'delete') {
      deleteCustomer(index);
    } else if (action === 'edit') {
      editCustomer(index);
    } else if (action === 'view') {
      viewCustomerDetails(index);
    }
    menu.remove();
  });

  document.body.appendChild(menu);

  // Close menu when clicking outside
  function closeMenu(e) {
    if (!menu.contains(e.target) && !button.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  }
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

function deleteCustomer(index) {
  if (confirm('Are you sure you want to delete this customer?')) {
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  }
}

function editCustomer(index) {
  const customer = customers[index];
  // Populate form with customer data
  customerForm.name.value = customer.name;
  customerForm.address.value = customer.address;
  customerForm.email.value = customer.email;
  customerForm.phone.value = customer.phone;
  customerForm.company.value = customer.company;
  customerForm.orders.value = customer.orders;
  customerForm.lastOrder.value = customer.lastOrder;

  // Show modal
  modal.classList.remove('hidden');

  // Update form submission handler
  const originalSubmitHandler = customerForm.onsubmit;
  customerForm.onsubmit = (e) => {
    e.preventDefault();
    customers[index] = {
      name: customerForm.name.value,
      address: customerForm.address.value,
      email: customerForm.email.value,
      phone: customerForm.phone.value,
      company: customerForm.company.value,
      orders: parseInt(customerForm.orders.value),
      lastOrder: customerForm.lastOrder.value,
    };
    localStorage.setItem("customers", JSON.stringify(customers));
    customerForm.reset();
    modal.classList.add('hidden');
    renderCustomers();
    // Restore original submit handler
    customerForm.onsubmit = originalSubmitHandler;
  };
}

function viewCustomerDetails(index) {
  const customer = customers[index];
  alert(`
    Customer Details:
    Name: ${customer.name}
    Company: ${customer.company}
    Email: ${customer.email}
    Phone: ${customer.phone}
    Address: ${customer.address}
    Total Orders: ${customer.orders}
    Last Order: ${formatDate(customer.lastOrder)}
  `);
}

addCustomerBtn.onclick = () => modal.classList.remove("hidden");
cancelBtn.onclick = () => modal.classList.add("hidden");

customerForm.onsubmit = (e) => {
  e.preventDefault();
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerForm.email.value)) {
    alert('Please enter a valid email address');
    return;
  }

  // Validate phone (10 digits)
  const phoneDigits = customerForm.phone.value.replace(/\D/g, '');
  if (phoneDigits.length !== 10) {
    alert('Please enter a valid 10-digit phone number');
    return;
  }

  // Validate orders (must be non-negative)
  if (parseInt(customerForm.orders.value) < 0) {
    alert('Orders cannot be negative');
    return;
  }

  // Validate date (must not be in the future)
  const orderDate = new Date(customerForm.lastOrder.value);
  if (orderDate > new Date()) {
    alert('Last order date cannot be in the future');
    return;
  }

  const newCustomer = {
    name: customerForm.name.value.trim(),
    address: customerForm.address.value.trim(),
    email: customerForm.email.value.trim(),
    phone: formatPhoneNumber(customerForm.phone.value),
    company: customerForm.company.value.trim(),
    orders: parseInt(customerForm.orders.value),
    lastOrder: customerForm.lastOrder.value,
  };
  
  customers.push(newCustomer);
  localStorage.setItem("customers", JSON.stringify(customers));
  customerForm.reset();
  modal.classList.add("hidden");
  renderCustomers();
};

// Enhanced search functionality with debounce and highlighting
let searchTimeout;
searchInput.oninput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
      renderCustomers();
      return;
    }

    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );

    renderCustomers(filtered);

    // Highlight matching text
    if (query) {
      const cells = document.querySelectorAll('td');
      cells.forEach(cell => {
        const text = cell.innerHTML;
        const highlightedText = text.replace(
          new RegExp(query, 'gi'),
          match => `<span class="highlight">${match}</span>`
        );
        cell.innerHTML = highlightedText;
      });
    }
  }, 300);
};

renderCustomers();
