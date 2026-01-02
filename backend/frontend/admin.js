function addVehicle() {
  const name = document.getElementById("vname").value.trim();
  const price = document.getElementById("vprice").value.trim();
  const resultEl = document.getElementById("vresult");

  // Basic Validation
  if (!name || !price) {
    resultEl.className = "text-danger";
    resultEl.innerText = "Error: Please fill in all fields.";
    return;
  }

  // Visual feedback: disable button while saving
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

  fetch("http://localhost:5000/admin/vehicle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      resultEl.className = "text-danger";
      resultEl.innerText = data.error;
    } else {
      resultEl.className = "text-success";
      resultEl.innerText = "Vehicle added successfully!";
      // Clear inputs
      document.getElementById("vname").value = "";
      document.getElementById("vprice").value = "";
      // Refresh the list if the function exists
      if (typeof loadVehicles === "function") loadVehicles();
    }
  })
  .catch(err => {
    resultEl.className = "text-danger";
    resultEl.innerText = "Server Error: Could not reach the API.";
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerText = "Add Vehicle";
  });
}