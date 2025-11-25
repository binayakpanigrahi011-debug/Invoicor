document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENT SELECTORS ---
    const invoiceTableBody = document.getElementById("invoice-table-body");
    const invoiceListTitle = document.getElementById("invoice-list-title");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    // --- LOCAL STORAGE KEY ---
    const INVOICES_STORAGE_KEY = 'invoicesData';

    // --- DATA FUNCTIONS ---
    const getInvoices = () => JSON.parse(localStorage.getItem(INVOICES_STORAGE_KEY)) || [];
    const saveInvoices = (invoices) => localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));

    // --- RENDER FUNCTION ---
    const renderInvoices = () => {
        const invoices = getInvoices();
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        // Filter invoices based on search and status dropdown
        const filteredInvoices = invoices.filter(invoice => {
            const customerName = invoice.customerName || '';
            const invoiceNumber = invoice.invoiceNumber || '';
            const matchesSearch = customerName.toLowerCase().includes(searchTerm) || invoiceNumber.toLowerCase().includes(searchTerm);
            const matchesStatus = selectedStatus === 'All Status' || invoice.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });

        invoiceTableBody.innerHTML = ''; // Clear existing table data
        invoiceListTitle.textContent = `Invoice List (${filteredInvoices.length})`;

        if (filteredInvoices.length === 0) {
            invoiceTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No invoices found.</td></tr>`;
            return;
        }

        filteredInvoices.forEach(invoice => {
            const statusClass = `status-${invoice.status.toLowerCase()}`;
            const row = `
                <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.customerName}</td>
                    <td>${formatDate(invoice.invoiceDate)}</td>
                    <td>${formatDate(invoice.dueDate)}</td>
                    <td>$${parseFloat(invoice.totalAmount).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${invoice.status}</span></td>
                    <td class="actions-cell">
                        <button class="actions-btn"><i class="fas fa-ellipsis-h"></i></button>
                        <ul class="actions-dropdown">
                            <li><a href="#" class="edit-btn" data-id="${invoice.id}">Edit</a></li>
                            <li><a href="#" class="delete-btn delete" data-id="${invoice.id}">Delete</a></li>
                        </ul>
                    </td>
                </tr>
            `;
            invoiceTableBody.insertAdjacentHTML('beforeend', row);
        });
    };
    
    // Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // --- EVENT LISTENERS ---

    // Listen for input on search and filter dropdowns
    searchInput.addEventListener('input', renderInvoices);
    statusFilter.addEventListener('change', renderInvoices);

    // Use event delegation for the entire table body to handle actions
    invoiceTableBody.addEventListener('click', (e) => {
        const target = e.target;

        // Handle clicking the dropdown actions button (...)
        if (target.closest('.actions-btn')) {
            const dropdown = target.closest('.actions-cell').querySelector('.actions-dropdown');
            // Close all other open dropdowns first
            document.querySelectorAll('.actions-dropdown.show').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            dropdown.classList.toggle('show');
            return;
        }

        // Handle clicking the "Delete" link
        if (target.matches('.delete-btn')) {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this invoice?')) {
                const invoiceIdToDelete = target.dataset.id; // keep as string
                
                let invoices = getInvoices();
                const updatedInvoices = invoices.filter(invoice => String(invoice.id) !== String(invoiceIdToDelete));
                
                saveInvoices(updatedInvoices);
                renderInvoices();
            }
            return;
        }

        // Handle clicking the "Edit" link
        if (target.matches('.edit-btn')) {
            e.preventDefault();
            const invoiceIdToEdit = target.dataset.id;
            window.location.href = `create-invoice.html?id=${invoiceIdToEdit}`;
            return;
        }
    });
    
    // Close any open action dropdowns when clicking anywhere else on the document
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.actions-cell')) {
            document.querySelectorAll('.actions-dropdown.show').forEach(d => d.classList.remove('show'));
        }
    });

    // --- INITIALIZATION ---
    renderInvoices();
});
