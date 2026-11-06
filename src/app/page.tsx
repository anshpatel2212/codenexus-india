'use client';

import { useEffect } from 'react';
import './landing.css';
import { landingMarkup } from './landing-markup';

export default function LandingPage() {
  useEffect(() => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const year = document.getElementById('year');

    if (year) {
      year.textContent = String(new Date().getFullYear());
    }

    if (!menuToggle || !navLinks) {
      return;
    }

    menuToggle.setAttribute('aria-controls', 'navLinks');

    const closeMenu = (restoreFocus = false) => {
      navLinks.classList.remove('active');
      menuToggle.innerHTML = '&#9776;';
      menuToggle.setAttribute('aria-label', 'Open menu');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        menuToggle.focus();
      }
    };

    const toggleMenu = () => {
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu(true);
      }
    };

    const links = navLinks.querySelectorAll('a');

    menuToggle.addEventListener('click', toggleMenu);
    links.forEach((link) => link.addEventListener('click', () => closeMenu(false)));
    document.addEventListener('keydown', handleKeyDown);

    const revealElements = document.querySelectorAll('.reveal');
    let observer: IntersectionObserver | null = null;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      revealElements.forEach((element) => observer?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add('visible'));
    }

    return () => {
      menuToggle.removeEventListener('click', toggleMenu);
      links.forEach((link) => link.removeEventListener('click', () => closeMenu(false)));
      document.removeEventListener('keydown', handleKeyDown);
      observer?.disconnect();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />;
}
