const URL_API = "https://script.google.com/macros/s/AKfycby5myZ0i9IGHpsKkt4kUmA3SIi5c_BCrCUX4vCDBvq1MHGhmUmEfhclU5jgqUisb4gH/exec";

let productos = [];
let carrito = [];
let tipoEntrega = "retiro";
let ubicacionLink = "";

// ELEMENTOS
const contenedor = document.getElementById("contenedor-productos");
const contador = document.getElementById("contador-productos");

// =========================
// CARGAR PRODUCTOS DESDE SHEET
// =========================
async function cargarProductos() {
    try {
        const res = await fetch(URL_API);
        const data = await res.json();

        productos = data
            .filter(p => p.activo === true || p.activo === "TRUE")
            .map(p => ({
                id: Number(p.id),
                nombre: p.nombre,
                precio: Number(p.precio),
                img: p.img
            }));

        renderProductos();

    } catch (error) {
        console.error("Error:", error);
        alert("Error cargando productos");
    }
}

// =========================
// RENDER PRODUCTOS
// =========================
function renderProductos() {
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("tarjeta-producto");

        div.innerHTML = `
            <img src="${prod.img}" onerror="this.src='https://via.placeholder.com/150'">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>

            <div class="contador">
                <button onclick="restar(${prod.id})">-</button>
                <span id="cant-${prod.id}">0</span>
                <button onclick="sumar(${prod.id})">+</button>
            </div>
        `;

        contenedor.appendChild(div);
    });
}

// =========================
// CARRITO
// =========================
function sumar(id) {
    const prod = productos.find(p => p.id === id);
    carrito.push(prod);
    actualizarCantidad(id, 1);
}

function restar(id) {
    const index = carrito.findIndex(p => p.id === id);
    if (index !== -1) {
        carrito.splice(index, 1);
        actualizarCantidad(id, -1);
    }
}

function actualizarCantidad(id, cambio) {
    const span = document.getElementById(`cant-${id}`);
    let valor = Number(span.innerText);
    valor += cambio;
    if (valor < 0) valor = 0;
    span.innerText = valor;

    contador.innerText = carrito.length;
}

// =========================
// ENTREGA
// =========================
function seleccionarEntrega(tipo) {
    tipoEntrega = tipo;

    const btnRetiro = document.getElementById("btn-retiro");
    const btnDelivery = document.getElementById("btn-delivery");
    const campo = document.getElementById("campo-direccion");

    btnRetiro.classList.remove("activo");
    btnDelivery.classList.remove("activo");

    if (tipo === "retiro") {
        btnRetiro.classList.add("activo");
        campo.style.display = "none";
        ubicacionLink = "";
    } else {
        btnDelivery.classList.add("activo");
        campo.style.display = "block";
    }
}

// =========================
// UBICACION GPS
// =========================
function usarUbicacion() {
    if (!navigator.geolocation) {
        alert("Tu navegador no permite ubicación");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        ubicacionLink = `https://www.google.com/maps?q=${lat},${lon}`;

        alert("Ubicación cargada ✔");
    });
}

// =========================
// ENVIAR PEDIDO
// =========================
function enviarPedido() {
    if (carrito.length === 0) {
        alert("El pedido está vacío");
        return;
    }

    let mensaje = "Hola AV Drinks, quiero:%0A%0A";
    let total = 0;
    const resumen = {};

    carrito.forEach(p => {
        resumen[p.nombre] = (resumen[p.nombre] || 0) + 1;
        total += p.precio;
    });

    for (let nombre in resumen) {
        mensaje += `*${resumen[nombre]}x* ${nombre}%0A`;
    }

    mensaje += `%0A*Total: $${total}*%0A%0A`;

    // ENTREGA
    if (tipoEntrega === "delivery") {
        const direccion = document.getElementById("direccion").value;

        mensaje += "🚚 *Delivery*%0A";

        if (ubicacionLink) {
            mensaje += `📍 Ubicación: ${ubicacionLink}%0A`;
        } else if (direccion) {
            mensaje += `📍 Dirección: ${direccion}%0A`;
        } else {
            alert("Poné ubicación o dirección");
            return;
        }

    } else {
        mensaje += "🏠 *Retiro en el local*%0A";
    }

    const telefono = "5492634351883";
    window.open(`https://wa.me/${telefono}?text=${mensaje}`);
}

// =========================
// INICIAR
// =========================
cargarProductos();
