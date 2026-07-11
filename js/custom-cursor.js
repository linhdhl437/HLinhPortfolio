/* 🎋 Custom Calligraphy Brush Cursor Controller */
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
  const lerpCoeff = 0.15; // smoothness factor

  // Track mouse coordinates
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Position dot instantly
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
  });

  // Smooth follow loop for the ring (Lerp)
  function updateRing() {
    // Lerp calculation: Position += (Target - Position) * Coefficient
    ringPos.x += (mouse.x - ringPos.x) * lerpCoeff;
    ringPos.y += (mouse.y - ringPos.y) * lerpCoeff;

    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
    
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Hover states on interactive elements
  const addHoverClass = () => cursorContainer.classList.add("cursor-hover");
  const removeHoverClass = () => cursorContainer.classList.remove("cursor-hover");

  const registerHoverListeners = () => {
    // Select all interactive targets
    const targets = document.querySelectorAll("a, button, [data-lightbox], .cursor-pointer, .btn, .sidebar-link, input, textarea, select");
    
    targets.forEach(target => {
      // Remove old listeners to avoid duplicates
      target.removeEventListener("mouseenter", addHoverClass);
      target.removeEventListener("mouseleave", removeHoverClass);
      
      // Register listeners
      target.addEventListener("mouseenter", addHoverClass);
      target.addEventListener("mouseleave", removeHoverClass);
    });
  };

  // Initial registration
  registerHoverListeners();

  // Re-observe DOM changes to attach hover listeners to dynamically loaded stages
  const observer = new MutationObserver(() => {
    registerHoverListeners();
  });
  
  // Observe body changes
  observer.observe(document.body, { childList: true, subtree: true });

  // Click Animation Trigger
  window.addEventListener("mousedown", () => {
    cursorContainer.classList.add("cursor-clicked");
  });

  window.addEventListener("mouseup", () => {
    // Wait for transition to complete before removing class
    setTimeout(() => {
      cursorContainer.classList.remove("cursor-clicked");
    }, 150);
  });
});
