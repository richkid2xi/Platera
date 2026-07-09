export function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function injectThemeColor(hex: string) {
  if (!hex || typeof window === 'undefined') return;
  
  const baseHsl = hexToHSL(hex);
  
  // Tailwind default Lightness progression approximation
  const lightnessMap: Record<number, number> = {
    50: 95,
    100: 90,
    200: 80,
    300: 70,
    400: 60,
    500: baseHsl.l, // Keep the base exactly as provided
    600: Math.max(10, baseHsl.l - 10),
    700: Math.max(10, baseHsl.l - 20),
    800: Math.max(10, baseHsl.l - 30),
    900: Math.max(10, baseHsl.l - 40),
  };

  let cssVars = '';
  for (const [shade, lightness] of Object.entries(lightnessMap)) {
    const shadeHex = hslToHex(baseHsl.h, baseHsl.s, lightness);
    cssVars += `  --color-primary-${shade}: ${shadeHex};\n`;
  }

  const styleId = 'platera-dynamic-theme';
  let styleEl = document.getElementById(styleId);
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
${cssVars}
    }
  `;
}
