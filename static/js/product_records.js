document.addEventListener("DOMContentLoaded", function () {

    // MODALS
    const addModal = document.getElementById("addProductModal");
    const editModal = document.getElementById("editProductModal");

    const openAddBtn = document.getElementById("openAddModalBtn");
    const closeAddBtn = document.getElementById("closeModalBtn");
    const closeAddCancelBtn = document.getElementById("closeAddCancelBtn");

    const closeEditBtn = document.getElementById("closeEditModalBtn");
    const closeEditCancelBtn = document.getElementById("closeEditCancelBtn");

    const editForm = document.getElementById("editProductForm");

    // SEARCH AND FILTER
    const searchInput = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const rows = document.querySelectorAll(".product-row");
    const noResults = document.getElementById("noSearchResults");

    // FORM INPUTS
    const editProductInput = document.getElementById("editProductInput");
    const editCategoryInput = document.getElementById("editCategoryInput");
    const editPriceInput = document.getElementById("editPriceInput");
    const editStatusInput = document.getElementById("editStatusInput");


    // OPEN MODAL
    function openModal(modal) {
        if (!modal) return;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }


    // CLOSE MODAL
    function closeModal(modal) {
        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        if (
            (!addModal || !addModal.classList.contains("is-open")) &&
            (!editModal || !editModal.classList.contains("is-open"))
        ) {
            document.body.style.overflow = "";
        }
    }


    // ADD PRODUCT
    if (openAddBtn) {
        openAddBtn.addEventListener("click", function () {
            openModal(addModal);
        });
    }

    if (closeAddBtn) {
        closeAddBtn.addEventListener("click", function () {
            closeModal(addModal);
        });
    }

    if (closeAddCancelBtn) {
        closeAddCancelBtn.addEventListener("click", function () {
            closeModal(addModal);
        });
    }


    // EDIT PRODUCT
    document.querySelectorAll(".edit-modal-btn").forEach(function (button) {

        button.addEventListener("click", function () {

            const id = this.dataset.id;

            if (!id || !editForm) return;

            editProductInput.value = this.dataset.product || "";
            editCategoryInput.value = this.dataset.category || "";
            editPriceInput.value = this.dataset.price || "";
            editStatusInput.value = this.dataset.status || "Available";

            editForm.action = `/products/edit/${id}/`;

            openModal(editModal);

        });

    });


    // CLOSE EDIT MODAL
    if (closeEditBtn) {
        closeEditBtn.addEventListener("click", function () {
            closeModal(editModal);
        });
    }

    if (closeEditCancelBtn) {
        closeEditCancelBtn.addEventListener("click", function () {
            closeModal(editModal);
        });
    }


    // CLOSE WHEN CLICKING OUTSIDE
    [addModal, editModal].forEach(function (modal) {

        if (!modal) return;

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                closeModal(modal);
            }

        });

    });


    // ESCAPE KEY
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeModal(addModal);
            closeModal(editModal);
        }

    });


    // SEARCH AND CATEGORY FILTER
    function filterProducts() {

        if (!searchInput || !categoryFilter) return;

        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value.trim().toLowerCase();

        let visibleCount = 0;

        rows.forEach(function (row) {

            const idCell = row.querySelector("[data-search-id]");

            const id = idCell
                ? idCell.textContent.trim().toLowerCase()
                : "";

            const productCell = row.querySelector(".product-name");
            const categoryCell = row.querySelector(".product-category");

            const product = productCell
                ? productCell.textContent.trim().toLowerCase()
                : "";

            const rowCategory = categoryCell
                ? categoryCell.textContent.trim().toLowerCase()
                : "";

            const matchesSearch =
                id.includes(query) || product.includes(query);

            const matchesCategory =
                category === "" || rowCategory === category;

            const show = matchesSearch && matchesCategory;

            row.hidden = !show;

            if (show) {
                visibleCount++;
            }

        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }

    }


    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterProducts);
    }

});