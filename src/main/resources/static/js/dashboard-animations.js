// Counter animations
document.querySelectorAll('.counter').forEach(el => {
    let target = parseInt(el.getAttribute('data-target'));
    gsap.to(el, { innerText: target, duration: 2, snap: { innerText: 1 }, ease: 'power2.out' });
});

// Staggered entrance
gsap.from('#welcome-banner', { y: 30, opacity: 0, duration: 0.6, delay: 0.2 });
gsap.from('#stat-cards > div', { scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.4 });
gsap.from('table tbody tr', { x: -20, opacity: 0, stagger: 0.05, delay: 0.8, ease: 'power2.out' });

// ScrollTrigger for sections
gsap.from('.glass', { scrollTrigger: { trigger: '.glass', start: 'top 90%' }, y: 30, opacity: 0, duration: 0.5 });
