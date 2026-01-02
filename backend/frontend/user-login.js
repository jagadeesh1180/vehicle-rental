function login() {
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "user.html";
    } else {
      document.getElementById("result").innerText = "Invalid login";
    }
  });
}
