/* 🎋 Main Script for HLinh Portfolio */
document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================================================
  // 1. MOBILE MENU TOGGLE
  // ==========================================================================
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("active");
      
      // Transform hamburger to X
      const spans = menuToggle.querySelectorAll("span");
      if (navMenu.classList.contains("active")) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(6px, -6px)";
      } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("active");
        const spans = menuToggle.querySelectorAll("span");
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });
  }

  // Close menu when clicking links & smooth scroll
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Close mobile menu
      if (navMenu) {
        navMenu.classList.remove("active");
        const spans = menuToggle.querySelectorAll("span");
        if (spans.length) {
          spans[0].style.transform = "none";
          spans[1].style.opacity = "1";
          spans[2].style.transform = "none";
        }
      }

      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const headerHeight = 70; // Matches navbar height
          const targetOffset = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          window.scrollTo({
            top: targetOffset,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // ==========================================================================
  // 2. STICKY HEADER & SCROLLSPY (ACTIVE LINK ON SCROLL)
  // ==========================================================================
  const header = document.getElementById("site-header");
  const sections = document.querySelectorAll("section[id]");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // A. Sticky Header Toggle
    if (header) {
      if (currentScrollY > 100) {
        header.style.backgroundColor = "rgba(249, 249, 246, 0.96)";
        
        // Scroll down hides, scroll up shows
        if (currentScrollY > lastScrollY && currentScrollY > 300) {
          header.classList.add("scroll-down");
        } else {
          header.classList.remove("scroll-down");
        }
      } else {
        header.style.backgroundColor = "rgba(249, 249, 246, 0.85)";
        header.classList.remove("scroll-down");
      }
    }
    
    lastScrollY = currentScrollY;

    // B. Scrollspy (Active Menu Item)
    let currentActiveId = "";
    const scrollPosition = currentScrollY + 200; // offset for detection

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentActiveId = sectionId;
      }
    });

    if (currentActiveId) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentActiveId}`) {
          link.classList.add("active");
        }
      });
    }
  });
  
  // CTA Button Smooth Scroll helper
  const ctaBtn = document.getElementById("hero-cta-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        const offset = aboutSection.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({
          top: offset,
          behavior: "smooth"
        });
      }
    });
  }

  // ==========================================================================
  // 3. SMOOTH SCROLL TO STAGE NODE ON PAGE LOAD (If navigated back from details page)
  // ==========================================================================
  if (window.location.hash && window.location.hash.startsWith("#stage-node-")) {
    setTimeout(() => {
      const targetNode = document.querySelector(window.location.hash);
      if (targetNode) {
        const headerHeight = 70; // Matches navbar height
        const targetOffset = targetNode.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetOffset,
          behavior: "smooth"
        });
      }
    }, 1800); // Wait for loading overlay to slide out and animations to start
  }
});
