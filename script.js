const productos = [
    { id: 1, nombre: "Fernet Branca 750ml", precio: 8500, img: "img/fernet.png" },
    { id: 2, nombre: "Cerveza Lata 473ml", precio: 1800, img: "img/cerveza.png" },
    { id: 3, nombre: "Gaseosa Cola 2.25L", precio: 2500, img: "img/cola.png" }
];

let carrito = [];

// Elementos del DOM
const contenedor = document.getElementById('contenedor-productos');
const contadorVisual = document.getElementById('contador-productos');

function cargarProductos() {
    contenedor.innerHTML = ""; // Limpiar antes de cargar
    productos.forEach(prod => {
        const div = document.createElement('div');
        div.classList.add('tarjeta-producto');
        div.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/150?text=Drink'">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>
            <button onclick="agregarAlCarrito(${prod.id})">Agregar al pedido</button>
        `;
        contenedor.appendChild(div);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    carrito.push(producto);
    
    // Actualizar el contador visual
    contadorVisual.innerText = carrito.length;
    
    // Efecto visual opcional: que el botón brille al agregar
    const btn = document.getElementById('btn-whatsapp');
    btn.style.transform = "translateX(-50%) scale(1.05)";
    setTimeout(() => btn.style.transform = "translateX(-50%) scale(1)", 200);
}

function enviarPedido() {
    if (carrito.length === 0) {
        alert("El pedido está vacío. ¡Agregá algo para tomar!");
        return;
    }

    let mensaje = "Hola AV Drinks, quiero hacer un pedido:%0A%0A";
    let total = 0;

    // Agrupamos productos repetidos para que el mensaje sea corto
    const resumen = {};
    carrito.forEach(item => {
        resumen[item.nombre] = (resumen[item.nombre] || 0) + 1;
        total += item.precio;
    });

    for (const nombre in resumen) {
        mensaje += `*${resumen[nombre]}x* ${nombre}%0A`;
    }

    mensaje += `%0A*Total: $${total}*%0A%0A¿Me confirman el pedido?`;
    
    // Tu número configurado correctamente
    const telefono = "5492634351883"; 
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

// Iniciar
cargarProductos();
