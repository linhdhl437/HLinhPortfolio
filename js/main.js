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
  // 0.1 CURSOR PARTICLE TOGGLE SYSTEM
  // ==========================================================================
  const particleBtn = document.getElementById("btn-toggle-particles");
  const particleCapsule = document.getElementById("particle-toggle-capsule");
  
  if (particleBtn) {
    const particleTypes = ["peach", "bamboo", "lotus", "off"];
    const particleIcons = {
      peach: "🌸",
      bamboo: "🎋",
      lotus: "🪷",
      off: "🚫"
    };
    const particleTitles = {
      peach: "Hiệu ứng chuột: Cánh hoa đào 🌸 (Click để đổi)",
      bamboo: "Hiệu ứng chuột: Lá trúc nhỏ 🎋 (Click để đổi)",
      lotus: "Hiệu ứng chuột: Cánh hoa sen 🪷 (Click để đổi)",
      off: "Tắt hiệu ứng hạt theo chuột 🚫 (Click để bật lại)"
    };
    
    let currentType = localStorage.getItem("cursorParticleType") || "peach";
    
    // Set initial icon and title
    particleBtn.textContent = particleIcons[currentType];
    if (particleCapsule) {
      particleCapsule.setAttribute("title", particleTitles[currentType]);
    }
    
    particleBtn.addEventListener("click", () => {
      const currentIndex = particleTypes.indexOf(currentType);
      const nextIndex = (currentIndex + 1) % particleTypes.length;
      currentType = particleTypes[nextIndex];
      
      // Save state
      localStorage.setItem("cursorParticleType", currentType);
      
      // Update UI
      particleBtn.textContent = particleIcons[currentType];
      if (particleCapsule) {
        particleCapsule.setAttribute("title", particleTitles[currentType]);
      }
      
      // Dispatch custom event to ambient-canvas.js
      window.dispatchEvent(new CustomEvent("cursorParticleTypeChanged", { detail: currentType }));
    });

    // Bổ sung: Chỉ dẫn đổi cọ di chuột tự động cho người dùng mới
    const particleTooltip = document.getElementById("particle-toggle-tooltip");
    const hasToggled = localStorage.getItem("cursorParticleToggled");

    if (particleTooltip && particleCapsule && !hasToggled) {
      // Hiển thị hiệu ứng phát sóng và bong bóng chỉ dẫn sau khi video intro kết thúc
      setTimeout(() => {
        particleCapsule.classList.add("pulse-glow");
        particleTooltip.classList.add("visible");
      }, 3500);

      // Tự động ẩn tooltip sau 7 giây hiển thị
      const autoHide = setTimeout(() => {
        hideTooltip();
      }, 10500);

      function hideTooltip() {
        particleTooltip.classList.remove("visible");
        particleCapsule.classList.remove("pulse-glow");
        clearTimeout(autoHide);
      }

      // Ẩn ngay khi di chuột vào nút hoặc click đổi cọ vẽ
      particleCapsule.addEventListener("mouseenter", hideTooltip, { once: true });
      particleBtn.addEventListener("click", () => {
        hideTooltip();
        localStorage.setItem("cursorParticleToggled", "true");
      }, { once: true });
    }
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
          const headerHeight = document.getElementById('site-header')?.offsetHeight || 70; // Matches navbar height dynamically
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

  let scrollTick = false;
  window.addEventListener("scroll", () => {
    if (!scrollTick) {
      window.requestAnimationFrame(() => {
        handleScroll();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });

  function handleScroll() {
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
  }
  
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
  // Handled in exitIntro() of loading.js to align with video fade-out

  // ==========================================================================
  // 4. JOURNEY TABS INTERACTION HANDLER
  // ==========================================================================
  const tabItems = document.querySelectorAll(".journey-tab-item");
  const tabPanes = document.querySelectorAll(".journey-tab-pane");
  let tabTimeoutId = null;

  if (tabItems.length && tabPanes.length) {
    tabItems.forEach((item, index) => {
      // Click handler
      item.addEventListener("click", () => {
        // 1. Check if already active
        if (item.classList.contains("active")) return;

        // Hủy bỏ tiến trình cũ nếu click liên tục nhanh
        if (tabTimeoutId) {
          clearTimeout(tabTimeoutId);
          tabTimeoutId = null;
        }

        // 2. Remove active state, aria-selected and tabindex from all items
        tabItems.forEach(i => {
          i.classList.remove("active");
          i.setAttribute("aria-selected", "false");
          i.setAttribute("tabindex", "-1");
        });
        
        // 3. Add active state, aria-selected and tabindex to clicked item
        item.classList.add("active");
        item.setAttribute("aria-selected", "true");
        item.setAttribute("tabindex", "0");
        
        // 4. Get target pane ID
        const targetId = item.getAttribute("data-target");
        
        // 5. Deactivate current active pane with transition
        const activePane = document.querySelector(".journey-tab-pane.active");

        // Đồng bộ ép toàn bộ các pane khác ẩn đi ngay lập tức trước khi chuyển tiếp
        tabPanes.forEach(pane => {
          if (pane !== activePane) {
            pane.classList.remove("active");
            pane.style.opacity = "0";
            pane.style.transform = "translateY(10px)";
          }
        });

        if (activePane) {
          activePane.style.opacity = "0";
          activePane.style.transform = "translateY(10px)";
          
          tabTimeoutId = setTimeout(() => {
            activePane.classList.remove("active");
            
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
              targetPane.classList.add("active");
              // Force reflow
              targetPane.offsetHeight;
              targetPane.style.opacity = "1";
              targetPane.style.transform = "translateY(0)";
            }
            tabTimeoutId = null;
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

      // Keyboard navigation handler (Arrows, Space, Enter)
      item.addEventListener("keydown", (e) => {
        let nextIndex = index;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          nextIndex = (index + 1) % tabItems.length;
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabItems.length) % tabItems.length;
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          item.click();
          return;
        } else {
          return;
        }
        e.preventDefault();
        tabItems[nextIndex].focus();
        tabItems[nextIndex].click();
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


    // Tab init on hash is now handled entirely in loading.js (synchronous, before first paint)
    // to avoid race conditions between the two DOMContentLoaded handlers.
  }
});

