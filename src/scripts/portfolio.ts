import { applyTranslations, getStoredLang, setStoredLang, type Lang } from "./i18n";

let currentLang: Lang = getStoredLang();
applyTranslations(currentLang);

const langToggle = document.getElementById("lang-toggle");
const langToggleLabel = langToggle?.querySelector<HTMLElement>(".lang-toggle-flag");
const updateLangToggleLabel = (lang: Lang) => {
  if (langToggleLabel) langToggleLabel.textContent = lang === "es" ? "EN" : "ES";
};
updateLangToggleLabel(currentLang);

if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "es" ? "en" : "es";
    setStoredLang(currentLang);
    applyTranslations(currentLang);
    updateLangToggleLabel(currentLang);
  });
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const heroPhoto = document.querySelector<HTMLImageElement>(".hero-photo");
let photoTilted = false;
if (heroPhoto) {
  window.addEventListener("scroll", () => {
    if (!photoTilted && window.scrollY > 5) {
      heroPhoto.classList.add("tilted");
      photoTilted = true;
    }
  });
  heroPhoto.addEventListener("mouseenter", () => heroPhoto.classList.remove("tilted"));
  heroPhoto.addEventListener("mouseleave", () => {
    if (photoTilted) heroPhoto.classList.add("tilted");
  });
}

const decoTerminal = document.querySelector<HTMLElement>(".deco-terminal");
const heroContent = document.querySelector<HTMLElement>(".hero-content");
let terminalFallen = false;

function calculateFallDistance() {
  if (!decoTerminal || !heroContent) return;
  const heroContentRect = heroContent.getBoundingClientRect();
  const heroContentBottom = heroContentRect.bottom;
  const terminalRect = decoTerminal.getBoundingClientRect();
  const terminalFall = Math.max(0, heroContentBottom - terminalRect.bottom - 50);
  decoTerminal.style.setProperty("--fall-distance", `${terminalFall}px`);
}

if (decoTerminal && heroContent) {
  calculateFallDistance();
  window.addEventListener("resize", calculateFallDistance);
  window.addEventListener("scroll", () => {
    if (!terminalFallen && window.scrollY > 5) {
      decoTerminal.classList.add("falling");
      terminalFallen = true;
    }
  });
}

const pageGap = document.querySelector<HTMLElement>(".page-gap");
const paperTearBottom = document.querySelector<HTMLElement>(".paper-tear-bottom");
const paperTearBottomBgGray = document.querySelector<SVGPathElement>('.paper-tear-bottom svg path[fill="#d0d0d0"]');
const tearTapeSticker = document.querySelector<HTMLElement>(".tear-tape-sticker");
const minGapHeight = -30;

function updateTapePosition() {
  if (paperTearBottom && tearTapeSticker) {
    const rect = paperTearBottom.getBoundingClientRect();
    tearTapeSticker.style.setProperty("--tape-position", `${rect.top}px`);
  }
}

function updateGapParallax() {
  if (!pageGap || !paperTearBottom) return;
  if (window.innerWidth <= 768) return;

  const scrollY = window.scrollY;
  const initialGapHeight = 300;
  const scrollStart = 100;
  const scrollRange = 200;
  const stickerDelay = 30;
  const stickerStart = scrollStart + scrollRange + stickerDelay;
  const stickerRange = 60;

  updateTapePosition();

  if (scrollY <= scrollStart) {
    pageGap.style.setProperty("height", initialGapHeight + "px", "important");
    paperTearBottom.style.setProperty("margin-top", "0px", "important");
    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = "1";
    if (tearTapeSticker) {
      tearTapeSticker.style.transform = "rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)";
      tearTapeSticker.style.opacity = "0";
    }
  } else if (scrollY >= scrollStart && scrollY <= scrollStart + scrollRange) {
    const progress = (scrollY - scrollStart) / scrollRange;
    const currentHeight = initialGapHeight - (initialGapHeight - minGapHeight) * progress;

    if (currentHeight >= 0) {
      pageGap.style.setProperty("height", currentHeight + "px", "important");
      paperTearBottom.style.setProperty("margin-top", "0px", "important");
      if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = "1";
      if (tearTapeSticker) {
        tearTapeSticker.style.transform = "rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)";
        tearTapeSticker.style.opacity = "0";
      }
    } else {
      pageGap.style.setProperty("height", "0px", "important");
      paperTearBottom.style.setProperty("margin-top", currentHeight + "px", "important");
      const negativePart = Math.abs(minGapHeight);
      const negativeProgress = Math.abs(currentHeight) / negativePart;
      const opacity = 1 - negativeProgress;
      if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = String(opacity);
      if (tearTapeSticker) {
        tearTapeSticker.style.transform = "rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)";
        tearTapeSticker.style.opacity = "0";
      }
    }
  } else if (scrollY > stickerStart && scrollY < stickerStart + stickerRange) {
    pageGap.style.setProperty("height", "0px", "important");
    paperTearBottom.style.setProperty("margin-top", minGapHeight + "px", "important");
    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = "0";
    if (tearTapeSticker) {
      const stickerProgress = (scrollY - stickerStart) / stickerRange;
      const translateY = -40 + 40 * stickerProgress;
      const translateZ = 30 - 30 * stickerProgress;
      const rotateX = 35 - 35 * stickerProgress;
      const opacityVal = Math.min(1, Math.max(0, (stickerProgress - 0.35) * 1.54));
      tearTapeSticker.style.transform = `rotate(-8deg) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
      tearTapeSticker.style.opacity = String(opacityVal);
    }
  } else if (scrollY >= stickerStart + stickerRange) {
    pageGap.style.setProperty("height", "0px", "important");
    paperTearBottom.style.setProperty("margin-top", minGapHeight + "px", "important");
    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = "0";
    if (tearTapeSticker) {
      tearTapeSticker.style.transform = "rotate(-8deg) translateY(0px) translateZ(0px) rotateX(0deg)";
      tearTapeSticker.style.opacity = "1";
    }
  } else {
    pageGap.style.setProperty("height", "0px", "important");
    paperTearBottom.style.setProperty("margin-top", minGapHeight + "px", "important");
    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = "0";
    if (tearTapeSticker) {
      tearTapeSticker.style.transform = "rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)";
      tearTapeSticker.style.opacity = "0";
    }
  }
}

window.addEventListener("resize", updateGapParallax, { passive: true });

const highlights = document.querySelectorAll<HTMLElement>(".highlight");
interface HighlightData { hasStarted: boolean; startScroll: number; duration: number; direction: string; }
const highlightData = new Map<HTMLElement, HighlightData>();

highlights.forEach((highlight, index) => {
  const direction = index % 2 === 0 ? "left" : "right";
  highlight.setAttribute("data-direction", direction);
  highlightData.set(highlight, { hasStarted: false, startScroll: 0, duration: 100, direction });
});

function updateHighlights() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  highlights.forEach((highlight) => {
    const rect = highlight.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const data = highlightData.get(highlight);
    if (!data) return;
    const triggerPoint = scrollY + windowHeight * 0.8;
    if (!data.hasStarted && triggerPoint >= elementTop) {
      data.hasStarted = true;
      data.startScroll = scrollY;
    }
    if (data.hasStarted) {
      const progress = Math.min(1, Math.max(0, (scrollY - data.startScroll) / data.duration));
      highlight.style.setProperty("--highlight-progress", `${progress * 100}%`);
    }
    if (data.hasStarted && scrollY < data.startScroll - 50) {
      data.hasStarted = false;
      highlight.style.setProperty("--highlight-progress", "0%");
    }
  });
}

const languageItems = document.querySelectorAll<HTMLElement>(".language-item");
interface LangData { hasStarted: boolean; startScroll: number; stars: NodeListOf<Element>; starDelay: number; }
const languageStarsData = new Map<HTMLElement, LangData>();
languageItems.forEach((item) => {
  languageStarsData.set(item, {
    hasStarted: false,
    startScroll: 0,
    stars: item.querySelectorAll(".language-stars .star"),
    starDelay: 50,
  });
});
function updateLanguageStars() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  languageItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const data = languageStarsData.get(item);
    if (!data) return;
    const triggerPoint = scrollY + windowHeight * 0.8;
    if (!data.hasStarted && triggerPoint >= elementTop) {
      data.hasStarted = true;
      data.startScroll = scrollY;
    }
    if (data.hasStarted) {
      const scrollProgress = scrollY - data.startScroll;
      data.stars.forEach((star, index) => {
        const starTrigger = index * data.starDelay;
        if (scrollProgress >= starTrigger) star.classList.add("visible");
      });
    }
  });
}

const journeyTimeline = document.querySelector<HTMLElement>(".journey-timeline");
const journeyTimelineBack = document.querySelector<HTMLElement>(".journey-timeline-back");
const journeyTimelineData = { hasStarted: false, startScroll: 0, pageRange: 200 };

function updateJourneyTimeline() {
  if (!journeyTimeline || !journeyTimelineBack) return;
  if (window.innerWidth < 769) {
    journeyTimeline.style.transform = "";
    journeyTimelineBack.style.transform = "";
    journeyTimeline.style.zIndex = "";
    journeyTimelineBack.style.zIndex = "";
    journeyTimeline.style.overflowY = "auto";
    journeyTimelineData.hasStarted = false;
    return;
  }
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const rect = journeyTimeline.getBoundingClientRect();
  const elementTop = rect.top + scrollY;
  const triggerPoint = scrollY + windowHeight * 0.5;
  if (!journeyTimelineData.hasStarted && triggerPoint >= elementTop) {
    journeyTimelineData.hasStarted = true;
    journeyTimelineData.startScroll = scrollY;
  }
  if (journeyTimelineData.hasStarted) {
    const progress = Math.min(1, Math.max(0, (scrollY - journeyTimelineData.startScroll) / journeyTimelineData.pageRange));
    const rotateY = 180 - 180 * progress;
    journeyTimeline.style.transform = `rotateY(${rotateY}deg)`;
    journeyTimelineBack.style.transform = `rotateY(${rotateY}deg)`;
    if (rotateY > 95) {
      journeyTimeline.style.zIndex = "1";
      journeyTimelineBack.style.zIndex = "100";
    } else {
      journeyTimeline.style.zIndex = "100";
      journeyTimelineBack.style.zIndex = "1";
    }
    journeyTimeline.style.overflowY = progress >= 1 ? "auto" : "hidden";
  } else {
    journeyTimeline.style.transform = "rotateY(180deg)";
    journeyTimelineBack.style.transform = "rotateY(180deg)";
    journeyTimeline.style.zIndex = "1";
    journeyTimelineBack.style.zIndex = "100";
    journeyTimeline.style.overflowY = "hidden";
  }
}

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
if (themeToggle) {
  const icon = themeToggle.querySelector("i");
  const updateIcon = (theme: string) => {
    if (!icon) return;
    if (theme === "dark") {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  };
  const currentTheme = localStorage.getItem("theme") || "light";
  body.setAttribute("data-theme", currentTheme);
  updateIcon(currentTheme);
  themeToggle.addEventListener("click", () => {
    const theme = body.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcon(newTheme);
  });
}

document.querySelectorAll<HTMLAnchorElement>(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    if (!targetId) return;
    const targetSection = document.querySelector(targetId);
    if (targetSection) targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const navbar = document.querySelector<HTMLElement>(".navbar");
const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");
const sectionsWithId = document.querySelectorAll<HTMLElement>("section[id]");
let lastScroll = 0;

function updateNavbarAndSections() {
  const currentScroll = window.scrollY;
  if (navbar) {
    if (currentScroll > lastScroll && currentScroll > 100) navbar.classList.add("navbar-hidden");
    else if (currentScroll < lastScroll) navbar.classList.remove("navbar-hidden");
  }
  let activeId: string | null = null;
  sectionsWithId.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
      activeId = sectionId;
    }
  });
  if (activeId) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }
  lastScroll = currentScroll;
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("fade-in");
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
);
document.querySelectorAll(".section, .timeline-item, .skill-box").forEach((el) => observer.observe(el));

const greetingElement = document.getElementById("hero-greeting");
if (greetingElement) {
  const finalText = greetingElement.textContent?.trim() || "¡Hola! 👋";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const matrixTypingEffect = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      greetingElement.textContent = finalText
        .split("")
        .map((char, index) => {
          if (index < iterations) return finalText[index];
          if (char === " " || char === "👋") return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      if (iterations >= finalText.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 50);
  };
  setTimeout(matrixTypingEffect, 500);
}

const progressBarFill = document.querySelector<HTMLElement>(".progress-bar-fill");
const checkpoints = document.querySelectorAll<HTMLElement>(".checkpoint");

function updateProgressBar() {
  if (!progressBarFill) return;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;
  const progress = (scrolled / documentHeight) * 100;
  progressBarFill.style.width = progress + "%";

  const sections = ["hero", "about", "experience", "skills", "contact"];
  let activeIndex = 0;
  sections.forEach((sectionId, index) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) activeIndex = index;
    }
  });
  checkpoints.forEach((checkpoint, index) => {
    if (index <= activeIndex) checkpoint.classList.add("active");
    else checkpoint.classList.remove("active");
  });
}

checkpoints.forEach((checkpoint) => {
  checkpoint.addEventListener("click", () => {
    const sectionId = checkpoint.getAttribute("data-section");
    if (!sectionId) return;
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("resize", updateProgressBar, { passive: true });

let scrollPending = false;
function onScrollMaster() {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    updateGapParallax();
    updateHighlights();
    updateLanguageStars();
    updateJourneyTimeline();
    updateNavbarAndSections();
    updateProgressBar();
  });
}
window.addEventListener("scroll", onScrollMaster, { passive: true });

// Inicializar todas las posiciones una vez en load
requestAnimationFrame(() => {
  updateGapParallax();
  updateHighlights();
  updateLanguageStars();
  updateJourneyTimeline();
  updateProgressBar();
});

const journeyMapEl = document.getElementById("journey-map");
if (journeyMapEl) {
  let mapLoaded = false;
  const loadMap = async () => {
    if (mapLoaded) return;
    mapLoaded = true;
    await import("leaflet/dist/leaflet.css");
    const { initJourneyMap } = await import("./journey-map");
    initJourneyMap();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadMap();
          io.disconnect();
          break;
        }
      }
    },
    { rootMargin: "200px 0px" },
  );
  io.observe(journeyMapEl);
}
