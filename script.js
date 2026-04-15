/* ============================================================
   MATTY'S COOKIE — Script
   Formulario de pedido → WhatsApp
   ============================================================ */

// Número de WhatsApp de Matty's Cookie (sin + ni espacios)
const WA_NUMBER = '5491173587842';

document.addEventListener('DOMContentLoaded', () => {

    /* --- Navbar scroll effect --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    /* --- Lógica de Contadores (Carrito) --- */
    const minusBtns = document.querySelectorAll('.btn-minus');
    const plusBtns = document.querySelectorAll('.btn-plus');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            let val = parseInt(input.value) || 0;
            if (val > 0) input.value = val - 1;
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            let val = parseInt(input.value) || 0;
            input.value = val + 1;
        });
    });

    /* --- Formulario Pedido → WhatsApp --- */
    const form = document.getElementById('whatsapp-order-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = [...document.querySelectorAll('.qty-input')];
        let totalGalletas = 0;
        let lineasPedido = [];

        inputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            if (qty > 0) {
                totalGalletas += qty;
                const flavor = input.dataset.flavor;
                lineasPedido.push(`• ${qty}x ${flavor}`);
            }
        });

        if (totalGalletas === 0) {
            alert('🍪 Por favor seleccioná al menos una galleta para armar tu pedido.');
            return;
        }

        const mensaje =
            `¡Hola! Quiero hacer un encargo de Matty's Cookie 🙌\n\n` +
            `*📝 Mi Pedido (${totalGalletas} galletas en total):*\n` +
            lineasPedido.join('\n') +
            `\n\n¿Cuál es el precio y cómo coordinamos? ¡Gracias!`;

        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    });

});
