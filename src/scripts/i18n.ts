export type Lang = "es" | "en";

type Entry = { es: string; en: string };

export const translations: Record<string, Entry> = {
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.about": { es: "Sobre mí", en: "About" },
  "nav.experience": { es: "Trayectoria", en: "Experience" },
  "nav.skills": { es: "Habilidades", en: "Skills" },
  "nav.cta": { es: "¡Hablemos!", en: "Let's talk!" },
  "nav.lang.tooltip": { es: "Switch to English", en: "Cambiar a español" },

  "progress.home": { es: "Inicio", en: "Home" },
  "progress.about": { es: "Sobre mí", en: "About" },
  "progress.experience": { es: "Trayectoria", en: "Experience" },
  "progress.skills": { es: "Habilidades", en: "Skills" },
  "progress.contact": { es: "Contacto", en: "Contact" },

  "hero.greeting": { es: "¡Hola! 👋", en: "Hi there! 👋" },
  "hero.name": { es: "Soy Dani Ramos.", en: "I'm Dani Ramos." },
  "hero.description": {
    es: "Desarrollador Full Stack basado en Valladolid, España. Construyo soluciones web seguras y escalables: desde arquitecturas WordPress Headless con Next.js + WPGraphQL hasta e-commerce a medida (WooCommerce, PrestaShop). +4 años de producción, +20 proyectos entregados y estudiante de Ingeniería Informática en la UOC.",
    en: "Full Stack Developer based in Valladolid, Spain. I build secure, scalable web solutions: from Headless WordPress architectures with Next.js + WPGraphQL to bespoke e-commerce (WooCommerce, PrestaShop). 4+ years in production, 20+ delivered projects and Computer Engineering student at UOC.",
  },
  "hero.cta": { es: "¡Hablemos!", en: "Let's talk!" },
  "hero.label": { es: "Full Stack Dev", en: "Full Stack Dev" },

  "about.title": { es: "SOBRE MÍ", en: "ABOUT ME" },
  "about.p1.html": {
    es: 'Desarrollador Full Stack con <span class="highlight highlight-yellow">más de 4 años</span> de experiencia en entornos de producción, gestionando <span class="highlight highlight-cyan">+20 proyectos</span> web entre corporativos y e-commerce. Especializado en arquitecturas <span class="highlight highlight-pink">Headless con Next.js + WPGraphQL</span> y en stack CMS y e-commerce, cubriendo el ciclo completo desde toma de requisitos hasta despliegue.',
    en: 'Full Stack Developer with <span class="highlight highlight-yellow">4+ years</span> of production experience, having delivered <span class="highlight highlight-cyan">20+ web projects</span> across corporate sites and e-commerce. Specialised in <span class="highlight highlight-pink">Headless architectures with Next.js + WPGraphQL</span> and CMS / e-commerce stack, owning the full lifecycle from requirements to deployment.',
  },
  "about.p2.html": {
    es: 'Aporto experiencia real en <span class="highlight highlight-cyan">optimización de Core Web Vitals</span> (Lighthouse Performance llevado del rango 40-55 a <span class="highlight highlight-yellow">90+</span> en más de 10 proyectos), <span class="highlight highlight-pink">SEO técnico</span> y configuración de capas de cache como <span class="highlight highlight-green">Varnish</span> y CDN. En despliegues headless gestiono SSH, reglas Nginx + Apache para enrutado híbrido Node/PHP y migraciones críticas entre versiones mayores de PHP.',
    en: 'Hands-on experience in <span class="highlight highlight-cyan">Core Web Vitals optimisation</span> (Lighthouse Performance raised from the 40-55 range to <span class="highlight highlight-yellow">90+</span> across 10+ projects), <span class="highlight highlight-pink">technical SEO</span> and configuring cache layers like <span class="highlight highlight-green">Varnish</span> and CDN. On headless deploys I manage SSH, Nginx + Apache rules for hybrid Node/PHP routing, and critical PHP major-version migrations.',
  },
  "about.p3.html": {
    es: 'En el lado de seguridad: <span class="highlight highlight-pink">recuperación de sitios comprometidos</span> (más de 10 limpiezas forenses), bastionado de servidores y reglas <span class="highlight highlight-cyan">ModSecurity (WAF)</span>. Compagino el trabajo técnico con <span class="highlight highlight-green">gestión de proyectos</span>: comunicación con cliente, cumplimiento de deadlines y coordinación del equipo. Actualmente curso el <span class="highlight highlight-yellow">Grado en Ingeniería Informática en la UOC</span> para profundizar en arquitectura de software y algoritmos.',
    en: 'On the security side: <span class="highlight highlight-pink">recovery of compromised sites</span> (10+ forensic cleanups), server hardening and <span class="highlight highlight-cyan">ModSecurity (WAF)</span> rules. I combine deep technical work with <span class="highlight highlight-green">project management</span>: client communication, deadline delivery and team coordination. Currently studying <span class="highlight highlight-yellow">Computer Engineering at UOC</span> to deepen my knowledge of software architecture and algorithms.',
  },

  "journey.title": { es: "Mi Trayectoria", en: "My Journey" },
  "journey.timeline": { es: "Línea de Tiempo", en: "Timeline" },

  "projects.title": { es: "PROYECTOS", en: "PROJECTS" },
  "projects.viewLive": { es: "Ver en vivo", en: "View live" },
  "projects.viewRepo": { es: "Ver código", en: "View code" },
  "projects.viewDemo": { es: "Ver demo", en: "View demo" },
  "nav.projects": { es: "Proyectos", en: "Projects" },
  "progress.projects": { es: "Proyectos", en: "Projects" },

  "skills.title": { es: "HABILIDADES", en: "SKILLS" },
  "skills.languages": { es: "Lenguajes", en: "Languages" },
  "skills.frontend": { es: "Frontend", en: "Frontend" },
  "skills.backend": { es: "Backend & APIs", en: "Backend & APIs" },
  "skills.cms": { es: "CMS & E-commerce", en: "CMS & E-commerce" },
  "skills.devops": { es: "DevOps & Infraestructura", en: "DevOps & Infrastructure" },
  "skills.security": { es: "Seguridad & Rendimiento", en: "Security & Performance" },
  "skills.tag.modulesPlugins": { es: "Plugins / Módulos", en: "Plugins / Modules" },
  "skills.tag.malware": { es: "Limpieza de malware", en: "Malware removal" },
  "skills.tag.hardening": { es: "Hardening servidores", en: "Server hardening" },
  "skills.tag.modsec": { es: "ModSecurity (WAF)", en: "ModSecurity (WAF)" },
  "skills.tag.payments": { es: "Pasarelas de pago", en: "Payment gateways" },
  "skills.tag.seo": { es: "SEO Técnico", en: "Technical SEO" },
  "skills.tag.wcag": { es: "WCAG / Accesibilidad", en: "WCAG / Accessibility" },
  "skills.tag.ssh": { es: "SSH / Linux CLI", en: "SSH / Linux CLI" },
  "skills.tag.nginxApache": { es: "Nginx + Apache", en: "Nginx + Apache" },
  "skills.tag.varnish": { es: "Varnish (cache)", en: "Varnish (cache)" },
  "skills.tag.phpVersions": { es: "Gestión versiones PHP", en: "PHP version management" },
  "skills.tag.wpAuth": { es: "WP REST + JWT/OAuth", en: "WP REST + JWT/OAuth" },
  "skills.tag.gutenberg": { es: "Gutenberg Blocks custom", en: "Custom Gutenberg Blocks" },

  "edu.title": { es: "EDUCACIÓN", en: "EDUCATION" },
  "lang.title": { es: "IDIOMAS", en: "LANGUAGES" },
  "lang.spanish": { es: "Español", en: "Spanish" },
  "lang.english": { es: "Inglés", en: "English" },

  "contact.title": { es: "HABLEMOS", en: "LET'S TALK" },
  "contact.intro": {
    es: "¿Tienes un proyecto en mente? Construyamos algo juntos.",
    en: "Got a project in mind? Let's build something together.",
  },
  "contact.form.name": { es: "Nombre", en: "Name" },
  "contact.form.email": { es: "Email", en: "Email" },
  "contact.form.message": { es: "Mensaje", en: "Message" },
  "contact.form.namePlaceholder": { es: "Tu nombre", en: "Your name" },
  "contact.form.emailPlaceholder": { es: "tu@email.com", en: "your@email.com" },
  "contact.form.messagePlaceholder": { es: "Cuéntame sobre tu proyecto...", en: "Tell me about your project..." },
  "contact.form.submit": { es: "Enviar mensaje", en: "Send message" },

  "footer.role": { es: "Desarrollador Full Stack", en: "Full Stack Developer" },
  "footer.terminal": { es: "Terminal", en: "Terminal" },

  "page.title": {
    es: "Dani Ramos Merino | Desarrollador Full Stack | Headless WordPress, Next.js & PHP",
    en: "Dani Ramos Merino | Full Stack Developer | Headless WordPress, Next.js & PHP",
  },
  "page.description": {
    es: "Desarrollador Full Stack con más de 3 años de experiencia. WordPress Headless con Next.js + WPGraphQL, WooCommerce, PHP y React. Basado en Valladolid, España.",
    en: "Full Stack Developer with 3+ years of experience. Headless WordPress with Next.js + WPGraphQL, WooCommerce, PHP and React. Based in Valladolid, Spain.",
  },
};

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem("lang");
  if (stored === "es" || stored === "en") return stored;
  const nav = navigator.language || "es";
  return nav.toLowerCase().startsWith("en") ? "en" : "es";
}

export function setStoredLang(lang: Lang): void {
  localStorage.setItem("lang", lang);
}

export function applyTranslations(lang: Lang): void {
  document.documentElement.lang = lang;

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const t = translations[key];
    if (t) el.textContent = t[lang];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    const t = translations[key];
    if (t) el.innerHTML = t[lang];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach((el) => {
    const spec = el.dataset.i18nAttr;
    if (!spec) return;
    spec.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (!attr || !key) return;
      const t = translations[key];
      if (t) el.setAttribute(attr, t[lang]);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-es][data-en]").forEach((el) => {
    el.textContent = lang === "en" ? el.dataset.en! : el.dataset.es!;
  });

  const titleT = translations["page.title"];
  if (titleT) document.title = titleT[lang];

  const descMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const descT = translations["page.description"];
  if (descMeta && descT) descMeta.setAttribute("content", descT[lang]);

  document.dispatchEvent(new CustomEvent<Lang>("langchange", { detail: lang }));
}

export function initLanguage(): Lang {
  const lang = getStoredLang();
  applyTranslations(lang);
  return lang;
}
