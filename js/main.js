document.addEventListener('DOMContentLoaded', () => {
    console.log('The Isle Database initialized');
    // Add any interactive behavior for the new layout here.
    
    // Example: Highlight active TOC section on scroll
    const sections = document.querySelectorAll('h2.sec');
    const navLinks = document.querySelectorAll('.toc a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});
