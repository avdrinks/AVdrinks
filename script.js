const URL_API = "https://script.google.com/macros/s/AKfycby5myZ0i9IGHpsKkt4kUmA3SIi5c_BCrCUX4vCDBvq1MHGhmUmEfhclU5jgqUisb4gH/exec";

let productos = [];
let carrito = [];
let tipoEntrega = null;
let ubicacionLink = "";

// Mapeo exacto de emojis por categoría
const EMOJIS_CAT = {
    "lo mas vendido": "🔥",
    "promos": "⚡",
    "fernet": "🌿",
    "vodka": "🍸",
    "aperitivos": "🍹",
    "gin": "🍸",
    "cervezas": "🍺",
    "vinos y espumantes": "🍷",
    "vinos": "🍷",
    "energizantes": "⚡",
    "sin alcohol": "🥤",
    "snacks y chocolates": "🍟",
    "snacks": "🍟",
    "cigarrillos": "🚬",
    "cigarros": "🚬",
    "unidades": "🍾",
    "hielo": "🧊"
};

// =========================
// CARGAR PRODUCTOS
// =========================
async function cargarProductos() {
    try {
        const res = await fetch(URL_API);
        const data = await res.json();

        productos = data
            .filter(p => p.nombre && (p.activo === true || p.activo === "TRUE" || p.activo === "true"))
            .map(p => ({
                id: Number(p.id),
                nombre: p.nombre,
                precio: Number(p.precio) || 0,
                img: p.img || '',
                categoria: p.categoria ? String(p.categoria).toLowerCase().trim() : "unidades"
            }));

        renderProductosDinamico();

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// =========================
// RENDER DINÁMICO
// =========================
function renderProductosDinamico() {
    const contenedorAcordeon = document.querySelector('.acordeon-bebidas');
    if (!contenedorAcordeon) return;
    
    contenedorAcordeon.innerHTML = ""; 

    const grupos = {};
    productos.forEach(p => {
        if (!grupos[p.categoria]) grupos[p.categoria] = [];
        grupos[p.categoria].push(p);
    });

    Object.keys(grupos).forEach((cat, index) => {
        const catId = cat.replace(/\s+/g, '-');
        const emoji = EMOJIS_CAT[cat] || '🥂';
        const estaAbierta = index === 0;

        const itemCat = document.createElement("div");
        itemCat.className = "categoria-item";

        itemCat.innerHTML = `
            <div class="cabecera-cat" onclick="toggleCategoria('${catId}')">
                <span>${emoji} ${cat.toUpperCase()}</span>
                <span class="flecha" id="flecha-${catId}">${estaAbierta ? '▼' : '▶'}</span>
            </div>
            <div id="lista-${catId}" class="contenido-cat" style="display: ${estaAbierta ? 'grid' : 'none'};">
            </div>
        `;

        contenedorAcordeon.appendChild(itemCat);

        const listaContenedor = itemCat.querySelector(`#lista-${catId}`);

        grupos[cat].forEach(prod => {
            const div = document.createElement("div");
            div.classList.add("tarjeta-producto");

            const cantActual = carrito.filter(item => item.id === prod.id).length;

            div.innerHTML = `
                <div class="contenedor-imagen">
                    <img src="${prod.img}" alt="${prod.nombre}" onerror="this.src='img/placeholder.png'">
                </div>
                <h3>${prod.nombre}</h3>
                <p>$${prod.precio.toLocaleString('es-AR')}</p>

                <div class="contador">
                    <button type="button" onclick="event.stopPropagation(); restar(${prod.id})">-</button>
                    <span id="cant-${prod.id}">${cantActual}</span>
                    <button type="button" onclick="event.stopPropagation(); sumar(${prod.id})">+</button>
                </div>
            `;
            listaContenedor.appendChild(div);
        });
    });
}

// =========================
// LÓGICA ACORDEÓN
// =========================
function toggleCategoria(cat) {
    const lista = document.getElementById(`lista-${cat}`);
    const flecha = document.getElementById(`flecha-${cat}`);
    if (!lista) return;

    const estaAbierto = lista.style.display === "grid";

    document.querySelectorAll('.contenido-cat').forEach(el => el.style.display = "none");
    document.querySelectorAll('.flecha').forEach(el => el.innerText = "▶");

    if (!estaAbierto) {
        lista.style.display = "grid";
        if (flecha) flecha.innerText = "▼";
        
        setTimeout(() => {
            lista.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
}

// =========================
// CARRITO
// =========================
function sumar(id) {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        carrito.push(prod);
        actualizarInterfaz(id);
    }
}

function restar(id) {
    const index = carrito.length - 1 - [...carrito].reverse().findIndex(p => p.id === id);
    if (index !== -1 && index < carrito.length) {
        carrito.splice(index, 1);
        actualizarInterfaz(id);
    }
}

function actualizarInterfaz(id) {
    const span = document.getElementById(`cant-${id}`);
    const cantTotal = document.getElementById("contador-productos");
    const cantidadProducto = carrito.filter(p => p.id === id).length;
    
    if (span) span.innerText = cantidadProducto;
    if (cantTotal) cantTotal.innerText = carrito.length;
}

// =========================
// ENTREGA Y UBICACIÓN
// =========================
function seleccionarEntrega(tipo) {
    tipoEntrega = tipo;
    const btnRetiro = document.getElementById("btn-retiro");
    const btnDelivery = document.getElementById("btn-delivery");
    const campo = document.getElementById("campo-direccion");

    if (btnRetiro) btnRetiro.classList.remove("activo");
    if (btnDelivery) btnDelivery.classList.remove("activo");

    if (tipo === "retiro") {
        if (btnRetiro) btnRetiro.classList.add("activo");
        if (campo) campo.style.display = "none";
        ubicacionLink = "";
    } else {
        if (btnDelivery) btnDelivery.classList.add("activo");
        if (campo) campo.style.display = "block";
    }
}

function usarUbicacion() {
    const btnUbi = document.querySelector(".btn-ubicacion");
    if (btnUbi) btnUbi.innerHTML = "⏳ Obteniendo...";

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        ubicacionLink = `https://www.google.com/maps?q=${lat},${lon}`;
        
        if (btnUbi) {
            btnUbi.innerHTML = "📍 Ubicación Cargada ✔";
            btnUbi.classList.add("activo");
        }
    }, () => {
        if (btnUbi) btnUbi.innerHTML = "📍 Reintentar";
        alert("No se pudo obtener la ubicación automáticamente.");
    });
}

// =========================
// WHATSAPP
// =========================
function enviarPedido() {
    if (carrito.length === 0) return alert("¡Tu carrito está vacío!");
    if (!tipoEntrega) return alert("Seleccioná si es Retiro o Delivery.");

    let mensaje = "🚀 *NUEVO PEDIDO - AV DRINKS*%0A%0A";
    const resumen = {};
    let total = 0;

    carrito.forEach(p => {
        resumen[p.nombre] = (resumen[p.nombre] || 0) + 1;
        total += p.precio;
    });

    for (let nombre in resumen) {
        mensaje += `• *${resumen[nombre]}x* ${nombre}%0A`;
    }

    mensaje += `%0A💰 *TOTAL: $${total.toLocaleString('es-AR')}*%0A`;
    mensaje += `────────────────────%0A`;

    if (tipoEntrega === "delivery") {
        const inputDir = document.getElementById("direccion");
        const direccion = inputDir ? inputDir.value.trim() : "";
        mensaje += "🛵 *MODO:* Delivery%0A";

        if (ubicacionLink) {
            mensaje += `📍 *Ubicación:* ${ubicacionLink}%0A`;
        } else if (direccion !== "") {
            mensaje += `🏠 *Dirección:* ${direccion}%0A`;
        } else {
            return alert("Ingresá tu dirección o compartí tu ubicación GPS.");
        }
    } else {
        mensaje += "🏠 *MODO:* Retiro en local%0A";
    }

    window.open(`https://wa.me/542634351883?text=${mensaje}`, "_blank");
}

// Cargar catálogo al inicio
cargarProductos();
