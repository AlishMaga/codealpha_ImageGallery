(function () {
  const gallery = document.getElementById("gallery");
  const cards = Array.from(gallery.querySelectorAll(".card"));
  const filters = Array.from(document.querySelectorAll(".filters button"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbTitle = document.getElementById("lb-title");
  const lbCaption = document.getElementById("lb-caption");
  const lbPrev = document.getElementById("lb-prev");
  const lbNext = document.getElementById("lb-next");
  const lbClose = document.getElementById("lb-close");
  const prevAll = document.getElementById("prevAll");
  const nextAll = document.getElementById("nextAll");

  let currentIndex = 0;
  let activeFilter = "all";

  /* Helper: open lightbox for a given index */
  function openLightbox(index) {
    const card = cards[index];
    if (!card) return;
    const img = card.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt || card.dataset.title || "";
    lbTitle.textContent = card.dataset.title || "";
    lbCaption.textContent = card.dataset.caption || "";
    currentIndex = index;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  function showNext() {
    const visible = getVisibleIndexes();
    const i = visible.indexOf(currentIndex);
    const nextI = (i + 1) % visible.length;
    openLightbox(visible[nextI]);
  }
  function showPrev() {
    const visible = getVisibleIndexes();
    const i = visible.indexOf(currentIndex);
    const prevI = (i - 1 + visible.length) % visible.length;
    openLightbox(visible[prevI]);
  }

  /* returns array of indexes for currently visible (non-filtered) cards */
  function getVisibleIndexes() {
    return cards
      .filter((c) => !c.classList.contains("hidden"))
      .map((c) => Number(c.dataset.index));
  }

  /* Filters */
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      activeFilter = filter;
      applyFilter(filter);
    });
  });

  function applyFilter(filter) {
    cards.forEach((c) => {
      const cat = c.dataset.category;
      if (filter === "all" || cat === filter) {
        c.classList.remove("hidden", "dim");
        c.style.display = "";
      } else {
        c.classList.add("hidden", "dim");
        // keep it in DOM but visually dimmed; we set display none for accessibility
        c.style.display = "block";
      }
    });
  }

  // Card click -> open lightbox
  cards.forEach((c, idx) => {
    c.addEventListener("click", () => openLightbox(idx));
  });

  // Lightbox controls
  lbNext.addEventListener("click", showNext);
  lbPrev.addEventListener("click", showPrev);
  lbClose.addEventListener("click", closeLightbox);

  // Overlay click to close (but not when clicking inner content)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("open")) {
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeLightbox();
    }
  });

  // global next/prev for gallery order (regardless of filter)
  let galleryOrder = cards.map((c) => Number(c.dataset.index));
  prevAll.addEventListener("click", () => {
    // show previous visible or rotate whole gallery
    const visible = getVisibleIndexes();
    if (visible.length === 0) return;
    const idx = visible.indexOf(currentIndex);
    const prevIdx = idx <= 0 ? visible[visible.length - 1] : visible[idx - 1];
    openLightbox(prevIdx);
  });
  nextAll.addEventListener("click", () => {
    const visible = getVisibleIndexes();
    if (visible.length === 0) return;
    const idx = visible.indexOf(currentIndex);
    const nextIdx =
      idx === -1 || idx === visible.length - 1 ? visible[0] : visible[idx + 1];
    openLightbox(nextIdx);
  });

  // Initialize
  applyFilter("all");

  // Accessibility: trap focus when lightbox open (simple)
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      // keep focus within the lb-close and controls
      e.preventDefault();
      lbClose.focus();
    }
  });

  // Smooth image loading: lazy load with IntersectionObserver
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const img = e.target.querySelector("img");
            // already loaded since we used full URLs, but this is where you'd swap data-src
            img.loading = "lazy";
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "200px" }
    );
    cards.forEach((c) => io.observe(c));
  }

  // Responsive: hide large nav buttons on small screens
  function updateNavVisibility() {
    if (window.innerWidth < 760) {
      prevAll.style.display = "none";
      nextAll.style.display = "none";
    } else {
      prevAll.style.display = "";
      nextAll.style.display = "";
    }
  }
  window.addEventListener("resize", updateNavVisibility);
  updateNavVisibility();
})();
