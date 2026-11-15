document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("expenseModal");
    const addButton = document.getElementById("addExpenseButton");
    const closeButton = document.getElementById("closeExpenseModal");
    const cancelButton = document.getElementById("cancelExpenseModal");
    const form = document.getElementById("expenseForm");

    const modalTitle = document.getElementById("modalTitle");
    const expenseId = document.getElementById("expenseId");
    const description = document.getElementById("id_description");
    const category = document.getElementById("id_category");
    const amount = document.getElementById("id_amount");
    const expenseDate = document.getElementById("id_expense_date");

    function openModal() {
        modal.classList.add("show");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }

    function resetForm() {
        form.reset();
        expenseId.value = "";
        modalTitle.textContent = "Add Expense";
    }

    if (modal.classList.contains("show")) {
        document.body.classList.add("modal-open");
    }

    addButton.addEventListener("click", () => {
        resetForm();
        openModal();
    });

    document.querySelectorAll(".edit-button").forEach(button => {
        button.addEventListener("click", () => {
            expenseId.value = button.dataset.id;
            description.value = button.dataset.description;
            category.value = button.dataset.category;
            amount.value = button.dataset.amount;
            expenseDate.value = button.dataset.date;

            modalTitle.textContent = "Edit Expense";
            openModal();
        });
    });

    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeModal();
        }
    });
});