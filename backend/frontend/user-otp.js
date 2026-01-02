function enterUserPortal() {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput.value.trim() || "TEST_USER";
  const btn = event.target;

  // 1. Validation: Ensure it looks like a phone number if not empty
  if (phone !== "TEST_USER" && phone.length < 10) {
    alert("Please enter a valid 10-digit mobile number");
    return;
  }

  // 2. UI Feedback: Change button state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Connecting...';

  // 3. Set Session Storage
  sessionStorage.setItem("userPhone", phone);

  // 4. Redirect after a slight delay for better UX
  setTimeout(() => {
    // Make sure this filename matches your map file exactly!
    window.location.href = "map.html"; 
  }, 800);
}