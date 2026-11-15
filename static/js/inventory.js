document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "pastaCravingsInventory";

    const inventorySearch = document.getElementById("inventorySearch");
    const statusFilter = document.getElementById("statusFilter");
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    const noSearchResults = document.getElementById("noSearchResults");
    const lowStockList = document.getElementById("lowStockList");

    const modal = document.getElementById("addInventoryModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModalBtn = document.getElementById("closeAddModalBtn");
    const inventoryForm = document.getElementById("addInventoryForm");

    const modalTitle = document.getElementById("inventoryModalTitle");
    const saveButton = document.getElementById("saveInventoryBtn");

    let inventoryItems = [];
    let editingId = null;
    let nextId = 1;

    try {
        inventoryItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!Array.isArray(inventoryItems)) {
            inventoryItems = [];
        }
    } catch (error) {
        inventoryItems = [];
    }

    if (inventoryItems.length > 0) {
        nextId = Math.max(...inventoryItems.map(item => Number(item.id) || 0)) + 1;
    }

    function saveInventory() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryItems));
    }

    function getStatus(item) {
        return Number(item.quantity) <= Number(item.minimumStock)
            ? "low"
            : "available";
    }

    function renderInventory() {
        inventoryTableBody.innerHTML = "";

        const searchValue = inventorySearch.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        const filteredItems = inventoryItems.filter(item => {
            const matchesSearch =
                String(item.id).padStart(3, "0").includes(searchValue) ||
                item.product.toLowerCase().includes(searchValue);

            const matchesStatus =
                selectedStatus === "" || getStatus(item) === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        filteredItems.forEach(item => {
            const row = document.createElement("tr");
            row.className = "inventory-row";
            row.dataset.id = item.id;

            const values = [
                String(item.id).padStart(3, "0"),
                item.product,
                item.quantity,
                item.unit
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const statusCell = document.createElement("td");
            const statusLabel = document.createElement("span");
            const status = getStatus(item);

            statusLabel.className = `inventory-status ${status}`;
            statusLabel.textContent =
                status === "low" ? "Low Stock" : "Available";

            statusCell.appendChild(statusLabel);
            row.appendChild(statusCell);

            const actionCell = document.createElement("td");
            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "edit-modal-btn";
            editButton.textContent = "Edit";
            editButton.dataset.id = item.id;

            actionCell.appendChild(editButton);
            row.appendChild(actionCell);

            inventoryTableBody.appendChild(row);
        });

        if (inventoryItems.length === 0) {
            noSearchResults.textContent =
                'No inventory items yet. Click "+ Add Item" to add your first item.';
            noSearchResults.style.display = "block";
        } else if (filteredItems.length === 0) {
            noSearchResults.textContent = "No matching inventory items found.";
            noSearchResults.style.display = "block";
        } else {
            noSearchResults.style.display = "none";
        }

        renderLowStockItems();
    }

    function renderLowStockItems() {
        lowStockList.innerHTML = "";

        const lowItems = inventoryItems.filter(item => getStatus(item) === "low");

        if (lowItems.length === 0) {
            const listItem = document.createElement("li");
            listItem.textContent = "No low stock items.";
            lowStockList.appendChild(listItem);
            return;
        }

        lowItems.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent =
                `${item.product} – ${item.quantity} ${item.unit} remaining`;
            lowStockList.appendChild(listItem);
        });
    }

    function openAddModal() {
        editingId = null;
        inventoryForm.reset();

        modalTitle.textContent = "Add Inventory Item";
        saveButton.textContent = "Save Item";

        modal.classList.add("show");
    }

    function openEditModal(id) {
        const item = inventoryItems.find(
            inventoryItem => Number(inventoryItem.id) === Number(id)
        );

        if (!item) {
            alert("Inventory item not found.");
            return;
        }

        editingId = item.id;

        inventoryForm.elements["product"].value = item.product;
        inventoryForm.elements["quantity"].value = item.quantity;
        inventoryForm.elements["unit"].value = item.unit;
        inventoryForm.elements["minimum_stock"].value = item.minimumStock;

        modalTitle.textContent = "Edit Inventory Item";
        saveButton.textContent = "Update Item";

        modal.classList.add("show");
    }

    function closeModal() {
        modal.classList.remove("show");
        inventoryForm.reset();
        editingId = null;
    }

    openAddModalBtn.addEventListener("click", openAddModal);
    closeAddModalBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    inventoryTableBody.addEventListener("click", function (event) {
        const editButton = event.target.closest(".edit-modal-btn");

        if (!editButton) {
            return;
        }

        openEditModal(editButton.dataset.id);
    });

    inventoryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const product = inventoryForm.elements["product"].value.trim();
        const quantityValue = inventoryForm.elements["quantity"].value;
        const unit = inventoryForm.elements["unit"].value;
        const minimumStockValue = inventoryForm.elements["minimum_stock"].value;

        const quantity = Number(quantityValue);
        const minimumStock = Number(minimumStockValue);

        if (
            product === "" ||
            unit === "" ||
            quantityValue === "" ||
            minimumStockValue === "" ||
            !Number.isInteger(quantity) ||
            !Number.isInteger(minimumStock) ||
            quantity < 0 ||
            minimumStock < 0
        ) {
            alert("Please enter valid inventory details.");
            return;
        }

        if (editingId !== null) {
            const itemIndex = inventoryItems.findIndex(
                item => Number(item.id) === Number(editingId)
            );

            if (itemIndex === -1) {
                alert("Unable to find the item to update.");
                return;
            }

            inventoryItems[itemIndex] = {
                ...inventoryItems[itemIndex],
                product: product,
                quantity: quantity,
                unit: unit,
                minimumStock: minimumStock
            };
        } else {
            inventoryItems.push({
                id: nextId++,
                product: product,
                quantity: quantity,
                unit: unit,
                minimumStock: minimumStock
            });
        }

        try {
            saveInventory();
        } catch (error) {
            alert("Unable to save items in browser storage.");
            return;
        }

        closeModal();
        renderInventory();
    });

    inventorySearch.addEventListener("input", renderInventory);
    statusFilter.addEventListener("change", renderInventory);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    renderInventory();
});
