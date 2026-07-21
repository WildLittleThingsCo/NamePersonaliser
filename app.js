// Wild Little Things & Co personalised letter visualiser.
// Each letter displays one colour circle.
// Clicking a circle opens one shared palette.

const collectionPalettes = {
  ceramic: [
    { name: "Soft Pink", hex: "#deb3ce" },
    { name: "Ice Blue", hex: "#b0d6e1" },
    { name: "Lilac", hex: "#a896c6" },
    { name: "Apple Green", hex: "#cbdf97" },
    { name: "Lemon", hex: "#f3dc74" },
    { name: "Mandarin", hex: "#eda16f" },
    { name: "Plum", hex: "#862550" },
    { name: "Purple", hex: "#412b5c" },
    { name: "Orange", hex: "#f09a43" },
    { name: "Yellow", hex: "#f2ed65" },
    { name: "Pink", hex: "#e16d76" },
    { name: "Red", hex: "#af452b" },
    { name: "Blue", hex: "#2455a2" },
    { name: "Green", hex: "#68b85f" },
    { name: "Tan", hex: "#e7dcbc" },
    { name: "Caramel", hex: "#a88764" },
    { name: "Dark Brown", hex: "#796759" },
    { name: "Chocolate", hex: "#3a2416" },
    { name: "Latte", hex: "#ceb9a8" },
    { name: "Charcoal", hex: "#000000" },
    { name: "Ivory White", hex: "#ffffff" }
  ],

  wildBear: [
    { name: "Tan", hex: "#e7dcbc" },
    { name: "Caramel", hex: "#a88764" },
    { name: "Dark Brown", hex: "#796759" },
    { name: "Chocolate", hex: "#3a2416" },
    { name: "Latte", hex: "#ceb9a8" },
    { name: "Charcoal", hex: "#000000" },
    { name: "Ivory White", hex: "#ffffff" },
    { name: "Soft Pink", hex: "#deb3ce" },
    { name: "Ice Blue", hex: "#b0d6e1" },
    { name: "Lilac", hex: "#a896c6" },
    { name: "Lemon", hex: "#f3dc74" }
  ],
};

const nameInput = document.getElementById("nameInput");
const collectionSelect = document.getElementById("collectionSelect");
const letterColorControls = document.getElementById("letterColorControls");
const sharedPalettePanel = document.getElementById("sharedPalettePanel");
const selectedLetterLabel = document.getElementById("selectedLetterLabel");
const sharedPalette = document.getElementById("sharedPalette");
const previewCanvas = document.getElementById("previewCanvas");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const ctx = previewCanvas.getContext("2d");

let activeCollection = collectionSelect.value;
let activePalette = collectionPalettes[activeCollection];
let letterColours = [];
let selectedLetterIndex = null;
let mochiFontLoaded = false;

// Load Mochi Boom for both the controls and canvas.
const mochiFont = new FontFace(
  "Mochi",
  'url("./Mochi%20Boom.otf")'
);

async function loadMochiFont() {
  try {
    const loadedFont = await mochiFont.load();

    document.fonts.add(loadedFont);
    mochiFontLoaded = true;

    // Force a small delay to ensure the font is registered
    await document.fonts.ready;

    buildLetterControls();
    render();
  } catch (error) {
    console.error("Mochi Boom could not be loaded:", error);

    // The visualiser will still work with a fallback font.
    buildLetterControls();
    render();
  }
}

// Return the current name without leading or trailing spaces.
function getCurrentText() {
  return nameInput.value.trim();
}

// Give each typed character a default colour.
function createDefaultLetterColours(text) {
  return Array.from(text).map((character, index) => {
    if (character === " ") {
      return null;
    }

    return activePalette[index % activePalette.length].hex;
  });
}

// Find the full colour information using a hex value.
function findColour(hex) {
  if (!hex) {
    return null;
  }

  return activePalette.find(
    (colour) => colour.hex.toLowerCase() === hex.toLowerCase()
  );
}

// Check if a colour exists in the active palette.
function colourExistsInActivePalette(hex) {
  if (!hex) {
    return false;
  }

  return activePalette.some(
    (colour) => colour.hex.toLowerCase() === hex.toLowerCase()
  );
}

// Keep existing colour choices when the customer adds or removes letters.
function syncLetterColours() {
  const characters = Array.from(getCurrentText());

  letterColours = characters.map((character, index) => {
    if (character === " ") {
      return null;
    }

    const existingColour = letterColours[index];

    if (existingColour && colourExistsInActivePalette(existingColour)) {
      return existingColour;
    }

    return activePalette[index % activePalette.length].hex;
  });
}

// Select a letter to open the shared palette.
function selectLetter(index, colourButton) {
  if (selectedLetterIndex === index) {
    selectedLetterIndex = null;
    sharedPalettePanel.classList.add("hidden");
    buildLetterControls();
    return;
  }

  selectedLetterIndex = index;

  buildLetterControls();
  buildSharedPalette();

  requestAnimationFrame(() => {
    positionPalettePopup(index);
  });
}

function positionPalettePopup(index) {
  const selectedControl = letterColorControls.querySelector(
    `.letter-control[data-index="${index}"]`
  );

  if (!selectedControl) {
    return;
  }

  sharedPalettePanel.style.left =
    `${selectedControl.offsetLeft + selectedControl.offsetWidth / 2}px`;

  sharedPalettePanel.style.top =
    `${selectedControl.offsetTop + selectedControl.offsetHeight + 12}px`;
}

// Create the clickable letter controls with colour circles.
function buildLetterControls() {
  const text = getCurrentText();

  letterColorControls.innerHTML = "";

  if (!text) {
    selectedLetterIndex = null;
    letterColours = [];

    const message = document.createElement("p");

    message.className = "empty-letter-message";
    message.textContent = "Enter a name above to begin choosing colours.";

    letterColorControls.appendChild(message);

    sharedPalettePanel.classList.add("hidden");

    return;
  }

  syncLetterColours();

  const characters = Array.from(text);

  const validSelectedLetter =
    selectedLetterIndex !== null &&
    characters[selectedLetterIndex] &&
    characters[selectedLetterIndex] !== " ";

  if (!validSelectedLetter) {
    selectedLetterIndex = null;
  }

  characters.forEach((character, index) => {
    if (character === " ") {
      return;
    }

    const control = document.createElement("div");
    control.className = "letter-control";
    control.dataset.index = index;

    if (index === selectedLetterIndex) {
      control.classList.add("selected");
    }

    const letterPreview = document.createElement("div");
    letterPreview.className = "letter-character";
    letterPreview.textContent = character;
    letterPreview.style.color = letterColours[index];

    letterPreview.addEventListener("click", () => {
    selectLetter(index, colourButton);
    });

    const colourButton = document.createElement("button");
    colourButton.type = "button";
    colourButton.className = "current-colour-button";
    colourButton.style.backgroundColor = letterColours[index];

    const selectedColour = findColour(letterColours[index]);
    colourButton.title = selectedColour ? selectedColour.name : "Choose colour";

    colourButton.setAttribute(
      "aria-label",
      `Choose colour for ${character}`
    );

    colourButton.addEventListener("click", () => {
    selectLetter(index, colourButton);
    });

    const colourName = document.createElement("div");
    colourName.className = "letter-colour-name";
    colourName.textContent = selectedColour ? selectedColour.name : "Choose colour";

    control.appendChild(letterPreview);
    control.appendChild(colourButton);
    control.appendChild(colourName);

    letterColorControls.appendChild(control);
  });

  buildSharedPalette();
}

// Build the shared palette panel that appears below the letter controls.
function buildSharedPalette() {
  sharedPalette.innerHTML = "";

  const text = getCurrentText();
  const characters = Array.from(text);

  if (
    selectedLetterIndex === null ||
    !characters[selectedLetterIndex] ||
    characters[selectedLetterIndex] === " "
  ) {
    sharedPalettePanel.classList.add("hidden");
    return;
  }

  sharedPalettePanel.classList.remove("hidden");

  const selectedCharacter = characters[selectedLetterIndex];

  selectedLetterLabel.textContent = `Choose a colour for ${selectedCharacter}`;

  activePalette.forEach((colour) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "shared-colour-button";

    button.style.backgroundColor = colour.hex;
    button.title = colour.name;

    button.setAttribute(
      "aria-label",
      `Set ${selectedCharacter} to ${colour.name}`
    );

    const currentColour = letterColours[selectedLetterIndex];

    if (
      currentColour &&
      colour.hex.toLowerCase() === currentColour.toLowerCase()
    ) {
      button.classList.add("selected");
    }

   button.addEventListener("click", () => {
  letterColours[selectedLetterIndex] = colour.hex;

  selectedLetterIndex = null;
  sharedPalettePanel.classList.add("hidden");

  buildLetterControls();
  render();
});
    
    sharedPalette.appendChild(button);
  });
}

// Change collection and replace every letter colour with colours from the newly selected collection.
collectionSelect.addEventListener("change", () => {
  activeCollection = collectionSelect.value;
  activePalette = collectionPalettes[activeCollection];

  letterColours = createDefaultLetterColours(getCurrentText());

  selectedLetterIndex = null;

  buildLetterControls();
  render();
});

// Update controls while the customer types.
nameInput.addEventListener("input", () => {
  let value = nameInput.value;
  
  // Remove any numbers
  value = value.replace(/[0-9]/g, "");
  
  // Convert to uppercase
  value = value.toUpperCase();
  
  // Update the input
  nameInput.value = value;

  syncLetterColours();

  const text = getCurrentText();

  if (
    selectedLetterIndex !== null &&
    selectedLetterIndex >= text.length
  ) {
    selectedLetterIndex = null;
  }

  buildLetterControls();
  render();
});

// Reset the visualiser.
resetBtn.addEventListener("click", () => {
  nameInput.value = "";

  collectionSelect.value = "ceramic";
  activeCollection = "ceramic";
  activePalette = collectionPalettes.ceramic;

  letterColours = createDefaultLetterColours(getCurrentText());

  selectedLetterIndex = null;

  buildLetterControls();
  render();
});

// Download the canvas preview.
downloadBtn.addEventListener("click", () => {
  render();

  const link = document.createElement("a");
  const filename =
    getCurrentText().replace(/\s+/g, "_") || "letter-design";

  link.download = `${filename}.png`;
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

// Draw a simple neutral display background.
function drawDefaultBackground(width, height) {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    height
  );

  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#f1efec");

  roundRect(ctx, 0, 0, width, height, 24);

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "#ddd7d1";
  ctx.lineWidth = 2;

  roundRect(ctx, 1, 1, width - 2, height - 2, 24);
  ctx.stroke();
}

// Measure the complete name one character at a time.
function measureCharacters(text) {
  const characters = Array.from(text);

  const widths = characters.map((character) => {
    return ctx.measureText(character).width;
  });

  const totalWidth = widths.reduce(
    (total, width) => total + width,
    0
  );

  return {
    characters,
    widths,
    totalWidth
  };
}

// Render the personalised name.
function render() {
  const width = previewCanvas.width;
  const height = previewCanvas.height;

  ctx.clearRect(0, 0, width, height);

drawDefaultBackground(width, height);

  const enteredText = getCurrentText();
  const displayText = enteredText || "WILD LITTLE THINGS";

  let displayColours;

  if (enteredText) {
    syncLetterColours();
    displayColours = letterColours;
  } else {
    displayColours = createDefaultLetterColours(displayText);
  }

  let fontSize = Math.floor(height * 0.42);
  const fontFamily = mochiFontLoaded
    ? '"Mochi"'
    : "sans-serif";

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `${fontSize}px ${fontFamily}`;

  let measurement = measureCharacters(displayText);

  while (
    measurement.totalWidth > width - 140 &&
    fontSize > 20
  ) {
    fontSize -= 4;
    ctx.font = `${fontSize}px ${fontFamily}`;
    measurement = measureCharacters(displayText);
  }

  let currentX =
    width / 2 - measurement.totalWidth / 2;

  measurement.characters.forEach(
    (character, index) => {
      const characterWidth = measurement.widths[index];

      if (character !== " ") {
        const colour =
          displayColours[index] ||
          activePalette[index % activePalette.length].hex;

        ctx.save();

        ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
        ctx.shadowBlur = 9;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = colour;
        ctx.fillText(
          character,
          currentX,
          height / 2
        );

        ctx.lineWidth = Math.max(
          1,
          fontSize * 0.025
        );

        ctx.strokeStyle = hexToRgba(colour, 0.08);

        ctx.strokeText(
          character,
          currentX,
          height / 2
        );

        ctx.restore();
      }

      currentX += characterWidth;
    }
  );
}

// Rounded rectangle helper.
function roundRect(
  context,
  x,
  y,
  width,
  height,
  radius
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    radius
  );
  context.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    radius
  );
  context.arcTo(
    x,
    y + height,
    x,
    y,
    radius
  );
  context.arcTo(
    x,
    y,
    x + width,
    y,
    radius
  );
  context.closePath();
}

// Convert hex colour to transparent RGBA.
function hexToRgba(hex, alpha = 1) {
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

// Initial setup.
letterColours = createDefaultLetterColours(getCurrentText());
loadMochiFont();
