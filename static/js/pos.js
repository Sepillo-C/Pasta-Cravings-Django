document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const orderPanel = document.getElementById("order-panel");
    const payPanel = document.getElementById("pay-panel");

    const checkoutBtn = document.getElementById("checkout-btn");
    const backBtn = document.getElementById("pay-back");
    const payBtn = document.getElementById("pay-btn");

    const orderTotal = document.getElementById("order-total");
    const payTotal = document.getElementById("pay-total");

    const cashInput = document.getElementById("cash");
    const changeInput = document.getElementById("change");

    const keypad = document.getElementById("keypad");
    const payMsg = document.getElementById("pay-msg");


    // ==========================================
    // VARIABLES
    // ==========================================

    let cashAmount = "";


    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    // Get the numerical total from the order panel
    function getTotal() {

        return Number(
            orderTotal.textContent.replace(/[^\d.-]/g, "")
        ) || 0;

    }


    // Format amounts using Philippine Peso
    function formatCurrency(amount) {

        return "₱" + Number(amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }


    // Update cash input
    function updateCash() {

        cashInput.value = cashAmount
            ? formatCurrency(Number(cashAmount))
            : "";

    }


    // Calculate change
    function calculateChange() {

        const total = getTotal();
        const cash = Number(cashAmount) || 0;

        if (!cashAmount) {

            changeInput.value = "";
            return;

        }

        if (cash >= total) {

            changeInput.value = formatCurrency(cash - total);

        } else {

            changeInput.value = "";

        }

    }


    // ==========================================
    // ORDER CART
    // ==========================================

    const orderBody = document.querySelector(".order-body");
    const subtotalEl = document.getElementById("order-subtotal");
    const serviceEl = document.getElementById("order-service");

    const DISCOUNT_RATE = 0;     // 0%
    const SERVICE_CHARGE = 0;    // flat ₱ amount
    const PPN_RATE = 0.11;       // 11%

    const items = {};            // id -> { id, name, price, stock, qty, card }

    function toNumber(text) {
        return Number(String(text).replace(/[^\d.]/g, "")) || 0;
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // Read every menu card once and register it as an item
    document.querySelectorAll(".menu-grid .card").forEach(function (card) {

        const name = card.querySelector("h3").textContent.trim();
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        items[id] = {
            id: id,
            name: name,
            price: toNumber(card.querySelector(".price").textContent),
            stock: parseInt(card.querySelector(".stock").textContent, 10) || 0,
            qty: 0,
            card: card
        };

        card.dataset.id = id;
        card.tabIndex = 0;
        card.setAttribute("role", "button");

    });

    function addItem(id) {
        const item = items[id];
        if (!item || item.qty >= item.stock) return;
        item.qty++;
        renderOrder();
    }

    function changeQty(id, delta) {
        const item = items[id];
        if (!item) return;
        item.qty = Math.max(0, Math.min(item.stock, item.qty + delta));
        renderOrder();
    }

    function removeItem(id) {
        if (!items[id]) return;
        items[id].qty = 0;
        renderOrder();
    }

    function renderOrder() {

        const ordered = Object.values(items).filter(function (i) { return i.qty > 0; });

        // --- Update stock text on the menu cards ---
        Object.values(items).forEach(function (item) {
            const left = item.stock - item.qty;
            const stockEl = item.card.querySelector(".stock");
            stockEl.textContent = left > 0 ? left + " Bowls available" : "Sold out";
            item.card.classList.toggle("sold-out", left === 0);
        });

        // --- Order list ---
        if (ordered.length === 0) {

            orderBody.classList.remove("has-items");
            orderBody.innerHTML = '<p class="no-tx">No Transaction</p>';

        } else {

            orderBody.classList.add("has-items");
            orderBody.innerHTML =
                '<ul class="order-list">' +
                ordered.map(function (item) {
                    return (
                        '<li class="order-row">' +
                            '<div class="order-info">' +
                                '<span class="order-name">' + escapeHtml(item.name) + '</span>' +
                                '<span class="order-price">' + formatCurrency(item.price * item.qty) + '</span>' +
                            '</div>' +
                            '<div class="order-controls">' +
                                '<button type="button" class="qty-btn" data-action="minus" data-id="' + item.id + '" aria-label="Decrease quantity">−</button>' +
                                '<span class="qty">' + item.qty + '</span>' +
                                '<button type="button" class="qty-btn" data-action="plus" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
                                '<button type="button" class="remove-btn" data-action="remove" data-id="' + item.id + '" aria-label="Remove ' + escapeHtml(item.name) + '">×</button>' +
                            '</div>' +
                        '</li>'
                    );
                }).join("") +
                '</ul>';

        }

        // --- Totals ---
        const subtotal = ordered.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
        const service = subtotal > 0 ? SERVICE_CHARGE : 0;
        const discounted = subtotal - subtotal * DISCOUNT_RATE + service;
        const total = discounted * (1 + PPN_RATE);   // PPN added on top

        subtotalEl.textContent = formatCurrency(subtotal);
        serviceEl.textContent = formatCurrency(service);
        orderTotal.textContent = formatCurrency(subtotal > 0 ? total : 0);

    }

    // Click a menu card to add it
    document.querySelector(".menu-grid").addEventListener("click", function (event) {
        const card = event.target.closest(".card");
        if (card) addItem(card.dataset.id);
    });

    // Keyboard support (Enter / Space on a focused card)
    document.querySelector(".menu-grid").addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest(".card");
        if (card) {
            event.preventDefault();
            addItem(card.dataset.id);
        }
    });

    // −, +, × buttons inside the order panel
    orderBody.addEventListener("click", function (event) {

        const btn = event.target.closest("button[data-action]");
        if (!btn) return;

        const id = btn.dataset.id;

        if (btn.dataset.action === "plus") changeQty(id, 1);
        else if (btn.dataset.action === "minus") changeQty(id, -1);
        else if (btn.dataset.action === "remove") removeItem(id);

    });


    // ==========================================
    // CATEGORY BUTTONS (ALL / PASTA / RICE BOWL / STARTERS)
    // ==========================================

    const categoryChips = document.querySelectorAll(".chips .chip");
    const menuCards = document.querySelectorAll(".menu-grid .card");
    const menuGrid = document.querySelector(".menu-grid");

    const searchInput = document.querySelector(".search input");

    let currentCategory = "all";

    // "No results" message shown when nothing matches
    const noResults = document.createElement("p");
    noResults.className = "no-results";
    noResults.textContent = "No items found";
    noResults.hidden = true;
    menuGrid.appendChild(noResults);

    // Show only the cards that match BOTH the category and the search text
    function applyFilters() {

        const query = searchInput.value.trim().toLowerCase();
        let visible = 0;

        menuCards.forEach(function (card) {

            const name = card.querySelector("h3").textContent.toLowerCase();

            const matchesCategory =
                currentCategory === "all" || card.dataset.category === currentCategory;
            const matchesSearch = name.includes(query);

            const show = matchesCategory && matchesSearch;
            card.hidden = !show;

            if (show) visible++;

        });

        noResults.hidden = visible > 0;

        // Jump back to the top of the list
        menuGrid.scrollTop = 0;

    }

    categoryChips.forEach(function (chip) {

        chip.addEventListener("click", function () {

            categoryChips.forEach(function (c) {
                c.classList.remove("active");
            });

            chip.classList.add("active");

            currentCategory = chip.dataset.category;
            applyFilters();

        });

    });

    // Filter as the user types
    searchInput.addEventListener("input", applyFilters);

    // Pressing Enter shouldn't do anything unexpected
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") event.preventDefault();
    });


    // ==========================================
    // ORDER TYPE (DINE IN / TO GO)
    // ==========================================

    const orderTypeButtons = document.querySelectorAll(".toggle .seg");

    orderTypeButtons.forEach(function (btn) {

        btn.addEventListener("click", function () {

            orderTypeButtons.forEach(function (b) {
                b.classList.remove("active");
            });

            btn.classList.add("active");

        });

    });


    // ==========================================
    // CHECKOUT BUTTON
    // ==========================================

    checkoutBtn.addEventListener("click", function () {

        const total = getTotal();

        // Display total in Philippine Peso
        payTotal.textContent = formatCurrency(total);

        // Reset payment fields
        cashAmount = "";
        cashInput.value = "";
        changeInput.value = "";
        payMsg.textContent = "";

        // Switch panels
        orderPanel.hidden = true;
        payPanel.hidden = false;

    });


    // ==========================================
    // BACK BUTTON
    // ==========================================

    backBtn.addEventListener("click", function () {

        // Return to order panel
        payPanel.hidden = true;
        orderPanel.hidden = false;

        // Reset payment fields
        cashAmount = "";
        cashInput.value = "";
        changeInput.value = "";
        payMsg.textContent = "";

    });


    // ==========================================
    // NUMERIC KEYPAD
    // ==========================================

    keypad.addEventListener("click", function (event) {

        const button = event.target.closest("button[data-key]");

        if (!button) return;

        const key = button.dataset.key;

        payMsg.textContent = "";


        // BACKSPACE
        if (key === "back") {

            cashAmount = cashAmount.slice(0, -1);

        }


        // CONFIRM CASH
        else if (key === "ok") {

            const total = getTotal();
            const cash = Number(cashAmount) || 0;

            if (total === 0) {

                payMsg.textContent = "No transaction to pay.";

            } else if (cash < total) {

                payMsg.textContent = "Insufficient cash amount.";

            } else {

                payMsg.textContent = "Cash amount confirmed.";

            }

        }


        // NUMBER INPUT
        else {

            if (cashAmount.length < 12) {

                if (cashAmount === "0") {

                    cashAmount = key;

                } else {

                    cashAmount += key;

                }

            }

        }


        // Update displayed values
        updateCash();
        calculateChange();

    });


    // ==========================================
    // PAY BUTTON
    // ==========================================

    payBtn.addEventListener("click", function () {

        const total = getTotal();
        const cash = Number(cashAmount) || 0;


        // Check if there is an order
        if (total === 0) {

            payMsg.textContent = "No transaction to pay.";
            return;

        }


        // Check if cash is sufficient
        if (cashAmount === "" || cash < total) {

            payMsg.textContent = "Insufficient cash amount.";
            return;

        }


        // Calculate change
        const change = cash - total;


        // Display payment confirmation
        payMsg.textContent =
            "Payment validated! Change: " + formatCurrency(change);


        // Database saving will be implemented later.

    });

});