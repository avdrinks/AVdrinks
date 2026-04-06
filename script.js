let carrito = [];

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    alert(`${nombre} agregado al pedido`);
}

function enviarPedido() {
    if (carrito.length === 0) return alert("El carrito está vacío");

    let mensaje = "Hola AV Drinks, quiero pedir:%0A";
    let total = 0;

    carrito.forEach(item => {
        mensaje += `- ${item.nombre} ($${item.precio})%0A`;
        total += item.precio;
    });

    mensaje += `%0ATotal: $${total}`;
    
    // Cambia el número por el de tu negocio
    const telefono = "+5492634351883"; 
    window.open(`https://wa.me/5492634351883";?text=${mensaje}`, '_blank');
}
