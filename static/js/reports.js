
// Helpers
const $ = (id) => document.getElementById(id);

const peso = (number) =>
    "₱" + number.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

let dailyData = null;
let monthlyData = null;


// Temporary deterministic placeholder data.
// Replace this with real Django database data later.
function seeded(seed) {
    let value = seed % 2147483647;

    if (value <= 0) {
        value += 2147483646;
    }

    return () => {
        value = (value * 16807) % 2147483647;
        return value / 2147483647;
    };
}


// Daily Sales Report
function generateDaily() {
    const date = $("daily-date").value;

    if (!date) {
        $("daily-date").focus();
        return;
    }

    const random = seeded(Number(date.replace(/-/g, "")));

    const orders = Math.floor(30 + random() * 90);
    const cancelled = Math.floor(random() * 8);
    const gross = Math.round(
        orders * (180 + random() * 220) * 100
    ) / 100;

    const discount = Math.round(
        gross * (0.03 + random() * 0.07) * 100
    ) / 100;

    const net = gross - discount;

    dailyData = {
        date,
        orders,
        cancelled,
        gross,
        discount,
        net
    };

    $("d-sales").textContent = peso(net);
    $("d-orders").textContent = orders;
    $("d-cancel").textContent = cancelled;
    $("d-gross").textContent = peso(gross);
    $("d-disc").textContent = "-" + peso(discount);
    $("d-net").textContent = peso(net);
}


// Monthly Sales Report
function setupMonthlyFilters() {
    MONTHS.forEach((month, index) => {
        $("m-month").add(new Option(month, index));
    });

    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= currentYear - 5; year--) {
        $("m-year").add(new Option(year, year));
    }

    $("m-month").value = new Date().getMonth();
}

function generateMonthly() {
    const month = Number($("m-month").value);
    const year = Number($("m-year").value);

    const random = seeded(year * 100 + month + 7);

    const weeks = [1, 2, 3, 4, 5].map(() =>
        Math.round(15000 + random() * 45000)
    );

    const sales = weeks.reduce((total, value) => total + value, 0);
    const orders = Math.floor(sales / (180 + random() * 60));
    const expenses = Math.round(sales * (0.45 + random() * 0.2));

    monthlyData = {
        month: MONTHS[month],
        year,
        weeks,
        sales,
        orders,
        expenses
    };

    $("m-sales").textContent = peso(sales);
    $("m-orders").textContent = orders.toLocaleString();
    $("m-exp").textContent = peso(expenses);

    renderMonthlyChart(weeks);
}

function renderMonthlyChart(weeks) {
    const chart = $("m-chart");

    chart.querySelectorAll(".report-bar").forEach((bar) => bar.remove());

    $("m-empty").hidden = true;

    const maxSales = Math.max(...weeks);

    weeks.forEach((sales, index) => {
        const bar = document.createElement("div");
        bar.className = "report-bar";
        bar.style.height = "0%";
        bar.title = `Week ${index + 1}: ${peso(sales)}`;

        const label = document.createElement("span");
        label.className = "report-bar-label";
        label.textContent = `W${index + 1}`;

        bar.appendChild(label);
        chart.appendChild(bar);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.height = `${(sales / maxSales) * 92}%`;
            });
        });
    });
}


// CSV Export
function downloadCSV(filename, rows) {
    const csv = rows
        .map((row) =>
            row.map((value) => {
                const text = String(value ?? "");
                return `"${text.replace(/"/g, '""')}"`;
            }).join(",")
        )
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportDaily() {
    if (!dailyData) {
        generateDaily();
    }

    if (!dailyData) return;

    const data = dailyData;

    downloadCSV(`daily-sales-${data.date}.csv`, [
        ["Date", "Orders", "Cancelled", "Gross Sales", "Discounts", "Net Sales"],
        [
            data.date,
            data.orders,
            data.cancelled,
            data.gross,
            data.discount,
            data.net
        ]
    ]);
}

function exportMonthly() {
    if (!monthlyData) {
        generateMonthly();
    }

    if (!monthlyData) return;

    const data = monthlyData;

    downloadCSV(`monthly-sales-${data.month}-${data.year}.csv`, [
        ["Week", "Sales"],
        ...data.weeks.map((sales, index) => [`Week ${index + 1}`, sales]),
        [],
        ["Total Sales", data.sales],
        ["Total Orders", data.orders],
        ["Total Expenses", data.expenses]
    ]);
}


// Print one report at a time
function printReport(reportId) {
    const otherId = reportId === "daily" ? "monthly" : "daily";
    const otherPanel = $(otherId);
    const previousDisplay = otherPanel.style.display;

    otherPanel.style.display = "none";

    window.print();

    otherPanel.style.display = previousDisplay;
}


// Initialize after the HTML loads
function initializeReports() {
    const date = new Date();

    // Use the local date instead of UTC.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    $("daily-date").value = `${year}-${month}-${day}`;

    setupMonthlyFilters();

    $("daily-generate").addEventListener("click", generateDaily);
    $("monthly-generate").addEventListener("click", generateMonthly);

    $("daily-export").addEventListener("click", exportDaily);
    $("monthly-export").addEventListener("click", exportMonthly);

    $("daily-print").addEventListener("click", () => printReport("daily"));
    $("monthly-print").addEventListener("click", () => printReport("monthly"));
}

initializeReports();
