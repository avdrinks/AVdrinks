const URL_API = "https://script.google.com/macros/s/AKfycby5myZ0i9IGHpsKkt4kUmA3SIi5c_BCrCUX4vCDBvq1MHGhmUmEfhclU5jgqUisb4gH/exec";

let productos = [];
let carrito = [];
let tipoEntrega = null;
let ubicacionLink = "";

const contenedor = document.getElementById("contenedor-productos");
const contador = document.getElementById("contador-productos");
const btnWhatsapp = document.getElementById("btn-whatsapp");

// =========================
// CARGAR PRODUCTOS
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
        alert("Error cargando productos");
    }
}

// =========================
// RENDER
// =========================
function renderProductos() {
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement("div");

        div.innerHTML = `
            <img src="${prod.img}">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>

            <div>
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

    btnWhatsapp.disabled = false;
}

// =========================
// UBICACION
// =========================
function usarUbicacion() {
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        ubicacionLink = `https://www.google.com/maps?q=${lat},${lon}`;
        alert("Ubicación cargada ✔");
    });
}

// =========================
// ENVIAR
// =========================
function enviarPedido() {

    if (!tipoEntrega) {
        alert("Seleccioná Retiro o Delivery");
        return;
    }

    if (carrito.length === 0) {
        alert("Agregá productos");
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

    if (tipoEntrega === "delivery") {
        const direccion = document.getElementById("direccion").value;

        mensaje += "🚚 Delivery%0A";

        if (ubicacionLink) {
            mensaje += `📍 ${ubicacionLink}%0A`;
        } else if (direccion) {
            mensaje += `📍 ${direccion}%0A`;
        } else {
            alert("Poné dirección o ubicación");
            return;
        }

    } else {
        mensaje += "🏠 Retiro en local%0A";
    }

    const telefono = "5492634351883";
    window.open(`https://wa.me/${telefono}?text=${mensaje}`);
}

// =========================
cargarProductos();
