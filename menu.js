/* Hamburger Menu and Modal Functionality */

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger Menu Functionality
  const menuToggle = document.getElementById('menu-toggle');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const closeMenu = document.getElementById('close-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  // Toggle hamburger menu
  function toggleMenu() {
    hamburgerMenu.classList.toggle('open');
    document.body.style.overflow = hamburgerMenu.classList.contains('open') ? 'hidden' : 'auto';
  }

  // Event listeners for menu toggle
  menuToggle.addEventListener('click', toggleMenu);
  closeMenu.addEventListener('click', toggleMenu);

  // Close menu when clicking outside
  hamburgerMenu.addEventListener('click', (e) => {
    if (e.target === hamburgerMenu) {
      toggleMenu();
    }
  });

  // Handle menu link clicks
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.getAttribute('data-action');

      // Close hamburger menu
      toggleMenu();

      // Handle different actions
      switch(action) {
        case 'home':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'report':
          document.getElementById('reports-section').scrollIntoView({ behavior: 'smooth' });
          break;
        case 'reports':
          document.getElementById('reports-section').scrollIntoView({ behavior: 'smooth' });
          break;
        case 'news':
          openModal('news-modal');
          break;
        case 'login':
          openModal('login-modal');
          break;
        case 'signup':
          openModal('signup-modal');
          break;
        case 'contact':
          openModal('contact-modal');
          break;
        case 'about':
          openModal('about-modal');
          break;
        case 'help':
          openModal('help-modal');
          break;
        case 'privacy':
          openModal('privacy-modal');
          break;
        case 'terms':
          openModal('terms-modal');
          break;
      }
    });
  });

  // Modal Functionality
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.close-modal');

  // Open modal function
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close modal function
  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }

  // Close modal when clicking close button
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });

  // Close modal when clicking outside
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Handle navbar login/signup buttons
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('login-modal');
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('signup-modal');
    });
  }

  // Form handling
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const contactForm = document.getElementById('contact-form');

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      // Basic validation
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }

      // Simulate login (replace with actual authentication)
      alert('Login functionality would be implemented here with backend integration');
      closeModal(loginForm.closest('.modal'));
      loginForm.reset();
    });
  }

  // Signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      const terms = formData.get('terms');

      // Basic validation
      if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (!terms) {
        alert('Please accept the Terms of Service');
        return;
      }

      // Simulate signup (replace with actual registration)
      alert('Signup functionality would be implemented here with backend integration');
      closeModal(signupForm.closest('.modal'));
      signupForm.reset();
    });
  }

  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');

      // Basic validation
      if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
      }

      // Simulate contact form submission
      alert('Thank you for your message! We will get back to you soon.');
      closeModal(contactForm.closest('.modal'));
      contactForm.reset();
    });
  }

  // Modal switching functionality
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin = document.getElementById('switch-to-login');
  const termsLink = document.getElementById('terms-link');

  if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('login-modal'));
      openModal('signup-modal');
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('signup-modal'));
      openModal('login-modal');
    });
  }

  if (termsLink) {
    termsLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('signup-modal'));
      openModal('terms-modal');
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Close modals with Escape key
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('show')) {
          closeModal(modal);
        }
      });

      // Close hamburger menu with Escape key
      if (hamburgerMenu.classList.contains('open')) {
        toggleMenu();
      }
    }
  });

  // Prevent form submission on Enter for better UX
  const modalForms = document.querySelectorAll('.modal form');
  modalForms.forEach(form => {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  });

  // Add loading states to buttons
  function setLoadingState(button, loading) {
    if (loading) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
      button.disabled = false;
      button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
    }
  }

  // Store original button text
  document.querySelectorAll('.modal-btn').forEach(button => {
    button.setAttribute('data-original-text', button.innerHTML);
  });

  // Apply loading state to forms
  modalForms.forEach(form => {
    form.addEventListener('submit', () => {
      const submitBtn = form.querySelector('.modal-btn');
      if (submitBtn) {
        setLoadingState(submitBtn, true);
        // Reset loading state after 2 seconds (for demo)
        setTimeout(() => setLoadingState(submitBtn, false), 2000);
      }
    });
  });
});