/* 🎋 Lightbox Gallery Controller for HLinh Portfolio */
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!lightbox || !lightboxImg || !lightboxCaption) return;

  let currentGalleryItems = [];
  let currentIndex = -1;

  // Function to open Lightbox
  const openLightbox = (imgSrc, altText, galleryName, element) => {
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = altText || "Hình ảnh sản phẩm";
    
    // Get all items in the same gallery
    if (galleryName) {
      currentGalleryItems = Array.from(
        document.querySelectorAll(`[data-gallery="${galleryName}"]`)
      );
      currentIndex = currentGalleryItems.indexOf(element);
      
      // Show/Hide navigation arrows
      if (currentGalleryItems.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
      } else {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
      }
    } else {
      currentGalleryItems = [];
      currentIndex = -1;
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // lock page scroll
  };

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // restore page scroll
    lightboxImg.src = "";
    lightboxCaption.textContent = "";
  };

  // Next image
  const showNext = () => {
    if (currentGalleryItems.length <= 1 || currentIndex === -1) return;
    currentIndex = (currentIndex + 1) % currentGalleryItems.length;
    const nextEl = currentGalleryItems[currentIndex];
    
    // Check if it's an image or a thumbnail wrapper
    const imgSrc = nextEl.getAttribute("href") || nextEl.getAttribute("src") || nextEl.dataset.src;
    const altText = nextEl.getAttribute("alt") || nextEl.dataset.caption;
    
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = altText || "Hình ảnh sản phẩm";
  };

  // Previous image
  const showPrev = () => {
    if (currentGalleryItems.length <= 1 || currentIndex === -1) return;
    currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    const prevEl = currentGalleryItems[currentIndex];
    
    const imgSrc = prevEl.getAttribute("href") || prevEl.getAttribute("src") || prevEl.dataset.src;
    const altText = prevEl.getAttribute("alt") || prevEl.dataset.caption;
    
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = altText || "Hình ảnh sản phẩm";
  };

  // Event Listeners for click triggers
  document.body.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (trigger) {
      e.preventDefault();
      
      const imgSrc = trigger.getAttribute("href") || trigger.getAttribute("src") || trigger.dataset.src;
      const altText = trigger.getAttribute("alt") || trigger.dataset.caption;
      const galleryName = trigger.dataset.gallery;
      
      openLightbox(imgSrc, altText, galleryName, trigger);
    }
  });

  // Close handlers
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Navigation handlers
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      showNext();
    } else if (e.key === "ArrowLeft") {
      showPrev();
    }
  });
});
