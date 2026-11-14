document.addEventListener("DOMContentLoaded", () => {
    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);
    const money = amount => `₱${amount.toFixed(2)}`;

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

    let cash = "";
    let paymentSaved = false;

    // CALCULATE TOTAL
    const getTotal = () => Object.values(cart)
        .reduce((sum, item) => sum + item.price * item.qty, 0);

    // UPDATE ORDER DISPLAY
    const render = () => {
        const total = getTotal();
        const items = Object.entries(cart).filter(([, item]) => item.qty > 0);

        $("#order-total").textContent = money(total);
        $("#pay-total").textContent = money(total);

        orderBody.classList.toggle("has-items", items.length > 0);

        orderBody.innerHTML = items.length
            ? items.map(([id, item]) => `
                <div class="order-item" data-id="${id}">
                    <div class="item-info">
                        <strong>${item.name}</strong>
                        <small>${money(item.price)} each</small>
                    </div>

                    <div class="item-bottom">
                        <div class="quantity-controls">
                            <button
                                type="button"
                                data-action="minus"
                                aria-label="Decrease quantity"
                            >−</button>

                            <span>${item.qty}</span>

                            <button
                                type="button"
                                data-action="plus"
                                aria-label="Increase quantity"
                            >+</button>

                            <button
                                type="button"
                                data-action="remove"
                                class="remove-item"
                                aria-label="Remove item"
                            >×</button>
                        </div>

                        <strong class="item-total">
                            ${money(item.price * item.qty)}
                        </strong>
                    </div>
                </div>
            `).join("")
            : '<p class="no-tx">No Transaction</p>';

        $("#checkout-btn").disabled = items.length === 0;
    };

    // ADD PRODUCTS TO CART
    cards.forEach((card, index) => {
        const name = card.querySelector("h3")?.textContent.trim();
        const price = Number(
            card.querySelector(".price")?.textContent.replace(/[^\d.]/g, "")
        );

        if (!name || !Number.isFinite(price)) return;

        card.dataset.id = index;

        card.addEventListener("click", () => {
            cart[index] ??= {
                name,
                price,
                qty: 0
            };

            cart[index].qty++;
            render();
        });
    });

    // CART QUANTITY CONTROLS
    orderBody.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const row = button.closest("[data-id]");
        if (!row) return;

        const id = row.dataset.id;
        const item = cart[id];

        if (!item) return;

        switch (button.dataset.action) {
            case "plus":
                item.qty++;
                break;

            case "minus":
                item.qty--;
                break;

            case "remove":
                item.qty = 0;
                break;
        }

        if (item.qty <= 0) {
            delete cart[id];
        }

        render();
    });

    // PRODUCT SEARCH
    $(".menu-panel .search input")?.addEventListener("input", event => {
        const query = event.target.value.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
            card.hidden = !name.includes(query);
        });
    });

    // CATEGORY FILTER
    $$(".chip").forEach(button => {
        button.addEventListener("click", () => {
            $$(".chip").forEach(chip => chip.classList.remove("active"));
            button.classList.add("active");

            cards.forEach(card => {
                card.hidden =
                    button.dataset.category !== "all" &&
                    card.dataset.category !== button.dataset.category;
            });
        });
    });

    // ORDER TYPE
    $$(".toggle .seg").forEach(button => {
        button.addEventListener("click", () => {
            $$(".toggle .seg").forEach(seg => seg.classList.remove("active"));
            button.classList.add("active");
        });
    });

    // CHECKOUT
    $("#checkout-btn").addEventListener("click", () => {
        if (!Object.keys(cart).length) return;

        orderPanel.hidden = true;
        payPanel.hidden = false;

        cash = "";
        cashInput.value = "";
        changeInput.value = "";
        payMsg.textContent = "";

        payBtn.disabled = false;
        payBtn.textContent = "Pay";

        render();
    });

    // BACK TO ORDER
    $("#pay-back").addEventListener("click", () => {
        if (paymentSaved) return;

        payPanel.hidden = true;
        orderPanel.hidden = false;
    });

    // NUMERIC KEYPAD
    $("#keypad").addEventListener("click", event => {
        const key = event.target.closest("button")?.dataset.key;

        if (!key || paymentSaved) return;

        if (key === "back") {
            cash = cash.slice(0, -1);
        } else if (key !== "ok") {
            cash += key;
        }

        cashInput.value = cash ? money(Number(cash)) : "";

        const change = Number(cash) - getTotal();

        changeInput.value = change >= 0
            ? money(change)
            : "";

        payMsg.textContent = "";
    });

    // PAYMENT SUCCESS MODAL
    $("#success-ok").addEventListener("click", () => {
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

    // SAVE PAYMENT TO DJANGO
    payBtn.addEventListener("click", async () => {
        const total = getTotal();

        if (!Object.keys(cart).length) {
            payMsg.textContent = "No transaction to pay.";
            return;
        }

        if (!cash || Number(cash) < total) {
            payMsg.textContent = "Insufficient cash amount.";
            return;
        }

        const csrf = $('[name="csrfmiddlewaretoken"]')?.value;
        const saveUrl = $(".page").dataset.saveUrl;
        const orderType = $(".toggle .seg.active")?.dataset.orderType || "Walk-In";

        payBtn.disabled = true;
        payBtn.textContent = "Processing...";

        try {
            const response = await fetch(saveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrf
                },
                body: JSON.stringify({
                    items: Object.values(cart).map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.qty
                    })),
                    cash,
                    order_type: orderType
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Payment failed.");
            }

            paymentSaved = true;
            payBtn.textContent = "Paid";
            successModal.hidden = false;

        } catch (error) {
            payMsg.textContent = error.message;
            payBtn.disabled = false;
            payBtn.textContent = "Pay";
        }
    });

    // INITIAL DISPLAY
    render();
});