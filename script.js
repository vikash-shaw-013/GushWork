/**
 * ============================================
 * MANGALAM HDPE PIPES - Interactive Functionality
 * ============================================
 * 
 * Features:
 * 1. Sticky Header - appears on scroll past first fold, hides when scrolling back up
 * 2. Image Carousel - with thumbnail navigation and prev/next arrows
 * 3. Zoom on Hover - magnified preview when hovering over carousel images
 * 4. Applications Carousel - side-scrolling for mobile
 * 5. Mobile Navigation - hamburger menu toggle
 * 6. Catalogue Modal - popup for brochure download
 * 7. Smooth Scroll - for anchor navigation
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ============================================
    // 1. STICKY HEADER
    // ============================================

    const stickyHeader = document.getElementById('stickyHeader');
    const mainNav = document.getElementById('mainNav');
    let lastScrollY = 0;
    let navBottom = 0;

    /**
     * Calculate the bottom position of the main navigation bar.
     * The sticky header appears only after scrolling past this point.
     */
    function updateNavPosition() {
        if (mainNav) {
            navBottom = mainNav.offsetTop + mainNav.offsetHeight;
        }
    }

    updateNavPosition();
    window.addEventListener('resize', updateNavPosition);

    /**
     * Handle scroll events for the sticky header.
     * - Shows header when scrolling DOWN past the main nav
     * - Hides header when scrolling UP back to the top
     */
    function handleStickyHeader() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > navBottom) {
            // Scrolled past the main nav — show sticky header
            if (currentScrollY > lastScrollY) {
                // Scrolling DOWN — show
                stickyHeader.classList.add('visible');
            } else {
                // Scrolling UP — keep visible while still below nav
                stickyHeader.classList.add('visible');
            }
        } else {
            // Back at the top — hide sticky header
            stickyHeader.classList.remove('visible');
        }

        // Special case: if user scrolls very close to the top, always hide
        if (currentScrollY < 50) {
            stickyHeader.classList.remove('visible');
        }

        lastScrollY = currentScrollY;
    }

    // Use requestAnimationFrame for smooth scroll handling
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleStickyHeader();
                ticking = false;
            });
            ticking = true;
        }
    });


    // ============================================
    // 2. IMAGE CAROUSEL
    // ============================================

    const carouselImages = [
        'images/carousel-1.png',
        'images/carousel-2.png',
        'images/carousel-3.png',
        'images/carousel-4.png'
    ];

    let currentSlide = 0;
    const mainImg = document.getElementById('carouselMainImg');
    const thumbs = document.querySelectorAll('.carousel__thumb');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const zoomPreviewImg = document.getElementById('zoomPreviewImg');

    /**
     * Switch the carousel to a specific slide index.
     * Updates main image, zoom preview image, and thumbnail active states.
     * @param {number} index - Slide index (0-3)
     */
    function goToSlide(index) {
        // Wrap around
        if (index < 0) index = carouselImages.length - 1;
        if (index >= carouselImages.length) index = 0;

        currentSlide = index;

        // Fade transition on main image
        mainImg.style.opacity = '0';
        setTimeout(function () {
            mainImg.src = carouselImages[currentSlide];
            if (zoomPreviewImg) {
                zoomPreviewImg.src = carouselImages[currentSlide];
            }
            mainImg.style.opacity = '1';
        }, 150);

        // Update thumbnail active state
        thumbs.forEach(function (thumb, i) {
            thumb.classList.toggle('active', i === currentSlide);
        });
    }

    // Arrow navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            goToSlide(currentSlide - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            goToSlide(currentSlide + 1);
        });
    }

    // Thumbnail click navigation
    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            const index = parseInt(this.dataset.index, 10);
            goToSlide(index);
        });
    });

    // Keyboard navigation for carousel
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });


    // ============================================
    // 3. ZOOM ON HOVER
    // ============================================

    const carouselMain = document.getElementById('carouselMain');
    const zoomLens = document.getElementById('zoomLens');
    const zoomPreview = document.getElementById('zoomPreview');

    // Zoom ratio — how much larger the preview is vs. the lens area
    const ZOOM_RATIO = 2.5;

    /**
     * Handle mouse movement over the main carousel image.
     * Moves the zoom lens to follow the cursor and updates the
     * zoomed preview window accordingly.
     * @param {MouseEvent} e - Mouse move event
     */
    function handleZoom(e) {
        if (!carouselMain || !zoomLens || !zoomPreview || !zoomPreviewImg) return;

        const rect = carouselMain.getBoundingClientRect();
        const lensW = zoomLens.offsetWidth;
        const lensH = zoomLens.offsetHeight;

        // Calculate cursor position relative to the main carousel image
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Clamp lens position so it doesn't go outside the image
        let lensX = x - lensW / 2;
        let lensY = y - lensH / 2;

        lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
        lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

        // Position the lens
        zoomLens.style.left = lensX + 'px';
        zoomLens.style.top = lensY + 'px';

        // Calculate zoomed preview image dimensions and position
        const previewW = zoomPreview.offsetWidth;
        const previewH = zoomPreview.offsetHeight;

        // Scale the image to fill the zoom preview at the given zoom ratio
        const imgScaleX = (rect.width * ZOOM_RATIO) / rect.width;
        const imgScaleY = (rect.height * ZOOM_RATIO) / rect.height;

        zoomPreviewImg.style.width = (rect.width * ZOOM_RATIO) + 'px';
        zoomPreviewImg.style.height = (rect.height * ZOOM_RATIO) + 'px';

        // Calculate which part of the zoomed image to show
        const ratioX = lensX / (rect.width - lensW);
        const ratioY = lensY / (rect.height - lensH);

        const maxOffsetX = (rect.width * ZOOM_RATIO) - previewW;
        const maxOffsetY = (rect.height * ZOOM_RATIO) - previewH;

        zoomPreviewImg.style.left = -(ratioX * maxOffsetX) + 'px';
        zoomPreviewImg.style.top = -(ratioY * maxOffsetY) + 'px';
    }

    // Show zoom preview on mouse enter
    if (carouselMain) {
        carouselMain.addEventListener('mouseenter', function () {
            // Only show zoom on larger screens
            if (window.innerWidth > 1024) {
                zoomPreview.classList.add('active');
            }
        });

        carouselMain.addEventListener('mousemove', function (e) {
            if (window.innerWidth > 1024) {
                handleZoom(e);
            }
        });

        // Hide zoom preview on mouse leave
        carouselMain.addEventListener('mouseleave', function () {
            zoomPreview.classList.remove('active');
        });
    }


    // ============================================
    // 4. APPLICATIONS CAROUSEL
    // ============================================

    const appCarousel = document.getElementById('appCarousel');
    const appPrev = document.getElementById('appPrev');
    const appNext = document.getElementById('appNext');
    let appScrollPosition = 0;

    /**
     * Scroll the applications carousel left or right.
     * Uses smooth scrolling for a polished user experience.
     * @param {string} direction - 'prev' or 'next'
     */
    function scrollAppCarousel(direction) {
        if (!appCarousel) return;

        const cardWidth = appCarousel.querySelector('.app-card').offsetWidth;
        const gap = 24; // matches CSS gap
        const scrollAmount = cardWidth + gap;

        if (direction === 'next') {
            appScrollPosition += scrollAmount;
        } else {
            appScrollPosition -= scrollAmount;
        }

        // Clamp to valid range
        const maxScroll = appCarousel.scrollWidth - appCarousel.clientWidth;
        appScrollPosition = Math.max(0, Math.min(appScrollPosition, maxScroll));

        appCarousel.scrollTo({
            left: appScrollPosition,
            behavior: 'smooth'
        });
    }

    if (appPrev) {
        appPrev.addEventListener('click', function () {
            scrollAppCarousel('prev');
        });
    }

    if (appNext) {
        appNext.addEventListener('click', function () {
            scrollAppCarousel('next');
        });
    }


    // ============================================
    // 5. MOBILE NAVIGATION
    // ============================================

    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('open');
        });

        // Close mobile nav when a link is clicked
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('open');
            });
        });
    }


    // ============================================
    // 6. CATALOGUE MODAL
    // ============================================

    const modal = document.getElementById('catalogueModal');
    const modalClose = document.getElementById('modalClose');
    const ctaForm = document.getElementById('ctaForm');
    const modalForm = document.getElementById('modalForm');

    /**
     * Open the catalogue request modal.
     */
    function openModal() {
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close the catalogue request modal.
     */
    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // Open modal after form submit in CTA section
    if (ctaForm) {
        ctaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            if (email) {
                openModal();
                // Pre-fill email in the modal form
                const modalEmail = document.getElementById('modalEmail');
                if (modalEmail) modalEmail.value = email;
            }
        });
    }

    // Close modal events
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    // Modal form submission
    if (modalForm) {
        modalForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Simulate successful submission
            var content = modal.querySelector('.modal__content');
            content.innerHTML = '<div style="text-align:center;padding:2rem 0;">' +
                '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin:0 auto 1rem;">' +
                '<circle cx="12" cy="12" r="10" fill="#059669"/>' +
                '<path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
                '<h3 style="color:#0D1B2A;margin-bottom:0.5rem;">Thank you!</h3>' +
                '<p style="color:#6B7280;">Our team will send the brochure to your email shortly.</p>' +
                '</div>';

            setTimeout(closeModal, 3000);
        });
    }


    // ============================================
    // 7. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerOffset = 80; // account for sticky header height
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ============================================
    // 8. INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================

    /**
     * Adds a subtle fade-in-up animation as sections scroll into view.
     * Uses IntersectionObserver for performance.
     */
    const animatedSections = document.querySelectorAll(
        '.feature-card, .process__step, .app-card, .price-info__card, .testimonial__quote'
    );

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedSections.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }
});
