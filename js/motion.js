/**
 * motion.js — animaciones que necesitan JavaScript (el resto vive en style.css)
 */

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Última animación lanzada en cada tarjeta: solo esa puede cerrar el <details> al terminar */
const current = new WeakMap();

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Abre o cierra una tarjeta de héroe animando la altura de su contenido.
 * Se puede interrumpir: si ya hay una animación en curso, continúa desde la altura actual.
 */
export function setCardOpen(card, open) {
    const content = card.querySelector('.hero-content');
    const isOpen = card.open && !card.classList.contains('closing');
    if (!content || isOpen === open) return;

    if (reducedMotion()) {
        card.classList.remove('closing');
        card.open = open;
        return;
    }

    // Punto de partida: donde esté ahora mismo (a mitad de otra animación o en reposo)
    const running = content.getAnimations().length > 0;
    const fromHeight = card.open ? content.getBoundingClientRect().height : 0;
    const fromOpacity = running ? getComputedStyle(content).opacity : (card.open ? 1 : 0);
    content.getAnimations().forEach(a => a.cancel());

    card.open = true;
    card.classList.toggle('closing', !open);
    const toHeight = open ? content.scrollHeight : 0;

    const anim = content.animate(
        { height: [`${fromHeight}px`, `${toHeight}px`], opacity: [fromOpacity, open ? 1 : 0] },
        { duration: 200, easing: EASE_OUT }
    );
    current.set(card, anim);
    anim.onfinish = () => {
        if (!open && current.get(card) === anim) {
            card.open = false;
            card.classList.remove('closing');
        }
    };
}

export function toggleCard(card) {
    setCardOpen(card, !card.open || card.classList.contains('closing'));
}

/**
 * Entrada escalonada del contenido al abrir un parche o cambiar de sección.
 * La clase se retira al terminar para que filtrar o buscar no vuelva a animar las tarjetas.
 */
let enterTimer = null;
export function playContentEnter(content, toc) {
    if (reducedMotion()) return;
    const items = content.querySelectorAll('.patch-header-card, .section-bar, .role-section-title, .hero-card, .bugfix-card, .empty-section');
    items.forEach((el, i) => el.style.setProperty('--enter-delay', `${Math.min(i, 8) * 40}ms`));

    content.classList.add('entering');
    toc?.classList.add('entering');
    clearTimeout(enterTimer);
    enterTimer = setTimeout(() => {
        content.classList.remove('entering');
        toc?.classList.remove('entering');
    }, 800);
}
