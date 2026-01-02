function addVehicle() {
  const name = document.getElementById("vname").value;
  const price = document.getElementById("vprice").value;

  fetch("http://localhost:5000/admin/vehicle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("vresult").innerText = data.message || data.error;
  });
}

function loadBookings() {
  fetch("http://localhost:5000/admin/bookings")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("bookings");
      tbody.innerHTML = "";

      data.forEach(b => {
        const row = `
          <tr>
            <td>${b.id}</td>
            <td>${b.name}</td>
            <td>${b.vehicle}</td>
            <td>${b.hours}</td>
            <td>₹${b.total}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    });
}
