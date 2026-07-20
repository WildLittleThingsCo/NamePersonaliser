```javascript
// Simple product visualiser
// The generated name always uses the Mochi Boom font.

const collectionPalettes = {
  ceramic: [
    {
      name: "Lilac",
      hex: "#C5A6D8"
    },
    {
      name: "Soft Pink",
      hex: "#E8B6C2"
    },
    {
      name: "Ice Blue",
      hex: "#AFCEDC"
    },
    {
      name: "Apple Green",
      hex: "#A8C98E"
    },
    {
      name: "Lemon",
      hex: "#E7D47A"
    },
    {
      name: "Mandarin",
      hex: "#D98B55"
    },
    {
      name: "Plum",
      hex: "#754B68"
    },
    {
      name: "Marine",
      hex: "#416B7A"
    }
  ],

  wildBear: [
    {
      name: "Ivory White",
      hex: "#EEE9DF"
    },
    {
      name: "Beige",
      hex: "#D2BFA4"
    },
    {
      name: "Latte",
      hex: "#B99F82"
    },
    {
      name: "Caramel",
      hex: "#A9784F"
    },
    {
      name: "Chocolate Brown",
      hex: "#6E4935"
    },
    {
      name: "Dark Brown",
      hex: "#443126"
    },
    {
      name: "Desert Tan",
      hex: "#C6A77C"
    },
    {
      name: "Nardo Grey",
      hex: "#9A9A94"
    }
  ]
};

const nameInput = document.getElementById("nameInput");
const collectionSelect =
  document.getElementById("collectionSelect");
const swatchesEl = document.getElementById("swatches");
const previewCanvas = document.getElementById("previewCanvas");
const ctx = previewCanvas.getContext("2d");
const customColor = document.getElementById("customColor");
const addCustom = document.getElementById("addCustom");
const downloadBtn = document.getElementById("downloadBtn");
const bgUpload = document.getElementById("bgUpload");
const resetBtn = document.getElementById("resetBtn");

let activeCollection = collectionSelect.value;

let activePalette =
  collectionPalettes[activeCollection];

let selectedColor =
  activePalette[0].hex;
let bgImage = null;
let mochiFontLoaded = false;

// Load Mochi Boom specifically for the canvas.
const mochiFont = new FontFace(
  "Mochi",
  'url("fonts/MochiBoom.ttf")'
);

async function loadMochiFont() {
  try {
    const loadedFont = await mochiFont.load();
    document.fonts.add(loadedFont);
    mochiFontLoaded = true;
    render();
  } catch (error) {
    console.error("Mochi Boom could not be loaded:", error);
  }
}

// Populate colour swatches.
function buildSwatches() {
  swatchesEl.innerHTML = "";

  palette.forEach((colour) => {
    const swatch = document.createElement("button");

    swatch.className = "swatch";
    swatch.type = "button";
    swatch.style.background = colour;
    swatch.title = colour;
    swatch.dataset.color = colour;

    if (colour === selectedColor) {
      swatch.classList.add("selected");
    }

    swatch.addEventListener("click", () => {
      selectedColor = colour;

      document.querySelectorAll(".swatch").forEach((item) => {
        item.classList.remove("selected");
      });

      swatch.classList.add("selected");
      render();
    });

    swatchesEl.appendChild(swatch);
  });
}

buildSwatches();

addCustom.addEventListener("click", () => {
  const colour = customColor.value;

  if (!palette.includes(colour)) {
    palette.unshift(colour);
  }

  selectedColor = colour;
  buildSwatches();
  render();
});

nameInput.addEventListener("input", render);

customColor.addEventListener("input", (event) => {
  selectedColor = event.target.value;

  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.classList.remove("selected");
  });

  render();
});

bgUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      bgImage = image;
      render();
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

resetBtn.addEventListener("click", () => {
  nameInput.value = "";
  bgImage = null;
  bgUpload.value = "";
  selectedColor = palette[0];
  customColor.value = "#000000";

  buildSwatches();
  render();
});

downloadBtn.addEventListener("click", () => {
  render();

  const link = document.createElement("a");
  const filename = (nameInput.value || "design").replace(/\s+/g, "_");

  link.download = `${filename}.png`;
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

function render() {
  const width = previewCanvas.width;
  const height = previewCanvas.height;

  ctx.clearRect(0, 0, width, height);

  // Draw uploaded background.
  if (bgImage) {
    const canvasRatio = width / height;
    const imageRatio = bgImage.width / bgImage.height;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = bgImage.width;
    let sourceHeight = bgImage.height;

    if (imageRatio > canvasRatio) {
      const newWidth = bgImage.height * canvasRatio;
      sourceX = (bgImage.width - newWidth) / 2;
      sourceWidth = newWidth;
    } else {
      const newHeight = bgImage.width / canvasRatio;
      sourceY = (bgImage.height - newHeight) / 2;
      sourceHeight = newHeight;
    }

    ctx.drawImage(
      bgImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height
    );
  } else {
    // Draw the sample product background.
    ctx.save();
    ctx.fillStyle = "#00000008";
    ctx.fillRect(18, 18, width - 36, height - 36);
    ctx.restore();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#f0f2f4");

    roundRect(ctx, 0, 0, width, height, 16);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = "#d6dbe0";
    ctx.lineWidth = 1;

    roundRect(ctx, 0.5, 0.5, width - 1, height - 1, 16);
    ctx.stroke();
  }

  const text = nameInput.value.trim() || "Sample Name";

  let fontSize = Math.floor(height * 0.5);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = selectedColor;

  // Always use Mochi Boom for the generated name.
  ctx.font = `${fontSize}px "Mochi"`;

  // Reduce the font size until the complete name fits.
  while (
    ctx.measureText(text).width > width - 160 &&
    fontSize > 10
  ) {
    fontSize -= 4;
    ctx.font = `${fontSize}px "Mochi"`;
  }

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = selectedColor;
  ctx.fillText(text, width / 2, height / 2);
  ctx.restore();

  ctx.lineWidth = Math.max(1, fontSize * 0.04);
  ctx.strokeStyle = hexToRgba(selectedColor, 0.05);
  ctx.strokeText(text, width / 2, height / 2);

  if (!mochiFontLoaded) {
    console.log("Waiting for the Mochi Boom font to load.");
  }
}

// Helper for drawing rounded rectangles.
function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

// Convert a hex colour to RGBA.
function hexToRgba(hex, alpha = 1) {
  if (!hex) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const cleanedHex = hex.replace("#", "");

  const expandedHex =
    cleanedHex.length === 3
      ? cleanedHex
          .split("")
          .map((character) => character + character)
          .join("")
      : cleanedHex;

  const colourNumber = parseInt(expandedHex, 16);

  const red = (colourNumber >> 16) & 255;
  const green = (colourNumber >> 8) & 255;
  const blue = colourNumber & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

// Load the font, then render the visualiser.
loadMochiFont();
```
