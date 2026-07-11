/* 🎋 Scroll Effects & Parallax for HLinh Portfolio */
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================================
  // 1. SCROLL REVEAL (FADE-IN UP ON ENTER VIEWPORT)
  // ==========================================================================
  const revealElements = document.querySelectorAll(".scroll-reveal");
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        
        // If there are child elements that need staggered animation
        const staggeredChildren = entry.target.querySelectorAll(".stagger-item");
        staggeredChildren.forEach((child, idx) => {
          setTimeout(() => {
            child.classList.add("animate-fade-in-up");
            child.style.opacity = "1";
          }, idx * 120);
        });
        
        // Once animated, stop observing
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // trigger early for better response
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================================================
  // 2. PARALLAX & GSAP SCROLL TRIGGER ANIMATIONS (Book open & Parallax backgrounds)
  // ==========================================================================
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 📜 THƯ QUYỂN MỞ HAI CHIỀU (Toggled via GSAP ScrollTrigger)
    gsap.utils.toArray(".scroll-unroll-container").forEach(container => {
      ScrollTrigger.create({
        trigger: container,
        start: "top 80%",       // Opens when top of section is 80% down viewport
        onEnter: () => container.classList.add("unrolled"),
        onEnterBack: () => container.classList.add("unrolled"),
        onLeaveBack: () => container.classList.remove("unrolled")
        // onLeave removed: keeps open when scrolling down past section
      });
    });

    // Parallax on mountains (giảm dịch chuyển trên di động để tăng hiệu năng)
    gsap.to(".hero-bg-mountains", {
      yPercent: isTouch ? 8 : 25,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: isTouch ? 0.6 : true
      }
    });

    // Parallax on clouds (giảm dịch chuyển trên di động để tăng hiệu năng)
    gsap.utils.toArray(".hero-cloud").forEach((cloud, idx) => {
      const speed = (idx + 1) * (isTouch ? 10 : 35);
      gsap.to(cloud, {
        y: speed,
        x: isTouch ? 5 : 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: isTouch ? 0.6 : true
        }
      });
    });

    // Parallax on Calligraphy decorative stamp watermarks
    gsap.utils.toArray(".calligraphy-accent").forEach((char) => {
      gsap.to(char, {
        y: isTouch ? -30 : -100,
        opacity: 0.15,
        ease: "power1.out",
        scrollTrigger: {
          trigger: char.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: isTouch ? 0.6 : true
        }
      });
    });
  } else {
    // Fallback: standard scroll handler if GSAP failed to load
    const mountains = document.querySelector(".hero-bg-mountains");
    const clouds = document.querySelectorAll(".hero-cloud");
    const scrolls = document.querySelectorAll(".scroll-unroll-container");

    // Standard unroll fallback using basic IntersectionObserver
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("unrolled");
        } else {
          // Only close if we scroll back up above it (boundingClientRect.top > 0)
          if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove("unrolled");
          }
        }
      });
    }, {
      threshold: 0.05
    });
    scrolls.forEach(scr => scrollObserver.observe(scr));

    let fallbackScrollTicking = false;
    window.addEventListener("scroll", () => {
      if (!fallbackScrollTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          if (mountains) {
            mountains.style.transform = `translateY(${scrollY * 0.15}px)`;
          }

          clouds.forEach((cloud, idx) => {
            const speed = (idx + 1) * 0.1;
            cloud.style.transform = `translateY(${scrollY * speed}px) translateX(${scrollY * 0.05}px)`;
          });
          
          fallbackScrollTicking = false;
        });
        fallbackScrollTicking = true;
      }
    }, { passive: true });
  }
});
