// Load vehicles dynamically when page opens
window.onload = function () {
  fetch("http://localhost:5000/vehicles")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("vehicle");
      select.innerHTML = "";

      data.forEach(v => {
        const option = document.createElement("option");
        option.value = v.name;
        option.text = v.name + " (₹" + v.price + "/hr)";
        select.appendChild(option);
      });
    })
    .catch(() => {
      alert("Unable to load vehicles");
    });
};

function bookVehicle() {
  const name = document.getElementById("name").value;
  const vehicle = document.getElementById("vehicle").value;
  const hours = document.getElementById("hours").value;

  if (!name || !vehicle || !hours) {
    document.getElementById("result").innerText = "All fields are required";
    return;
  }

  // STEP 1: Create booking (get total amount)
  fetch("http://localhost:5000/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, vehicle, hours })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.total) {
      document.getElementById("result").innerText = "Booking failed";
      return;
    }

    // STEP 2: Create Razorpay order (TEST MODE)
    fetch("http://localhost:5000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: data.total })
    })
    .then(res => res.json())
    .then(order => {

      const options = {
        key: "rzp_test_RyxFepgcVzqUKT", // 🔴 PUT YOUR TEST KEY ID HERE
        amount: order.amount,
        currency: "INR",
        name: "Vehicle Rental",
        description: "Vehicle Booking Payment (Test Mode)",
        order_id: order.id,
        handler: function (response) {
          document.getElementById("result").innerText =
            "Payment Successful (Test Mode)\nPayment ID: " +
            response.razorpay_payment_id;
        },
        prefill: {
          name: name
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  })
  .catch(() => {
    document.getElementById("result").innerText = "Server error";
  });
}
