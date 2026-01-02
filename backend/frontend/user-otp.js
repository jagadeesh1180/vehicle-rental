function enterUserPortal() {
  const phone =
    document.getElementById("phone").value || "TEST_USER";

  // Temporary login flag
  sessionStorage.setItem("userPhone", phone);

  // Go to user flow
  window.location.href = "map.html";
}
