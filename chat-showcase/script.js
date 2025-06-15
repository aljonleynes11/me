document.addEventListener('DOMContentLoaded', function() {
    // Language toggle functionality
    const languageToggle = document.getElementById('language-toggle');
    const currentLang = document.getElementById('current-lang');
    const toggleCircle = document.getElementById('toggle-circle');
    let isEnglish = true;

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    // Handle language switching
    languageToggle.addEventListener('click', function() {
        isEnglish = !isEnglish;
        currentLang.textContent = isEnglish ? 'EN' : 'ES';
        
        // Move the toggle circle
        if (isEnglish) {
            toggleCircle.style.transform = 'translateX(0)';
        } else {
            toggleCircle.style.transform = 'translateX(100%)';
        }
        
        // Switch all text elements with data-en and data-es attributes
        const elementsWithLang = document.querySelectorAll('[data-en][data-es]');
        
        elementsWithLang.forEach(element => {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                // Handle placeholders
                element.placeholder = isEnglish 
                    ? element.getAttribute('data-en-placeholder') 
                    : element.getAttribute('data-es-placeholder');
            } else {
                // Handle regular text content
                element.textContent = isEnglish 
                    ? element.getAttribute('data-en') 
                    : element.getAttribute('data-es');
            }
        });
    });

    // Handle mobile menu toggle
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('active');
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Product card hover effect enhancement
    const productCards = document.querySelectorAll('.bg-white.rounded-lg.overflow-hidden.shadow-lg');
    
    productCards.forEach(card => {
        const button = card.querySelector('button');
        
        card.addEventListener('mouseenter', function() {
            button.classList.remove('bg-amber-800');
            button.classList.add('bg-amber-700');
        });
        
        card.addEventListener('mouseleave', function() {
            button.classList.add('bg-amber-800');
            button.classList.remove('bg-amber-700');
        });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }

    // Form validation
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            let isValid = true;
            
            // Simple validation
            if (!nameInput.value.trim()) {
                highlightError(nameInput);
                isValid = false;
            } else {
                removeHighlight(nameInput);
            }
            
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                highlightError(emailInput);
                isValid = false;
            } else {
                removeHighlight(emailInput);
            }
            
            if (!messageInput.value.trim()) {
                highlightError(messageInput);
                isValid = false;
            } else {
                removeHighlight(messageInput);
            }
            
            if (isValid) {
                // Here you would typically send the form data to a server
                alert(isEnglish ? 'Thank you for your message! We will get back to you soon.' : '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
            }
        });
    }

    // Helper functions for form validation
    function highlightError(input) {
        input.style.borderColor = '#ef4444';
    }
    
    function removeHighlight(input) {
        input.style.borderColor = '#d6d3d1';
    }
    
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
}); 