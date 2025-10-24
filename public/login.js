const API = "http://localhost:3000/api";
const CODIGO_SECRETO = "ADMIN123";// 👈 Cambia este código por uno seguro

// Registro
async function registrar() {
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nombre, correo, password })
  });
  const data = await res.json();
  alert(data.message || data.error);
}

// Login
async function login() {
  const correo = document.getElementById("loginCorreo").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ correo, password })
  });
  const data = await res.json();
  
  if (data.usuario) {
    alert("✅ Bienvenido, " + data.usuario.nombre);
    document.getElementById("codigoSecretoSection").style.display = "block"; // mostrar sección de código
  } else {
    alert(data.error);
  }
}

// Reset
async function resetPass() {
  const correo = document.getElementById("resetCorreo").value;

  const res = await fetch(`${API}/reset`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ correo })
  });
  const data = await res.json();
  alert(data.message || data.error);
}

// Verificar código secreto
function verificarCodigo() {
  const codigoIngresado = document.getElementById("codigoSecreto").value;
  if (codigoIngresado === CODIGO_SECRETO) {
    alert("✅ Acceso concedido");
    window.location.href = "admin.html"; // redirige al panel
  } else {
    alert("❌ Código incorrecto");
  }
}
