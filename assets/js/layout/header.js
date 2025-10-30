// Mobile header toggle logic
(function () {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay');
    const body = document.body;

    if (!hamburger || !mobileMenu || !overlay) return;

    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('active');
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
        hamburger.setAttribute('aria-expanded', String(!isOpen));
    }

    function closeMenu() {
        if (mobileMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            body.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-menu .nav-list a').forEach((link) => {
        link.addEventListener('click', toggleMenu);
    });

    // Close mobile menu when switching to desktop view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
})();

// Desktop and Mobile header scroll behavior
(function () {
    const desktopHeader = document.querySelector('.app-header');
    const mobileHeader = document.querySelector('.mobile-header');
    const body = document.body;

    if (!desktopHeader && !mobileHeader) return;

    let lastScrollTop = 0;
    let scrollTimeout;

    function getCurrentHeader() {
        // Return the appropriate header based on screen size and visibility
        if (window.innerWidth <= 768 && mobileHeader && mobileHeader.style.display !== 'none') {
            return mobileHeader;
        }
        return desktopHeader;
    }

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentHeader = getCurrentHeader();

        if (!currentHeader) return;

        // Clear the timeout if it exists
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        // Determine scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down & past threshold - hide header
            if (currentHeader === desktopHeader) {
                currentHeader.style.transform = 'translateX(-50%) translateY(-115%)';
            } else {
                currentHeader.style.transform = 'translateY(-115%)';
            }
        } else {
            // Scrolling up - show header
            if (currentHeader === desktopHeader) {
                currentHeader.style.transform = 'translateX(-50%) translateY(0)';
            } else {
                currentHeader.style.transform = 'translateY(0)';
            }
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

        // Set a timeout to hide header after scrolling stops (optional)
        scrollTimeout = setTimeout(() => {
            // Keep header visible when scroll stops
        }, 150);
    }

    // Throttle scroll events for better performance
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
            setTimeout(() => { ticking = false; }, 10);
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });

    // Handle window resize to switch between mobile and desktop headers
    window.addEventListener('resize', () => {
        const currentHeader = getCurrentHeader();
        if (currentHeader) {
            // Show header when switching between mobile/desktop views
            if (currentHeader === desktopHeader) {
                currentHeader.style.transform = 'translateX(-50%) translateY(0)';
            } else {
                currentHeader.style.transform = 'translateY(0)';
            }
        }
    });

    // Show header on page load
    window.addEventListener('load', () => {
        const currentHeader = getCurrentHeader();
        if (currentHeader) {
            if (currentHeader === desktopHeader) {
                currentHeader.style.transform = 'translateX(-50%) translateY(0)';
            } else {
                currentHeader.style.transform = 'translateY(0)';
            }
        }
    });
})();
