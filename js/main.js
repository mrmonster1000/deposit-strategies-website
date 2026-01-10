// Main JavaScript for Deposit Strategies Website

document.addEventListener('DOMContentLoaded', function() {

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const navLinks = document.querySelectorAll('.nav-mobile .nav-link');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMobile.classList.toggle('active');
        });

        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });
    }

    // Theme Toggle (Dark Mode)
    const themeToggle = document.querySelector('.theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Subscribe Form Handling
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // Simple email validation
            const email = emailInput.value.trim();
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Update button state
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';

            // Simulate API call (replace with actual API endpoint)
            try {
                await simulateAPICall(email);

                // Success
                showNotification('Thanks for subscribing! You\'ll receive our next update.', 'success');
                emailInput.value = '';

                // Track conversion if analytics available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'subscribe', {
                        'event_category': 'engagement',
                        'event_label': 'newsletter'
                    });
                }

            } catch (error) {
                showNotification('Something went wrong. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Intersection Observer for Fade-in Animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.article-preview, .featured-card, .article-card, .cta-card');
    animateElements.forEach(el => {
        animationObserver.observe(el);
    });

    // Helper Functions
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function simulateAPICall(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (in production, make actual API call)
                console.log('Email submitted:', email);
                resolve();
            }, 1500);
        });
    }

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMobile && navMobile.classList.contains('active')) {
            if (!e.target.closest('.nav-mobile') && !e.target.closest('.mobile-menu-toggle')) {
                mobileMenuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            }
        }
    });

    // Handle escape key for mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMobile && navMobile.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navMobile.classList.remove('active');
        }
    });
});

// Initialize on page load
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
