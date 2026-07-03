document.addEventListener('DOMContentLoaded', () => {

    // --- Typing Effect ---
    const typingElement = document.getElementById('typing-text');
    const words = [
        "Building secure RESTful APIs",
        "Crafting scalable Laravel applications",
        "Integrating AI into web apps",
        "Transforming ideas into reality"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function type() {
        if (!typingElement) return;

        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
            typingDelay = 50;
        } else {
            charIndex++;
            typingDelay = 100;
        }

        typingElement.textContent = currentWord.substring(0, charIndex);

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingDelay = 2000; // Pause at the end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingDelay = 500; // Pause before next word
        }

        setTimeout(type, typingDelay);
    }

    // Start typing effect
    if(typingElement) {
        setTimeout(type, 1000);
    }


    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- Smooth Scrolling for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // If mobile menu is open, close it
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if(navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // --- Active Link Switching on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollTopBtn = document.getElementById('scroll-top');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Subtract navbar height/offset to trigger earlier
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Scroll to top button visibility
        if (scrollTopBtn) {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });

    // Scroll to top click
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Dark/Light Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    // Check for saved preference
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if(themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            
            // Toggle icon
            if (themeIcon) {
                if (body.classList.contains('light-mode')) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                    localStorage.setItem('portfolioTheme', 'light');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                    localStorage.setItem('portfolioTheme', 'dark');
                }
            }
        });
    }

    // --- Theme Color Switcher ---
    const colorDots = document.querySelectorAll('.color-dot');
    const htmlElement = document.documentElement;
    
    // Check for saved color preference
    const savedColor = localStorage.getItem('portfolioColor') || 'amethyst';
    htmlElement.setAttribute('data-theme-color', savedColor);
    colorDots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-color') === savedColor);
    });

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            
            // Add transitioning class for smooth color morph
            htmlElement.classList.add('color-transitioning');
            
            // Set attribute on html element (root)
            htmlElement.setAttribute('data-theme-color', color);
            
            // Update active state in UI
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            
            // Save preference
            localStorage.setItem('portfolioColor', color);

            // Remove transitioning class after animation
            setTimeout(() => htmlElement.classList.remove('color-transitioning'), 700);
        });
    });

    // --- Animated Stats Counter ---
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current) + '+';
        }, 16);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statsObserver.observe(el));

    // --- Experience Tabs ---
    const tabBtns = document.querySelectorAll('.exp-tab-btn');
    const tabContents = document.querySelectorAll('.exp-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`tab-${tabId}`);
            if(targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // --- Projects Carousel ---
    const track          = document.getElementById('projectsTrack');
    const trackContainer = document.getElementById('projectsTrackContainer');
    const prevBtn        = document.getElementById('projPrev');
    const nextBtn        = document.getElementById('projNext');
    const paginationEl   = document.getElementById('projPagination');
    const currentEl      = document.getElementById('projCurrent');
    const totalEl        = document.getElementById('projTotal');

    if (track && prevBtn && nextBtn) {
        const slides = Array.from(track.querySelectorAll('.proj-slide'));
        let currentPage = 0;
        let isAnimating  = false;

        // How many slides are visible at once (respects breakpoints)
        function getSlidesPerPage() {
            if (window.innerWidth <= 600)  return 1;
            if (window.innerWidth <= 991)  return 2;
            return 3;
        }

        function getTotalPages() {
            return Math.ceil(slides.length / getSlidesPerPage());
        }

        // Build / rebuild pagination dots
        function buildDots() {
            if (!paginationEl) return;
            paginationEl.innerHTML = '';
            const total = getTotalPages();
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.className = 'proj-dot' + (i === currentPage ? ' active' : '');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.addEventListener('click', () => goToPage(i, i < currentPage ? 'right' : 'left'));
                paginationEl.appendChild(dot);
            }
        }

        // Update dot states
        function updateDots() {
            if (!paginationEl) return;
            const dots = paginationEl.querySelectorAll('.proj-dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
        }

        // Update counter text
        function updateCounter() {
            if (currentEl) currentEl.textContent = currentPage + 1;
            if (totalEl)   totalEl.textContent   = getTotalPages();
        }

        // Update arrow disabled state
        function updateArrows() {
            const total = getTotalPages();
            prevBtn.classList.toggle('proj-disabled', currentPage === 0);
            nextBtn.classList.toggle('proj-disabled', currentPage >= total - 1);
        }

        // Move track to the correct position with elegant animation
        function goToPage(page, direction = 'left') {
            if (isAnimating) return;
            const total = getTotalPages();
            if (page < 0 || page >= total) return;
            isAnimating = true;

            // Step 1: fade+blur out
            track.classList.add('is-animating');
            const exitClass = direction === 'left' ? 'slide-left-exit' : 'slide-right-exit';
            track.classList.add(exitClass);

            // Step 2: after half the transition, snap position and fade back in
            setTimeout(() => {
                currentPage = page;

                // Calculate pixel offset
                const slideWidth   = slides[0].getBoundingClientRect().width;
                const gap          = 24; // must match CSS gap
                const perPage      = getSlidesPerPage();
                const offset       = page * (perPage * (slideWidth + gap));
                track.style.transform = `translateX(-${offset}px)`;

                // Remove exit class → triggers fade-in via CSS transition removal
                track.classList.remove(exitClass);

                updateDots();
                updateCounter();
                updateArrows();

                // Re-enable after animation completes
                setTimeout(() => {
                    track.classList.remove('is-animating');
                    isAnimating = false;
                }, 350);
            }, 280);
        }

        // Arrow clicks
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) goToPage(currentPage - 1, 'right');
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < getTotalPages() - 1) goToPage(currentPage + 1, 'left');
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('projects');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            // Only intercept when projects section is in view
            if (rect.top > window.innerHeight || rect.bottom < 0) return;
            if (e.key === 'ArrowLeft')  goToPage(currentPage - 1, 'right');
            if (e.key === 'ArrowRight') goToPage(currentPage + 1, 'left');
        });

        // Touch / swipe support
        let touchStartX = 0;
        trackContainer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        trackContainer.addEventListener('touchend', e => {
            const delta = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 50) {
                if (delta > 0) goToPage(currentPage + 1, 'left');
                else           goToPage(currentPage - 1, 'right');
            }
        }, { passive: true });

        // On window resize, recalculate (recalculate visible slides per page)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Clamp current page within new total
                currentPage = Math.min(currentPage, getTotalPages() - 1);
                // Rebuild dots for new breakpoint
                buildDots();
                // Snap to correct position instantly (no animation on resize)
                const slideWidth = slides[0].getBoundingClientRect().width;
                const gap        = 24;
                const perPage    = getSlidesPerPage();
                const offset     = currentPage * (perPage * (slideWidth + gap));
                track.style.transition = 'none';
                track.style.transform  = `translateX(-${offset}px)`;
                setTimeout(() => { track.style.transition = ''; }, 50);
                updateCounter();
                updateArrows();
            }, 150);
        });

        // Initialize
        buildDots();
        updateCounter();
        updateArrows();
    }

    // --- Certifications Carousel ---
    const certPrevBtn  = document.getElementById('certPrev');
    const certNextBtn  = document.getElementById('certNext');
    const certPages    = document.querySelectorAll('.cert-page');
    const certDots     = document.querySelectorAll('#certPagination .proj-dot');
    const certCurrEl   = document.getElementById('certCurrent');
    const certTotalEl  = document.getElementById('certTotal');
    let certPage = 0;
    const certTotal = certPages.length;

    function goToCertPage(n) {
        certPages[certPage].classList.remove('active');
        certDots[certPage]?.classList.remove('active');
        certPage = n;
        certPages[certPage].classList.add('active');
        certDots[certPage]?.classList.add('active');
        if (certCurrEl) certCurrEl.textContent = certPage + 1;
        certPrevBtn?.classList.toggle('cert-disabled', certPage === 0);
        certNextBtn?.classList.toggle('cert-disabled', certPage >= certTotal - 1);
    }

    if (certPrevBtn && certNextBtn && certPages.length) {
        if (certTotalEl) certTotalEl.textContent = certTotal;
        certPrevBtn.classList.add('cert-disabled');
        if (certPage >= certTotal - 1) certNextBtn.classList.add('cert-disabled');

        certPrevBtn.addEventListener('click', () => { if (certPage > 0) goToCertPage(certPage - 1); });
        certNextBtn.addEventListener('click', () => { if (certPage < certTotal - 1) goToCertPage(certPage + 1); });
        certDots.forEach((dot, i) => dot.addEventListener('click', () => goToCertPage(i)));
    }

});
