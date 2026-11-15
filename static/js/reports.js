document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const page = document.querySelector(".sales-reports-page");

    const dailyURL = page.dataset.dailyUrl;
    const monthlyURL = page.dataset.monthlyUrl;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let dailyData = null;
    let monthlyData = null;

    const peso = value => "₱" + Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    function showError(id, message = "") {
        $(id).textContent = message;
        $(id).hidden = !message;
    }

    async function fetchReport(url, errorId) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Unable to load report data.");
            }

            showError(errorId);
            return await response.json();
        } catch (error) {
            showError(errorId, error.message);
            return null;
        }
    }

    async function loadDaily() {
        const date = $("daily-date").value;
        if (!date) return;

        const data = await fetchReport(
            `${dailyURL}?date=${encodeURIComponent(date)}`,
            "daily-error"
        );

        if (!data) return;
        dailyData = { date, ...data };

        $("d-sales").textContent = peso(data.total_sales);
        $("d-orders").textContent = Number(data.total_orders).toLocaleString();
        $("d-average").textContent = peso(data.average_order);
        $("d-gross").textContent = peso(data.gross_sales);
        $("d-tax").textContent = peso(data.tax);
        $("d-service").textContent = peso(data.service_charge);
        $("d-net").textContent = peso(data.total_sales);
    }

    async function loadMonthly() {
        const month = String(Number($("m-month").value) + 1).padStart(2, "0");
        const year = $("m-year").value;
        const selectedMonth = `${year}-${month}`;

        const data = await fetchReport(
            `${monthlyURL}?month=${selectedMonth}`,
            "monthly-error"
        );

        if (!data) return;
        monthlyData = { month: months[Number($("m-month").value)], year, ...data };

        $("m-sales").textContent = peso(data.total_sales);
        $("m-orders").textContent = Number(data.total_orders).toLocaleString();
        $("m-average").textContent = peso(data.average_order);

        renderChart(data.weeks);
    }

    function renderChart(weeks) {
        const chart = $("m-chart");
        chart.querySelectorAll(".report-bar").forEach(bar => bar.remove());

        const empty = $("m-empty");
        const max = Math.max(...weeks.map(week => Number(week.sales)), 0);

        if (max === 0) {
            empty.textContent = "No sales recorded for this month.";
            empty.hidden = false;
            return;
        }

        empty.hidden = true;

        weeks.forEach(week => {
            const sales = Number(week.sales);
            const bar = document.createElement("div");

            bar.className = "report-bar";
            bar.style.height = `${Math.max((sales / max) * 92, 2)}%`;
            bar.title = `${week.label}: ${peso(sales)}`;

            const label = document.createElement("span");
            label.className = "report-bar-label";
            label.textContent = week.label.replace("Week ", "W");

            bar.appendChild(label);
            chart.appendChild(bar);
        });
    }

    function setupFilters() {
        months.forEach((month, index) => {
            $("m-month").add(new Option(month, index));
        });

        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= currentYear - 5; year--) {
            $("m-year").add(new Option(year, year));
        }

        $("m-month").value = new Date().getMonth();
        $("m-year").value = currentYear;

        $("daily-date").value = [
            currentYear,
            String(new Date().getMonth() + 1).padStart(2, "0"),
            String(new Date().getDate()).padStart(2, "0")
        ].join("-");
    }

    function downloadCSV(filename, rows) {
        const csv = rows.map(row =>
            row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
        ).join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function exportDaily() {
        if (!dailyData) return;

        const data = dailyData;

        downloadCSV(`daily-sales-${data.date}.csv`, [
            ["Date", "Total Sales", "Gross Sales", "Tax", "Service Charge", "Orders", "Average Order"],
            [data.date, data.total_sales, data.gross_sales, data.tax,
                data.service_charge, data.total_orders, data.average_order]
        ]);
    }

    function exportMonthly() {
        if (!monthlyData) return;

        const data = monthlyData;

        downloadCSV(`monthly-sales-${data.month}-${data.year}.csv`, [
            ["Month", "Total Sales", "Orders", "Average Order"],
            [data.month + " " + data.year, data.total_sales,
                data.total_orders, data.average_order],
            [],
            ["Week", "Sales"],
            ...data.weeks.map(week => [week.label, week.sales])
        ]);
    }

    function printReport(id) {
        const other = $(id === "daily" ? "monthly" : "daily");
        const previous = other.style.display;

        other.style.display = "none";
        window.print();
        other.style.display = previous;
    }

    setupFilters();

    $("daily-date").addEventListener("change", loadDaily);
    $("m-month").addEventListener("change", loadMonthly);
    $("m-year").addEventListener("change", loadMonthly);

    $("daily-export").addEventListener("click", exportDaily);
    $("monthly-export").addEventListener("click", exportMonthly);

    $("daily-print").addEventListener("click", () => printReport("daily"));
    $("monthly-print").addEventListener("click", () => printReport("monthly"));

    loadDaily();
    loadMonthly();
});