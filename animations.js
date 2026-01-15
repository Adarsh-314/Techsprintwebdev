/* Animation enhancements for scroll and interactive effects */

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);

  // Observe all reports for scroll animations
  document.querySelectorAll('.report').forEach(el => {
    observer.observe(el);
  });

  // Add stagger effect to reports
  const reports = document.querySelectorAll('.report');
  reports.forEach((report, index) => {
    report.style.animationDelay = `${index * 0.1}s`;
  });

  // Smooth scroll on anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Parallax effect on hero section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroSection.style.transform = `translateY(${scrollY * 0.5}px)`;
    });
  }

  // Add glow effect to form inputs on focus
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.boxShadow = '0 0 15px rgba(0, 170, 255, 0.4)';
    });
    input.addEventListener('blur', function() {
      this.style.boxShadow = 'none';
    });
  });

  // Animate counters when in view
  const counterElements = document.querySelectorAll('[data-count]');
  counterElements.forEach(el => {
    observer.observe(el);
  });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
  button {
    position: relative;
    overflow: hidden;
  }

  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  .animate-in {
    animation: slideIn 0.6s ease-out forwards !important;
  }
`;
document.head.appendChild(style);
