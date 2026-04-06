const URL_API = "https://script.google.com/macros/s/AKfycbwrlaCzciec-YG2mu9TbdPTl-oSmlLRlH4yXSrWa7cchOfnHLaGwHuzRjhHDhRyvSJ4/exec";

let productos = [];
let carrito = [];

const contenedor = document.getElementById("contenedor-productos");
const contador = document.getElementById("contador-productos");

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

function enviarPedido() {
    if (carrito.length === 0) {
        alert("Pedido vacío");
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

    mensaje += `%0ATotal: $${total}`;

    const telefono = "5492634351883";
    window.open(`https://wa.me/${telefono}?text=${mensaje}`);
}

cargarProductos();
