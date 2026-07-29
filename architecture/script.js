/* ════════════════════════════════════════════════════════════════
   SHERATON HOTELS & RESORTS — ARCHITECTURAL INTERACTION SCRIPT
   ════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Blur & Shrink Effect
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Lightbox Modal Functionality
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');

    window.openLightbox = function(imageSrc, titleText) {
        if (!lightboxModal || !lightboxImg || !lightboxCaption) return;
        lightboxImg.src = imageSrc;
        lightboxCaption.textContent = titleText;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // ESC key closes lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // 3. Tabbed Architectural Highlights Switcher
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const activePanel = document.getElementById(targetTab);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
    });

    // 4. Interactive Gallery Filtering
    const galleryBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.arch-gallery-item');

    galleryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterCategory = btn.getAttribute('data-filter');

            galleryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (filterCategory === 'all' || itemCategory === filterCategory) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in-out forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 5. IntersectionObserver Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.element-card, .material-card, .pool-card-large, .pool-feature-item, .quote-card, .feature-img-box');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        revealObserver.observe(el);
    });

    // 6. Interactive Click to Shake Icons
    const interactiveCards = document.querySelectorAll(
        '.pool-feature-item, .element-card, .material-card, .feature-list li, .zoom-icon, .logo-wrap, .stat-item'
    );

    interactiveCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const icon = this.querySelector('i, svg') || this;
            icon.classList.remove('icon-shake');
            void icon.offsetWidth; // Trigger DOM reflow to restart animation
            icon.classList.add('icon-shake');

            setTimeout(() => {
                icon.classList.remove('icon-shake');
            }, 600);
        });
    });
});

