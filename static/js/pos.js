document.addEventListener("DOMContentLoaded", () => {
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];

    const cards = $$(".menu-grid .card");
    const cart = {};

    const orderBody = $(".order-body");
    const orderPanel = $("#order-panel");
    const payPanel = $("#pay-panel");
    const cashInput = $("#cash");
    const changeInput = $("#change");
    const payMsg = $("#pay-msg");
    const payBtn = $("#pay-btn");
    const successModal = $("#success-modal");
    const checkoutBtn = $("#checkout-btn");
    const keypad = $("#keypad");
    const page = $(".page");

    if (!cards.length || !orderBody || !orderPanel || !payPanel ||
        !cashInput || !changeInput || !payMsg || !payBtn ||
        !successModal || !checkoutBtn || !keypad || !page) {
        return;
    }

    let cash = "";
    let paymentSaved = false;
    let activeCategory = "all";
    let searchQuery = "";

    // Store money as integer centavos to avoid floating-point errors.
    const money = cents => `₱${(cents / 100).toFixed(2)}`;
    const centsToDecimal = cents => (cents / 100).toFixed(2);

    const toCents = value => {
        const cleaned = String(value).replace(/[^\d.]/g, "");
        const [whole = "0", decimal = ""] = cleaned.split(".");
        const pesos = Number.parseInt(whole || "0", 10);
        const centavos = Number.parseInt((decimal + "00").slice(0, 2), 10);

        return (Number.isFinite(pesos) ? pesos : 0) * 100 +
            (Number.isFinite(centavos) ? centavos : 0);
    };

    const cashToCents = value => {
        if (!value) return 0;

        const [whole = "0", decimal = ""] = String(value).split(".");
        const pesos = Number.parseInt(whole || "0", 10);
        const centavos = Number.parseInt((decimal + "00").slice(0, 2), 10);

        return (Number.isFinite(pesos) ? pesos : 0) * 100 +
            (Number.isFinite(centavos) ? centavos : 0);
    };

    const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

    const getTotal = () => Object.values(cart).reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const getItems = () => Object.entries(cart).filter(
        ([, item]) => item.qty > 0
    );

    // Search and category filters work together.
    const filterProducts = () => {
        let visibleCount = 0;

        cards.forEach(card => {
            const name = card.querySelector("h3")?.textContent.trim().toLowerCase() || "";
            const matchesCategory = activeCategory === "all" ||
                card.dataset.category === activeCategory;
            const matchesSearch = name.includes(searchQuery);
            const visible = matchesCategory && matchesSearch;

            card.hidden = !visible;
            if (visible) visibleCount++;
        });

        let noResults = $(".menu-grid .no-results");

        if (!noResults) {
            noResults = document.createElement("p");
            noResults.className = "no-results";
            noResults.textContent = "No products found.";
            noResults.hidden = true;
            $(".menu-grid")?.append(noResults);
        }

        if (noResults) {
            noResults.hidden = visibleCount > 0;
        }
    };

    const updatePaymentDisplay = () => {
        const enteredCash = cashToCents(cash);
        const change = enteredCash - getTotal();

        cashInput.value = cash ? money(enteredCash) : "";
        changeInput.value = cash && change >= 0 ? money(change) : "";
    };

    const render = () => {
        const total = getTotal();
        const items = getItems();

        $("#order-total").textContent = money(total);
        $("#pay-total").textContent = money(total);

        orderBody.classList.toggle("has-items", items.length > 0);

        orderBody.innerHTML = items.length
            ? items.map(([id, item]) => `
                <div class="order-item" data-id="${id}">
                    <div class="item-info">
                        <strong>${escapeHTML(item.name)}</strong>
                        <small>${money(item.price)} each</small>
                    </div>

                    <div class="item-bottom">
                        <div class="quantity-controls">
                            <button type="button" data-action="minus" aria-label="Decrease quantity">−</button>
                            <span>${item.qty}</span>
                            <button type="button" data-action="plus" aria-label="Increase quantity">+</button>
                            <button type="button" data-action="remove" class="remove-item" aria-label="Remove item">×</button>
                        </div>

                        <strong class="item-total">${money(item.price * item.qty)}</strong>
                    </div>
                </div>
            `).join("")
            : '<p class="no-tx">No Transaction</p>';

        checkoutBtn.disabled = items.length === 0;
        updatePaymentDisplay();
    };

    // Add menu products to the cart.
    cards.forEach((card, index) => {
        const name = card.querySelector("h3")?.textContent.trim();
        const price = toCents(card.querySelector(".price")?.textContent || "0");

        if (!name || price < 0) return;

        card.dataset.id = String(index);

        card.addEventListener("click", () => {
            if (card.classList.contains("sold-out")) return;

            cart[index] ??= { name, price, qty: 0 };
            cart[index].qty++;

            render();
        });
    });

    // Cart quantity controls.
    orderBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const row = button.closest("[data-id]");
        const item = row ? cart[row.dataset.id] : null;

        if (!item) return;

        if (button.dataset.action === "plus") item.qty++;
        if (button.dataset.action === "minus") item.qty--;
        if (button.dataset.action === "remove") item.qty = 0;

        if (item.qty <= 0) {
            delete cart[row.dataset.id];
        }

        render();
    });

    // Product search.
    $(".menu-panel .search input")?.addEventListener("input", event => {
        searchQuery = event.target.value.trim().toLowerCase();
        filterProducts();
    });

    // Category filter.
    $$(".chip").forEach(button => {
        button.addEventListener("click", () => {
            $$(".chip").forEach(chip => chip.classList.remove("active"));

            button.classList.add("active");
            activeCategory = button.dataset.category || "all";

            filterProducts();
        });
    });

    // Order type selection.
    $$(".toggle .seg").forEach(button => {
        button.addEventListener("click", () => {
            $$(".toggle .seg").forEach(seg => seg.classList.remove("active"));
            button.classList.add("active");
        });
    });

    // Open payment panel.
    checkoutBtn.addEventListener("click", () => {
        if (!getItems().length) return;

        paymentSaved = false;
        cash = "";

        cashInput.value = "";
        changeInput.value = "";
        payMsg.textContent = "";

        payBtn.disabled = false;
        payBtn.textContent = "Pay";

        orderPanel.hidden = true;
        payPanel.hidden = false;

        render();
    });

    // Return to the order panel before payment is saved.
    $("#pay-back")?.addEventListener("click", () => {
        if (paymentSaved) return;

        payPanel.hidden = true;
        orderPanel.hidden = false;
    });

    // Numeric keypad.
    keypad.addEventListener("click", event => {
        const key = event.target.closest("button")?.dataset.key;

        if (!key || paymentSaved) return;

        if (key === "back") {
            cash = cash.slice(0, -1);
        } else if (key === ".") {
            if (cash.includes(".")) return;

            cash = cash || "0";
            cash += ".";
        } else if (/^\d+$/.test(key)) {
            if (cash.includes(".") && cash.split(".")[1].length >= 2) return;

            cash += key;
        } else {
            return;
        }

        updatePaymentDisplay();
        payMsg.textContent = "";
    });

    // Reset POS after the success modal is acknowledged.
    $("#success-ok")?.addEventListener("click", () => {
        successModal.hidden = true;

        Object.keys(cart).forEach(id => delete cart[id]);

        cash = "";
        paymentSaved = false;

        cashInput.value = "";
        changeInput.value = "";
        payMsg.textContent = "";

        payBtn.disabled = false;
        payBtn.textContent = "Pay";

        payPanel.hidden = true;
        orderPanel.hidden = false;

        render();
    });

    // Save payment and order to Django.
    payBtn.addEventListener("click", async () => {
        const total = getTotal();
        const cashAmount = cashToCents(cash);
        const items = getItems();

        if (!items.length) {
            payMsg.textContent = "No transaction to pay.";
            return;
        }

        if (!cash || cashAmount < total) {
            payMsg.textContent = "Insufficient cash amount.";
            return;
        }

        const csrf = $('[name="csrfmiddlewaretoken"]')?.value;
        const saveUrl = page.dataset.saveUrl;
        const activeOrderType = $(".toggle .seg.active");

        const orderType = activeOrderType?.dataset.orderType ||
            activeOrderType?.textContent.trim() || "Walk-In";

        if (!csrf || !saveUrl) {
            payMsg.textContent = "Payment setup is incomplete. Refresh the page and try again.";
            return;
        }

        payBtn.disabled = true;
        payBtn.textContent = "Processing...";
        payMsg.textContent = "";

        try {
            const response = await fetch(saveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrf
                },
                body: JSON.stringify({
                    items: items.map(([, item]) => ({
                        name: item.name,
                        price: centsToDecimal(item.price),
                        quantity: item.qty
                    })),
                    cash: centsToDecimal(cashAmount),
                    order_type: orderType
                })
            });

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error("The server returned an invalid response. Please try again.");
            }

            if (!response.ok) {
                throw new Error(result.error || "Payment failed.");
            }

            paymentSaved = true;
            payBtn.textContent = "Paid";
            successModal.hidden = false;

        } catch (error) {
            payMsg.textContent = error.message || "Payment failed. Please try again.";

            payBtn.disabled = false;
            payBtn.textContent = "Pay";
        }
    });

    filterProducts();
    render();
});