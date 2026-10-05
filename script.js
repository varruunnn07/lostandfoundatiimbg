/**
 * Lost & Found Portal - Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initUIEffects();
    // Future initialization functions (e.g., initNavigation(), initSearch(), initAuth()) can be added here cleanly.
});

/**
 * Initializes visual and interactive UI effects (parallax and hover transitions).
 */
function initUIEffects() {
    // Parallax effect on background shapes
    const shapes = document.querySelectorAll('.shape');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.clientX) * speed / 1000;
            const yOffset = (window.innerHeight / 2 - e.clientY) * speed / 1000;
            
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px) ${index === 3 ? 'rotate(45deg)' : ''}`;
        });
    });

    // Smooth hover for glass cards
    const cards = document.querySelectorAll('.interactive-hover');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'var(--transition)';
        });
    });
}
