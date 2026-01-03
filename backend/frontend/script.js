/* =========================
   UTILITY: Button Loading
========================= */
function toggleBtn(isLoading) {
  const btn = document.querySelector("button[onclick='bookVehicle()']");
  if (!btn) return;

  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm"></span> Processing...'
    : 'Book & Pay';
}

/* =========================
   1. LOAD VEHICLES
========================= */
window.onload = async function () {
  const select = document.getElementById("vehicle");
  const selectedFromMap = sessionStorage.getItem("selectedVehicle");

  try {
    const res = await fetch(
      "https://vehicle-rental-3.onrender.com/vehicles"
    );

    const data = await res.json();

    select.innerHTML = data.map(v => `
      <option value="${v.name}" ${v.name === selectedFromMap ? "selected" : ""}>
        ${v.name} (₹${v.price}/hr)
      </option>
    `).join("");

  } catch (err) {
    document.getElementById("result").innerHTML =
      '<span class="text-danger small">Unable to load vehicles.</span>';
  }
};

/* =========================
   2. BOOK + PAY FLOW
========================= */
async function bookVehicle() {
  const name = document.getElementById("name").value.trim();
  const vehicle = document.getElementById("vehicle").value;
  const hours = document.getElementById("hours").value;
  const result = document.getElementById("result");

  if (!name || !vehicle || !hours) {
    result.className = "text-warning small";
    result.innerText = "Please fill all fields.";
    return;
  }

  toggleBtn(true);
  result.innerText = "";

  try {
    /* STEP 1: Create Booking */
    const bookRes = await fetch(
      "https://vehicle-rental-3.onrender.com/book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vehicle, hours })
      }
    );

    const bookData = await bookRes.json();
    if (!bookData.total) throw new Error("Booking failed");

    /* STEP 2: Create Razorpay Order */
    const orderRes = await fetch(
      "https://vehicle-rental-3.onrender.com/create-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bookData.total })
      }
    );

    const order = await orderRes.json();

    /* STEP 3: Razorpay Checkout */
    const options = {
      key: "rzp_test_RyxFepgcVzqUKT",
      amount: order.amount,
      currency: "INR",
      name: "DriveX Rentals",
      description: `Booking for ${vehicle}`,
      order_id: order.id,
      handler: function (response) {
        result.innerHTML = `
          <div class="alert alert-success mt-3">
            <i class="bi bi-check-circle"></i>
            Payment Successful<br>
            <small>Ref: ${response.razorpay_payment_id}</small>
          </div>`;
        toggleBtn(false);
      },
      modal: {
        ondismiss: () => toggleBtn(false)
      },
      prefill: {
        name: name,
        contact: sessionStorage.getItem("userPhone") || ""
      },
      theme: { color: "#000000" }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    result.className = "text-danger small";
    result.innerText = "Error: " + err.message;
    toggleBtn(false);
  }
}
