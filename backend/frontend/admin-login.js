function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
  if (data.success) {
  sessionStorage.setItem("admin", "true");
  window.location.href = "admin.html";
   }
 else {
      document.getElementById("result").innerText = "Invalid login";
    }
  });
}
