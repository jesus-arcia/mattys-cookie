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

    /* --- Formulario Box de 3 → WhatsApp --- */
    const form = document.getElementById('whatsapp-order-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Recopilar selecciones
        const cookies = [...document.querySelectorAll('.cookie-select')];

        // Validar que todo esté seleccionado
        const allSelected = cookies.every(s => s.value);
        if (!allSelected) {
            alert('🍪 Por favor seleccioná tus 3 galletas antes de continuar.');
            return;
        }

        // Armar el pedido
        const galletas = cookies.map((cookie, i) =>
            `🍪 Galleta ${i + 1}: ${cookie.value}`
        );

        const mensaje =
            `¡Hola! Quiero hacer un encargo de Matty's Cookie 🙌\n\n` +
            `*🎁 Mi Box de 3 Galletas:*\n` +
            galletas.join('\n') +
            `\n\n¿Cuál es el precio y cómo coordinamos? ¡Gracias!`;

        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    });

});
