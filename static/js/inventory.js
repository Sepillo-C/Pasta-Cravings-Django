document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const app = $("inventoryApp");
    const api = app.dataset.apiUrl;
    const updateUrl = app.dataset.updateUrl;

    const search = $("inventorySearch");
    const filter = $("statusFilter");
    const table = $("inventoryTableBody");
    const empty = $("noSearchResults");
    const lowList = $("lowStockList");

    const modal = $("addInventoryModal");
    const form = $("addInventoryForm");
    const title = $("inventoryModalTitle");
    const saveButton = $("saveInventoryBtn");

    const csrf = form.querySelector('[name="csrfmiddlewaretoken"]').value;

    let items = [];
    let editingId = null;

    async function request(url, method = "GET", data = null) {
        const options = {
            method,
            headers: {
                "X-CSRFToken": csrf
            },
            credentials: "same-origin"
        };

        if (data) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong.");
        }

        return result;
    }

    const getStatus = item =>
        Number(item.quantity) <= Number(item.minimumStock) ? "low" : "available";

    async function loadInventory() {
        try {
            items = await request(api);
            render();
        } catch (error) {
            empty.textContent = error.message;
            empty.style.display = "block";
            console.error(error);
        }
    }

    function render() {
        table.innerHTML = "";

        const query = search.value.trim().toLowerCase();

        const filtered = items.filter(item =>
            item.product.toLowerCase().includes(query) &&
            (!filter.value || getStatus(item) === filter.value)
        );

        filtered.forEach(item => {
            const row = document.createElement("tr");

            [
                item.product,
                item.quantity,
                item.unit,
                getStatus(item) === "low" ? "Low Stock" : "Available"
            ].forEach((value, index) => {
                const cell = document.createElement("td");

                if (index === 3) {
                    const label = document.createElement("span");
                    label.className = `inventory-status ${getStatus(item)}`;
                    label.textContent = value;
                    cell.appendChild(label);
                } else {
                    cell.textContent = value;
                }

                row.appendChild(cell);
            });

            const action = document.createElement("td");
            const button = document.createElement("button");

            button.type = "button";
            button.className = "edit-modal-btn";
            button.dataset.id = item.id;
            button.textContent = "Edit";

            action.appendChild(button);
            row.appendChild(action);
            table.appendChild(row);
        });

        empty.textContent = items.length
            ? "No matching inventory items found."
            : 'No inventory items yet. Click "+ Add Item" to add your first item.';

        empty.style.display = filtered.length ? "none" : "block";

        renderLowStock();
    }

    function renderLowStock() {
        lowList.innerHTML = "";

        const lowItems = items.filter(item => getStatus(item) === "low");

        if (!lowItems.length) {
            lowList.innerHTML = "<li>No low stock items.</li>";
            return;
        }

        lowItems.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.product} – ${item.quantity} ${item.unit} remaining`;
            lowList.appendChild(li);
        });
    }

    function openModal(item = null) {
        form.reset();
        editingId = item ? item.id : null;

        title.textContent = item ? "Edit Inventory Item" : "Add Inventory Item";
        saveButton.textContent = item ? "Update Item" : "Save Item";

        if (item) {
            form.elements.product.value = item.product;
            form.elements.quantity.value = item.quantity;
            form.elements.unit.value = item.unit;
            form.elements.minimum_stock.value = item.minimumStock;
        }

        modal.classList.add("show");
    }

    function closeModal() {
        modal.classList.remove("show");
        form.reset();
        editingId = null;
    }

    $("openAddModalBtn").addEventListener("click", () => openModal());
    $("closeAddModalBtn").addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    table.addEventListener("click", event => {
        const button = event.target.closest(".edit-modal-btn");
        if (!button) return;

        const item = items.find(item => item.id === Number(button.dataset.id));
        if (item) openModal(item);
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const quantityValue = form.elements.quantity.value;
        const minimumValue = form.elements.minimum_stock.value;

        const data = {
            product: form.elements.product.value.trim(),
            quantity: Number(quantityValue),
            unit: form.elements.unit.value,
            minimumStock: Number(minimumValue)
        };

        if (
            !data.product || !data.unit ||
            quantityValue === "" || minimumValue === "" ||
            !Number.isInteger(data.quantity) ||
            !Number.isInteger(data.minimumStock) ||
            data.quantity < 0 || data.minimumStock < 0
        ) {
            alert("Please enter valid inventory details.");
            return;
        }

        saveButton.disabled = true;

        try {
            if (editingId !== null) {
                await request(
                    updateUrl.replace("/0/", `/${editingId}/`),
                    "PATCH",
                    data
                );
            } else {
                await request(api, "POST", data);
            }

            closeModal();
            await loadInventory();
        } catch (error) {
            alert(error.message);
        } finally {
            saveButton.disabled = false;
        }
    });

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeModal();
    });

    loadInventory();
});