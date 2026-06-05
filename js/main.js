/* ================================================
   SailingLoc — Scripts globaux
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Menu mobile ─────────────────────────── */
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ── Accordéon FAQ ───────────────────────── */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Fermer tous les autres
      document.querySelectorAll('.accordion-btn.open').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.classList.remove('open');
      });

      if (!isOpen) {
        btn.classList.add('open');
        body.classList.add('open');
      }
    });
  });

  /* ── Onglets de type de bateau (accueil) ── */
  document.querySelectorAll('.boat-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.boat-types-row').querySelectorAll('.boat-type-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Onglets FAQ (catégories) ─────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs');
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.tab;
      if (target) {
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      }
    });
  });

  /* ── Carousel destinations ───────────────── */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    if (!track) return;

    let index = 0;
    const getItemWidth = () => {
      const item = track.firstElementChild;
      if (!item) return 0;
      const style = getComputedStyle(track);
      const gap = parseInt(style.gap) || 24;
      return item.offsetWidth + gap;
    };
    const getVisible = () => Math.round(carousel.offsetWidth / getItemWidth());
    const getMax = () => Math.max(0, track.children.length - getVisible());
    const slide = () => { track.style.transform = `translateX(-${index * getItemWidth()}px)`; };

    if (nextBtn) nextBtn.addEventListener('click', () => { index = Math.min(index + 1, getMax()); slide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { index = Math.max(index - 1, 0); slide(); });
  });

  /* ── Favori (cœur) ───────────────────────── */
  document.querySelectorAll('.btn-heart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('liked');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('liked')) {
        icon.classList.replace('fa-regular', 'fa-solid');
      } else {
        icon.classList.replace('fa-solid', 'fa-regular');
      }
    });
  });

  /* ── Filtres chips (toggle) ──────────────── */
  document.querySelectorAll('.chip-group .chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  /* ── Galerie produit (miniatures) ───────── */
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const main = document.querySelector('.gallery-main img');
      if (!main) return;
      const src = thumb.querySelector('img').src;
      thumb.closest('.gallery').querySelectorAll('.gallery-thumb')
        .forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      main.src = src;
    });
  });

  /* ── Formulaire contact : options ───────── */
  document.querySelectorAll('.contact-radio input').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.contact-radio').forEach(r => r.classList.remove('active'));
      radio.closest('.contact-radio').classList.add('active');
    });
  });

  /* ── Animation apparition au scroll ─────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ── Sticky réservation (page produit) ─── */
  const bookingCard = document.querySelector('.booking-card');
  if (bookingCard) {
    const sentinel = document.querySelector('.booking-sentinel');
    if (sentinel) {
      new IntersectionObserver(([e]) => {
        bookingCard.classList.toggle('sticky-active', !e.isIntersecting);
      }).observe(sentinel);
    }
  }

});
