const URL_API = "https://script.google.com/macros/s/AKfycby5myZ0i9IGHpsKkt4kUmA3SIi5c_BCrCUX4vCDBvq1MHGhmUmEfhclU5jgqUisb4gH/exec";

let productos = [];
let carrito = [];
let tipoEntrega = null;
let ubicacionLink = "";

const contenedor = document.getElementById("contenedor-productos");
const contadorHeader = document.getElementById("contador-productos");
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
        console.error("Error:", error);
        alert("Error cargando el catálogo de AV Drinks");
    }
}

// =========================
// RENDER (REPARADO PARA EL NUEVO CSS)
// =========================
function renderProductos() {
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("tarjeta-producto"); // Añadimos la clase para el CSS

        div.innerHTML = `
            <div class="contenedor-imagen">
                <img src="${prod.img}" alt="${prod.nombre}" onerror="this.src='img/placeholder.png'">
            </div>
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
// LÓGICA DEL CARRITO
// =========================
function sumar(id) {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        carrito.push(prod);
        actualizarInterfaz(id);
    }
}

function restar(id) {
    const index = carrito.findLastIndex(p => p.id === id);
    if (index !== -1) {
        carrito.splice(index, 1);
        actualizarInterfaz(id);
    }
}

function actualizarInterfaz(id) {
    // Actualizar cantidad individual en la tarjeta
    const span = document.getElementById(`cant-${id}`);
    const cantidadActual = carrito.filter(p => p.id === id).length;
    
    if (span) {
        span.innerText = cantidadActual;
    }
    
    // Actualizar contador total en el header
    if (contadorHeader) {
        contadorHeader.innerText = carrito.length;
    }
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
// UBICACIÓN (LINK CORREGIDO)
// =========================
function usarUbicacion() {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // URL corregida para Google Maps
        ubicacionLink = `https://www.google.com/maps?q=${lat},${lon}`;
        
        const btnUbi = document.querySelector(".btn-ubicacion");
        btnUbi.innerHTML = "📍 Ubicación Cargada ✔";
        btnUbi.classList.add("activo");
        alert("Ubicación obtenida correctamente");
    }, error => {
        alert("No se pudo obtener la ubicación. Por favor, escribí tu dirección.");
    });
}

// =========================
// ENVIAR PEDIDO A WHATSAPP
// =========================
function enviarPedido() {
    if (carrito.length === 0) {
        alert("¡El carrito está vacío! Agregá algunas bebidas.");
        return;
    }

    if (!tipoEntrega) {
        alert("Por favor, seleccioná si es Retiro o Delivery.");
        return;
    }

    let mensaje = "🚀 *NUEVO PEDIDO - AV DRINKS*%0A%0A";
    let total = 0;
    const resumen = {};

    // Agrupar productos por nombre
    carrito.forEach(p => {
        resumen[p.nombre] = (resumen[p.nombre] || 0) + 1;
        total += p.precio;
    });

    // Listar productos
    for (let nombre in resumen) {
        mensaje += `• *${resumen[nombre]}x* ${nombre}%0A`;
    }

    mensaje += `%0A💰 *TOTAL A PAGAR: $${total}*%0A`;
    mensaje += `────────────────────%0A`;

    if (tipoEntrega === "delivery") {
        const direccion = document.getElementById("direccion").value;
        mensaje += "🛵 *MODO:* Delivery%0A";

        if (ubicacionLink) {
            mensaje += `📍 *Ubicación:* ${ubicacionLink}%0A`;
        } else if (direccion.trim() !== "") {
            mensaje += `🏠 *Dirección:* ${direccion}%0A`;
        } else {
            alert("Para delivery, necesitamos tu ubicación o dirección escrita.");
            return;
        }
    } else {
        mensaje += "🏠 *MODO:* Retiro en local%0A";
    }

    const telefono = "5492634351883";
    const urlWa = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(urlWa, "_blank");
}

// =========================
// INICIO
// =========================
cargarProductos();
