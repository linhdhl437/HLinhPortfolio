/* 🎋 Custom Calligraphy Brush Cursor Controller (Tối ưu hóa Event Delegation & RAF Idle) */
document.addEventListener("DOMContentLoaded", () => {
  // Check if mobile device / touch screen
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    return; // Do not initialize custom cursor on touch screens
  }

  // Create cursor elements dynamically if they do not exist
  let cursorContainer = document.getElementById("custom-cursor-container");
  if (!cursorContainer) {
    cursorContainer = document.createElement("div");
    cursorContainer.id = "custom-cursor-container";
    cursorContainer.className = "custom-cursor-container";
    cursorContainer.innerHTML = `
      <div id="cursor-dot" class="cursor-dot"></div>
      <div id="cursor-ring" class="cursor-ring"></div>
    `;
    document.body.appendChild(cursorContainer);
  }

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  // Mouse coordinates
  const mouse = { x: -100, y: -100 };
  
  // Ring delayed coordinates (Lerp)
  const ringPos = { x: -100, y: -100 };
  const lerpCoeff = 0.18; // smoothness factor

  let rafId = null;

  // Smooth follow loop for the ring (Lerp with Idle & Visibility Check)
  function updateRing() {
    if (document.hidden) {
      rafId = null;
      return;
    }

    const dx = mouse.x - ringPos.x;
    const dy = mouse.y - ringPos.y;

    // Run animation when distance is noticeable
    if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
      ringPos.x += dx * lerpCoeff;
      ringPos.y += dy * lerpCoeff;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(updateRing);
    } else {
      // Ring has caught up with mouse — sleep loop to save CPU
      ringPos.x = mouse.x;
      ringPos.y = mouse.y;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      rafId = null;
    }
  }

  function startUpdateRing() {
    if (!rafId && !document.hidden) {
      rafId = requestAnimationFrame(updateRing);
    }
  }

  // Track mouse coordinates
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Position dot instantly
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    
    // Wake up follow loop
    startUpdateRing();
  }, { passive: true });

  // Handle tab visibility to save CPU and battery
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      startUpdateRing();
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  // ==========================================================================
  // EVENT DELEGATION: Ultra-efficient hover detection with ZERO MutationObserver
  // ==========================================================================
  const INTERACTIVE_SELECTOR = "a, button, [data-lightbox], .cursor-pointer, .btn, .sidebar-link, input, textarea, select, label";

  document.body.addEventListener("mouseover", (e) => {
    if (e.target && e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
      cursorContainer.classList.add("cursor-hover");
    }
  }, { passive: true });

  document.body.addEventListener("mouseout", (e) => {
    if (e.target && e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
      // Check if relatedTarget is still within an interactive element
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(INTERACTIVE_SELECTOR)) {
        cursorContainer.classList.remove("cursor-hover");
      }
    }
  }, { passive: true });

  // Click Animation Trigger
  window.addEventListener("mousedown", () => {
    cursorContainer.classList.add("cursor-clicked");
  }, { passive: true });

  window.addEventListener("mouseup", () => {
    setTimeout(() => {
      cursorContainer.classList.remove("cursor-clicked");
    }, 150);
  }, { passive: true });
});
