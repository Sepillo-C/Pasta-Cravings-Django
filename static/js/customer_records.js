document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("customerSearch");
    const customerRows = document.querySelectorAll(".customer-row");
    const noResults = document.getElementById("noSearchResults");

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchValue = this.value.toLowerCase().trim();
            let visibleCount = 0;

            customerRows.forEach(function (row) {

                const customerId = row.cells[0].textContent.toLowerCase();
                const totalOrders = row.cells[1].textContent.toLowerCase();

                const matches =
                    customerId.includes(searchValue) ||
                    totalOrders.includes(searchValue);

                row.style.display = matches ? "" : "none";

                if (matches) {
                    visibleCount++;
                }

            });

            if (noResults) {
                noResults.style.display =
                    visibleCount === 0 && customerRows.length > 0
                        ? ""
                        : "none";
            }

        });

    }

});