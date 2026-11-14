document.addEventListener("DOMContentLoaded", () => {

    // UPDATE ORDER STATUS
    document.querySelectorAll(".status-form").forEach(form => {
        form.addEventListener("submit", async event => {
            event.preventDefault();

            const button = form.querySelector(".status-toggle");
            const badge = form.closest("tr").querySelector(".status");

            button.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": form.querySelector(
                            '[name="csrfmiddlewaretoken"]'
                        ).value
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Status update failed.");
                }

                // UPDATE STATUS BADGE
                badge.textContent = result.status_display.toUpperCase();
                badge.className = `status ${result.status.toLowerCase()}`;

                // SWITCH BUTTON TEXT
                button.textContent = result.status === "COMPLETED"
                    ? "Mark Preparing"
                    : "Mark Completed";

            } catch (error) {
                alert(error.message);
            } finally {
                button.disabled = false;
            }
        });
    });

    // SEARCH ORDERS
    const searchInput = document.querySelector(".search-box input");

    searchInput?.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();

        document.querySelectorAll(".order-history tbody tr").forEach(row => {
            if (row.querySelector(".empty-orders")) return;

            row.hidden = !row.textContent.toLowerCase().includes(query);
        });
    });

});
