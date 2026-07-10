/* 🎋 Main Script for HLinh Portfolio */
document.addEventListener("DOMContentLoaded", () => {
  // Detect reload to reset hash and scroll to top on refresh
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length && navEntries[0].type === "reload") {
    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }
    window.scrollTo(0, 0);
  }
  
  // ==========================================================================
  // 0. BRUSH TOGGLE SYSTEM
  // ==========================================================================
  const toggleBtn = document.getElementById("btn-toggle-brush");
  if (toggleBtn) {
    let brushEnabled = localStorage.getItem("brushEnabled") !== "false";
    if (!brushEnabled) {
      document.body.classList.add("brush-disabled");
      toggleBtn.classList.add("disabled");
    }
    
    toggleBtn.addEventListener("click", () => {
      brushEnabled = !brushEnabled;
      localStorage.setItem("brushEnabled", brushEnabled);
      if (brushEnabled) {
        document.body.classList.remove("brush-disabled");
        toggleBtn.classList.remove("disabled");
      } else {
        document.body.classList.add("brush-disabled");
        toggleBtn.classList.add("disabled");
      }
    });
  }

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

          // Silently update address bar URL hash on click
          window.history.pushState(null, null, targetId);
        }
      }
    });
  });

  // ==========================================================================
  // 2. STICKY HEADER & SCROLLSPY (ACTIVE LINK ON SCROLL)
  // ==========================================================================
  const header = document.getElementById("site-header");
  const sections = document.querySelectorAll("section[id], footer[id]");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // A. Sticky Header Toggle (Keep header always visible)
    if (header) {
      if (currentScrollY > 50) {
        header.style.backgroundColor = "rgba(249, 249, 246, 0.96)";
      } else {
        header.style.backgroundColor = "rgba(249, 249, 246, 0.85)";
      }
      header.classList.remove("scroll-down");
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
      // Silently update address bar URL hash on scroll
      if (window.location.hash !== `#${currentActiveId}`) {
        window.history.replaceState(null, null, `#${currentActiveId}`);
      }
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
      const targetNode = document.getElementById("HanhTrinh");
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

  // ==========================================================================
  // 4. JOURNEY TABS INTERACTION HANDLER
  // ==========================================================================
  const tabItems = document.querySelectorAll(".journey-tab-item");
  const tabPanes = document.querySelectorAll(".journey-tab-pane");

  if (tabItems.length && tabPanes.length) {
    tabItems.forEach(item => {
      item.addEventListener("click", () => {
        // 1. Check if already active
        if (item.classList.contains("active")) return;

        // 2. Remove active state from all items
        tabItems.forEach(i => i.classList.remove("active"));
        
        // 3. Add active state to clicked item
        item.classList.add("active");
        
        // 4. Get target pane ID
        const targetId = item.getAttribute("data-target");
        
        // 5. Deactivate current active pane with transition
        const activePane = document.querySelector(".journey-tab-pane.active");
        if (activePane) {
          activePane.style.opacity = "0";
          activePane.style.transform = "translateY(10px)";
          
          setTimeout(() => {
            activePane.classList.remove("active");
            
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
              targetPane.classList.add("active");
              // Force reflow
              targetPane.offsetHeight;
              targetPane.style.opacity = "1";
              targetPane.style.transform = "translateY(0)";
            }
          }, 300);
        } else {
          // Fallback if no active pane
          const targetPane = document.getElementById(targetId);
          if (targetPane) {
            targetPane.classList.add("active");
            targetPane.offsetHeight;
            targetPane.style.opacity = "1";
            targetPane.style.transform = "translateY(0)";
          }
        }
      });
    });

    // Initialize transition style triggers
    tabPanes.forEach(pane => {
      pane.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      if (pane.classList.contains("active")) {
        pane.style.opacity = "1";
        pane.style.transform = "translateY(0)";
      } else {
        pane.style.opacity = "0";
        pane.style.transform = "translateY(10px)";
      }
    });

    // Check if loading with a stage hash, and click the corresponding tab
    const hash = window.location.hash;
    if (hash && hash.startsWith("#stage-node-")) {
      const stageNum = hash.replace("#stage-node-", "");
      const targetTabItem = document.querySelector(`.journey-tab-item[data-target="tab-stage-${stageNum}"]`);
      if (targetTabItem) {
        targetTabItem.click();
      }
    }
  }
});
