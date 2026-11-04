(() => {
  const U = window.POS_URLS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const peso = (n) => "₱" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 2 });
  const csrf = () => document.cookie.split("; ").find((c) => c.startsWith("csrftoken="))?.split("=")[1] || "";

  let cart = null, method = "cash", cash = "", pendingDelete = null;

  async function api(url, body) {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf() },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  }

  /* ---------- cart rendering ---------- */
  function render(c) {
    cart = c;
    const box = $("#lines");
    if (!c.lines.length) {
      box.innerHTML = '<p class="empty">No Transaction</p>';
    } else {
      box.innerHTML = c.lines.map((l) => `
        <div class="line" data-id="${l.id}">
          <div><div class="ln">${l.name}</div><div class="sub">${peso(l.price)} each</div></div>
          <div class="qty">
            <button data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-d="1" aria-label="More">+</button>
          </div>
          <button class="del" data-del aria-label="Remove">✕</button>
        </div>`).join("");
    }
    $("#t-sub").textContent = peso(c.subtotal);
    $("#t-disc").textContent = c.discount + "%";
    $("#t-svc").textContent = peso(c.service);
    $("#t-tax").textContent = c.tax_percent + "%";
    $("#t-total").textContent = peso(c.total);
    $("#pay-total").textContent = peso(c.total);
    $$("#types .chip").forEach((b) => b.classList.toggle("active", b.dataset.type === c.type));
    updateChange();
  }

  const run = async (fn) => { try { render(await fn()); } catch (e) { alert(e.message); } };

  /* ---------- product grid ---------- */
  $("#grid").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) run(() => api(U.add, { product_id: card.dataset.id }));
  });

  let activeCat = "all";
  function filterGrid() {
    const q = $("#search").value.trim().toLowerCase();
    $$("#grid .card").forEach((c) => {
      const okCat = activeCat === "all" || c.dataset.cat === activeCat;
      c.classList.toggle("hidden", !(okCat && c.dataset.name.includes(q)));
    });
  }
  $("#categories").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    activeCat = b.dataset.cat;
    $$("#categories .chip").forEach((x) => x.classList.toggle("active", x === b));
    filterGrid();
  });
  $("#search").addEventListener("input", filterGrid);

  /* ---------- order panel ---------- */
  $("#types").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) run(() => api(U.type, { type: b.dataset.type }));
  });

  $("#lines").addEventListener("click", (e) => {
    const row = e.target.closest(".line"); if (!row) return;
    if (e.target.dataset.d) {
      run(() => api(U.update, { product_id: row.dataset.id, delta: +e.target.dataset.d }));
    } else if (e.target.closest("[data-del]")) {
      pendingDelete = row.dataset.id;
      $("#delete-modal").hidden = false;
    }
  });

  /* delete modal */
  $("#delete-modal").addEventListener("click", (e) => {
    if (e.target.matches("[data-close], .overlay")) { pendingDelete = null; $("#delete-modal").hidden = true; }
  });
  $("#confirm-delete").addEventListener("click", async () => {
    if (pendingDelete) render(await api(U.remove, { product_id: pendingDelete }));
    pendingDelete = null; $("#delete-modal").hidden = true;
  });

  /* ---------- payment view ---------- */
  function show(view) {
    $("#order-view").hidden = view !== "order";
    $("#pay-view").hidden = view !== "pay";
  }
  $("#checkout").addEventListener("click", () => {
    if (!cart || !cart.lines.length) return alert("Add at least one item first.");
    cash = ""; $("#cash").value = ""; $("#pay-error").textContent = "";
    show("pay"); updateChange();
  });
  $("#back").addEventListener("click", () => show("order"));

  $("#methods").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    method = b.dataset.method;
    $$("#methods .chip").forEach((x) => x.classList.toggle("active", x === b));
    const isCash = method === "cash";
    $("#cash-fields").hidden = !isCash;
    $("#noncash").hidden = isCash;
  });

  function updateChange() {
    const total = cart ? parseFloat(cart.total) : 0;
    const given = parseFloat(cash || "0");
    $("#cash").value = cash ? peso(given) : "";
    $("#change").value = cash && given >= total ? peso(given - total) : "";
  }

  $("#numpad").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const k = b.dataset.key;
    if (k === "back") cash = cash.slice(0, -1);
    else if (k === "ok") cash = String(Math.ceil(parseFloat(cart.total)));   // exact / rounded-up amount
    else if (cash.length < 9) cash += b.textContent;
    updateChange();
  });

  $("#pay").addEventListener("click", async () => {
    $("#pay-error").textContent = "";
    $("#pay").disabled = true;
    try {
      const r = await api(U.checkout, { method, cash: method === "cash" ? cash : undefined });
      $("#success-msg").textContent = `Payment Success, please check your history (Order #${r.order_id})`;
      $("#success-modal").hidden = false;
    } catch (err) {
      $("#pay-error").textContent = err.message;
    } finally {
      $("#pay").disabled = false;
    }
  });

  $("#success-ok").addEventListener("click", () => location.reload());

  api(U.cart).then(render);
})();