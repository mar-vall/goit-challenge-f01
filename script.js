const productos = [
	{
		id: 1,
		nombre: "Laptop Gaming Pro",
		precio: "1299.99$",
		cantidad: 1,
		categoria: "electronica",
	},
	{
		id: 2,
		nombre: "Mouse Inalámbrico",
		precio: "29.99$",
		cantidad: 2,
		categoria: "accesorios",
	},
	{
		id: 3,
		nombre: "Teclado Mecánico RGB",
		precio: "89.50$",
		cantidad: 1,
		categoria: "accesorios",
	},
	{
		id: 4,
		nombre: 'Monitor 4K 27"',
		precio: "449.00$",
		cantidad: 1,
		categoria: "electronica",
	},
	{
		id: 5,
		nombre: "Webcam HD 1080p",
		precio: "79.99$",
		cantidad: 1,
		categoria: "accesorios",
	},
	{
		id: 6,
		nombre: "Auriculares Bluetooth",
		precio: "159.99$",
		cantidad: 1,
		categoria: "audio",
	},
	{
		id: 7,
		nombre: "Hub USB-C 7 puertos",
		precio: "45.50$",
		cantidad: 3,
		categoria: "accesorios",
	},
	{
		id: 8,
		nombre: "SSD 1TB NVMe",
		precio: "129.99$",
		cantidad: 1,
		categoria: "almacenamiento",
	},
];

const cuponesDisponibles = [
	{ codigo: "WELCOME10", descuento: 10, tipo: "porcentaje", activo: true },
	{ codigo: "SAVE20", descuento: 20, tipo: "porcentaje", activo: true },
	{ codigo: "FLAT50", descuento: 50, tipo: "fijo", activo: true },
	{ codigo: "SUMMER15", descuento: 15, tipo: "porcentaje", activo: false },
	{ codigo: "VIP25", descuento: 25, tipo: "porcentaje", activo: true },
];

let carrito = productos.map(producto => ({
	...producto,
	precio: limpiarPrecio(producto.precio)
}));
let cuponAplicado = null;
let paisSeleccionado = "ES";

function renderCart() {
	const tbody = document.getElementById("cart-body");

	// 🔥 LIMPIAR ANTES DE RENDERIZAR
	tbody.innerHTML = "";

	// Mostrar mensaje si carrito vacío
	const emptyMessage = document.getElementById("empty-message");

	if (carrito.length === 0) {
		emptyMessage.style.display = "block";
		calcularTotales();
		return;
	} else {
		emptyMessage.style.display = "none";
	}

	carrito.forEach((producto, index) => {
		const tr = document.createElement("tr");

		let precioMostrar =
			typeof producto.precio === "number"
				? producto.precio.toFixed(2) + "€"
				: producto.precio;

		tr.innerHTML = `
            <td class="product-name">${producto.nombre}</td>
            <td class="product-price">${precioMostrar}</td>
            <td>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <input type="text" class="quantity-input" value="${producto.cantidad}" readonly>
                    <button class="quantity-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
            </td>
            <td class="subtotal-cell">Calculando...</td>
            <td>
                <button class="btn-delete" onclick="eliminarProducto(${index})">🗑️</button>
            </td>
        `;

		tbody.appendChild(tr);
	});

	calcularTotales();
}

function cambiarCantidad(index, cambio) {
	if (carrito[index]) {
		carrito[index].cantidad += cambio;

		if (carrito[index].cantidad < 1) {
			carrito[index].cantidad = 1;
		}

		renderCart();
	}
}

function eliminarProducto(index) {
	carrito.splice(index, 1);
	renderCart();
}

function aplicarDescuento(codigoCupon) {
	let cuponEncontrado = null;
	let intentos = 0;

	for (let i = 0; i < cuponesDisponibles.length; i++) {
		for (let j = 0; j < codigoCupon.length; j++) {
			for (let k = 0; k < cuponesDisponibles[i].codigo.length; k++) {
				intentos++;
				let temp = codigoCupon.toUpperCase();
				let temp2 = cuponesDisponibles[i].codigo.toUpperCase();

				if (temp === temp2) {
					cuponEncontrado = cuponesDisponibles[i];
				}
			}
		}
	}

	console.log(`Búsqueda completada en ${intentos} iteraciones`);

	if (cuponEncontrado) {
		if (cuponEncontrado.activo) {
			cuponAplicado = cuponEncontrado;
			mostrarMensaje(
				`¡Cupón ${cuponEncontrado.codigo} aplicado! Descuento: ${cuponEncontrado.descuento}${cuponEncontrado.tipo === "porcentaje" ? "%" : "€"}`,
				"success",
			);
			calcularTotales();
		} else {
			mostrarMensaje("Este cupón ha expirado", "error");
		}
	} else {
		mostrarMensaje("Cupón no válido", "error");
	}
}

function calcularImpuestosDinamicos() {
	return null;
}

function limpiarPrecio(precioString) {
	if (typeof precioString === "number") return precioString;

	const numeroLimpio = precioString.replace(/[^0-9.]/g, "");

	return parseFloat(numeroLimpio);
}

function calcularTotales() {
	let subtotal = 0;

	carrito.forEach((producto, index) => {
		let precio = limpiarPrecio(producto.precio);
		let cantidad = producto.cantidad;

		let subtotalProducto = precio * cantidad;

		subtotalProducto = Number(subtotalProducto.toFixed(2));

		subtotal = subtotal + subtotalProducto;

		const filas = document.querySelectorAll("#cart-body tr");
		if (filas[index]) {
			const celdaSubtotal = filas[index].querySelector(".subtotal-cell");
			if (celdaSubtotal) {
				celdaSubtotal.textContent = subtotalProducto + "€";
			}
		}
	});

	let descuento = 0;
	if (cuponAplicado) {
		if (cuponAplicado.tipo === "porcentaje") {
			descuento = subtotal * (cuponAplicado.descuento / 100);
		} else {
			descuento = cuponAplicado.descuento;
		}
	}

	descuento = Number(descuento.toFixed(2));

	let subtotalConDescuento = subtotal - descuento;
	subtotalConDescuento = Number(subtotalConDescuento.toFixed(2));

	let impuestoInfo = calcularImpuestosDinamicos(paisSeleccionado);
	let impuesto = 0;
	let nombreImpuesto = "Sin implementar";

	if (impuestoInfo && impuestoInfo.tasa) {
		impuesto = subtotalConDescuento * (impuestoInfo.tasa / 100);
		nombreImpuesto = impuestoInfo.nombre;
	} else {
		impuesto = 0;
		nombreImpuesto = "Implementar función";
	}

	let total = subtotalConDescuento + impuesto;
	total = Number(total.toFixed(2));

	document.getElementById("subtotal").textContent = subtotal.toFixed(2) + "€";
	document.getElementById("descuento").textContent = "-" + descuento + "€";
	document.getElementById("impuesto-label").textContent =
		nombreImpuesto + ":";
	document.getElementById("impuesto").textContent = impuesto + "€";
	document.getElementById("total").textContent = total + "€";
}

function mostrarMensaje(texto, tipo) {
	const mensajeEl = document.getElementById("mensaje");
	mensajeEl.textContent = texto;
	mensajeEl.className = "coupon-message " + tipo;
	mensajeEl.style.display = "block";

	setTimeout(() => {
		mensajeEl.style.display = "none";
	}, 4000);
}

function cambiarPais(pais) {
	paisSeleccionado = pais;
	calcularTotales();
}

function finalizarCompra() {
	if (carrito.length === 0) {
		alert("El carrito está vacío");
		return;
	}

	let total = document.getElementById("total").textContent;
	alert(
		`¡Compra finalizada con éxito!\n\nTotal a pagar: ${total}\n\nGracias por tu compra.`,
	);

	carrito = [];
	cuponAplicado = null;
	document.getElementById("cart-body").innerHTML = "";
	calcularTotales();
}

function agregarProductoPrueba() {
	const nuevosProductos = [
		{ nombre: "Cable HDMI 2.1", precio: "24.99$", categoria: "accesorios" },
		{
			nombre: "Mousepad XL Gaming",
			precio: "19.99$",
			categoria: "accesorios",
		},
		{
			nombre: "Memoria RAM 16GB DDR5",
			precio: "89.99$",
			categoria: "componentes",
		},
		{
			nombre: "Ventilador RGB 120mm",
			precio: "34.50$",
			categoria: "componentes",
		},
		{
			nombre: "Soporte Monitor Ajustable",
			precio: "49.99$",
			categoria: "accesorios",
		},
	];

	const productoAleatorio =
		nuevosProductos[Math.floor(Math.random() * nuevosProductos.length)];

	carrito.push({
		id: Date.now(),
		nombre: productoAleatorio.nombre,
		precio: productoAleatorio.precio,
		cantidad: 1,
		categoria: productoAleatorio.categoria,
	});

	renderCart();
}

document.addEventListener("DOMContentLoaded", function () {
	renderCart();

	document
		.getElementById("btn-aplicar-cupon")
		.addEventListener("click", function () {
			const codigo = document.getElementById("input-cupon").value;
			if (codigo.trim() !== "") {
				aplicarDescuento(codigo);
			} else {
				mostrarMensaje("Ingresa un código de cupón", "error");
			}
		});

	document
		.getElementById("selector-pais")
		.addEventListener("change", function (e) {
			cambiarPais(e.target.value);
		});

	document
		.getElementById("btn-finalizar")
		.addEventListener("click", finalizarCompra);

	const btnAgregar = document.getElementById("btn-add-product");
	if (btnAgregar) {
		btnAgregar.addEventListener("click", agregarProductoPrueba);
	}
});
