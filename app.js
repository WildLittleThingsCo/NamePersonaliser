// Simple visualiser
// Replace the colors array with your official product hex colour codes.
// You can also fetch colours from an API and populate `palette` dynamically.
const palette = [
  "#0f4c81", // deep blue
  "#c0392b", // red
  "#27ae60", // green
  "#f39c12", // amber
  "#8e44ad", // purple
  "#ecf0f1", // silver-like light
  "#2c3e50"  // dark slate
];

const nameInput = document.getElementById("nameInput");
const fontSelect = document.getElementById("fontSelect");
const swatchesEl = document.getElementById("swatches");
const previewCanvas = document.getElementById("previewCanvas");
const ctx = previewCanvas.getContext("2d");
const customColor = document.getElementById("customColor");
const addCustom = document.getElementById("addCustom");
const downloadBtn = document.getElementById("downloadBtn");
const bgUpload = document.getElementById("bgUpload");
const resetBtn = document.getElementById("resetBtn");

let selectedColor = palette[0];
let bgImage = null;

// Populate swatches
function buildSwatches(){
  swatchesEl.innerHTML = "";
  palette.forEach((c, idx) => {
    const d = document.createElement("button");
    d.className = "swatch";
    d.style.background = c;
    d.title = c;
    d.dataset.color = c;
    if (c === selectedColor) d.classList.add("selected");
    d.addEventListener("click", () => {
      selectedColor = c;
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
      d.classList.add("selected");
      render();
    });
    swatchesEl.appendChild(d);
  });
}
buildSwatches();

addCustom.addEventListener("click", () => {
  const c = customColor.value;
  if (!palette.includes(c)){
    palette.unshift(c);
    selectedColor = c;
    buildSwatches();
    render();
  } else {
    selectedColor = c;
    buildSwatches();
    render();
  }
});

nameInput.addEventListener("input", render);
fontSelect.addEventListener("change", render);
customColor.addEventListener("input", e => {
  // live-preview custom color (not added until Add)
  selectedColor = e.target.value;
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
  render();
});

bgUpload.addEventListener("change", (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      bgImage = img;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

resetBtn.addEventListener("click", () => {
  nameInput.value = "";
  fontSelect.value = "Montserrat, sans-serif";
  bgImage = null;
  selectedColor = palette[0];
  customColor.value = "#000000";
  buildSwatches();
  render();
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${(nameInput.value || "design").replace(/\s+/g,"_")}.png`;
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

function render(){
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  // Clear
  ctx.clearRect(0,0,w,h);

  // Draw product background area (example: a brushed plate look or uploaded image)
  if (bgImage){
    // fit bg image into canvas preserving aspect and center-crop
    const arCanvas = w / h;
    const arImg = bgImage.width / bgImage.height;
    let sx=0, sy=0, sw=bgImage.width, sh=bgImage.height;
    if (arImg > arCanvas){
      // crop sides
      const newW = bgImage.height * arCanvas;
      sx = (bgImage.width - newW) / 2;
      sw = newW;
    } else {
      // crop top/bottom
      const newH = bgImage.width / arCanvas;
      sy = (bgImage.height - newH) / 2;
      sh = newH;
    }
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    // Draw a simple mock product (rounded rectangle with subtle gradient + shadow)
    // Shadow
    ctx.save();
    ctx.fillStyle = "#00000008";
    ctx.fillRect(18, 18, w-36, h-36);
    ctx.restore();
    // Plate
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, "#f0f2f4");
    roundRect(ctx, 0, 0, w, h, 16);
    ctx.fillStyle = grad;
    ctx.fill();
    // subtle inner border
    ctx.strokeStyle = "#d6dbe0";
    ctx.lineWidth = 1;
    roundRect(ctx, 0.5, 0.5, w-1, h-1, 16);
    ctx.stroke();
  }

  // Render the name text centered
  const text = nameInput.value || "Sample Name";
  const fontFamily = fontSelect.value;
  // Dynamic font sizing algorithm: try large size then reduce to fit
  let fontSize = Math.floor(h * 0.5); // start big
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = selectedColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  // reduce until fits width
  while (ctx.measureText(text).width > (w - 160) && fontSize > 10){
    fontSize -= 4;
    ctx.font = `${fontSize}px ${fontFamily}`;
  }
  // Add subtle text effects (simulating finish)
  // - For metallic finishes you might add a highlight; here we just draw a strong fill and optional subtle stroke for contrast
  ctx.save();
  // soft drop shadow for contrast
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = selectedColor;
  ctx.fillText(text, w/2, h/2);
  ctx.restore();

  // optional: light bevel effect for shiny paints
  // small light stroke
  ctx.lineWidth = Math.max(1, fontSize * 0.04);
  ctx.strokeStyle = hexToRgba(selectedColor, 0.05);
  ctx.strokeText(text, w/2, h/2);
}

// Helper: rounded rect path
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// convert hex to rgba
function hexToRgba(hex, alpha = 1){
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#","");
  const bigint = parseInt(h.length === 3 ? h.split('').map(ch => ch+ch).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// initial render
render();
