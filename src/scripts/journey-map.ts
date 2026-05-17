import L from "leaflet";
import type { Lang } from "./i18n";

interface BiText {
  es: string;
  en: string;
}

interface Company {
  district: string;
  company: string;
  period: BiText;
  role: BiText;
}

interface Location {
  coords: [number, number];
  city: BiText;
  cityKey: string;
  companies: Company[];
}

const locations: Location[] = [
  {
    coords: [41.6529, -4.7286],
    city: { es: "Valladolid", en: "Valladolid" },
    cityKey: "Valladolid",
    companies: [
      {
        district: "Valladolid",
        company: "Esloogan 360",
        period: { es: "2026 - Actualidad", en: "2026 - Present" },
        role: { es: "Desarrollador Full Stack", en: "Full Stack Developer" },
      },
      {
        district: "Valladolid",
        company: "MADISON Experience Marketing",
        period: { es: "2021", en: "2021" },
        role: { es: "Web Developer (Prácticas)", en: "Web Developer (Internship)" },
      },
    ],
  },
  {
    coords: [40.9701, -5.6635],
    city: { es: "Salamanca", en: "Salamanca" },
    cityKey: "Salamanca",
    companies: [
      {
        district: "Salamanca",
        company: "DIPE - Desarrollo Web",
        period: { es: "2022 - 2026", en: "2022 - 2026" },
        role: { es: "Full Stack Web Developer", en: "Full Stack Web Developer" },
      },
    ],
  },
];

function getCurrentLang(): Lang {
  const stored = localStorage.getItem("lang");
  return stored === "en" ? "en" : "es";
}

function buildPopup(location: Location, lang: Lang): string {
  let html = `<div class="map-popup"><div class="map-popup-country">${location.city[lang]}</div>`;
  location.companies.forEach((company, index) => {
    if (index > 0) html += `<div class="map-popup-divider"></div>`;
    html += `
      <div class="map-popup-company">
        <strong>${company.company}</strong>
        <span>${company.role[lang]}</span>
        <small>${company.district}</small>
        <small>${company.period[lang]}</small>
      </div>`;
  });
  html += `</div>`;
  return html;
}

function buildMarkerIcon(location: Location, lang: Lang): L.DivIcon {
  const isCurrent = location.cityKey === "Valladolid";
  return L.divIcon({
    className: isCurrent ? "neo-marker neo-marker-current" : "neo-marker",
    html: `
      <div class="neo-marker-label ${isCurrent ? "neo-marker-label-current" : ""}">${location.city[lang]}</div>
      <div class="neo-marker-pin ${isCurrent ? "neo-marker-pin-current" : ""}"></div>
    `,
    iconSize: isCurrent ? [35, 35] : [30, 30],
    iconAnchor: isCurrent ? [17.5, 50] : [15, 45],
    popupAnchor: [0, isCurrent ? -50 : -45],
  });
}

export function initJourneyMap(): void {
  const mapEl = document.getElementById("journey-map");
  if (!mapEl) return;

  const initialView = { center: [41.3, -5.2] as [number, number], zoom: 7 };

  const map = L.map("journey-map", {
    center: initialView.center,
    zoom: initialView.zoom,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer("https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg", {
    attribution: "© Stamen Design, © OpenStreetMap contributors",
    maxZoom: 16,
  }).addTo(map);

  const HomeControl = L.Control.extend({
    onAdd(targetMap: L.Map) {
      const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-home");
      const link = L.DomUtil.create("a", "", container) as HTMLAnchorElement;
      link.href = "#";
      link.title = "Reset map view";
      link.innerHTML = '<i class="fas fa-home"></i>';
      L.DomEvent.on(link, "click", (e) => {
        L.DomEvent.preventDefault(e);
        targetMap.setView(initialView.center, initialView.zoom);
      });
      return container;
    },
  });

  new HomeControl({ position: "topright" }).addTo(map);

  const markers: Record<string, L.Marker> = {};
  let currentLang: Lang = getCurrentLang();

  locations.forEach((location) => {
    const marker = L.marker(location.coords, { icon: buildMarkerIcon(location, currentLang) }).addTo(map);
    marker.bindPopup(buildPopup(location, currentLang));
    markers[location.cityKey] = marker;
  });

  document.addEventListener("langchange", (e) => {
    const lang = (e as CustomEvent<Lang>).detail;
    currentLang = lang;
    locations.forEach((location) => {
      const marker = markers[location.cityKey];
      if (!marker) return;
      marker.setIcon(buildMarkerIcon(location, lang));
      marker.setPopupContent(buildPopup(location, lang));
    });
  });

  document.querySelectorAll<HTMLElement>(".timeline-item-flat").forEach((item) => {
    item.addEventListener("click", () => {
      const city = item.getAttribute("data-country");
      if (!city) return;
      const marker = markers[city];
      if (marker) {
        map.setView(marker.getLatLng(), 9, { animate: true, duration: 1 });
        setTimeout(() => marker.openPopup(), 500);
      }
    });
  });
}
