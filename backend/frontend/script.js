/* UTILITY: Show loading state */
const toggleBtn = (isLoading) => {
    const btn = document.querySelector("button[onclick='bookVehicle()']");
    btn.disabled = isLoading;
    btn.innerHTML = isLoading ? 
        '<span class="spinner-border spinner-border-sm"></span> Processing...' : 
        'Book & Pay';
};

/* 1. LOAD VEHICLES WITH FALLBACK */
window.onload = async function () {
    const select = document.getElementById("vehicle");
    const selectedFromMap = sessionStorage.getItem("selectedVehicle");

    try {
        const res = await fetch("http://localhost:5000/vehicles");
        const data = await res.json();
        
        select.innerHTML = data.map(v => `
            <option value="${v.name}" ${v.name === selectedFromMap ? 'selected' : ''}>
                ${v.name} (₹${v.price}/hr)
            </option>
        `).join("");
        
    } catch (err) {
        document.getElementById("result").innerHTML = 
            '<span class="text-danger small">Network error: Could not load fleet.</span>';
    }
};

/* 2. CONSOLIDATED BOOKING & PAYMENT WORKFLOW */
async function bookVehicle() {
    const name = document.getElementById("name").value.trim();
    const vehicle = document.getElementById("vehicle").value;
    const hours = document.getElementById("hours").value;
    const result = document.getElementById("result");

    if (!name || !vehicle || !hours) {
        result.className = "text-warning small";
        result.innerText = "Please complete all fields.";
        return;
    }

    toggleBtn(true);
    result.innerText = "";

    try {
        // STEP 1: Initialize Booking on Backend
        const bookRes = await fetch("http://localhost:5000/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, vehicle, hours })
        });
        const bookData = await bookRes.json();

        if (!bookData.total) throw new Error("Booking registration failed.");

        // STEP 2: Create Razorpay Order
        const orderRes = await fetch("http://localhost:5000/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: bookData.total })
        });
        const order = await orderRes.json();

        // STEP 3: Open Razorpay Interface
        const options = {
            key: "rzp_test_RyxFepgcVzqUKT", 
            amount: order.amount,
            currency: "INR",
            name: "DriveX Rentals",
            description: `Booking for ${vehicle}`,
            order_id: order.id,
            modal: {
                ondismiss: function() { toggleBtn(false); }
            },
            handler: function (response) {
                // SUCCESS FLOW
                result.innerHTML = `
                    <div class="alert alert-success mt-3">
                        <i class="bi bi-check-circle"></i> Payment Successful!<br>
                        <small>Ref: ${response.razorpay_payment_id}</small>
                    </div>`;
                toggleBtn(false);
                // Optional: Redirect to receipt page
                // window.location.href = "success.html?id=" + response.razorpay_payment_id;
            },
            prefill: { name: name, contact: sessionStorage.getItem("userPhone") },
            theme: { color: "#000000" } // Matching your dark UI
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        result.className = "text-danger small";
        result.innerText = "Error: " + err.message;
        toggleBtn(false);
    }
}