const header = document.querySelector("[data-header]");
const hero = document.querySelector(".hero");
const pageLoader = document.querySelector("[data-page-loader]");
const loaderProgress = document.querySelector("[data-loader-progress]");
const typePrefix = document.querySelector("[data-type-prefix]");
const typeStrong = document.querySelector("[data-type-strong]");
const typeCaret = document.querySelector("[data-type-caret]");
const textRevealItems = Array.from(
  document.querySelectorAll(
    "main h1, main h2, main h3, main p, main .section-kicker, main .service-number, main .service-grid span, main .timeline span, main .about-values span, main .contact-form label span, footer span"
  )
).filter((item) => !item.closest(".hero, .how-work, .project-folders"));
const objectRevealItems = Array.from(
  document.querySelectorAll(
    ".intro-content, .intro-cta, .service-grid article, .timeline article, .contact-form, .folder-card img, .about-hero-content, .about-values article"
  )
).filter((item) => !item.closest(".hero, .how-work"));
const howWork = document.querySelector("[data-how-work]");
const howWorkScene = document.querySelector(".how-work-scene");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const navCtas = document.querySelectorAll(".nav-cta");
const form = document.querySelector(".contact-form");
const note = document.querySelector("[data-form-note]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileSceneQuery = window.matchMedia("(max-width: 980px)");

if (pageLoader) {
  document.body.classList.add("is-loading");
}

const runPageLoader = () => {
  if (!pageLoader || !loaderProgress) {
    return;
  }

  const loaderLogo = pageLoader.querySelector(".loader-logo");
  const duration = prefersReducedMotion ? 700 : 3800;
  const start = performance.now();
  const loaderStops = [
    { at: 0, scene: 0 },
    { at: 0.16, scene: 0.18 },
    { at: 0.27, scene: 0.18 },
    { at: 0.43, scene: 0.56 },
    { at: 0.54, scene: 0.56 },
    { at: 0.70, scene: 0.87 },
    { at: 0.81, scene: 0.87 },
    { at: 0.94, scene: 0.995 },
    { at: 1, scene: 0.995 },
  ];

  const readLoaderSceneProgress = (value) => {
    for (let index = 0; index < loaderStops.length - 1; index += 1) {
      const current = loaderStops[index];
      const next = loaderStops[index + 1];

      if (value <= next.at) {
        const localProgress = (value - current.at) / Math.max(next.at - current.at, 0.001);
        const easedProgress = easeInOutCubic(clamp(localProgress, 0, 1));

        return current.scene + (next.scene - current.scene) * easedProgress;
      }
    }

    return loaderStops[loaderStops.length - 1].scene;
  };

  if (loaderLogo) {
    applyHowWorkLogoState(loaderLogo, getHowWorkLogoState(0), { colorOnly: true });
  }

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const sceneProgress = readLoaderSceneProgress(progress);
    const percentage = Math.round(progress * 100);
    loaderProgress.textContent = `LOADING ${percentage}%`;

    if (loaderLogo) {
      applyHowWorkLogoState(loaderLogo, getHowWorkLogoState(sceneProgress), { colorOnly: true });
    }

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    pageLoader.classList.add("is-loaded");
    document.body.classList.remove("is-loading");

    window.setTimeout(() => {
      pageLoader.remove();
    }, 560);
  };

  window.requestAnimationFrame(tick);
};

const updateHeader = () => {
  if (header.classList.contains("is-menu-open")) {
    header.classList.add("is-scrolled");
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (pageLoader) {
  if (document.readyState === "complete") {
    runPageLoader();
  } else {
    window.addEventListener("load", runPageLoader, { once: true });
  }
}

const updateHowWorkCanvas = () => {
  if (!howWork || !document.body.classList.contains("page-about")) {
    return;
  }

  const rect = howWork.getBoundingClientRect();
  const isActive = rect.top < window.innerHeight && rect.bottom > 0;
  document.body.classList.toggle("is-how-work-active", isActive);
};

let menuScrollY = 0;

const lockPageScroll = () => {
  menuScrollY = window.scrollY;
};

const unlockPageScroll = () => {
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, menuScrollY);
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
  updateHeader();
};

const restoreMenuScroll = () => {
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, menuScrollY);
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
};

const blockMenuScroll = (event) => {
  if (!document.body.classList.contains("is-menu-open")) {
    return;
  }

  event.preventDefault();
};

const blockMenuScrollKeys = (event) => {
  if (!document.body.classList.contains("is-menu-open")) {
    return;
  }

  const scrollKeys = [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
  if (scrollKeys.includes(event.key)) {
    event.preventDefault();
  }
};

const setMenuOpen = (isOpen) => {
  if (!menuToggle || !navLinks) {
    return;
  }

  const wasOpen = header.classList.contains("is-menu-open");
  if (isOpen === wasOpen) {
    return;
  }

  if (isOpen) {
    lockPageScroll();
    if (howWorkProgressFrame) {
      window.cancelAnimationFrame(howWorkProgressFrame);
      howWorkProgressFrame = 0;
      howWorkTargetProgress = howWorkRenderProgress;
    }
    if (limitedScrollFrame) {
      window.cancelAnimationFrame(limitedScrollFrame);
      limitedScrollFrame = 0;
    }
  }

  header.classList.toggle("is-menu-open", isOpen);
  document.body.classList.toggle("is-menu-open", isOpen);
  document.documentElement.classList.toggle("is-menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

  if (isOpen) {
    header.classList.add("is-scrolled");
    restoreMenuScroll();
  } else {
    unlockPageScroll();
    updateHowWork();
  }
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-menu-open"));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!header.classList.contains("is-menu-open")) {
      return;
    }

    const target = event.target;
    if (navLinks.contains(target) || menuToggle.contains(target)) {
      return;
    }

    setMenuOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("wheel", blockMenuScroll, { passive: false });
  window.addEventListener("touchmove", blockMenuScroll, { passive: false });
  window.addEventListener("keydown", blockMenuScrollKeys);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setMenuOpen(false);
    }
  });
}

const ctaHoverColors = [
  { background: "#fc3d9d", color: "#fff", iconFilter: "invert(1)" },
  { background: "#9ff4d4", color: "#171716", iconFilter: "none" },
];

navCtas.forEach((cta) => {
  const applyRandomCtaHover = () => {
    const color = ctaHoverColors[Math.floor(Math.random() * ctaHoverColors.length)];
    cta.style.setProperty("--nav-cta-hover-bg", color.background);
    cta.style.setProperty("--nav-cta-hover-color", color.color);
    cta.style.setProperty("--nav-cta-hover-icon-filter", color.iconFilter);
    cta.style.backgroundColor = color.background;
    cta.style.color = color.color;
    cta.style.borderColor = color.background;
    const icon = cta.querySelector("img");
    if (icon) {
      icon.style.filter = color.iconFilter;
    }
    cta.classList.add("is-random-hover");
  };

  cta.addEventListener("pointerenter", applyRandomCtaHover);
  cta.addEventListener("focus", applyRandomCtaHover);
  cta.addEventListener("pointerleave", () => {
    cta.classList.remove("is-random-hover");
    cta.style.backgroundColor = "";
    cta.style.color = "";
    cta.style.borderColor = "";
    const icon = cta.querySelector("img");
    if (icon) {
      icon.style.filter = "";
    }
  });
  cta.addEventListener("blur", () => {
    cta.classList.remove("is-random-hover");
    cta.style.backgroundColor = "";
    cta.style.color = "";
    cta.style.borderColor = "";
    const icon = cta.querySelector("img");
    if (icon) {
      icon.style.filter = "";
    }
  });
});

const randomPercent = (min, max) => `${Math.round(min + Math.random() * (max - min))}%`;

const moveHighlights = () => {
  hero.style.setProperty("--pink-x", randomPercent(2, 34));
  hero.style.setProperty("--pink-y", randomPercent(0, 32));
  hero.style.setProperty("--green-x", randomPercent(48, 88));
  hero.style.setProperty("--green-y", randomPercent(0, 22));
  hero.style.setProperty("--blue-x", randomPercent(28, 78));
  hero.style.setProperty("--blue-y", randomPercent(18, 62));
};

if (hero) {
  setInterval(moveHighlights, 8000);
}

const typeHeroTitle = () => {
  if (!typePrefix || !typeStrong || !typeCaret) {
    return;
  }

  const prefix = "We Post with ";
  const strong = "Purpose";
  const full = prefix + strong;
  let index = 0;

  const tick = () => {
    const current = full.slice(0, index);
    typePrefix.textContent = current.slice(0, prefix.length);
    typeStrong.textContent = current.slice(prefix.length);
    index += 1;

    if (index <= full.length) {
      window.setTimeout(tick, index < prefix.length ? 58 : 72);
    } else {
      typeCaret.classList.add("is-hidden");
      typeStrong.classList.add("is-looping");
    }
  };

  tick();
};

typeHeroTitle();

if ("IntersectionObserver" in window) {
  const objectRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-object-visible", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.16 }
  );

  objectRevealItems.forEach((item) => {
    item.classList.add("object-dissolve");
    objectRevealObserver.observe(item);
  });

  const textRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-text-visible", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.18 }
  );

  textRevealItems.forEach((item) => {
    item.classList.add("text-dissolve");
    textRevealObserver.observe(item);
  });
} else {
  textRevealItems.forEach((item) => item.classList.add("is-text-visible"));
  objectRevealItems.forEach((item) => item.classList.add("is-object-visible"));
}

if (form && note) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    note.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      note.textContent = "Thanks for reaching out. We'll review your project and get back to you shortly.";
      form.reset();
    } catch (error) {
      note.textContent = "Sorry, the message could not be sent. Please email namanacreative@gmail.com directly.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const progressBetween = (value, start, end) => clamp((value - start) / (end - start), 0, 1);
const smoothProgress = (value) => value * value * (3 - 2 * value);
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const visibleCropOffset = (top, right, bottom, left) => {
  const centerX = (left + (100 - right)) / 2;
  const centerY = (top + (100 - bottom)) / 2;

  return {
    x: 50 - centerX,
    y: 50 - centerY,
  };
};

const getHowWorkLogoState = (progress) => {
  const morphProgress = easeInOutCubic(progressBetween(progress, 0.10, 0.16));
  const empathyFinal = easeInOutCubic(progressBetween(progress, 0.16, 0.18));
  const empathyOut = easeInOutCubic(progressBetween(progress, 0.27, 0.32));
  const colorReturn = easeInOutCubic(progressBetween(progress, 0.32, 0.36));
  const scrollRotateProgress = easeInOutCubic(progressBetween(progress, 0.36, 0.42));
  const blueRemove = easeInOutCubic(progressBetween(progress, 0.43, 0.49));
  const cropProgress = easeInOutCubic(progressBetween(progress, 0.47, 0.53));
  const discussionFinal = easeInOutCubic(progressBetween(progress, 0.53, 0.56));
  const discussionOut = easeInOutCubic(progressBetween(progress, 0.68, 0.73));
  const logoRestore = easeInOutCubic(progressBetween(progress, 0.73, 0.78));
  const creationBlueGone = easeInOutCubic(progressBetween(progress, 0.74, 0.80));
  const creationShapeCrop = easeInOutCubic(progressBetween(progress, 0.76, 0.82));
  const creationTurn = easeInOutCubic(progressBetween(progress, 0.78, 0.84));
  const creationFinal = easeInOutCubic(progressBetween(progress, 0.84, 0.87));
  const creationOut = easeInOutCubic(progressBetween(progress, 0.925, 0.95));
  const growthReturn = easeInOutCubic(progressBetween(progress, 0.925, 0.95));
  const growthRemove = easeInOutCubic(progressBetween(progress, 0.95, 0.97));
  const growthWhite = easeInOutCubic(progressBetween(progress, 0.965, 0.98));
  const empathyWhite = empathyFinal * (1 - empathyOut);
  const discussionWhite = discussionFinal * (1 - discussionOut);
  const creationWhite = creationFinal * (1 - creationOut);
  const logoWhite = Math.max(empathyWhite, discussionWhite, creationWhite, growthWhite);
  const growthCircle = easeInOutCubic(progressBetween(progress, 0.965, 0.98));
  const logoCircleOpacity = Math.max(empathyWhite, discussionWhite, creationWhite, growthCircle);
  const preDiscussionBlue = progress < 0.32 ? 1 - morphProgress : colorReturn;
  const preDiscussionSage = progress < 0.32 ? 1 - morphProgress : colorReturn;
  const preDiscussionPink = progress < 0.32 ? 1 - morphProgress * 0.18 : 0.82 + colorReturn * 0.18;

  const rotateProgress = scrollRotateProgress;
  const restoredLogo = rotateProgress * (1 - logoRestore);
  const logoRotate = (restoredLogo * 180 - 45 * creationTurn) * (1 - growthReturn);
  const logoFlip = restoredLogo * 180 * (1 - growthReturn);
  const logoBlueOpacity =
    (preDiscussionBlue * (1 - blueRemove) * (1 - logoRestore) + logoRestore * (1 - creationBlueGone)) *
    (1 - growthRemove);
  const logoSageOpacity = preDiscussionSage * (1 - logoRestore) + logoRestore;
  const logoPinkOpacity =
    (preDiscussionPink * (1 - logoRestore) + logoRestore) * (1 - growthRemove);
  const finalCrop = cropProgress * (1 - logoRestore) * (1 - growthReturn);
  const boxTop = 0;
  const growthCropRight = 0.2;
  const growthCropBottom = 60.6;
  const growthCropLeft = 59.6;
  const boxRight = creationShapeCrop * 12 * (1 - growthReturn) + growthCropRight * growthRemove;
  const boxBottom = creationShapeCrop * 46 * (1 - growthReturn) + growthCropBottom * growthRemove;
  const boxLeft = creationShapeCrop * 34 * (1 - growthReturn) + growthCropLeft * growthRemove;
  const cropLeft = finalCrop * 50 + boxLeft;
  const cropRight = boxRight;
  const cropTop = boxTop;
  const cropBottom = boxBottom;
  const visibleOffset = visibleCropOffset(cropTop, cropRight, cropBottom, cropLeft);
  const finalCreationOffset = visibleCropOffset(0, 12, 46, 84);
  const creationPixelOffsetX = -12.5;
  const creationPixelOffsetY = 31;
  const creationRotationCentering = creationShapeCrop * creationTurn * (1 - growthReturn);
  const logoVisibleX =
    visibleOffset.x + (creationPixelOffsetX - finalCreationOffset.x) * creationRotationCentering - growthRemove * 29;
  const logoVisibleY =
    visibleOffset.y + (creationPixelOffsetY - finalCreationOffset.y) * creationRotationCentering + growthRemove * 29;
  const empathyScaleCorrection = empathyWhite * 0.14 * (1 - discussionWhite) * (1 - creationWhite) * (1 - growthRemove);
  const logoScale = 1 - empathyScaleCorrection + creationShapeCrop * 0.32 * (1 - growthReturn) + growthRemove * 0.74;

  return {
    blueOpacity: logoBlueOpacity,
    sageOpacity: logoSageOpacity,
    pinkOpacity: logoPinkOpacity,
    white: logoWhite,
    circleOpacity: logoCircleOpacity,
    rotate: logoRotate,
    flip: logoFlip,
    visibleX: logoVisibleX,
    visibleY: logoVisibleY,
    scale: logoScale,
    maskSolid: 72 + creationShapeCrop * 28,
    cropTop,
    cropRight,
    cropBottom,
    cropLeft,
  };
};

const applyHowWorkLogoState = (target, state, options = {}) => {
  const logoWhite = options.colorOnly ? 0 : state.white;
  const circleOpacity = options.colorOnly ? 0 : state.circleOpacity;

  target.style.setProperty("--work-logo-blue-opacity", state.blueOpacity.toFixed(3));
  target.style.setProperty("--work-logo-sage-opacity", state.sageOpacity.toFixed(3));
  target.style.setProperty("--work-logo-pink-opacity", state.pinkOpacity.toFixed(3));
  target.style.setProperty("--work-logo-white", logoWhite.toFixed(3));
  target.style.setProperty("--work-logo-circle-opacity", circleOpacity.toFixed(3));
  target.style.setProperty("--work-logo-rotate", `${state.rotate.toFixed(1)}deg`);
  target.style.setProperty("--work-logo-flip-y", `${state.flip.toFixed(1)}deg`);
  target.style.setProperty("--work-logo-center-offset", "0%");
  target.style.setProperty("--work-logo-center-y-offset", "0%");
  target.style.setProperty("--work-logo-visible-x", `${state.visibleX.toFixed(1)}%`);
  target.style.setProperty("--work-logo-visible-y", `${state.visibleY.toFixed(1)}%`);
  target.style.setProperty("--work-logo-scale", state.scale.toFixed(3));
  target.style.setProperty("--work-logo-origin-x", "50%");
  target.style.setProperty("--work-logo-origin-y", "50%");
  target.style.setProperty("--work-logo-mask-solid", `${state.maskSolid.toFixed(1)}%`);
  target.style.setProperty("--work-logo-crop-top", `${state.cropTop.toFixed(1)}%`);
  target.style.setProperty("--work-logo-crop-right", `${state.cropRight.toFixed(1)}%`);
  target.style.setProperty("--work-logo-crop-bottom", `${state.cropBottom.toFixed(1)}%`);
  target.style.setProperty("--work-logo-crop-left", `${state.cropLeft.toFixed(1)}%`);
};

let howWorkTargetProgress = 0;
let howWorkRenderProgress = 0;
let howWorkProgressReady = false;
let howWorkProgressFrame = 0;

const readHowWorkProgress = () => {
  if (!howWork || prefersReducedMotion) {
    return 0;
  }

  const rect = howWork.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const travel = Math.max(howWork.offsetHeight - viewportHeight, 1);

  return clamp(-rect.top / travel, 0, 1);
};

const renderHowWork = (progress) => {
  const introFade = easeInOutCubic(progressBetween(progress, 0.05, 0.10));
  const morphProgress = easeInOutCubic(progressBetween(progress, 0.10, 0.16));
  const empathyFinal = easeInOutCubic(progressBetween(progress, 0.16, 0.18));
  const empathyReveal = easeInOutCubic(progressBetween(progress, 0.18, 0.21));
  const empathyOut = easeInOutCubic(progressBetween(progress, 0.27, 0.32));
  const colorReturn = easeInOutCubic(progressBetween(progress, 0.32, 0.36));
  const scrollRotateProgress = easeInOutCubic(progressBetween(progress, 0.36, 0.42));
  const blueRemove = easeInOutCubic(progressBetween(progress, 0.43, 0.49));
  const cropProgress = easeInOutCubic(progressBetween(progress, 0.47, 0.53));
  const discussionFinal = easeInOutCubic(progressBetween(progress, 0.53, 0.56));
  const discussionReveal = easeInOutCubic(progressBetween(progress, 0.56, 0.60));
  const discussionOut = easeInOutCubic(progressBetween(progress, 0.68, 0.73));
  const logoRestore = easeInOutCubic(progressBetween(progress, 0.73, 0.78));
  const creationBlueGone = easeInOutCubic(progressBetween(progress, 0.74, 0.80));
  const creationShapeCrop = easeInOutCubic(progressBetween(progress, 0.76, 0.82));
  const creationTurn = easeInOutCubic(progressBetween(progress, 0.78, 0.84));
  const creationFinal = easeInOutCubic(progressBetween(progress, 0.84, 0.87));
  const creationReveal = easeInOutCubic(progressBetween(progress, 0.87, 0.90));
  const creationOut = easeInOutCubic(progressBetween(progress, 0.925, 0.95));
  const growthReturn = easeInOutCubic(progressBetween(progress, 0.925, 0.95));
  const growthRemove = easeInOutCubic(progressBetween(progress, 0.95, 0.97));
  const growthWhite = easeInOutCubic(progressBetween(progress, 0.965, 0.98));
  const growthReveal = easeInOutCubic(progressBetween(progress, 0.98, 0.995));
  const empathyWhite = empathyFinal * (1 - empathyOut);
  const discussionWhite = discussionFinal * (1 - discussionOut);
  const creationWhite = creationFinal * (1 - creationOut);
  const logoWhite = Math.max(empathyWhite, discussionWhite, creationWhite, growthWhite);
  const growthCircle = easeInOutCubic(progressBetween(progress, 0.965, 0.98));
  const logoCircleOpacity = Math.max(empathyWhite, discussionWhite, creationWhite, growthCircle);
  const preDiscussionBlue = progress < 0.32 ? 1 - morphProgress : colorReturn;
  const preDiscussionSage = progress < 0.32 ? 1 - morphProgress : colorReturn;
  const preDiscussionPink = progress < 0.32 ? 1 - morphProgress * 0.18 : 0.82 + colorReturn * 0.18;

  const rotateProgress = scrollRotateProgress;
  const restoredLogo = rotateProgress * (1 - logoRestore);
  const logoRotate = (restoredLogo * 180 - 45 * creationTurn) * (1 - growthReturn);
  const logoFlip = restoredLogo * 180 * (1 - growthReturn);
  const logoBlueOpacity =
    (preDiscussionBlue * (1 - blueRemove) * (1 - logoRestore) + logoRestore * (1 - creationBlueGone)) *
    (1 - growthRemove);
  const logoSageOpacity = preDiscussionSage * (1 - logoRestore) + logoRestore;
  const logoPinkOpacity =
    (preDiscussionPink * (1 - logoRestore) + logoRestore) * (1 - growthRemove);
  const finalCrop = cropProgress * (1 - logoRestore) * (1 - growthReturn);
  const boxTop = 0;
  const growthCropRight = 0.2;
  const growthCropBottom = 60.6;
  const growthCropLeft = 59.6;
  const boxRight = creationShapeCrop * 12 * (1 - growthReturn) + growthCropRight * growthRemove;
  const boxBottom = creationShapeCrop * 46 * (1 - growthReturn) + growthCropBottom * growthRemove;
  const boxLeft = creationShapeCrop * 34 * (1 - growthReturn) + growthCropLeft * growthRemove;
  const cropLeft = finalCrop * 50 + boxLeft;
  const cropRight = boxRight;
  const cropTop = boxTop;
  const cropBottom = boxBottom;
  const visibleOffset = visibleCropOffset(cropTop, cropRight, cropBottom, cropLeft);
  const finalCreationOffset = visibleCropOffset(0, 12, 46, 84);
  const creationPixelOffsetX = -12.5;
  const creationPixelOffsetY = 31;
  const creationRotationCentering = creationShapeCrop * creationTurn * (1 - growthReturn);
  const logoVisibleX =
    visibleOffset.x + (creationPixelOffsetX - finalCreationOffset.x) * creationRotationCentering - growthRemove * 29;
  const logoVisibleY =
    visibleOffset.y + (creationPixelOffsetY - finalCreationOffset.y) * creationRotationCentering + growthRemove * 29;
  const empathyScaleCorrection = empathyWhite * 0.14 * (1 - discussionWhite) * (1 - creationWhite) * (1 - growthRemove);
  const logoScale = 1 - empathyScaleCorrection + creationShapeCrop * 0.32 * (1 - growthReturn) + growthRemove * 0.74;

  howWork.style.setProperty("--work-darkness", progress.toFixed(3));
  howWork.style.setProperty("--work-intro", introFade.toFixed(3));
  howWork.style.setProperty("--work-empathy", (empathyReveal * (1 - empathyOut)).toFixed(3));
  howWork.style.setProperty("--work-shade", (0.14 + progress * 0.68).toFixed(3));
  howWork.style.setProperty("--work-grain-opacity", (0.34 + progress * 0.2).toFixed(3));
  howWork.style.setProperty("--work-bottom-vignette", (0.16 + progress * 0.44).toFixed(3));
  howWork.style.setProperty("--work-bottom-overlay", (0.32 + progress * 0.5).toFixed(3));
  howWork.style.setProperty("--work-logo-blue-opacity", logoBlueOpacity.toFixed(3));
  howWork.style.setProperty("--work-logo-sage-opacity", logoSageOpacity.toFixed(3));
  howWork.style.setProperty("--work-logo-pink-opacity", logoPinkOpacity.toFixed(3));
  howWork.style.setProperty("--work-logo-white", logoWhite.toFixed(3));
  howWork.style.setProperty("--work-logo-circle-opacity", logoCircleOpacity.toFixed(3));
  howWork.style.setProperty("--work-logo-rotate", `${logoRotate.toFixed(1)}deg`);
  howWork.style.setProperty("--work-logo-flip-y", `${logoFlip.toFixed(1)}deg`);
  howWork.style.setProperty("--work-logo-center-offset", "0%");
  howWork.style.setProperty("--work-logo-center-y-offset", "0%");
  howWork.style.setProperty("--work-logo-visible-x", `${logoVisibleX.toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-visible-y", `${logoVisibleY.toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-scale", logoScale.toFixed(3));
  howWork.style.setProperty("--work-logo-origin-x", "50%");
  howWork.style.setProperty("--work-logo-origin-y", "50%");
  howWork.style.setProperty("--work-logo-mask-solid", `${(72 + creationShapeCrop * 28).toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-crop-top", `${cropTop.toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-crop-right", `${cropRight.toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-crop-bottom", `${cropBottom.toFixed(1)}%`);
  howWork.style.setProperty("--work-logo-crop-left", `${cropLeft.toFixed(1)}%`);
  howWork.style.setProperty("--work-title-opacity", (1 - introFade).toFixed(3));
  howWork.style.setProperty("--work-title-y", `${(introFade * -42).toFixed(1)}px`);
  howWork.style.setProperty("--work-step-opacity", (empathyReveal * (1 - empathyOut)).toFixed(3));
  howWork.style.setProperty("--work-step-y", `${((1 - empathyReveal) * 32 - empathyOut * 22).toFixed(1)}px`);
  howWork.style.setProperty("--work-discussion-opacity", (discussionReveal * (1 - discussionOut)).toFixed(3));
  howWork.style.setProperty("--work-discussion-y", `${((1 - discussionReveal) * 32).toFixed(1)}px`);
  howWork.style.setProperty("--work-creation-opacity", (creationReveal * (1 - creationOut)).toFixed(3));
  howWork.style.setProperty("--work-creation-y", `${((1 - creationReveal) * 32 - creationOut * 22).toFixed(1)}px`);
  howWork.style.setProperty("--work-growth-opacity", growthReveal.toFixed(3));
  howWork.style.setProperty("--work-growth-y", `${((1 - growthReveal) * 32).toFixed(1)}px`);
};

const animateHowWorkProgress = () => {
  const distance = howWorkTargetProgress - howWorkRenderProgress;

  if (Math.abs(distance) < 0.001) {
    howWorkRenderProgress = howWorkTargetProgress;
    renderHowWork(howWorkRenderProgress);
    howWorkProgressFrame = 0;
    return;
  }

  howWorkRenderProgress += distance * 0.24;
  renderHowWork(howWorkRenderProgress);
  howWorkProgressFrame = window.requestAnimationFrame(animateHowWorkProgress);
};

const updateHowWork = () => {
  if (!howWork || prefersReducedMotion || document.body.classList.contains("is-menu-open")) {
    return;
  }

  howWorkTargetProgress = readHowWorkProgress();

  if (!howWorkProgressReady) {
    howWorkRenderProgress = howWorkTargetProgress;
    howWorkProgressReady = true;
    renderHowWork(howWorkRenderProgress);
    return;
  }

  if (!howWorkProgressFrame) {
    howWorkProgressFrame = window.requestAnimationFrame(animateHowWorkProgress);
  }
};

const normalizeWheelDelta = (event) => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
};

let limitedScrollTarget = 0;
let limitedScrollFrame = 0;
let limitedScrollLocked = false;
let howWorkTouchActive = false;
let howWorkTouchStartY = 0;
let howWorkTouchLastY = 0;
let howWorkTouchStartProgress = 0;
let howWorkTouchStartIndex = 0;
let howWorkTouchHandled = false;

const getMaxScrollY = () =>
  Math.max(0, document.documentElement.scrollHeight - (window.innerHeight || 1));

const animateLimitedScroll = () => {
  const distance = limitedScrollTarget - window.scrollY;

  if (Math.abs(distance) < 1) {
    window.scrollTo(0, limitedScrollTarget);
    limitedScrollFrame = 0;
    limitedScrollLocked = false;
    return;
  }

  const currentScroll = window.scrollY;
  const nextScroll = clamp(currentScroll + distance * 0.2, 0, getMaxScrollY());
  window.scrollTo(0, nextScroll);

  if (Math.abs(window.scrollY - currentScroll) < 0.5) {
    limitedScrollTarget = window.scrollY;
    limitedScrollFrame = 0;
    limitedScrollLocked = false;
    return;
  }

  limitedScrollFrame = window.requestAnimationFrame(animateLimitedScroll);
};

const getHowWorkMetrics = () => {
  const viewportHeight = window.innerHeight || 1;
  const sectionStart = howWork.offsetTop;
  const sectionEnd = howWork.offsetTop + howWork.offsetHeight - viewportHeight;
  const travel = Math.max(howWork.offsetHeight - viewportHeight, 1);

  return { sectionStart, sectionEnd, travel };
};

const isInsideHowWork = () => {
  if (!howWork) {
    return false;
  }

  const { sectionStart, sectionEnd } = getHowWorkMetrics();
  return window.scrollY >= sectionStart && window.scrollY <= sectionEnd;
};

const isHowWorkSceneCentered = () => {
  if (!howWorkScene || !isInsideHowWork()) {
    return false;
  }

  const rect = howWorkScene.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const sceneCenter = rect.top + rect.height / 2;
  const centerTolerance = Math.min(96, viewportHeight * 0.14);

  return rect.top <= 6 && Math.abs(sceneCenter - viewportHeight / 2) <= centerTolerance;
};

const howWorkSceneStops = [0, 0.21, 0.6, 0.9, 0.995];

const nearestHowWorkStopIndex = (progress) => {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  howWorkSceneStops.forEach((stop, index) => {
    const distance = Math.abs(stop - progress);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

const getHowWorkStepState = () => {
  const { sectionStart, sectionEnd, travel } = getHowWorkMetrics();
  const progress = clamp((window.scrollY - sectionStart) / travel, 0, 1);
  const currentIndex = nearestHowWorkStopIndex(progress);

  return { sectionStart, sectionEnd, travel, currentIndex };
};

const escapeHowWorkSection = (direction) => {
  const { sectionStart, sectionEnd } = getHowWorkMetrics();
  const viewportHeight = window.innerHeight || 1;
  limitedScrollLocked = true;
  limitedScrollTarget = clamp(
    direction < 0
      ? sectionStart - viewportHeight * 0.72
      : sectionEnd + viewportHeight * 0.72,
    0,
    getMaxScrollY()
  );

  if (limitedScrollFrame) {
    window.cancelAnimationFrame(limitedScrollFrame);
  }

  limitedScrollFrame = window.requestAnimationFrame(animateLimitedScroll);
};

const stepHowWorkScroll = (direction) => {
  if (!howWork || limitedScrollLocked) {
    return false;
  }

  const { sectionStart, sectionEnd, travel, currentIndex } = getHowWorkStepState();
  const nextIndex = clamp(currentIndex + direction, 0, howWorkSceneStops.length - 1);

  if (nextIndex === currentIndex) {
    return false;
  }

  limitedScrollLocked = true;
  limitedScrollTarget = clamp(sectionStart + howWorkSceneStops[nextIndex] * travel, sectionStart, sectionEnd);

  if (limitedScrollFrame) {
    window.cancelAnimationFrame(limitedScrollFrame);
  }

  limitedScrollFrame = window.requestAnimationFrame(animateLimitedScroll);
  return true;
};

const snapHowWorkToProgress = (progress) => {
  const { sectionStart, sectionEnd, travel } = getHowWorkMetrics();
  limitedScrollLocked = true;
  limitedScrollTarget = clamp(sectionStart + progress * travel, sectionStart, sectionEnd);

  if (limitedScrollFrame) {
    window.cancelAnimationFrame(limitedScrollFrame);
  }

  limitedScrollFrame = window.requestAnimationFrame(animateLimitedScroll);
};

const limitHowWorkScroll = (event) => {
  if (
    !howWork ||
    prefersReducedMotion ||
    document.body.classList.contains("is-menu-open") ||
    event.ctrlKey ||
    event.deltaY === 0
  ) {
    return;
  }

  const viewportHeight = window.innerHeight || 1;
  const sectionStart = howWork.offsetTop;
  const sectionEnd = howWork.offsetTop + howWork.offsetHeight - viewportHeight;
  const currentScroll = window.scrollY;
  const rawDelta = normalizeWheelDelta(event);
  const nextScroll = currentScroll + rawDelta;
  const insideSection = currentScroll >= sectionStart && currentScroll <= sectionEnd;
  const enteringSection =
    (currentScroll < sectionStart && nextScroll > sectionStart) ||
    (currentScroll > sectionEnd && nextScroll < sectionEnd);

  if (!insideSection && !enteringSection) {
    return;
  }

  if (mobileSceneQuery.matches) {
    if (!isHowWorkSceneCentered()) {
      return;
    }

    const { currentIndex } = getHowWorkStepState();
    const isLeavingSection =
      (currentIndex === 0 && rawDelta < 0) ||
      (currentIndex === howWorkSceneStops.length - 1 && rawDelta > 0);

    if (isLeavingSection) {
      return;
    }

    event.preventDefault();
    stepHowWorkScroll(rawDelta > 0 ? 1 : -1);
    return;
  }

  if ((currentScroll <= sectionStart && rawDelta < 0) || (currentScroll >= sectionEnd && rawDelta > 0)) {
    return;
  }

  event.preventDefault();
  const maxStep = 220;
  const limitedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), maxStep);
  limitedScrollTarget = clamp(currentScroll + limitedDelta, sectionStart, sectionEnd);

  if (!limitedScrollFrame) {
    limitedScrollFrame = window.requestAnimationFrame(animateLimitedScroll);
  }
};

const handleHowWorkTouchStart = (event) => {
  if (!mobileSceneQuery.matches || !isHowWorkSceneCentered() || document.body.classList.contains("is-menu-open")) {
    howWorkTouchActive = false;
    return;
  }

  const touch = event.touches[0];
  const { sectionStart, travel, currentIndex } = getHowWorkStepState();
  howWorkTouchActive = true;
  howWorkTouchHandled = false;
  howWorkTouchStartY = touch.clientY;
  howWorkTouchLastY = touch.clientY;
  howWorkTouchStartProgress = clamp((window.scrollY - sectionStart) / travel, 0, 1);
  howWorkTouchStartIndex = currentIndex;

  if (limitedScrollFrame) {
    window.cancelAnimationFrame(limitedScrollFrame);
    limitedScrollFrame = 0;
    limitedScrollLocked = false;
  }
};

const handleHowWorkTouchMove = (event) => {
  if (!howWorkTouchActive || !mobileSceneQuery.matches || document.body.classList.contains("is-menu-open")) {
    return;
  }

  const touch = event.touches[0];
  const delta = howWorkTouchStartY - touch.clientY;
  const direction = delta > 0 ? 1 : -1;
  const atFirstScene = howWorkTouchStartIndex === 0;
  const atLastScene = howWorkTouchStartIndex === howWorkSceneStops.length - 1;

  howWorkTouchLastY = touch.clientY;

  if (Math.abs(delta) < 6) {
    return;
  }

  if ((atFirstScene && direction < 0) || (atLastScene && direction > 0)) {
    howWorkTouchActive = false;
    return;
  }

  event.preventDefault();
  howWorkTouchHandled = true;

  const { sectionStart, sectionEnd, travel } = getHowWorkMetrics();
  const targetIndex = clamp(howWorkTouchStartIndex + direction, 0, howWorkSceneStops.length - 1);
  const fromProgress = howWorkSceneStops[howWorkTouchStartIndex];
  const toProgress = howWorkSceneStops[targetIndex];
  const viewportHeight = window.innerHeight || 1;
  const dragAmount = clamp(Math.abs(delta) / (viewportHeight * 0.78), 0, 1);
  const easedDrag = smoothProgress(dragAmount);
  const dragProgress = fromProgress + (toProgress - fromProgress) * easedDrag;
  const dragScroll = clamp(sectionStart + dragProgress * travel, sectionStart, sectionEnd);

  window.scrollTo(0, dragScroll);
};

const handleHowWorkTouchEnd = () => {
  if (!howWorkTouchActive || !mobileSceneQuery.matches || document.body.classList.contains("is-menu-open")) {
    howWorkTouchActive = false;
    return;
  }

  const delta = howWorkTouchStartY - howWorkTouchLastY;
  const direction = delta > 0 ? 1 : -1;
  const targetIndex = clamp(howWorkTouchStartIndex + direction, 0, howWorkSceneStops.length - 1);
  const targetProgress = howWorkSceneStops[targetIndex];
  const startProgress = howWorkSceneStops[howWorkTouchStartIndex];
  const viewportHeight = window.innerHeight || 1;
  const dragAmount = clamp(Math.abs(delta) / (viewportHeight * 0.78), 0, 1);
  howWorkTouchActive = false;

  if (!howWorkTouchHandled || Math.abs(delta) < 34) {
    snapHowWorkToProgress(howWorkTouchStartProgress);
    return;
  }

  if (targetIndex === howWorkTouchStartIndex) {
    escapeHowWorkSection(direction);
    return;
  }

  snapHowWorkToProgress(dragAmount > 0.24 ? targetProgress : startProgress);
};

if (howWork) {
  updateHowWorkCanvas();
  updateHowWork();
  window.addEventListener(
    "scroll",
    () => {
      updateHowWorkCanvas();
      updateHowWork();
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    updateHowWorkCanvas();
    updateHowWork();
  });
  window.addEventListener("wheel", limitHowWorkScroll, { passive: false });
  howWork.addEventListener("touchstart", handleHowWorkTouchStart, { passive: false });
  howWork.addEventListener("touchmove", handleHowWorkTouchMove, { passive: false });
  howWork.addEventListener("touchend", handleHowWorkTouchEnd);
}
