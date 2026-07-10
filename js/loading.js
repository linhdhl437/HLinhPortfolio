/* 🎋 Welcome Screen & Fullscreen Video Intro Controller */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
  // Detect reload to reset hash and force intro video replay on refresh
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length && navEntries[0].type === "reload") {
    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }
    window.scrollTo(0, 0);
  }

  const overlay = document.getElementById("intro-video-overlay");
  const enterScreen = document.getElementById("intro-enter-screen");
  const startBtn = document.getElementById("btn-start-intro");
  const video = document.getElementById("intro-video");
  const skipBtn = document.getElementById("btn-skip-intro");
  
  // Hide skip button initially
  if (skipBtn) {
    skipBtn.style.display = "none";
    skipBtn.classList.remove("visible");
  }
  
  // Replay triggers (removed nav trigger to keep navbar minimal)
  const heroTrigger = document.getElementById("hero-video-trigger");

  // State to track status
  let isPlayingIntro = true;
  let fadeOutTriggered = false;
  let skipBtnTimeout;

  // Helper to prevent wheel and touch gestures during video playback
  function preventDefault(e) {
    e.preventDefault();
  }

  // Check if page loaded with a hash (e.g. back from details page or navigating directly)
  const hasHash = window.location.hash && (
    window.location.hash.startsWith("#stage-node-") || 
    ["#Modau", "#ToiLaAi", "#HanhTrinh", "#NhinLai", "#LienHe"].includes(window.location.hash)
  );

  // ============================================================
  // PAGE TRANSITION: Fade-in when navigating back from stage details
  // ============================================================
  const isComingFromDetails = document.referrer.includes('stage_details');
  if (isComingFromDetails || (window.location.hash && window.location.hash.startsWith('#stage-node-'))) {
    // Briefly make body transparent for a smooth fade-in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
      });
    });
  }

  if (hasHash && overlay) {
    overlay.style.display = "none";
    overlay.classList.add("fade-out");
    isPlayingIntro = false;
    document.body.style.overflow = "";
    
    // Immediately reveal Hero intro section elements (no opacity 0 lockout)
    const heroElements = document.querySelectorAll(".hero-animate");
    heroElements.forEach((el) => {
      el.classList.add("animate-fade-in-up");
      el.style.opacity = "1";
    });
    
    // ---- Activate correct tab SYNCHRONOUSLY (before any paint) ----
    const hash = window.location.hash;
    if (hash.startsWith("#stage-node-")) {
      const stageNum = hash.replace("#stage-node-", "");
      const targetTabItem = document.querySelector(`.journey-tab-item[data-target="tab-stage-${stageNum}"]`);
      const targetTabPane = document.getElementById(`tab-stage-${stageNum}`);
      
      if (targetTabItem && targetTabPane) {
        document.querySelectorAll(".journey-tab-item").forEach(i => i.classList.remove("active"));
        document.querySelectorAll(".journey-tab-pane").forEach(p => {
          p.classList.remove("active");
          p.style.opacity = "0";
          p.style.transform = "translateY(10px)";
        });
        targetTabItem.classList.add("active");
        targetTabPane.classList.add("active");
        targetTabPane.style.opacity = "1";
        targetTabPane.style.transform = "translateY(0)";
        
        // Scroll tab item into view inside the sidebar
        setTimeout(() => {
          targetTabItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 200);
      }
    }

    // Scroll to target section after layout has settled
    setTimeout(() => {
      let targetNode = null;
      if (hash.startsWith("#stage-node-")) {
        targetNode = document.getElementById("HanhTrinh");
      } else {
        try {
          targetNode = document.querySelector(hash);
        } catch (e) {
          targetNode = null;
        }
      }
      
      if (targetNode) {
        const headerEl = document.getElementById('site-header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 70;
        const targetOffset = targetNode.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetOffset,
          behavior: "auto"
        });
        
        // Subtle highlight pulse on the journey section to confirm arrival
        targetNode.style.transition = 'box-shadow 0.5s ease';
        targetNode.style.boxShadow = 'inset 0 0 0 2px rgba(184,144,71,0.3)';
        setTimeout(() => {
          targetNode.style.boxShadow = '';
        }, 800);
      }
    }, 80);
  } else {
    // Lock scrolling initially for welcome intro video playback
    document.body.style.overflow = "hidden";
  }

  // 2. Play intro on welcome screen click
  if (enterScreen && video) {
    let enterClicked = false;
    enterScreen.addEventListener("click", () => {
      if (enterClicked) return;
      enterClicked = true;
      
      // Fade out welcome screen panel
      enterScreen.classList.add("fade-out");
      
      setTimeout(() => {
        enterScreen.style.display = "none";
      }, 800);

      // Lock mouse wheel and touch scroll during play
      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });

      // Play video with audio
      video.muted = false;
      video.currentTime = 0;
      fadeOutTriggered = false;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Unmuted autoplay was blocked, fallback to muted: ", error);
          video.muted = true;
          video.play();
        });
      }
    });
  }

  // 2.1. Handle Skip Intro Button Click
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fadeOutTriggered = true;
      exitIntro();
    });
  }

  // 3. Handle transition when video is near the end
  if (video && overlay) {
    video.addEventListener("timeupdate", () => {
      if (video.duration && (video.duration - video.currentTime <= 0.8)) {
        if (!fadeOutTriggered) {
          fadeOutTriggered = true;
          exitIntro();
        }
      }
    });

    video.addEventListener("ended", () => {
      if (!fadeOutTriggered) {
        fadeOutTriggered = true;
        exitIntro();
      }
    });
  }

  function exitIntro() {
    isPlayingIntro = false;
    overlay.classList.add("fade-out");
    
    // Unlock scrolling
    document.body.style.overflow = "";
    window.removeEventListener("wheel", preventDefault);
    window.removeEventListener("touchmove", preventDefault);

    // Scroll handling based on hash routing
    const hash = window.location.hash;
    if (hash) {
      let targetNode = null;
      if (hash.startsWith("#stage-node-")) {
        targetNode = document.getElementById("HanhTrinh");
      } else {
        try {
          targetNode = document.querySelector(hash);
        } catch (e) {
          targetNode = null;
        }
      }
      
      if (targetNode) {
        const headerHeight = 70; // Matches navbar height
        const targetOffset = targetNode.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetOffset,
          behavior: "auto" // Jump instantly
        });
      } else {
        // Fallback to top if target element not found
        window.scrollTo(0, 0);
        window.history.replaceState(null, null, "#Modau");
      }
    } else {
      // Scroll to the very top section (Modau) immediately on exit if no hash is present
      window.scrollTo(0, 0);
      window.history.replaceState(null, null, "#Modau");
    }

    setTimeout(() => {
      overlay.style.display = "none";
      video.pause();
      
      // Trigger Hero entrance animations
      const heroElements = document.querySelectorAll(".hero-animate");
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("animate-fade-in-up");
          el.style.opacity = "1";
        }, index * 150);
      });
    }, 1200);
  }

  // 4. Tap video to toggle Skip button & Lock all other clicks/interactions
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (!isPlayingIntro) return;
      
      // If click skip button, let it handle
      if (e.target.closest("#btn-skip-intro")) return;
      
      // If welcome panel is still up, let it handle
      if (enterScreen && enterScreen.style.display !== "none") return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle skip button visibility
      if (skipBtn) {
        const isCurrentlyVisible = skipBtn.classList.contains("visible");
        if (!isCurrentlyVisible) {
          skipBtn.style.display = "block";
          skipBtn.offsetHeight; // Force reflow
          skipBtn.classList.add("visible");
          
          // Hide again after 3 seconds of inactivity
          clearTimeout(skipBtnTimeout);
          skipBtnTimeout = setTimeout(() => {
            skipBtn.classList.remove("visible");
            setTimeout(() => {
              if (!skipBtn.classList.contains("visible")) {
                skipBtn.style.display = "none";
              }
            }, 300);
          }, 3000);
        } else {
          // Hide immediately
          skipBtn.classList.remove("visible");
          setTimeout(() => {
            if (!skipBtn.classList.contains("visible")) {
              skipBtn.style.display = "none";
            }
          }, 300);
        }
      }
    });

    // Block keyboard controls (Spacebar/Enter) that could pause the video
    window.addEventListener("keydown", (e) => {
      if (isPlayingIntro && (overlay.style.display !== "none" && !overlay.classList.contains("fade-out"))) {
        if (["Space", " ", "Enter"].includes(e.key)) {
          e.preventDefault();
        }
      }
    }, { passive: false });
  }

  // 5. Replay Video Intro logic (Locks scroll & restarts lock listeners)
  function replayIntro() {
    isPlayingIntro = true;
    fadeOutTriggered = false;
    
    // Stop scroll & add locks
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    
    // Hide skip button initially
    if (skipBtn) {
      skipBtn.classList.remove("visible");
      skipBtn.style.display = "none";
    }

    // Show overlay
    overlay.style.display = "block";
    overlay.offsetHeight;
    overlay.classList.remove("fade-out");
    
    if (enterScreen) {
      enterScreen.style.display = "none";
    }

    // Play video
    video.muted = false;
    video.currentTime = 0;
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        video.muted = true;
        video.play();
      });
    }
  }

  if (heroTrigger) {
    heroTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      replayIntro();
    });
  }
});
