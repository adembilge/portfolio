/* ==========================================================================
   Portfolio — main.js
   Small, self-contained modules. Every module null-checks its root element,
   so the script never throws if a section is missing.
   ========================================================================== */
(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Navigation: mobile toggle, scroll-spy, progress bar ---------- */
    function initNav() {
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');

        if (toggle && menu) {
            const setOpen = (open) => {
                menu.classList.toggle('open', open);
                toggle.setAttribute('aria-expanded', String(open));
            };

            toggle.addEventListener('click', () => {
                setOpen(!menu.classList.contains('open'));
            });

            menu.addEventListener('click', (e) => {
                if (e.target.closest('a')) setOpen(false);
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && menu.classList.contains('open')) {
                    setOpen(false);
                    toggle.focus();
                }
            });

            document.addEventListener('click', (e) => {
                if (menu.classList.contains('open') && !e.target.closest('.nav')) {
                    setOpen(false);
                }
            });
        }

        // In-page anchors: scroll without updating the URL hash.
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const hash = link.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.getElementById(hash.slice(1));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start',
            });
        });

        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            const target = document.getElementById(id);
            history.replaceState(null, '', window.location.pathname + window.location.search);
            if (target) {
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }

        // Scroll-spy: highlight the nav link of the section in view.
        const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
        const sections = links
            .map((link) => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        if (sections.length && 'IntersectionObserver' in window) {
            const setActive = (id) => {
                links.forEach((link) => {
                    const active = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('is-active', active);
                    if (active) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            };

            const spy = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            }, { rootMargin: '-35% 0px -55% 0px' });

            sections.forEach((section) => spy.observe(section));
        }

        // Reading progress bar (rAF-throttled scroll handler).
        const progress = document.getElementById('nav-progress');
        if (progress) {
            let ticking = false;
            const update = () => {
                const doc = document.documentElement;
                const total = doc.scrollHeight - window.innerHeight;
                const ratio = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
                progress.style.transform = `scaleX(${ratio})`;
                ticking = false;
            };
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    ticking = true;
                    requestAnimationFrame(update);
                }
            }, { passive: true });
            update();
        }
    }

    /* ---------- Hero typing animation (matches old_index.html) ---------- */
    function initTyping() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;

        const roles = ['Software Engineer', 'Master Of Science Candidate', 'Researcher', 'Data Engineer'];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeWriter() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                typingElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }

            setTimeout(typeWriter, typeSpeed);
        }

        typeWriter();
    }

    /* ---------- Scroll reveals + skill bar fills (matches old_index.html) ---------- */
    function initReveals() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');

                if (entry.target.querySelector('.skill-progress')) {
                    entry.target.querySelectorAll('.skill-progress').forEach((bar) => {
                        setTimeout(() => {
                            bar.style.width = bar.getAttribute('data-width');
                        }, 300);
                    });
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    }

    /* ---------- Stat counters: count up on page load (matches hero timing) ---------- */
    function initCounters() {
        const stats = document.querySelector('.stats');
        if (!stats || reducedMotion) return;

        const animate = (el) => {
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            if (Number.isNaN(target)) return;

            const duration = 1100;
            const start = performance.now();

            const frame = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        };

        stats.querySelectorAll('.stat-value[data-count]').forEach(animate);
    }

    /* ---------- About gallery: crossfade rotation (old_index) + dot controls ---------- */
    function initGallery() {
        const gallery = document.querySelector('.about-gallery');
        if (!gallery) return;

        const images = gallery.querySelectorAll('.gallery-image');
        if (images.length < 2) return;

        let current = 0;
        let timer = null;
        const dots = [];

        const show = (index) => {
            images[current].classList.remove('active');
            if (dots[current]) dots[current].classList.remove('active');
            current = index;
            images[current].classList.add('active');
            if (dots[current]) dots[current].classList.add('active');
        };

        const next = () => show((current + 1) % images.length);

        const start = () => {
            if (!timer) timer = setInterval(next, 4000);
        };

        const stop = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        };

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'gallery-dots';
        images.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Show photo ${i + 1} of ${images.length}`);
            dot.addEventListener('click', () => show(i));
            dotsWrap.appendChild(dot);
            dots.push(dot);
        });
        gallery.appendChild(dotsWrap);

        gallery.addEventListener('mouseenter', stop);
        gallery.addEventListener('mouseleave', start);

        start();
    }

    /* ---------- Project showcase: thumbnail-driven preview swap ---------- */
    function initShowcase() {
        const wrap = document.getElementById('cognify-showcase');
        if (!wrap) return;

        const main = wrap.querySelector('.portfolio-main');
        const thumbsWrap = wrap.querySelector('.portfolio-thumbs');
        if (!main || !thumbsWrap) return;

        const thumbs = [...thumbsWrap.querySelectorAll('.portfolio-thumb')];
        if (!thumbs.length) return;

        // Preload full-size shots so swaps are instant.
        thumbs.forEach((thumb) => {
            const img = new Image();
            img.src = thumb.dataset.src;
        });

        const show = (thumb) => {
            if (thumb.classList.contains('active')) return;
            thumbs.forEach((t) => t.classList.remove('active'));
            thumb.classList.add('active');
            main.style.opacity = '0';
            requestAnimationFrame(() => {
                main.src = thumb.dataset.src;
                main.alt = thumb.dataset.alt;
                main.style.opacity = '1';
            });
        };

        const thumbFrom = (e) => e.target.closest('.portfolio-thumb');

        thumbsWrap.addEventListener('click', (e) => {
            const thumb = thumbFrom(e);
            if (thumb) show(thumb);
        });

        thumbsWrap.addEventListener('mouseover', (e) => {
            const thumb = thumbFrom(e);
            if (thumb) show(thumb);
        });

        thumbsWrap.addEventListener('focusin', (e) => {
            const thumb = thumbFrom(e);
            if (thumb) show(thumb);
        });

        // Arrow-key navigation between thumbnails.
        thumbsWrap.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const focused = document.activeElement && document.activeElement.closest('.portfolio-thumb');
            if (!focused) return;
            e.preventDefault();
            const index = thumbs.indexOf(focused);
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            thumbs[(index + delta + thumbs.length) % thumbs.length].focus();
        });
    }

    /* ---------- Boot ---------- */
    initNav();
    initTyping();
    initReveals();
    initCounters();
    initGallery();
    initShowcase();
})();
