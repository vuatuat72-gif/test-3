(() => {
    const container = document.createElement('div');
    const hearts = ['💖', '💗', '💕', '💓', '💘', '💝'];
    container.className = 'floating-hearts';
    container.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 16; index++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[index % hearts.length];
        heart.style.setProperty('--left', `${2 + index * 6.35}%`);
        heart.style.setProperty('--heart-size', `${1.1 + (index % 4) * 0.2}rem`);
        heart.style.setProperty('--float-duration', `${9 + (index % 5)}s`);
        heart.style.setProperty('--delay', `${-((index * 1.7) % 12)}s`);
        const drift = (18 + (index % 4) * 7) * (index % 2 === 0 ? 1 : -1);
        heart.style.setProperty('--drift', `${drift}px`);
        container.appendChild(heart);
    }

    document.body.prepend(container);
})();
