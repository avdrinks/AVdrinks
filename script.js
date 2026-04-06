// ==========================
// PRODUCTOS
// ==========================
const productos = [
    { id: 1, nombre: "Fernet Branca 750ml", precio: 8500, img: "img/fernet.png" },
    { id: 2, nombre: "Cerveza Lata 473ml", precio: 1800, img: "img/cerveza.png" },
    { id: 3, nombre: "Gaseosa Cola 2.25L", precio: 2500, img: "img/cola.png" }
];

// ==========================
// CARRITO
// ==========================
let carrito = {};

// ==========================
// TIPO DE ENTREGA
// ==========================
let tipoEntrega = "retiro";

// ==========================
// ELEMENTOS DEL DOM
// ==========================
const contenedor = document.getElementById('contenedor-productos');
const contadorVisual = document.getElementById('contador-productos');

// ==========================
// CARGAR PRODUCTOS
// ==========================
function cargarProductos() {
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement('div');
        div.classList.add('tarjeta-producto');

        div.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/150?text=Drink'">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>

            <div class="contador">
                <button onclick="cambiarCantidad(${prod.id}, -1)">-</button>
                <span id="cantidad-${prod.id}">0</span>
                <button onclick="cambiarCantidad(${prod.id}, 1)">+</button>
            </div>
        `;

        contenedor.appendChild(div);
    });
}

// ==========================
// CAMBIAR CANTIDAD (+ / -)
// ==========================
function cambiarCantidad(id, cambio) {
    const producto = productos.find(p => p.id === id);

    if (!carrito[id]) {
        carrito[id] = { ...producto, cantidad: 0 };
    }

    carrito[id].cantidad += cambio;

    if (carrito[id].cantidad <= 0) {
        delete carrito[id];
    }

    actualizarVista();
}

// ==========================
// ACTUALIZAR UI
// ==========================
function actualizarVista() {
    let totalItems = 0;

    productos.forEach(prod => {
        const cantidad = carrito[prod.id]?.cantidad || 0;

        const span = document.getElementById(`cantidad-${prod.id}`);
        if (span) span.innerText = cantidad;

        totalItems += cantidad;
    });

    contadorVisual.innerText = totalItems;
}

// ==========================
// SELECCIONAR ENTREGA
// ==========================
function seleccionarEntrega(tipo) {
    tipoEntrega = tipo;

    const btnRetiro = document.getElementById("btn-retiro");
    const btnDelivery = document.getElementById("btn-delivery");
    const campoDireccion = document.getElementById("campo-direccion");

    btnRetiro.classList.remove("activo");
    btnDelivery.classList.remove("activo");

    if (tipo === "retiro") {
        btnRetiro.classList.add("activo");
        campoDireccion.style.display = "none";
    } else {
        btnDelivery.classList.add("activo");
        campoDireccion.style.display = "block";
    }
}

// ==========================
// ENVIAR PEDIDO A WHATSAPP
// ==========================
function enviarPedido() {
    const items = Object.values(carrito);

    if (items.length === 0) {
        alert("El pedido está vacío. ¡Agregá algo para tomar!");
        return;
    }

    let mensaje = "🍻 *AV Drinks* 🍻\n\n";
    mensaje += "Quiero hacer un pedido:\n\n";

    let total = 0;

    items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `*${item.cantidad}x* ${item.nombre} - $${subtotal}\n`;
        total += subtotal;
    });

    mensaje += `\n*Total productos: $${total}*\n\n`;

    // ==========================
    // ENTREGA
    // ==========================
    if (tipoEntrega === "retiro") {
        mensaje += "📍 Retiro en el local\n";
    } else {
        const direccion = document.getElementById("direccion").value;

        if (!direccion) {
            alert("Por favor escribí tu dirección para el delivery");
            return;
        }

        mensaje += "🚚 Delivery\n";
        mensaje += `📍 Dirección: ${direccion}\n`;
        mensaje += "💰 (Consultar costo de envío)\n";
    }

    mensaje += "\n¿Me confirmás el pedido?";

    const telefono = "5492634351883";

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ==========================
// INICIAR APP
// ==========================
cargarProductos();
