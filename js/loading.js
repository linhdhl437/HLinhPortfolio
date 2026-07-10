/* 🎋 Welcome Screen & Fullscreen Video Intro Controller */
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
  
  // Replay triggers (removed nav trigger to keep navbar minimal)
  const heroTrigger = document.getElementById("hero-video-trigger");

  // State to track status
  let isPlayingIntro = true;
  let fadeOutTriggered = false;

  // Check if page loaded with a hash (e.g. back from details page or navigating directly)
  const hasHash = window.location.hash && (
    window.location.hash.startsWith("#stage-node-") || 
    ["#Modau", "#ToiLaAi", "#HanhTrinh", "#NhinLai", "#LienHe"].includes(window.location.hash)
  );

  if (hasHash && overlay) {
    overlay.style.display = "none";
    overlay.classList.add("fade-out");
    isPlayingIntro = false;
    document.body.style.overflow = "";
    
    // Trigger Hero entrance animations immediately
    const heroElements = document.querySelectorAll(".hero-animate");
    heroElements.forEach((el) => {
      el.classList.add("animate-fade-in-up");
      el.style.opacity = "1";
    });
  } else {
    // 1. Lock scrolling initially
    document.body.style.overflow = "hidden";
  }

  // 2. Play intro on welcome screen click (Bypasses browser autoplay block with audio)
  if (enterScreen && video) {
    enterScreen.addEventListener("click", () => {
      // Fade out welcome screen panel
      enterScreen.classList.add("fade-out");
      
      setTimeout(() => {
        enterScreen.style.display = "none";
      }, 800);

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
  const skipBtn = document.getElementById("btn-skip-intro");
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fadeOutTriggered = true;
      exitIntro();
    });
  }

  // 3. Handle transition when video is near the end (crossfade before black screen)
  if (video && overlay) {
    // Listen to timeupdate to start fade-out slightly early (e.g. 0.8s before video ends)
    video.addEventListener("timeupdate", () => {
      if (video.duration && (video.duration - video.currentTime <= 0.8)) {
        if (!fadeOutTriggered) {
          fadeOutTriggered = true;
          exitIntro();
        }
      }
    });

    // Fallback in case timeupdate missed the exact last fraction of a second
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
    
    // Allow page to scroll
    document.body.style.overflow = "";

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
    }, 1200); // Matches CSS transition duration
  }

  // 4. Block user from pausing/skipping the video during playback
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (isPlayingIntro && !e.target.closest("#btn-skip-intro")) {
        e.preventDefault();
        e.stopPropagation();
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

  // 5. Replay Video Intro logic
  function replayIntro() {
    isPlayingIntro = true;
    fadeOutTriggered = false;
    
    // Stop scroll
    document.body.style.overflow = "hidden";
    
    // Show overlay
    overlay.style.display = "block";
    overlay.offsetHeight; // Force reflow
    overlay.classList.remove("fade-out");
    
    // Hide welcome panel (directly show video)
    if (enterScreen) {
      enterScreen.style.display = "none";
    }

    // Play video unmuted
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
