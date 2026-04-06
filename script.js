const productos = [
    { id: 1, nombre: "FERNET + COCA + HIELO", precio: 19500, img: "img/fernet.png" },
    { id: 2, nombre: "Cerveza Lata 473ml", precio: 1800, img: "img/cerveza.png" },
    { id: 3, nombre: "Gaseosa 2.25L", precio: 2500, img: "img/cola.png" }
];

let carrito = {};
let tipoEntrega = "retiro";
let ubicacionCliente = null;

const contenedor = document.getElementById('contenedor-productos');
const contadorVisual = document.getElementById('contador-productos');

function cargarProductos() {
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement('div');
        div.classList.add('tarjeta-producto');

        div.innerHTML = `
            <img src="${prod.img}" onerror="this.src='https://via.placeholder.com/150'">
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

function actualizarVista() {
    let total = 0;

    productos.forEach(prod => {
        const cantidad = carrito[prod.id]?.cantidad || 0;
        document.getElementById(`cantidad-${prod.id}`).innerText = cantidad;
        total += cantidad;
    });

    contadorVisual.innerText = total;
}

function seleccionarEntrega(tipo) {
    tipoEntrega = tipo;

    document.getElementById("btn-retiro").classList.remove("activo");
    document.getElementById("btn-delivery").classList.remove("activo");

    if (tipo === "retiro") {
        document.getElementById("btn-retiro").classList.add("activo");
        document.getElementById("campo-direccion").style.display = "none";
    } else {
        document.getElementById("btn-delivery").classList.add("activo");
        document.getElementById("campo-direccion").style.display = "block";
    }
}

function usarUbicacion() {
    if (!navigator.geolocation) {
        alert("Tu dispositivo no permite ubicación");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            ubicacionCliente = `https://www.google.com/maps?q=${lat},${lon}`;

            alert("Ubicación capturada 📍");
        },
        () => {
            alert("No se pudo obtener la ubicación");
        }
    );
}

function enviarPedido() {
    const items = Object.values(carrito);

    if (items.length === 0) {
        alert("Agregá productos primero");
        return;
    }

    let mensaje = "🍻 AV Drinks 🍻\n\n";
    let total = 0;

    items.forEach(item => {
        let sub = item.precio * item.cantidad;
        mensaje += `${item.cantidad}x ${item.nombre} - $${sub}\n`;
        total += sub;
    });

    mensaje += `\nTotal: $${total}\n\n`;

    if (tipoEntrega === "retiro") {
        mensaje += "🏠 Retiro en el local\n";
    } else {
        const dir = document.getElementById("direccion").value;

        mensaje += "🚚 Delivery\n";

        if (ubicacionCliente) {
            mensaje += `📍 Ubicación: ${ubicacionCliente}\n`;
        } else if (dir) {
            mensaje += `📍 Dirección: ${dir}\n`;
        } else {
            alert("Poné dirección o usá ubicación");
            return;
        }

        mensaje += "💰 Envío a confirmar\n";
    }

    const telefono = "5492634351883";

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`);
}

cargarProductos();
