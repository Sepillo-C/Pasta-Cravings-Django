document.addEventListener("DOMContentLoaded", function () {
    const addModal = document.getElementById("addProductModal");
    const editModal = document.getElementById("editProductModal");

    const openAddBtn = document.getElementById("openAddModalBtn");
    const closeAddBtn = document.getElementById("closeModalBtn");
    const closeEditBtn = document.getElementById("closeEditModalBtn");

    const editForm = document.getElementById("editProductForm");

    const searchInput = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const rows = document.querySelectorAll(".product-row");
    const noResults = document.getElementById("noSearchResults");

    openAddBtn.addEventListener("click", function () {
        addModal.style.display = "flex";
    });

    closeAddBtn.addEventListener("click", function () {
        addModal.style.display = "none";
    });

    closeEditBtn.addEventListener("click", function () {
        editModal.style.display = "none";
    });

    document.querySelectorAll(".edit-modal-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const id = this.dataset.id;

            document.getElementById("editProductInput").value =
                this.dataset.product;

            document.getElementById("editCategoryInput").value =
                this.dataset.category;

            document.getElementById("editPriceInput").value =
                this.dataset.price;

            document.getElementById("editStatusInput").value =
                this.dataset.status;

            editForm.action = `/products/edit/${id}/`;
            editModal.style.display = "flex";
        });
    });

    [addModal, editModal].forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            addModal.style.display = "none";
            editModal.style.display = "none";
        }
    });

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value.toLowerCase();
        let visibleCount = 0;

        rows.forEach(function (row) {
            const idCell = row.querySelector("[data-search-id]");
            const id = idCell ? idCell.textContent.trim().toLowerCase() : "";
            const product = row.cells[1].textContent.toLowerCase();
            const rowCategory = row.cells[2].textContent.trim().toLowerCase();

            const matchesSearch =
                id.includes(query) || product.includes(query);

            const matchesCategory =
                category === "" || rowCategory === category;

            const show = matchesSearch && matchesCategory;
            row.style.display = show ? "" : "none";

            if (show) visibleCount++;
        });

        noResults.style.display = visibleCount === 0 ? "block" : "none";
    }

    searchInput.addEventListener("input", filterProducts);
    categoryFilter.addEventListener("change", filterProducts);
});