const fs = require('fs');
const path = require('path');

// Extract SVG string from server.js template
const sampleData = {
  headline: "MOBILITÉ FRANCOPHONE WORK PERMIT WITHOUT LMIA FRENCH...",
  badgeText: "MOBILITÉ FRANCOPHONE PR",
  subtitle: "Regulated RCIC Legal Guidance & Application Support Across Canada",
  bullet1: "Mobilité Francophone work permit without LMIA for French speak...",
  bullet2: "Employer job offer & Provincial Nomination (PNP) assessment",
  bullet3: "Spouse Open Work Permit (SOWP) eligibility for accompanying fa...",
  bullet4: "Complete legal representation by licensed RCIC consultants",
  ctaText: "👉 BOOK YOUR OFFICIAL CONSULTATION TODAY"
};

function renderNativeSvgTextLines(text, startX, startY, maxLen, lineHeight, color, fontSize, fontWeight, anchor = 'start', fontFamily = 'Montserrat') {
  if (!text) return '';
  const clean = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const words = clean.split(' ');
  const lines = [];
  let currentLine = '';

  for (let w of words) {
    if ((currentLine + ' ' + w).length <= maxLen) {
      currentLine += (currentLine ? ' ' : '') + w;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = w;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.map((line, idx) => 
    `<text x="${startX}" y="${startY + (idx * lineHeight)}" font-family="'${fontFamily}', sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="${anchor}">${line}</text>`
  ).join('\n');
}

const activeHighlightColor = '#C41E3A';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&amp;family=Playfair+Display:wght@700;800;900&amp;display=swap');
    </style>
    <clipPath id="photoClip">
      <rect width="414" height="606" rx="28"/>
    </clipPath>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- BACKGROUND -->
  <rect width="1080" height="1080" fill="#F8FAFC"/>

  <!-- HEADER BRAND BAR -->
  <g transform="translate(0, 0)">
    <rect width="1080" height="150" fill="#FFFFFF"/>
    <!-- PROMINENT ENLARGED LOGO CARD -->
    <g transform="translate(45, 27)">
      <rect width="290" height="96" rx="14" fill="#FFFFFF" filter="url(#shadow)" stroke="#E2E8F0" stroke-width="1.5"/>
      <text x="145" y="55" font-family="'Playfair Display', serif" font-weight="900" font-size="28" fill="#C41E3A" text-anchor="middle">TravelBells</text>
      <text x="145" y="78" font-family="'Montserrat', sans-serif" font-weight="700" font-size="12" fill="#002B49" letter-spacing="2" text-anchor="middle">IMMIGRATION</text>
    </g>

    <!-- RCIC BADGE -->
    <g transform="translate(700, 48)">
      <rect width="335" height="54" rx="27" fill="#F8FAFC" stroke="#002B49" stroke-width="2"/>
      <text x="167" y="34" font-family="'Montserrat', sans-serif" font-weight="800" font-size="16" fill="#002B49" text-anchor="middle">🇨🇦 Licensed RCIC Member</text>
    </g>
  </g>

  <!-- MAIN CONTAINER CARD -->
  <g transform="translate(30, 165)" filter="url(#shadow)">
    <rect width="1020" height="615" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>

    <!-- LEFT GRADUATE / CANDIDATE IMAGE PLACEHOLDER -->
    <g transform="translate(20, 20)">
      <rect width="414" height="575" rx="20" fill="#E2E8F0"/>
      <text x="207" y="290" font-family="'Montserrat', sans-serif" font-weight="700" font-size="20" fill="#64748B" text-anchor="middle">Immigration Candidate</text>
    </g>

    <!-- RIGHT CONTENT AREA -->
    <g transform="translate(460, 30)">
      <!-- BADGE -->
      <rect x="0" y="0" width="325" height="38" rx="19" fill="${activeHighlightColor}"/>
      <text x="162" y="24" font-family="'Montserrat', sans-serif" font-weight="800" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${sampleData.badgeText}</text>

      <!-- HEADLINE -->
      <g transform="translate(0, 52)">
        ${renderNativeSvgTextLines(sampleData.headline, 0, 32, 28, 38, '#002B49', 30, '900', 'start', 'Playfair Display')}
      </g>

      <!-- SUBTITLE -->
      <g transform="translate(0, 140)">
        <text x="0" y="20" font-family="'Montserrat', sans-serif" font-weight="700" font-size="16" fill="#475569">Regulated RCIC Legal Guidance &amp;</text>
        <text x="0" y="44" font-family="'Montserrat', sans-serif" font-weight="700" font-size="16" fill="#475569">Application Support Across Canada</text>
      </g>

      <!-- 4 BULLET POINTS IN RED BORDER BOX -->
      <g transform="translate(0, 200)">
        <rect width="530" height="355" rx="16" fill="#FFFFFF" stroke="${activeHighlightColor}" stroke-width="2.5"/>

        <!-- Bullet 1 -->
        <g transform="translate(25, 25)">
          <circle cx="16" cy="16" r="15" fill="${activeHighlightColor}"/>
          <path d="M11 16 L15 20 L22 12" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          ${renderNativeSvgTextLines(sampleData.bullet1, 45, 22, 36, 23, '#002B49', 19, '800', 'start', 'Montserrat')}
        </g>

        <!-- Bullet 2 -->
        <g transform="translate(25, 110)">
          <circle cx="16" cy="16" r="15" fill="${activeHighlightColor}"/>
          <path d="M11 16 L15 20 L22 12" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          ${renderNativeSvgTextLines(sampleData.bullet2, 45, 22, 36, 23, '#002B49', 19, '800', 'start', 'Montserrat')}
        </g>

        <!-- Bullet 3 -->
        <g transform="translate(25, 200)">
          <circle cx="16" cy="16" r="15" fill="${activeHighlightColor}"/>
          <path d="M11 16 L15 20 L22 12" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          ${renderNativeSvgTextLines(sampleData.bullet3, 45, 22, 36, 23, '#002B49', 19, '800', 'start', 'Montserrat')}
        </g>

        <!-- Bullet 4 -->
        <g transform="translate(25, 290)">
          <circle cx="16" cy="16" r="15" fill="${activeHighlightColor}"/>
          <path d="M11 16 L15 20 L22 12" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          ${renderNativeSvgTextLines(sampleData.bullet4, 45, 22, 36, 23, '#002B49', 19, '800', 'start', 'Montserrat')}
        </g>
      </g>
    </g>
  </g>

  <!-- CTA BANNER BAR -->
  <g transform="translate(30, 795)" filter="url(#shadow)">
    <rect width="1020" height="64" rx="16" fill="${activeHighlightColor}"/>
    <text x="510" y="41" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="1">👉 BOOK YOUR OFFICIAL CONSULTATION TODAY</text>
  </g>

  <!-- FOOTER WITH 4 UNIFORM CRIMSON PILLS -->
  <g transform="translate(0, 875)">
    <rect width="1080" height="205" fill="#002B49"/>
    <rect width="1080" height="6" fill="${activeHighlightColor}"/>
    <g transform="translate(40, 35)">
      <rect x="0" y="0" width="480" height="50" rx="14" fill="#5B1425" stroke="#8B1E38" stroke-width="1.2"/>
      <text x="240" y="32" font-family="'Montserrat', sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="middle">🌐 www.travelbellsimmigration.com</text>

      <rect x="520" y="0" width="480" height="50" rx="14" fill="#5B1425" stroke="#8B1E38" stroke-width="1.2"/>
      <text x="760" y="32" font-family="'Montserrat', sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="middle">📧 info@travelbellsimmigration.com</text>

      <rect x="0" y="70" width="480" height="50" rx="14" fill="#5B1425" stroke="#8B1E38" stroke-width="1.2"/>
      <text x="240" y="102" font-family="'Montserrat', sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="middle">📞 +1 (647) 890-1476</text>

      <rect x="520" y="70" width="480" height="50" rx="14" fill="#5B1425" stroke="#8B1E38" stroke-width="1.2"/>
      <text x="760" y="102" font-family="'Montserrat', sans-serif" font-weight="800" font-size="16.5" fill="#FFFFFF" text-anchor="middle">📍 Ontario, Canada • Licensed RCIC Member</text>
    </g>
  </g>
</svg>`;

const svgPath = path.join(__dirname, 'final_creative_graphic_proof.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log("Saved SVG file to:", svgPath);
