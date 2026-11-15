const data = JSON.parse(
    document.getElementById("dashboard-data").textContent
);

// DATE
document.getElementById("date").textContent =
    new Date().toLocaleString("en-PH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }) + " | Lucena City";

// CURRENCY
const currency = amount =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(amount);

// STATISTICS
document.getElementById("revenue").textContent =
    currency(data.revenue);

document.getElementById("totalOrders").textContent =
    data.total_orders.toLocaleString("en-PH");

// CHART ELEMENTS
const bars = document.getElementById("bars");
const xAxis = document.getElementById("xAxis");
const yAxis = document.getElementById("yAxis");
const chartRange = document.getElementById("chartRange");

// RENDER CHART
function renderChart(chartData) {
    bars.innerHTML = "";
    xAxis.innerHTML = "";
    yAxis.innerHTML = "";

    const values = chartData.map(item => item.value);
    const maxValue = Math.max(...values, 1);

    const chartMax = Math.ceil(maxValue / 100) * 100 || 100;

    chartData.forEach(item => {
        const height = (item.value / chartMax) * 92;

        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${height}%`;
        bar.title = `${item.date}: ${currency(item.value)}`;

        bars.appendChild(bar);

        const label = document.createElement("span");
        label.textContent = item.label;
        xAxis.appendChild(label);
    });

    // Y-AXIS LABELS
    for (let i = 4; i >= 0; i--) {
        const label = document.createElement("span");
        const amount = (chartMax / 4) * i;

        label.textContent = amount >= 1000
            ? `₱${(amount / 1000).toFixed(1)}k`
            : `₱${amount.toFixed(0)}`;

        yAxis.appendChild(label);
    }
}

// SWITCH BETWEEN WEEK AND MONTH
function updateChart() {
    if (chartRange.value === "month") {
        renderChart(data.monthly_chart);
    } else {
        renderChart(data.chart);
    }
}

chartRange.addEventListener("change", updateChart);

// INITIAL CHART
updateChart();

// TOP-SELLING PRODUCTS
const topList = document.getElementById("topList");

if (data.top_selling.length) {
    data.top_selling.forEach((product, index) => {
        const item = document.createElement("li");

        const rank = document.createElement("span");
        rank.className = "rank";
        rank.textContent = index + 1;

        const name = document.createElement("span");
        name.textContent =
            `${product.product_name} — ${product.total_quantity} sold`;

        item.append(rank, name);
        topList.appendChild(item);
    });
} else {
    const empty = document.createElement("li");
    empty.textContent = "No sales recorded yet.";
    topList.appendChild(empty);
}