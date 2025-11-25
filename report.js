document.addEventListener("DOMContentLoaded", function () {
  const invoices = [
    {
      id: 101,
      customer: "Acme Corp",
      date: "2025-10-01",
      amount: 1200,
      status: "Paid",
    },
    {
      id: 102,
      customer: "Beta LLC",
      date: "2025-10-05",
      amount: 550,
      status: "Pending",
    },
    {
      id: 103,
      customer: "Gamma Inc",
      date: "2025-09-20",
      amount: 320,
      status: "Paid",
    },
    {
      id: 104,
      customer: "Delta Co",
      date: "2025-11-01",
      amount: 780,
      status: "Pending",
    },
    {
      id: 105,
      customer: "Epsilon",
      date: "2025-08-15",
      amount: 220,
      status: "Overdue",
    },
  ];

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const revenue = [2400, 2800, 2600, 3000, 3200, 3100, 3500, 4200];

  const totalInvoicesEl = document.getElementById("totalInvoices");
  const paidInvoicesEl = document.getElementById("paidInvoices");
  const pendingInvoicesEl = document.getElementById("pendingInvoices");
  const overdueInvoicesEl = document.getElementById("overdueInvoices");
  const mailListEl = document.getElementById("mailList");
  const recentTableBody = document.querySelector("#recentTable tbody");

  const total = invoices.length;
  const paid = invoices.filter((i) => i.status.toLowerCase() === "paid").length;
  const pending = invoices.filter(
    (i) => i.status.toLowerCase() === "pending"
  ).length;
  const overdue = invoices.filter(
    (i) => i.status.toLowerCase() === "overdue"
  ).length;

  totalInvoicesEl.textContent = total;
  paidInvoicesEl.textContent = paid;
  pendingInvoicesEl.textContent = pending;
  overdueInvoicesEl.textContent = overdue;

  invoices.slice(0, 10).forEach((inv) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${inv.id}</td>
      <td>${inv.customer}</td>
      <td>${inv.date}</td>
      <td>${inv.amount.toFixed(2)}</td>
      <td>${inv.status}</td>
    `;
    recentTableBody.appendChild(tr);
  });

  const mails = [
    {
      to: "client1@acme.com",
      subject: "Invoice #102 - Reminder",
      status: "Pending",
    },
    {
      to: "client2@beta.com",
      subject: "Invoice #104 - Reminder",
      status: "Pending",
    },
    { to: "client3@gamma.com", subject: "Invoice #103 - Paid", status: "Sent" },
  ];

  mails.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `<div>
        <div><strong>${m.to}</strong></div>
        <div class="meta">${m.subject}</div>
      </div>
      <div>
        <span class="meta">${m.status}</span>
      </div>`;
    mailListEl.appendChild(li);
  });

  function createGrowthChart() {
    const ctx = document.getElementById("growthChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Revenue",
            data: revenue,
            borderColor: "#007bff",
            backgroundColor: "rgba(0,123,255,0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  function createStatusChart() {
    const ctx = document.getElementById("statusChart").getContext("2d");
    const data = [paid, pending, overdue];
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Paid", "Pending", "Overdue"],
        datasets: [
          {
            data,
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  createGrowthChart();
  createStatusChart();

  document.getElementById("exportCsv").addEventListener("click", () => {
    const headers = ["id", "customer", "date", "amount", "status"];
    const rows = invoices.map((i) => [
      i.id,
      i.customer,
      i.date,
      i.amount,
      i.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  document
    .getElementById("printReport")
    .addEventListener("click", () => window.print());
});
