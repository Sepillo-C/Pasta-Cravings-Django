document.addEventListener("DOMContentLoaded", function () {
    const addModal = document.getElementById("addCustomerModal");
    const editModal = document.getElementById("editCustomerModal");

    const openAddBtn = document.getElementById("openAddModalBtn");
    const closeAddBtn = document.getElementById("closeModalBtn");
    const closeEditBtn = document.getElementById("closeEditModalBtn");

    const editForm = document.getElementById("editCustomerForm");

    const editNameInput = document.getElementById("editNameInput");
    const editContactInput = document.getElementById("editContactInput");
    const editOrdersInput = document.getElementById("editOrdersInput");

    const searchInput = document.getElementById("customerSearch");
    const customerRows = document.querySelectorAll(".customer-row");
    const noSearchResults = document.getElementById("noSearchResults");

    // Open Add Customer modal
    if (openAddBtn && addModal) {
        openAddBtn.addEventListener("click", function () {
            addModal.style.display = "flex";
        });
    }

    // Close Add Customer modal
    if (closeAddBtn && addModal) {
        closeAddBtn.addEventListener("click", function () {
            addModal.style.display = "none";
        });
    }

    // Open Edit Customer modal and populate its fields
    document.querySelectorAll(".edit-modal-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.dataset.id;

            editNameInput.value = this.dataset.name || "";
            editContactInput.value = this.dataset.contact || "";
            editOrdersInput.value = this.dataset.orders || "0";

            editForm.action = `/customers/edit/${id}/`;

            editModal.style.display = "flex";
        });
    });

    // Close Edit Customer modal
    if (closeEditBtn && editModal) {
        closeEditBtn.addEventListener("click", function () {
            editModal.style.display = "none";
        });
    }

    // Close modals by clicking their backdrops
    [addModal, editModal].forEach(function (modal) {
        if (!modal) return;

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // Close modals using Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (addModal) addModal.style.display = "none";
            if (editModal) editModal.style.display = "none";
        }
    });

    // Search customer records by ID
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = this.value.trim().toLowerCase();
            let visibleCount = 0;

            customerRows.forEach(function (row) {
                const idCell = row.querySelector("[data-search-id]");
                const customerId = idCell
                    ? idCell.dataset.searchId.toLowerCase()
                    : "";

                const displayedId = idCell
                    ? idCell.textContent.trim().toLowerCase()
                    : "";

                const matches =
                    customerId.includes(query) ||
                    displayedId.includes(query);

                row.style.display = matches ? "" : "none";

                if (matches) visibleCount++;
            });

            if (noSearchResults) {
                noSearchResults.style.display =
                    query !== "" && visibleCount === 0 ? "block" : "none";
            }
        });
    }
});