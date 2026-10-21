import sharp from "sharp";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const GALLERY_DIR = path.join(IMAGES_DIR, "gallery");
const GMAPS_DIR = path.join(IMAGES_DIR, "gmaps");
const PRODUCTS_DIR = path.join(IMAGES_DIR, "products");

for (const dir of [IMAGES_DIR, GALLERY_DIR, GMAPS_DIR, PRODUCTS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Colors matching the brand palette
const COLORS = {
  ink: "#201719",
  cream: "#FFF7EC",
  creamCard: "#FFFDF9",
  pink: "#F24C8B",
  pinkLight: "#FCE7F0",
  orange: "#FF7B30",
  orangeLight: "#FFECD9",
  lime: "#BCE84A",
  cyan: "#42C7D9",
  purple: "#7B4FF3",
  waffleDark: "#C47B2B",
  waffleMid: "#E59E3D",
  waffleLight: "#F7C978",
  chocolate: "#4A2810",
  strawberryRed: "#E53E5D",
  blueberryBlue: "#4338CA",
  matchaGreen: "#15803D",
};

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** SVG helpers */
function waffleGridPattern(id: string, darkColor: string, lightColor: string) {
  return `
    <pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="${lightColor}"/>
      <rect x="4" y="4" width="32" height="32" rx="4" fill="${darkColor}" opacity="0.8"/>
      <rect x="8" y="8" width="24" height="24" rx="2" fill="${lightColor}" opacity="0.3"/>
    </pattern>
  `;
}

function demoWatermark(text = "DEMO") {
  return `
    <g transform="translate(40, 40)">
      <rect x="0" y="0" width="100" height="34" rx="17" fill="#201719" opacity="0.9" />
      <text x="50" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#BCE84A" text-anchor="middle" letter-spacing="2">DEMO</text>
    </g>
  `;
}

/** 1. Logo SVG */
function createLogoSvg(size = 512): string {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF7B30" />
        <stop offset="50%" stop-color="#F24C8B" />
        <stop offset="100%" stop-color="#7B4FF3" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#201719" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Outer rounded badge -->
    <rect x="24" y="24" width="464" height="464" rx="110" fill="url(#logoBg)" filter="url(#shadow)"/>
    
    <!-- Inner creamy card -->
    <rect x="48" y="48" width="416" height="416" rx="90" fill="#FFF7EC"/>
    
    <!-- Stylized Waffle Icon -->
    <g transform="translate(136, 90)">
      <!-- Waffle base -->
      <rect x="0" y="0" width="240" height="200" rx="36" fill="#F7C978" stroke="#C47B2B" stroke-width="10"/>
      <!-- Grid cells -->
      <rect x="25" y="25" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="80" y="25" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="135" y="25" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="175" y="25" width="40" height="40" rx="8" fill="#E59E3D"/>
      
      <rect x="25" y="80" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="80" y="80" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="135" y="80" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="175" y="80" width="40" height="40" rx="8" fill="#E59E3D"/>

      <rect x="25" y="135" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="80" y="135" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="135" y="135" width="40" height="40" rx="8" fill="#E59E3D"/>
      <rect x="175" y="135" width="40" height="40" rx="8" fill="#E59E3D"/>
      
      <!-- Melting syrup / drip -->
      <path d="M 20 50 Q 50 110, 80 50 Q 120 120, 160 50 Q 200 90, 220 50" fill="none" stroke="#F24C8B" stroke-width="14" stroke-linecap="round"/>
      <circle cx="80" cy="115" r="7" fill="#F24C8B"/>
      <circle cx="160" cy="125" r="6" fill="#F24C8B"/>
    </g>
    
    <!-- DEMO Typography -->
    <text x="256" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#201719" text-anchor="middle" letter-spacing="4">DEMO</text>
    <text x="256" y="410" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#FF7B30" text-anchor="middle" letter-spacing="8">WAFFLES</text>
  </svg>
  `;
}

/** 2. OpenGraph Banner */
function createOgImageSvg(): string {
  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#201719" />
        <stop offset="60%" stop-color="#2A1C20" />
        <stop offset="100%" stop-color="#140E10" />
      </linearGradient>
      ${waffleGridPattern("wGrid", "#332227", "#201719")}
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#ogBg)"/>
    <rect width="1200" height="630" fill="url(#wGrid)" opacity="0.4"/>
    
    <!-- Decorative Glowing Blobs -->
    <circle cx="200" cy="150" r="240" fill="#F24C8B" opacity="0.2" filter="blur(60px)"/>
    <circle cx="1000" cy="450" r="260" fill="#42C7D9" opacity="0.2" filter="blur(70px)"/>
    <circle cx="950" cy="180" r="220" fill="#FF7B30" opacity="0.25" filter="blur(60px)"/>
    
    <!-- Pill badge -->
    <rect x="100" y="100" width="180" height="44" rx="22" fill="#BCE84A" />
    <text x="190" y="128" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#201719" text-anchor="middle" letter-spacing="3">DEMO STORE</text>
    
    <!-- Main Headline -->
    <text x="100" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#FFF7EC">DEMO WAFFLES</text>
    <text x="100" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="#FF7B30">Fresh Waffle Pops &amp; Shakes Showcase</text>
    <text x="100" y="345" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#E2DCD5">A complete demo showcase with ordering, menu management and dessert items.</text>
    
    <!-- Feature tags -->
    <g transform="translate(100, 420)">
      <rect x="0" y="0" width="160" height="42" rx="21" fill="#FFFFFF" opacity="0.1" />
      <text x="80" y="27" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#FFF7EC" text-anchor="middle">Waffle Pops</text>
      
      <rect x="180" y="0" width="160" height="42" rx="21" fill="#FFFFFF" opacity="0.1" />
      <text x="260" y="27" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#FFF7EC" text-anchor="middle">Thick Shakes</text>

      <rect x="360" y="0" width="160" height="42" rx="21" fill="#FFFFFF" opacity="0.1" />
      <text x="440" y="27" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#FFF7EC" text-anchor="middle">Online Ordering</text>
    </g>
    
    <!-- Right Graphic: Stylized Waffle Illustration -->
    <g transform="translate(800, 160)">
      <rect x="0" y="0" width="280" height="280" rx="50" fill="#FFF7EC" stroke="#201719" stroke-width="12" />
      <rect x="30" y="30" width="220" height="220" rx="30" fill="#F7C978" stroke="#C47B2B" stroke-width="8"/>
      
      <!-- Waffle squares -->
      <rect x="55" y="55" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="115" y="55" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="175" y="55" width="45" height="45" rx="8" fill="#E59E3D"/>

      <rect x="55" y="115" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="115" y="115" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="175" y="115" width="45" height="45" rx="8" fill="#E59E3D"/>

      <rect x="55" y="175" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="115" y="175" width="45" height="45" rx="8" fill="#E59E3D"/>
      <rect x="175" y="175" width="45" height="45" rx="8" fill="#E59E3D"/>
      
      <!-- Heart sticker -->
      <circle cx="230" cy="60" r="38" fill="#F24C8B" stroke="#201719" stroke-width="6"/>
      <text x="230" y="68" font-family="sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">DEMO</text>
    </g>
  </svg>
  `;
}

/** 3. Hero Waffle / Signature Waffle Images */
function createHeroWaffleSvg(title = "DEMO WAFFLE POP", subtitle = "Handcrafted & Dipped Fresh"): string {
  return `
  <svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF7EC" />
        <stop offset="100%" stop-color="#FFEED6" />
      </linearGradient>
      ${waffleGridPattern("hPattern", "#F3DEC0", "#FFF7EC")}
    </defs>
    
    <rect width="1200" height="900" fill="url(#heroBg)"/>
    <rect width="1200" height="900" fill="url(#hPattern)" opacity="0.6"/>
    
    <!-- Warm glowing circles -->
    <circle cx="600" cy="450" r="360" fill="#FF7B30" opacity="0.12"/>
    <circle cx="600" cy="450" r="280" fill="#F24C8B" opacity="0.08"/>

    <!-- Stick -->
    <rect x="575" y="550" width="50" height="260" rx="20" fill="#D4A373" stroke="#8C5E35" stroke-width="8"/>
    
    <!-- Waffle Body -->
    <g transform="translate(420, 160)">
      <rect x="0" y="0" width="360" height="480" rx="60" fill="#F7C978" stroke="#C47B2B" stroke-width="16"/>
      
      <!-- Waffle Grid in columns & rows -->
      ${[0, 1, 2].map(c => [0, 1, 2, 3].map(r => `
        <rect x="${38 + c * 100}" y="${40 + r * 100}" width="80" height="80" rx="14" fill="#E59E3D" stroke="#C47B2B" stroke-width="4"/>
        <rect x="${46 + c * 100}" y="${48 + r * 100}" width="64" height="64" rx="10" fill="#F7C978" opacity="0.4"/>
      `).join("")).join("")}
      
      <!-- Chocolate / Strawberry Glaze Drizzle -->
      <path d="M 0 160 Q 90 260, 180 180 Q 270 290, 360 200 L 360 0 L 0 0 Z" fill="#4A2810" opacity="0.95"/>
      <path d="M 0 220 Q 90 320, 180 240 Q 270 340, 360 250" fill="none" stroke="#F24C8B" stroke-width="16" stroke-linecap="round"/>
      
      <!-- Sprinkles & Toppings -->
      <rect x="70" y="80" width="22" height="8" rx="4" fill="#BCE84A" transform="rotate(30 70 80)"/>
      <rect x="150" y="60" width="22" height="8" rx="4" fill="#FF7B30" transform="rotate(-40 150 60)"/>
      <rect x="230" y="110" width="22" height="8" rx="4" fill="#42C7D9" transform="rotate(20 230 110)"/>
      <rect x="110" y="140" width="22" height="8" rx="4" fill="#FFFFFF" transform="rotate(-15 110 140)"/>
      <rect x="270" y="70" width="22" height="8" rx="4" fill="#BCE84A" transform="rotate(45 270 70)"/>
      <circle cx="200" cy="140" r="14" fill="#E53E5D"/>
      <circle cx="120" cy="90" r="12" fill="#E53E5D"/>
    </g>

    <!-- Top Badge -->
    <g transform="translate(600, 90)">
      <rect x="-140" y="-30" width="280" height="60" rx="30" fill="#201719" stroke="#BCE84A" stroke-width="4"/>
      <text x="0" y="10" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#BCE84A" text-anchor="middle" letter-spacing="3">DEMO PICTURE</text>
    </g>

    <!-- Bottom Caption -->
    <text x="600" y="840" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#201719" text-anchor="middle">${escapeXml(title)}</text>
    <text x="600" y="875" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#FF7B30" text-anchor="middle">${escapeXml(subtitle)}</text>
  </svg>
  `;
}

/** 4. Product Image Generator */
interface ProductTheme {
  id: string;
  name: string;
  category: "waffle" | "shake" | "drink" | "addon";
  primaryColor: string;
  toppingColor: string;
}

function createProductSvg(p: ProductTheme): string {
  const isShake = p.category === "shake";
  const isDrink = p.category === "drink";
  const isAddon = p.category === "addon";

  let mainGraphic = "";

  if (isShake) {
    // Milkshake Glass Graphic
    mainGraphic = `
      <g transform="translate(250, 120)">
        <!-- Straw -->
        <line x1="200" y1="20" x2="130" y2="280" stroke="#F24C8B" stroke-width="20" stroke-linecap="round"/>
        <!-- Whipped Cream Dome -->
        <path d="M 60 160 C 60 70, 240 70, 240 160 Z" fill="#FFFFFF" stroke="#201719" stroke-width="8"/>
        <circle cx="150" cy="85" r="24" fill="${p.toppingColor}"/>
        <!-- Shake Glass Body -->
        <polygon points="60,160 240,160 210,480 90,480" fill="${p.primaryColor}" stroke="#201719" stroke-width="10"/>
        <!-- Glass shine -->
        <line x1="85" y1="180" x2="105" y2="460" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.6"/>
        <!-- Glass Base -->
        <ellipse cx="150" cy="495" rx="75" ry="18" fill="#E2DCD5" stroke="#201719" stroke-width="8"/>
      </g>
    `;
  } else if (isDrink) {
    // Drink Glass Graphic
    mainGraphic = `
      <g transform="translate(250, 140)">
        <!-- Glass -->
        <polygon points="70,120 230,120 205,450 95,450" fill="${p.primaryColor}" opacity="0.9" stroke="#201719" stroke-width="10"/>
        <!-- Lemon slice or ice cubes -->
        <rect x="110" y="200" width="45" height="45" rx="8" fill="#FFFFFF" opacity="0.6" stroke="#201719" stroke-width="4"/>
        <rect x="145" y="270" width="45" height="45" rx="8" fill="#FFFFFF" opacity="0.6" stroke="#201719" stroke-width="4"/>
        <circle cx="190" cy="130" r="35" fill="${p.toppingColor}" stroke="#201719" stroke-width="6"/>
        <line x1="90" y1="150" x2="110" y2="430" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.5"/>
      </g>
    `;
  } else if (isAddon) {
    // Small dish / scoop
    mainGraphic = `
      <g transform="translate(250, 180)">
        <!-- Bowl -->
        <path d="M 40 240 Q 150 420, 260 240 Z" fill="#FFFFFF" stroke="#201719" stroke-width="12"/>
        <!-- Content Scoop -->
        <circle cx="150" cy="200" r="90" fill="${p.primaryColor}" stroke="#201719" stroke-width="10"/>
        <!-- Topping drizzle / chips -->
        <circle cx="130" cy="170" r="14" fill="${p.toppingColor}"/>
        <circle cx="170" cy="190" r="16" fill="${p.toppingColor}"/>
        <circle cx="140" cy="230" r="12" fill="${p.toppingColor}"/>
      </g>
    `;
  } else {
    // Waffle Pop Graphic
    mainGraphic = `
      <g transform="translate(260, 110)">
        <!-- Stick -->
        <rect x="125" y="360" width="30" height="180" rx="15" fill="#D4A373" stroke="#8C5E35" stroke-width="6"/>
        <!-- Waffle Base -->
        <rect x="40" y="30" width="200" height="340" rx="36" fill="#F7C978" stroke="#C47B2B" stroke-width="10"/>
        <!-- Waffle Grid -->
        ${[0, 1].map(c => [0, 1, 2].map(r => `
          <rect x="${65 + c * 75}" y="${65 + r * 75}" width="55" height="55" rx="10" fill="#E59E3D" stroke="#C47B2B" stroke-width="3"/>
        `).join("")).join("")}
        <!-- Glaze & Topping -->
        <path d="M 40 140 Q 90 220, 140 150 Q 190 230, 240 160 L 240 30 L 40 30 Z" fill="${p.primaryColor}" opacity="0.95"/>
        <circle cx="100" cy="90" r="14" fill="${p.toppingColor}"/>
        <circle cx="175" cy="115" r="16" fill="${p.toppingColor}"/>
        <circle cx="140" cy="65" r="12" fill="${p.toppingColor}"/>
      </g>
    `;
  }

  return `
  <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cardGrad_${p.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFDF9" />
        <stop offset="100%" stop-color="#FCEFD8" />
      </radialGradient>
      ${waffleGridPattern(`pat_${p.id}`, "#F5E4CE", "#FFFDF9")}
    </defs>
    
    <!-- Background Card -->
    <rect width="800" height="800" fill="url(#cardGrad_${p.id})"/>
    <rect width="800" height="800" fill="url(#pat_${p.id})" opacity="0.45"/>
    
    <!-- Outer Border -->
    <rect x="16" y="16" width="768" height="768" rx="40" fill="none" stroke="#201719" stroke-width="6"/>

    <!-- Central Art -->
    ${mainGraphic}
    
    <!-- Top Demo Badge -->
    <g transform="translate(40, 40)">
      <rect x="0" y="0" width="130" height="40" rx="20" fill="#201719"/>
      <text x="65" y="26" font-family="system-ui, sans-serif" font-size="15" font-weight="900" fill="#BCE84A" text-anchor="middle" letter-spacing="2">DEMO</text>
    </g>

    <!-- Bottom Product Title Banner -->
    <g transform="translate(400, 715)">
      <rect x="-240" y="-36" width="480" height="64" rx="24" fill="#201719" stroke="#FF7B30" stroke-width="3"/>
      <text x="0" y="6" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#FFF7EC" text-anchor="middle">${escapeXml(p.name)}</text>
    </g>
  </svg>
  `;
}

/** 5. Cafe & Atmosphere Gallery / GMaps Image Generator */
function createSceneSvg(title: string, subtitle: string, iconType: string, accentColor = "#FF7B30"): string {
  let iconContent = "";
  if (iconType === "cafe") {
    // Cafe counter / store front
    iconContent = `
      <g transform="translate(320, 160)">
        <!-- Roof awning -->
        <polygon points="0,90 360,90 320,20 40,20" fill="${accentColor}" stroke="#201719" stroke-width="8"/>
        <!-- Shop sign -->
        <rect x="60" y="105" width="240" height="60" rx="14" fill="#201719"/>
        <text x="180" y="145" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#FFF7EC" text-anchor="middle" letter-spacing="3">DEMO CAFE</text>
        <!-- Counter -->
        <rect x="40" y="180" width="280" height="180" rx="18" fill="#FFF7EC" stroke="#201719" stroke-width="10"/>
        <rect x="60" y="200" width="240" height="70" rx="10" fill="#E59E3D" opacity="0.3"/>
        <circle cx="180" cy="300" r="26" fill="#F24C8B"/>
      </g>
    `;
  } else if (iconType === "neon") {
    // Glowing neon sign
    iconContent = `
      <g transform="translate(320, 180)">
        <circle cx="180" cy="180" r="160" fill="#201719" stroke="${accentColor}" stroke-width="12"/>
        <circle cx="180" cy="180" r="130" fill="none" stroke="#F24C8B" stroke-width="6"/>
        <text x="180" y="170" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#BCE84A" text-anchor="middle" letter-spacing="3">DEMO</text>
        <text x="180" y="220" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#42C7D9" text-anchor="middle" letter-spacing="4">WAFFLES</text>
      </g>
    `;
  } else if (iconType === "menu") {
    // Menu board
    iconContent = `
      <g transform="translate(340, 150)">
        <rect x="0" y="0" width="320" height="380" rx="24" fill="#201719" stroke="#FFF7EC" stroke-width="8"/>
        <text x="160" y="55" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#FF7B30" text-anchor="middle">DEMO MENU</text>
        <line x1="40" y1="80" x2="280" y2="80" stroke="#FFF7EC" stroke-width="2" opacity="0.4"/>
        <text x="50" y="130" font-family="sans-serif" font-size="16" fill="#FFF7EC">Classic Waffle Pop</text>
        <text x="260" y="130" font-family="sans-serif" font-size="16" fill="#BCE84A" text-anchor="end">DEMO</text>
        <text x="50" y="180" font-family="sans-serif" font-size="16" fill="#FFF7EC">Nutella Crunch</text>
        <text x="260" y="180" font-family="sans-serif" font-size="16" fill="#BCE84A" text-anchor="end">DEMO</text>
        <text x="50" y="230" font-family="sans-serif" font-size="16" fill="#FFF7EC">Strawberry Swirl</text>
        <text x="260" y="230" font-family="sans-serif" font-size="16" fill="#BCE84A" text-anchor="end">DEMO</text>
        <text x="50" y="280" font-family="sans-serif" font-size="16" fill="#FFF7EC">Thick Shake</text>
        <text x="260" y="280" font-family="sans-serif" font-size="16" fill="#BCE84A" text-anchor="end">DEMO</text>
      </g>
    `;
  } else {
    // Waffle spread / treats platter
    iconContent = `
      <g transform="translate(320, 160)">
        <ellipse cx="180" cy="220" rx="170" ry="90" fill="#FFF7EC" stroke="#201719" stroke-width="10"/>
        <rect x="90" y="160" width="80" height="90" rx="16" fill="#F7C978" stroke="#C47B2B" stroke-width="6"/>
        <rect x="190" y="160" width="80" height="90" rx="16" fill="#F7C978" stroke="#C47B2B" stroke-width="6"/>
        <circle cx="180" cy="150" r="30" fill="#E53E5D"/>
        <circle cx="210" cy="140" r="24" fill="#4338CA"/>
        <circle cx="150" cy="140" r="20" fill="#F24C8B"/>
      </g>
    `;
  }

  return `
  <svg width="1000" height="750" viewBox="0 0 1000 750" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#201719" />
        <stop offset="100%" stop-color="#2D1D23" />
      </linearGradient>
    </defs>
    
    <rect width="1000" height="750" fill="url(#scGrad)"/>
    
    <!-- Soft glow -->
    <circle cx="500" cy="350" r="280" fill="${accentColor}" opacity="0.15" filter="blur(50px)"/>

    <!-- Icon Art -->
    ${iconContent}

    <!-- Top Badge -->
    <g transform="translate(50, 50)">
      <rect x="0" y="0" width="130" height="38" rx="19" fill="#FFF7EC" opacity="0.12"/>
      <text x="65" y="24" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#BCE84A" text-anchor="middle" letter-spacing="2">DEMO</text>
    </g>

    <!-- Bottom Text -->
    <text x="500" y="650" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#FFF7EC" text-anchor="middle">${escapeXml(title)}</text>
    <text x="500" y="690" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#FF7B30" text-anchor="middle">${escapeXml(subtitle)}</text>
  </svg>
  `;
}

/** 6. All product configurations */
const PRODUCTS: ProductTheme[] = [
  // Classic Waffles
  { id: "strawberry", name: "Demo Strawberry", category: "waffle", primaryColor: "#E53E5D", toppingColor: "#FFFFFF" },
  { id: "blueberry", name: "Demo Blueberry", category: "waffle", primaryColor: "#4338CA", toppingColor: "#BCE84A" },
  { id: "choco-chip-classic", name: "Demo Choco Chip", category: "waffle", primaryColor: "#4A2810", toppingColor: "#201719" },
  { id: "banana", name: "Demo Banana", category: "waffle", primaryColor: "#F59E0B", toppingColor: "#4A2810" },
  { id: "kitkat", name: "Demo Kitkat", category: "waffle", primaryColor: "#B91C1C", toppingColor: "#4A2810" },
  { id: "nutella-crunch", name: "Demo Nutella Crunch", category: "waffle", primaryColor: "#4A2810", toppingColor: "#F7C978" },
  { id: "red-velvet", name: "Demo Red Velvet", category: "waffle", primaryColor: "#991B1B", toppingColor: "#FFFFFF" },
  { id: "strawberry-swirl", name: "Demo Strawberry Swirl", category: "waffle", primaryColor: "#F24C8B", toppingColor: "#FFFFFF" },
  { id: "oreo-crunch", name: "Demo Oreo Crunch", category: "waffle", primaryColor: "#18181B", toppingColor: "#FFFFFF" },
  { id: "biscoff-bliss", name: "Demo Biscoff Bliss", category: "waffle", primaryColor: "#B45309", toppingColor: "#F7C978" },
  
  // Nutella Waffles
  { id: "banana-nutella-nuts", name: "Demo Banana Nutella", category: "waffle", primaryColor: "#4A2810", toppingColor: "#F59E0B" },
  { id: "nutella-crunch-nuts", name: "Demo Nutella & Nuts", category: "waffle", primaryColor: "#4A2810", toppingColor: "#F7C978" },
  { id: "strawberry-banana-nutella", name: "Demo Strawberry Banana", category: "waffle", primaryColor: "#E53E5D", toppingColor: "#F59E0B" },
  { id: "double-strawberry-nutella", name: "Demo Double Berry", category: "waffle", primaryColor: "#E53E5D", toppingColor: "#4A2810" },
  { id: "kitkat-crunch", name: "Demo Kitkat Crisp", category: "waffle", primaryColor: "#B91C1C", toppingColor: "#F7C978" },

  // Shakes
  { id: "oreo-crush", name: "Demo Oreo Shake", category: "shake", primaryColor: "#27272A", toppingColor: "#18181B" },
  { id: "strawberry-breeze", name: "Demo Strawberry Shake", category: "shake", primaryColor: "#F472B6", toppingColor: "#E53E5D" },
  { id: "kitkat-fusion", name: "Demo Kitkat Shake", category: "shake", primaryColor: "#78350F", toppingColor: "#B91C1C" },
  { id: "blueberry-frost", name: "Demo Blueberry Shake", category: "shake", primaryColor: "#6366F1", toppingColor: "#4338CA" },
  { id: "nutella-bliss", name: "Demo Nutella Shake", category: "shake", primaryColor: "#592E13", toppingColor: "#F7C978" },

  // Drinks
  { id: "mint-lemonade", name: "Demo Mint Lemonade", category: "drink", primaryColor: "#84CC16", toppingColor: "#FBBF24" },
  { id: "house-milk-coffee", name: "Demo Iced Coffee", category: "drink", primaryColor: "#A16207", toppingColor: "#F3E8FF" },

  // Add-ons
  { id: "add-on-ice-cream", name: "Demo Ice Cream", category: "addon", primaryColor: "#FEF08A", toppingColor: "#F24C8B" },
  { id: "add-on-whipped-cream", name: "Demo Whipped Cream", category: "addon", primaryColor: "#FFFFFF", toppingColor: "#E53E5D" },
  { id: "add-on-extra-nutella", name: "Demo Extra Nutella", category: "addon", primaryColor: "#4A2810", toppingColor: "#F7C978" },
  { id: "add-on-extra-nuts", name: "Demo Roasted Nuts", category: "addon", primaryColor: "#D97706", toppingColor: "#78350F" },
  { id: "add-on-choco-chip", name: "Demo Chocolate Chips", category: "addon", primaryColor: "#292524", toppingColor: "#4A2810" },
];

async function main() {
  console.log("Generating demo pictures and brand assets...");

  // 1. Logos & Favicons
  console.log("- Generating Logos...");
  const logoSvg = createLogoSvg(512);
  fs.writeFileSync(path.join(PUBLIC_DIR, "logo.svg"), logoSvg);
  fs.writeFileSync(path.join(IMAGES_DIR, "logo.svg"), logoSvg);
  
  await sharp(Buffer.from(logoSvg)).png().toFile(path.join(IMAGES_DIR, "logo.png"));
  await sharp(Buffer.from(logoSvg)).png().toFile(path.join(IMAGES_DIR, "logo-full.png"));
  await sharp(Buffer.from(logoSvg)).resize(176, 176).png().toFile(path.join(IMAGES_DIR, "logo-176.png"));
  await sharp(Buffer.from(logoSvg)).resize(176, 176).webp().toFile(path.join(IMAGES_DIR, "logo-176.webp"));
  await sharp(Buffer.from(logoSvg)).resize(180, 180).png().toFile(path.join(IMAGES_DIR, "apple-touch-icon.png"));
  await sharp(Buffer.from(logoSvg)).resize(192, 192).png().toFile(path.join(IMAGES_DIR, "icon-192.png"));
  await sharp(Buffer.from(logoSvg)).resize(48, 48).png().toFile(path.join(IMAGES_DIR, "favicon-48.png"));

  // 2. OpenGraph & Hero Images
  console.log("- Generating OG & Hero images...");
  const ogSvg = createOgImageSvg();
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 90 }).toFile(path.join(IMAGES_DIR, "og-image.jpg"));

  const heroSvg = createHeroWaffleSvg("DEMO WAFFLE POPS", "Freshly Pressed & Dipped");
  await sharp(Buffer.from(heroSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "hero-waffle.webp"));
  await sharp(Buffer.from(heroSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "hero-waffle-gmaps.webp"));

  const sigStrawberrySvg = createHeroWaffleSvg("DEMO STRAWBERRY SWIRL", "Sweet Glaze & Cream");
  await sharp(Buffer.from(sigStrawberrySvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "sig-strawberry.webp"));

  const sigOreoSvg = createHeroWaffleSvg("DEMO OREO CRUNCH", "Chocolate & Cookie Crumbles");
  await sharp(Buffer.from(sigOreoSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "sig-oreo.webp"));

  const sigNutellaSvg = createHeroWaffleSvg("DEMO NUTELLA CRUNCH", "Hazelnut Dip & Crispy Sprinkles");
  await sharp(Buffer.from(sigNutellaSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "sig-nutella.webp"));

  const offerSvg = createHeroWaffleSvg("DEMO SPECIAL OFFER", "Waffle Pop + Drink Combo");
  await sharp(Buffer.from(offerSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "offer-berry-brew.webp"));

  const posterSvg = createHeroWaffleSvg("DEMO MENU POSTER", "Explore All Flavours");
  await sharp(Buffer.from(posterSvg)).webp({ quality: 85 }).toFile(path.join(IMAGES_DIR, "menu-poster.webp"));

  // 3. Products
  console.log(`- Generating ${PRODUCTS.length} product images...`);
  for (const prod of PRODUCTS) {
    const prodSvg = createProductSvg(prod);
    await sharp(Buffer.from(prodSvg)).webp({ quality: 85 }).toFile(path.join(PRODUCTS_DIR, `${prod.id}.webp`));
  }

  // 4. Gallery Images (8 images)
  console.log("- Generating Gallery images...");
  const galleryScenes = [
    { file: "counter-order.webp", title: "Demo Ordering Counter", sub: "Fast & friendly counter service", type: "cafe", color: "#FF7B30" },
    { file: "interior-counter.webp", title: "Demo Cafe Interior", sub: "Cozy atmosphere & sweet aroma", type: "cafe", color: "#42C7D9" },
    { file: "menu-card.webp", title: "Demo Menu Display", sub: "All waffles & drinks at a glance", type: "menu", color: "#F24C8B" },
    { file: "mural-logo.webp", title: "Demo Pop-Art Mural", sub: "Vibrant wall art & signature mascot", type: "neon", color: "#7B4FF3" },
    { file: "ordering-experience.webp", title: "Demo Guest Experience", sub: "Made fresh to order every time", type: "cafe", color: "#BCE84A" },
    { file: "shop-sign.webp", title: "Demo Glowing Sign", sub: "Spot the bright waffle logo", type: "neon", color: "#FF7B30" },
    { file: "waffle-closeup.webp", title: "Demo Waffle Pop", sub: "Golden crisp on a stick", type: "spread", color: "#F24C8B" },
    { file: "waffle-spread.webp", title: "Demo Waffle Platter", sub: "Assortment of sweet toppings", type: "spread", color: "#42C7D9" },
  ];
  for (const sc of galleryScenes) {
    const scSvg = createSceneSvg(sc.title, sc.sub, sc.type, sc.color);
    await sharp(Buffer.from(scSvg)).webp({ quality: 85 }).toFile(path.join(GALLERY_DIR, sc.file));
  }

  // 5. Gmaps Images (9 images)
  console.log("- Generating GMaps images...");
  const gmapsScenes = [
    { file: "cherry-waffles.webp", title: "Demo Berry Waffles", sub: "Fresh berries & warm waffle", type: "spread", color: "#E53E5D" },
    { file: "choco-waffle-box.webp", title: "Demo Waffle Box", sub: "Ready for takeaway & snacking", type: "spread", color: "#4A2810" },
    { file: "drink.webp", title: "Demo Chilled Drink", sub: "Refreshing beverage", type: "drink", color: "#42C7D9" },
    { file: "exterior-busy.webp", title: "Demo Cafe Evening", sub: "Lively evening crowd", type: "cafe", color: "#FF7B30" },
    { file: "exterior-night.webp", title: "Demo Shop at Night", sub: "Warm glow & sweet treats", type: "neon", color: "#7B4FF3" },
    { file: "exterior-wide.webp", title: "Demo Street View", sub: "Easy to find on Demo Street", type: "cafe", color: "#BCE84A" },
    { file: "exterior.webp", title: "Demo Store Front", sub: "Welcome to Demo Waffles", type: "cafe", color: "#FF7B30" },
    { file: "sign.webp", title: "Demo Signboard", sub: "Circular waffle emblem", type: "neon", color: "#F24C8B" },
    { file: "waffle-pops.webp", title: "Demo Waffle Pops Platter", sub: "Dipped & decorated", type: "spread", color: "#FF7B30" },
  ];
  for (const gm of gmapsScenes) {
    const gmSvg = createSceneSvg(gm.title, gm.sub, gm.type, gm.color);
    await sharp(Buffer.from(gmSvg)).webp({ quality: 85 }).toFile(path.join(GMAPS_DIR, gm.file));
  }

  console.log("All demo pictures generated successfully!");
}

main().catch((err) => {
  console.error("Error generating demo pictures:", err);
  process.exit(1);
});
