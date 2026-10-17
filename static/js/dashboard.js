// Sample data for now.
// We will replace this with data from the database later.

const data = {
  revenue: null,

  chart: [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 30 },
    { label: "Wed", value: 70 },
    { label: "Thu", value: 88 },
    { label: "Fri", value: 90 },
    { label: "Sat", value: 80 },
    { label: "Sun", value: 58 },
  ],

  topSelling: [
    "Cheesy Bacon Fries",
    "Chicken Ala King",
    "Cheesy Poppers",
    "Orange Chicken",
    "Hungarian Sausage",
    "Lechon Kawali",
    "Aglio Olio",
    "Bolognese",
    "Tuna Pesto",
    "Creamy Truffle",
  ],
};



const dateText = new Date().toLocaleString("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

document.getElementById("date").textContent = dateText + " | Lucena City";



if (data.revenue != null) {
  document.getElementById("revenue").textContent =
    "₱" + data.revenue.toLocaleString();
}



const max = Math.max(...data.chart.map((item) => item.value));


document.getElementById("bars").innerHTML = data.chart
  .map((item) => {
    const height = (item.value / max) * 92;

    return `<div class="bar" style="height: ${height}%"></div>`;
  })
  .join("");


document.getElementById("xAxis").innerHTML = data.chart
  .map((item) => `<span>${item.label}</span>`)
  .join("");


document.getElementById("yAxis").innerHTML = Array.from(
  { length: 9 },
  (_, i) => `<span>${Math.round(max * (1 - i / 9))}</span>`
).join("");


document.getElementById("topList").innerHTML = data.topSelling
  .map((name, i) => {
    return `<li><span class="rank">${i + 1}</span>${name}</li>`;
  })
  .join("");