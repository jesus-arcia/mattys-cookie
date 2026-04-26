/* ============================================================
   MATTY'S COOKIE — Script v2.0
   Flujo: Formulario → Modal de Preconfirmación → n8n + WhatsApp
   ============================================================ */

// Número de WhatsApp de Matty's Cookie (sin + ni espacios)
const WA_NUMBER = '5491126949587';

// ── Generador de ID de Orden ──────────────────────────────────
function generateOrderId() {
    const now = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    return `MC-${dd}${mm}-${rand}`;
}

// ── Variables de estado del pedido actual ─────────────────────
let _pedidoData    = null;
let _mensajeDuena  = null;
let _orderId       = null;

// ── Esperar DOM ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    /* --- Navbar scroll effect --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    /* --- Lógica de Contadores (Carrito) --- */
    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            let val = parseInt(input.value) || 0;
            if (val > 0) input.value = val - 1;
        });
    });

    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            let val = parseInt(input.value) || 0;
            input.value = val + 1;
        });
    });

    /* ─────────────────────────────────────────────────────────
       FORMULARIO → abre Modal de Preconfirmación
    ───────────────────────────────────────────────────────── */
    const form = document.getElementById('whatsapp-order-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = [...document.querySelectorAll('.qty-input')];
        let totalGalletas = 0;
        let totalPrecio   = 0;
        let lineasPedido  = [];
        let lineasHTML    = '';
        
        // Objeto para el dashboard de Google Sheets
        let desgloseSabores = {
            "Red_Velvet": 0,
            "Cookie_Cream": 0,
            "Choco_Avellana": 0,
            "Chips_Clasica": 0,
            "Chips_Chocolate": 0,
            "Coquito": 0,
            "Pistacho": 0,
            "Peanuts_Nuts": 0
        };

        inputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            if (qty > 0) {
                totalGalletas += qty;
                const flavor    = input.dataset.flavor;
                const price     = parseInt(input.dataset.price) || 0;
                const subtotal  = qty * price;
                totalPrecio    += subtotal;

                // Mapear el sabor al formato del desglose
                let flavorKey = flavor.replace(/[^a-zA-Z0-9]/g, '_');
                if (flavor === "Chips rellena de Chocolate") flavorKey = "Chips_Chocolate";
                if (flavor === "Chips Clásica") flavorKey = "Chips_Clasica";
                if (flavor === "Red-Velvet") flavorKey = "Red_Velvet";
                if (flavor === "Cookie Cream") flavorKey = "Cookie_Cream";
                if (flavor === "Choco Avellana") flavorKey = "Choco_Avellana";
                if (flavor === "Peanuts-Nuts") flavorKey = "Peanuts_Nuts";

                desgloseSabores[flavorKey] = qty;

                const printPrice    = new Intl.NumberFormat('es-AR').format(price);
                const printSubtotal = new Intl.NumberFormat('es-AR').format(subtotal);

                lineasPedido.push(`• ${qty}x ${flavor} ($${printPrice} c/u = $${printSubtotal})`);
                lineasHTML += `
                    <div class="modal-order-row">
                        <span class="modal-order-flavor">${qty}× <strong>${flavor}</strong></span>
                        <span class="modal-order-price">$${printSubtotal}</span>
                    </div>`;
            }
        });

        if (totalGalletas === 0) {
            alert('🍪 Por favor seleccioná al menos una galleta para armar tu pedido.');
            return;
        }

        const printTotal   = new Intl.NumberFormat('es-AR').format(totalPrecio);
        const customerName = document.getElementById('customer-name').value.trim();
        let   customerPhone = document.getElementById('customer-phone').value.trim();
        const customerEmail = document.getElementById('customer-email').value.trim();

        // Normalizar teléfono
        customerPhone = customerPhone.replace(/[^\d+]/g, '');
        if (!customerPhone.startsWith('+')) customerPhone = '+' + customerPhone;

        // Generar ID de Orden
        _orderId = generateOrderId();

        // Armar mensajes
        _mensajeDuena =
            `🆔 *Orden:* ${_orderId}\n` +
            `¡Hola! Quiero hacer un encargo de Matty's Cookie 🙌\n\n` +
            `*👤 Cliente:* ${customerName}\n` +
            `*📱 WhatsApp:* ${customerPhone}\n` +
            `*📧 Email:* ${customerEmail}\n\n` +
            `*📝 Mi Pedido (${totalGalletas} galletas en total):*\n` +
            lineasPedido.join('\n') +
            `\n\n*💰 Total a pagar:* $${printTotal} ARS`;

        const mensajeCliente = `¡Hola ${customerName}! 🍪 Tu orden *${_orderId}* de Matty's Cookie fue recibida. En breve nos comunicaremos para coordinar la entrega. ¡Gracias por elegirnos!`;

        const now = new Date();
        const fechaStr = now.toLocaleDateString();
        const horaStr = now.toLocaleTimeString();

        _pedidoData = {
            order_id:        _orderId,
            nombre:          customerName,
            telefono_cliente: customerPhone,
            email:           customerEmail,
            mensaje_duena:   _mensajeDuena,
            mensaje_cliente: mensajeCliente,
            total:           `$${printTotal} ARS`,
            galletas_total:  totalGalletas,
            desglose_texto:  lineasPedido.join(', '),
            sabores:         desgloseSabores,
            fecha:           fechaStr,
            hora:            horaStr
        };

        // ── Poblar el Modal ─────────────────────────────────
        document.getElementById('modal-order-id').textContent    = _orderId;
        document.getElementById('modal-client-name').textContent = customerName;
        document.getElementById('modal-items-list').innerHTML    = lineasHTML;
        document.getElementById('modal-total-count').textContent = `${totalGalletas} galleta${totalGalletas > 1 ? 's' : ''}`;
        document.getElementById('modal-total-price').textContent = `$${printTotal} ARS`;

        // ── Mostrar Modal ───────────────────────────────────
        document.getElementById('order-confirm-modal').classList.add('active');
    });

    /* ─────────────────────────────────────────────────────────
       BOTÓN CONFIRMAR dentro del Modal
    ───────────────────────────────────────────────────────── */
    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
        if (!_pedidoData) return;

        const confirmBtn = document.getElementById('modal-confirm-btn');
        confirmBtn.textContent = 'Enviando... ⏳';
        confirmBtn.disabled    = true;

        fetch('https://dosalumno21.app.n8n.cloud/webhook/mattys-cookie', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(_pedidoData)
        })
        .then(response => {
            if (response.ok) {
                // Cerrar modal de preconfirmación
                closeModal('order-confirm-modal');

                // Llenar datos en el modal de pago
                document.getElementById('payment-total-price').textContent = _pedidoData.total;
                document.getElementById('payment-order-id').textContent = _orderId;

                // Abrir modal de pago
                document.getElementById('order-payment-modal').classList.add('active');
            } else {
                throw new Error('Error en el envío');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Hubo un inconveniente al enviar tu pedido. Por favor intentá de nuevo.');
        })
        .finally(() => {
            confirmBtn.textContent = 'Confirmar y Enviar Pedido';
            confirmBtn.disabled    = false;
        });
    });

    /* ─────────────────────────────────────────────────────────
       BOTONES DEL MODAL DE PAGO
    ───────────────────────────────────────────────────────── */
    document.getElementById('modal-whatsapp-btn').addEventListener('click', () => {
        closeModal('order-payment-modal');

        // Abrir modal de éxito
        document.getElementById('modal-success-id').textContent = _orderId;
        document.getElementById('order-success-modal').classList.add('active');

        // Abrir WhatsApp
        const encodedMessage = encodeURIComponent(_mensajeDuena);
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodedMessage}`, '_blank');

        form.reset();
    });

    document.getElementById('modal-payment-close').addEventListener('click', () => {
        closeModal('order-payment-modal');
        
        // Abrir modal de éxito igualmente
        document.getElementById('modal-success-id').textContent = _orderId;
        document.getElementById('order-success-modal').classList.add('active');
        
        form.reset();
    });

    /* --- Botón cancelar Modal Pre-confirmación --- */
    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        closeModal('order-confirm-modal');
    });

    /* --- Cerrar modal de éxito --- */
    document.getElementById('modal-success-close').addEventListener('click', () => {
        closeModal('order-success-modal');
    });

    /* --- Cerrar al hacer click en el overlay --- */
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
});

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
