document.addEventListener("DOMContentLoaded", () => {
  const addProductBtn = document.getElementById("addProductBtn");
  const addModal = document.getElementById("addProductModal");
  const editModal = document.getElementById("editProductModal");
  const addForm = document.getElementById("addProductForm");
  const editForm = document.getElementById("editProductForm");

  const searchInput = document.getElementById("searchInput");
  const productTableBody = document.getElementById("product-table-body");

  const totalProductsEl = document.getElementById("total-products");
  const totalValueEl = document.getElementById("total-stock-value");
  const lowStockEl = document.getElementById("low-stock-items");
  const categoriesEl = document.getElementById("total-categories");
  const productsCountEl = document.getElementById("products-count");
  const lowStockListContainer = document.getElementById("low-stock-list");

  const STORAGE_KEY = "inventoryProducts:v1";

  const getProducts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveProducts = (products) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  };

  const toInt = (val, fallback = 0) => {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const toFloat = (val, fallback = 0) => {
    const n = parseFloat(String(val).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  };

  const cleanText = (str) => (str == null ? "" : String(str).trim());

  ns;
  const extractProductsFromTable = () => {
    const rows = Array.from(productTableBody?.querySelectorAll("tr") || []);
    const products = [];

    rows.forEach((tr, idx) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 5) return; // not a data row

      const nameCell = tds[0];
      const name = cleanText(nameCell.childNodes[0]?.textContent || "");
      const small = nameCell.querySelector("small");
      const description = cleanText(small ? small.textContent : "");

      const sku = cleanText(tds[1]?.textContent);
      const category = cleanText(tds[2]?.textContent);
      const price = toFloat(tds[3]?.textContent, 0);
      const stockQuantity = toInt(tds[4]?.textContent, 0);

      let minStockLevel = 5;
      const statusCell = tds[5];
      if (statusCell) {
        const statusText = (statusCell.textContent || "").toLowerCase();
        if (statusText.includes("low")) {
          minStockLevel = Math.max(1, stockQuantity + 1);
        }
      }

      if (name || sku || category) {
        products.push({
          id: Date.now() + idx,
          name,
          sku,
          category,
          description,
          price,
          stockQuantity,
          minStockLevel,
        });
      }
    });

    return products;
  };

  const renderProducts = (productsToRender) => {
    const products = productsToRender || getProducts();
    productTableBody.innerHTML = "";

    if (products.length === 0) {
      productTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>`;
    } else {
      products.forEach((product) => {
        const statusClass =
          product.stockQuantity <= product.minStockLevel
            ? "low-stock"
            : "in-stock";
        const statusText =
          product.stockQuantity <= product.minStockLevel
            ? "Low Stock"
            : "In Stock";

        const row = `
          <tr>
            <td>${product.name}<br><small>${
          product.description || ""
        }</small></td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>$${toFloat(product.price).toFixed(2)}</td>
            <td>${toInt(product.stockQuantity)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td class="actions-cell">
              <button class="actions-btn" data-id="${product.id}">
                <i class="fas fa-ellipsis-h"></i>
              </button>
              <ul class="actions-dropdown">
                <li><a href="#" class="edit-btn" data-id="${
                  product.id
                }">Edit</a></li>
                <li><a href="#" class="delete-btn delete" data-id="${
                  product.id
                }">Delete</a></li>
              </ul>
            </td>
          </tr>
        `;
        productTableBody.insertAdjacentHTML("beforeend", row);
      });
    }

    updateSummaryCards();
    updateLowStockAlerts();
  };

  const updateSummaryCards = () => {
    const products = getProducts();
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + toFloat(p.price) * toInt(p.stockQuantity),
      0
    );
    const lowStockItems = products.filter(
      (p) => toInt(p.stockQuantity) <= toInt(p.minStockLevel)
    ).length;
    const categories = new Set(products.map((p) => cleanText(p.category))).size;

    totalProductsEl.textContent = totalProducts;
    productsCountEl.textContent = `Products (${totalProducts})`;
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    lowStockEl.textContent = lowStockItems;
    categoriesEl.textContent = categories;
  };

  const updateLowStockAlerts = () => {
    const products = getProducts();
    const lowStockProducts = products.filter(
      (p) => toInt(p.stockQuantity) <= toInt(p.minStockLevel)
    );

    lowStockListContainer.innerHTML = "";

    if (lowStockProducts.length > 0) {
      const title = document.createElement("p");
      title.textContent = "The following items are low on stock:";
      lowStockListContainer.appendChild(title);

      lowStockProducts.forEach((product) => {
        const alertItem = document.createElement("div");
        alertItem.className = "alert-item";
        alertItem.innerHTML = `
          <span>${product.name}</span>
          <span>${toInt(product.stockQuantity)} left (min: ${toInt(
          product.minStockLevel
        )})</span>
        `;
        lowStockListContainer.appendChild(alertItem);
      });
    } else {
      const noAlertsMessage = document.createElement("p");
      noAlertsMessage.textContent = "All items are sufficiently stocked.";
      lowStockListContainer.appendChild(noAlertsMessage);
    }
  };

  const openModal = (modal) => (modal.style.display = "block");
  const closeModal = (modal) => (modal.style.display = "none");

  addProductBtn.addEventListener("click", () => openModal(addModal));

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      closeModal(e.target.closest(".modal"))
    );
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) closeModal(e.target);
  });

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: document.getElementById("productName").value,
      sku: document.getElementById("sku").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      price: toFloat(document.getElementById("price").value),
      stockQuantity: toInt(document.getElementById("stockQuantity").value),
      minStockLevel: toInt(document.getElementById("minStockLevel").value, 5),
    };
    const products = getProducts();
    products.push(newProduct);
    saveProducts(products);
    renderProducts();
    addForm.reset();
    closeModal(addModal);
  });

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const productId = toInt(document.getElementById("editProductId").value);
    const updatedProduct = {
      id: productId,
      name: document.getElementById("editProductName").value,
      sku: document.getElementById("editSku").value,
      category: document.getElementById("editCategory").value,
      description: document.getElementById("editDescription").value,
      price: toFloat(document.getElementById("editPrice").value),
      stockQuantity: toInt(document.getElementById("editStockQuantity").value),
      minStockLevel: toInt(
        document.getElementById("editMinStockLevel").value,
        5
      ),
    };
    let products = getProducts().map((p) =>
      p.id === productId ? updatedProduct : p
    );
    saveProducts(products);
    renderProducts();
    closeModal(editModal);
  });

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const products = getProducts();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.sku.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
  });

  productTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const cell = target.closest(".actions-cell");
    const dropdown = cell?.querySelector(".actions-dropdown");

    if (target.closest(".actions-btn")) {
      e.preventDefault();
      document.querySelectorAll(".actions-dropdown.show").forEach((d) => {
        if (d !== dropdown) d.classList.remove("show");
      });
      dropdown?.classList.toggle("show");
    } else if (target.classList.contains("edit-btn")) {
      e.preventDefault();
      const productId = toInt(target.dataset.id);
      const productToEdit = getProducts().find((p) => p.id === productId);
      if (productToEdit) {
        document.getElementById("editProductId").value = productToEdit.id;
        document.getElementById("editProductName").value = productToEdit.name;
        document.getElementById("editSku").value = productToEdit.sku;
        document.getElementById("editCategory").value = productToEdit.category;
        document.getElementById("editDescription").value =
          productToEdit.description;
        document.getElementById("editPrice").value = productToEdit.price;
        document.getElementById("editStockQuantity").value =
          productToEdit.stockQuantity;
        document.getElementById("editMinStockLevel").value =
          productToEdit.minStockLevel;
        openModal(editModal);
      }
    } else if (target.classList.contains("delete-btn")) {
      e.preventDefault();
      const productId = toInt(target.dataset.id);
      if (confirm("Are you sure you want to delete this product?")) {
        const products = getProducts().filter((p) => p.id !== productId);
        saveProducts(products);
        renderProducts();
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".actions-cell")) {
      document
        .querySelectorAll(".actions-dropdown.show")
        .forEach((d) => d.classList.remove("show"));
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) renderProducts();
  });

  const ensureStorageInitialized = () => {
    const existing = getProducts();
    if (existing.length > 0) {
      return;
    }
    const harvested = extractProductsFromTable();
    if (harvested.length > 0) {
      saveProducts(harvested);
    } else {
      saveProducts([]);
    }
  };

  ensureStorageInitialized();
  renderProducts();
});
