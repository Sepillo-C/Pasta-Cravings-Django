(function () {
  const payPanel   = document.getElementById("pay-panel");
  const orderTotal = document.getElementById("order-total");
  const payTotal   = document.getElementById("pay-total");
  const cashInput  = document.getElementById("cash");
  const changeInput = document.getElementById("change");
  const msg        = document.getElementById("pay-msg");

  let cash = "";   // digits typed so far

  const fmt = (n) => "Rp " + Math.round(n).toLocaleString("en-US");
  const total = () => parseInt(orderTotal.textContent.replace(/[^\d]/g, ""), 10) || 0;

  function render() {
    const cashNum = parseInt(cash || "0", 10);
    cashInput.value = cash ? fmt(cashNum) : "";
    changeInput.value = cash && cashNum >= total() ? fmt(cashNum - total()) : "";
  }

  function say(text, ok) {
    msg.textContent = text;
    msg.classList.toggle("ok", !!ok);
  }

  function openPayment() {
    cash = "";
    payTotal.textContent = fmt(total());
    say("");
    render();
    payPanel.hidden = false;   // pops out over the order panel
  }

  function closePayment() {
    payPanel.hidden = true;    // order panel is still underneath
  }

  function press(key) {
    if (key === "back") cash = cash.slice(0, -1);
    else if (key === "ok") return pay();
    else if ((cash + key).length <= 9) cash = (cash + key).replace(/^0+(?=\d)/, "");
    say("");
    render();
  }

  function pay() {
    const cashNum = parseInt(cash || "0", 10);
    if (!cash || cashNum < total()) {
      say("Cash is not enough.");
      return;
    }
    say("Payment complete.", true);
    setTimeout(closePayment, 1200);
  }

  document.getElementById("checkout-btn").addEventListener("click", openPayment);
  document.getElementById("pay-back").addEventListener("click", closePayment);
  document.getElementById("pay-btn").addEventListener("click", pay);

  document.getElementById("keypad").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-key]");
    if (b) press(b.dataset.key);
  });

  // keyboard support while the payment screen is open
  document.addEventListener("keydown", (e) => {
    if (payPanel.hidden) return;
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("back");
    else if (e.key === "Enter") pay();
    else if (e.key === "Escape") closePayment();
  });
})();