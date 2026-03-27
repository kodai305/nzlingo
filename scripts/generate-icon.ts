import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const ICONS_DIR = resolve(__dirname, "../public/icons");

// NZLingo icon: movie clapperboard + speech bubble on indigo background
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>

  <!-- Clapperboard base -->
  <rect x="100" y="200" width="220" height="170" rx="16" fill="white" opacity="0.95"/>

  <!-- Clapperboard top (hinged part) -->
  <polygon points="90,200 110,145 320,145 330,200" fill="white" opacity="0.95"/>

  <!-- Clapperboard stripes -->
  <polygon points="105,200 118,155 148,155 135,200" fill="#4f46e5"/>
  <polygon points="155,200 168,155 198,155 185,200" fill="#4f46e5"/>
  <polygon points="205,200 218,155 248,155 235,200" fill="#4f46e5"/>
  <polygon points="255,200 268,155 298,155 285,200" fill="#4f46e5"/>

  <!-- Clapperboard lines -->
  <rect x="120" y="230" width="180" height="8" rx="4" fill="#e0e0e0"/>
  <rect x="120" y="260" width="140" height="8" rx="4" fill="#e0e0e0"/>
  <rect x="120" y="290" width="160" height="8" rx="4" fill="#e0e0e0"/>

  <!-- Speech bubble -->
  <path d="M280,120 Q280,70 340,70 L420,70 Q450,70 450,100 L450,180 Q450,210 420,210 L360,210 L330,250 L340,210 L310,210 Q280,210 280,180 Z" fill="white" opacity="0.95"/>

  <!-- Speech bubble dots (speaking) -->
  <circle cx="340" cy="140" r="10" fill="#6366f1"/>
  <circle cx="370" cy="140" r="10" fill="#818cf8"/>
  <circle cx="400" cy="140" r="10" fill="#a5b4fc"/>
</svg>
`;

async function generateIcons() {
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgIcon);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(resolve(ICONS_DIR, "icon-192.png"));
  console.log("✓ icon-192.png");

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(resolve(ICONS_DIR, "icon-512.png"));
  console.log("✓ icon-512.png");

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(resolve(ICONS_DIR, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // Favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(resolve(ICONS_DIR, "favicon-32.png"));
  console.log("✓ favicon-32.png");

  console.log("\nDone! Icons generated in public/icons/");
}

generateIcons();
