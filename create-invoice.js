document.addEventListener("DOMContentLoaded", () => {
    // --- STORAGE KEYS (aligned with inventory.js and customer.js) ---
    const PRODUCTS_STORAGE_KEY_V1 = 'inventoryProducts:v1';
    const PRODUCTS_STORAGE_KEY_OLD = 'inventoryProducts';
    const CUSTOMERS_STORAGE_KEY = 'customers';
    const INVOICES_STORAGE_KEY = 'invoicesData';

    // --- ELEMENT SELECTORS ---
    const formTitle = document.querySelector('.form-header h1');
    const saveInvoiceBtn = document.getElementById("saveInvoiceBtn");
    const itemsContainer = document.getElementById("invoice-items-container");
    const selectCustomerEl = document.getElementById("selectCustomer");

    // Customer form fields
    const customerNameEl = document.getElementById('customerName');
    const customerEmailEl = document.getElementById('customerEmail');
    const customerAddressEl = document.getElementById('customerAddress');

    // --- URL PARAMS ---
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceIdToEdit = urlParams.get('id');
    const isEditMode = !!invoiceIdToEdit;

    // --- FETCH LOCAL DATA ---
    const products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY_V1)) ||
                     JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY_OLD)) || [];
    const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY)) || [];

    // --- FUNCTIONS ---

    // Add a new invoice item row
    const createItemRow = (item = null) => {
        const row = document.createElement("div");
        row.classList.add("item-row");

        const productOptions = products.map(p => 
            `<option value="${p.id}" data-price="${p.price}" ${item && p.id == item.productId ? 'selected' : ''}>${p.name}</option>`
        ).join('');

        row.innerHTML = `
            <div>
                <select class="product-select">
                    <option value="">Select product...</option>
                    ${productOptions}
                </select>
            </div>
            <div><input type="number" class="quantity-input" value="${item ? item.quantity : 1}" min="1"></div>
            <div><input type="number" class="price-input" value="${item ? parseFloat(item.price).toFixed(2) : '0.00'}" disabled></div>
            <div><input type="text" class="total-input" value="$0.00" disabled></div>
            <div><button class="delete-item-btn"><i class="fas fa-trash"></i></button></div>
        `;
        itemsContainer.appendChild(row);

        const productSelect = row.querySelector('.product-select');
        productSelect.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // Calculate subtotal, tax, total
    const updateSummary = () => {
        let subtotal = 0;
        document.querySelectorAll('.item-row').forEach(row => {
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
            subtotal += price * quantity;
        });
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
        document.getElementById("total").textContent = `$${total.toFixed(2)}`;
    };

    // Populate customer dropdown
    const populateCustomerDropdown = () => {
        selectCustomerEl.innerHTML = '<option value="">Select Existing Customer</option>';
        if (customers.length === 0) {
            selectCustomerEl.innerHTML = '<option value="">No customers found</option>';
            return;
        }
        customers.forEach(customer => {
            const option = `<option value="${customer.id}">${customer.name}</option>`;
            selectCustomerEl.insertAdjacentHTML('beforeend', option);
        });
    };

    // Autofill customer details when selected
    const handleCustomerSelect = () => {
        const selectedCustomerId = selectCustomerEl.value;
        if (!selectedCustomerId) {
            customerNameEl.value = '';
            customerEmailEl.value = '';
            customerAddressEl.value = '';
            return;
        }
        const selectedCustomer = customers.find(c => c.id == selectedCustomerId);
        if (selectedCustomer) {
            customerNameEl.value = selectedCustomer.name;
            customerEmailEl.value = selectedCustomer.email;
            customerAddressEl.value = selectedCustomer.address || '';
        }
    };

    // Save or update invoice
    const saveInvoice = () => {
        const totalAmount = parseFloat(document.getElementById("total").textContent.replace('$', '')) || 0;
        const invoiceData = {
            id: isEditMode ? parseInt(invoiceIdToEdit) : Date.now(),
            customerName: customerNameEl.value,
            customerEmail: customerEmailEl.value,
            customerAddress: customerAddressEl.value,
            invoiceDate: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value,
            status: document.getElementById('invoiceStatus').value,
            notes: document.getElementById('invoiceNotes').value,
            totalAmount,
            items: Array.from(document.querySelectorAll('.item-row')).map(row => ({
                productId: row.querySelector('.product-select').value,
                productName: row.querySelector('.product-select').selectedOptions[0].text,
                quantity: row.querySelector('.quantity-input').value,
                price: row.querySelector('.price-input').value,
            }))
        };

        if (!invoiceData.customerName || !invoiceData.invoiceDate || !invoiceData.dueDate) {
            alert('Please fill in Customer Name, Invoice Date, and Due Date.');
            return;
        }

        let invoices = JSON.parse(localStorage.getItem(INVOICES_STORAGE_KEY)) || [];
        if (isEditMode) {
            const invoiceIndex = invoices.findIndex(inv => inv.id == invoiceIdToEdit);
            invoiceData.invoiceNumber = invoices[invoiceIndex].invoiceNumber;
            invoices[invoiceIndex] = invoiceData;
        } else {
            const lastInvNum = invoices.length > 0 ? parseInt(invoices[invoices.length - 1].invoiceNumber.split('-')[1]) : 0;
            invoiceData.invoiceNumber = `INV-${String(lastInvNum + 1).padStart(3, '0')}`;
            invoices.push(invoiceData);
        }

        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
        alert(`Invoice ${invoiceData.invoiceNumber} ${isEditMode ? 'updated' : 'saved'} successfully!`);
        window.location.href = 'invoices.html';
    };

    // Prefill for editing existing invoice
    const populateFormForEdit = () => {
        const invoices = JSON.parse(localStorage.getItem(INVOICES_STORAGE_KEY)) || [];
        const invoice = invoices.find(inv => inv.id == invoiceIdToEdit);

        if (!invoice) {
            alert('Invoice not found!');
            window.location.href = 'invoices.html';
            return;
        }

        customerNameEl.value = invoice.customerName;
        customerEmailEl.value = invoice.customerEmail;
        customerAddressEl.value = invoice.customerAddress;
        document.getElementById('invoiceDate').value = invoice.invoiceDate;
        document.getElementById('dueDate').value = invoice.dueDate;
        document.getElementById('invoiceStatus').value = invoice.status;
        document.getElementById('invoiceNotes').value = invoice.notes;

        itemsContainer.innerHTML = '';
        invoice.items.forEach(item => createItemRow(item));
    };

    // --- INITIALIZATION ---
    populateCustomerDropdown();

    if (isEditMode) {
        formTitle.textContent = 'Edit Invoice';
        saveInvoiceBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        populateFormForEdit();
    } else {
        document.getElementById('invoiceDate').valueAsDate = new Date();
        createItemRow();
    }

    // --- EVENT HANDLERS ---
    document.getElementById("addItemBtn").addEventListener("click", () => createItemRow());
    selectCustomerEl.addEventListener('change', handleCustomerSelect);
    saveInvoiceBtn.addEventListener('click', saveInvoice);

    // Update and delete logic
    const itemUpdateHandler = (e) => {
        if (!e.target.matches('.product-select, .quantity-input')) return;
        const row = e.target.closest('.item-row');
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const priceInput = row.querySelector('.price-input');
        const totalInput = row.querySelector('.total-input');
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price) || 0;
        const quantity = parseInt(quantityInput.value) || 0;
        priceInput.value = price.toFixed(2);
        totalInput.value = `$${(price * quantity).toFixed(2)}`;
        updateSummary();
    };

    itemsContainer.addEventListener('change', itemUpdateHandler);
    itemsContainer.addEventListener('input', itemUpdateHandler);
    itemsContainer.addEventListener('click', e => {
        if (e.target.closest('.delete-item-btn')) {
            e.target.closest('.item-row').remove();
            updateSummary();
        }
    });
});
``
