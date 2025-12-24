// ==============================
// System (Browser) Fonts
// ==============================
export const SYSTEM_FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Courier New",
];

// ==============================
// 100+ Google Fonts
// ==============================
export const GOOGLE_FONTS = [
  "Poppins","Roboto","Montserrat","Lato","Open Sans","Oswald","Raleway",
  "Inter","Nunito","Playfair Display","Merriweather","Source Sans Pro",
  "Ubuntu","PT Sans","Noto Sans","Rubik","Work Sans","Mukta","Hind",
  "Manrope","Quicksand","Josefin Sans","DM Sans","Karla","Titillium Web",
  "Arimo","Cabin","Barlow","Exo 2","Fira Sans","Heebo","Inconsolata",
  "Libre Franklin","Mulish","Oxygen","Prompt","Red Hat Display",
  "Space Grotesk","Tajawal","Varela Round","Yantramanav","Archivo",
  "Asap","Bebas Neue","Cormorant","Crimson Text","Dosis",
  "IBM Plex Sans","Kanit","Libre Baskerville","Lora","Nanum Gothic",
  "Overpass","Public Sans","Questrial","Signika","Spline Sans",
  "Teko","Urbanist","Zilla Slab","Anton","Baloo 2","Chivo",
  "Didact Gothic","Eczar","Francois One","Glegoo",
  "Hammersmith One","Istok Web","Jost","Kumbh Sans","Lexend",
  "Mada","News Cycle","Old Standard TT","Palanquin","Righteous",
  "Sora","Trirong","Unbounded","Vollkorn",
];

// ==============================
// Final Font List (Dropdown)
// ==============================
export const FONT_FAMILIES = [
  ...SYSTEM_FONTS,
  ...GOOGLE_FONTS,
];

// ==============================
// Google Font Loader
// ==============================
const loadedFonts = new Set();

export const loadGoogleFonts = fonts => {
  if (!fonts) return;

  const fontArray = Array.isArray(fonts) ? fonts : [fonts];

  const families = fontArray
    .filter(font => !loadedFonts.has(font))
    .map(font => {
      loadedFonts.add(font);
      return `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700`;
    });

  if (!families.length) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;

  document.head.appendChild(link);
};
