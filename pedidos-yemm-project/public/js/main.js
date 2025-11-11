// This file contains the JavaScript code that handles client-side functionality, such as making API calls to the server and updating the DOM.

document.addEventListener('DOMContentLoaded', function () {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoLista = document.getElementById('carritoLista');
    const carritoTotal = document.getElementById('carritoTotal');

    function actualizarCarrito() {
        carritoLista.innerHTML = '';
        let suma = 0;

        carrito.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${item.nombre} - $${item.precio}
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            `;
            carritoLista.appendChild(li);
            suma += Number(item.precio) || 0;
        });

        carritoTotal.textContent = `$${suma.toLocaleString()}`;
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        actualizarCarrito();
    }

    document.querySelectorAll('.agregar-carrito').forEach(btn => {
        btn.addEventListener('click', function () {
            const nombre = this.dataset.nombre;
            const precio = parseInt(this.dataset.precio) || 0;
            carrito.push({ nombre, precio });
            actualizarCarrito();
        });
    });

    actualizarCarrito();
});