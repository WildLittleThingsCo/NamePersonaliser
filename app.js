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
    { name: "Ivory White", hex: "#ffffff" },
    { name: "Olive", hex: "#2b3a1e" }

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
    { name: "Lemon", hex: "#f3dc74" },
    { name: "Olive", hex: "#2b3a1e" }

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
const copyBtn = document.getElementById("copyBtn");
const summaryName = document.getElementById("summaryName");
const summaryColours = document.getElementById("summaryColours");
const copyConfirmation = document.getElementById("copyConfirmation");

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

    await document.fonts.ready;

    buildLetterControls();
    render();
  } catch (error) {
    console.error("Mochi Boom could not be loaded:", error);

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

    const colourButton = document.createElement("button");
    colourButton.type = "button";
    colourButton.className = "current-colour-button";
    colourButton.style.backgroundColor = letterColours[index];

    const selectedColour = findColour(letterColours[index]);

    colourButton.title = selectedColour
      ? selectedColour.name
      : "Choose colour";

    colourButton.setAttribute(
      "aria-label",
      `Choose colour for ${character}`
    );

    letterPreview.addEventListener("click", () => {
      selectLetter(index, colourButton);
    });

    colourButton.addEventListener("click", () => {
      selectLetter(index, colourButton);
    });

    const colourName = document.createElement("div");
    colourName.className = "letter-colour-name";

    colourName.textContent = selectedColour
      ? selectedColour.name
      : "Choose colour";

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

  selectedLetterLabel.textContent =
    `Choose a colour for ${selectedCharacter}`;

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

// Create the Etsy order summary.
function getDesignSummary() {
  const name = getCurrentText();

  syncLetterColours();

  const selectedOption =
    collectionSelect.options[collectionSelect.selectedIndex];

  const collection = selectedOption
    ? selectedOption.textContent.trim()
    : "";

  const colours = [];

  Array.from(name).forEach((letter, index) => {
    if (letter === " ") {
      return;
    }

    const selectedHex =
      letterColours[index] ||
      activePalette[index % activePalette.length].hex;

    const colourDetails = activePalette.find((colour) => {
      return (
        colour.hex.toLowerCase() ===
        selectedHex.toLowerCase()
      );
    });

    colours.push({
      letter,
      colourName: colourDetails
        ? colourDetails.name
        : "Colour not selected",
      hex: selectedHex
    });
  });

  const colourText = colours
    .map((item) => `${item.letter}-${item.colourName}`)
    .join(", ");

  const copyText = name
    ? `Name and colours: ${name}: ${colourText}`
    : "";

  return {
    name,
    collection,
    colours,
    colourText,
    copyText
  };
}

function updateOrderSummary() {
  const design = getDesignSummary();

  summaryName.textContent =
    design.name || "Enter your name";

  if (design.colourText) {
    summaryColours.textContent =
      design.colourText;
  } else {
    summaryColours.textContent =
      "Enter a name to view your colour selection.";
  }
}
// Change collection and replace each letter with colours
// from the newly selected collection.
collectionSelect.addEventListener("change", () => {
  activeCollection = collectionSelect.value;
  activePalette = collectionPalettes[activeCollection];

  letterColours =
    createDefaultLetterColours(getCurrentText());

  selectedLetterIndex = null;

  buildLetterControls();
  render();
});

// Update the controls while the customer types.
nameInput.addEventListener("input", () => {
  let value = nameInput.value;

  // Remove numbers
  value = value.replace(/[0-9]/g, "");

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

  letterColours =
    createDefaultLetterColours(getCurrentText());

  selectedLetterIndex = null;

  copyConfirmation.textContent = "";

  buildLetterControls();
  render();
});

// Copy the completed design summary for Etsy.
copyBtn.addEventListener("click", async () => {
  const design = getDesignSummary();

  copyConfirmation.textContent = "";

  if (!design.name) {
    copyConfirmation.textContent =
      "Please enter a name before copying your design.";

    nameInput.focus();
    return;
  }

  try {
    await navigator.clipboard.writeText(
      design.copyText
    );
  } catch (error) {
    const textArea =
      document.createElement("textarea");

    textArea.value = design.copyText;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    document.execCommand("copy");

    textArea.remove();
  }

  const originalText = copyBtn.textContent;

  copyBtn.textContent = "✓ Copied!";

  copyConfirmation.textContent =
    "Your design is ready to paste into Etsy.";

  window.setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
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

  roundRect(
    ctx,
    0,
    0,
    width,
    height,
    24
  );

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "#ddd7d1";
  ctx.lineWidth = 2;

  roundRect(
    ctx,
    1,
    1,
    width - 2,
    height - 2,
    24
  );

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

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawDefaultBackground(width, height);

  const enteredText = getCurrentText();

  const displayText =
    enteredText || "WILD LITTLE THINGS";

  let displayColours;

  if (enteredText) {
    syncLetterColours();
    displayColours = letterColours;
  } else {
    displayColours =
      createDefaultLetterColours(displayText);
  }

  let fontSize =
    Math.floor(height * 0.42);

  const fontFamily = mochiFontLoaded
    ? '"Mochi"'
    : "sans-serif";

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `${fontSize}px ${fontFamily}`;

  let measurement =
    measureCharacters(displayText);

  while (
    measurement.totalWidth > width - 140 &&
    fontSize > 20
  ) {
    fontSize -= 4;

    ctx.font =
      `${fontSize}px ${fontFamily}`;

    measurement =
      measureCharacters(displayText);
  }

  let currentX =
    width / 2 -
    measurement.totalWidth / 2;

  measurement.characters.forEach(
    (character, index) => {
      const characterWidth =
        measurement.widths[index];

      if (character !== " ") {
        const colour =
          displayColours[index] ||
          activePalette[
            index % activePalette.length
          ].hex;

       ctx.save();

ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
ctx.shadowBlur = 9;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 5;
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

ctx.strokeStyle =
  hexToRgba(colour, 0.08);

ctx.strokeText(
  character,
  currentX,
  height / 2
);

/* COLLECTION FINISH */

if (collectionSelect.value === "ceramic") {
  drawGlossyFinish(
  character,
  currentX,
  height / 2,
  fontSize,
  colour
);
}

if (collectionSelect.value === "wildBear") {
  drawWildBearFinish(
    character,
    currentX,
    height / 2,
    fontSize,
    colour
  );
}

ctx.restore();
      }

      currentX += characterWidth;
    }
  );

  updateOrderSummary();
}
function drawGlossyFinish(
  character,
  x,
  y,
  fontSize,
  colour
) {
  ctx.save();

  // Prevent glossy effects from creating extra shadows
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;


  // --------------------------------
  // 1. SUBTLE LOWER-RIGHT DEPTH
  // --------------------------------

ctx.globalAlpha = 0.24;

ctx.lineWidth = Math.max(
  2,
  fontSize * 0.045
);

ctx.strokeStyle =
  "rgba(30, 20, 15, 0.24)";

  ctx.strokeText(
    character,
    x + fontSize * 0.010,
    y + fontSize * 0.015
  );


  // --------------------------------
  // 2. SOFT UPPER-LEFT LIGHT
  // --------------------------------

  ctx.globalAlpha = 0.20;

  ctx.lineWidth = Math.max(
    1,
    fontSize * 0.022
  );

  ctx.strokeStyle =
    "rgba(255, 255, 255, 0.70)";

  ctx.strokeText(
    character,
    x - fontSize * 0.006,
    y - fontSize * 0.008
  );


  ctx.restore();
}
function drawWildBearFinish(
  character,
  x,
  y,
  fontSize,
  colour
) {
  ctx.save();

  // No glossy shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  /*
    Build a temporary mask using the letter.
    This keeps the texture inside the letter shape.
  */
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = previewCanvas.width;
  maskCanvas.height = previewCanvas.height;

  const maskCtx = maskCanvas.getContext("2d");

  maskCtx.font = ctx.font;
  maskCtx.textAlign = "left";
  maskCtx.textBaseline = "middle";

  maskCtx.fillStyle = "#ffffff";
  maskCtx.fillText(
    character,
    x,
    y
  );

  /*
    Create a second temporary canvas for the boucle texture.
  */
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = previewCanvas.width;
  textureCanvas.height = previewCanvas.height;

  const textureCtx = textureCanvas.getContext("2d");

  /*
    Soft lighter and darker speckles.
    Small circles give a fuzzy/boucle impression.
  */
  const characterWidth =
    ctx.measureText(character).width;

  const textureCount =
    Math.max(
      120,
      Math.floor(fontSize * 1.3)
    );

  for (let i = 0; i < textureCount; i++) {
    const dotX =
      x +
      Math.random() * characterWidth;

    const dotY =
      y -
      fontSize * 0.48 +
      Math.random() * fontSize * 0.96;

    const radius =
      Math.random() * 2.2 + 0.8;

    textureCtx.beginPath();

    textureCtx.arc(
      dotX,
      dotY,
      radius,
      0,
      Math.PI * 2
    );

    if (Math.random() > 0.5) {
      textureCtx.fillStyle =
        "rgba(255,255,255,0.22)";
    } else {
      textureCtx.fillStyle =
        "rgba(0,0,0,0.10)";
    }

    textureCtx.fill();
  }

  /*
    Keep only the texture that falls inside the letter.
  */
  textureCtx.globalCompositeOperation =
    "destination-in";

  textureCtx.drawImage(
    maskCanvas,
    0,
    0
  );

  /*
    Paint the texture over the existing letter.
  */
  ctx.globalAlpha = 0.95;

  ctx.drawImage(
    textureCanvas,
    0,
    0
  );

  /*
    Soft fuzzy-looking outer edge.
  */
  ctx.globalAlpha = 0.12;

  ctx.lineWidth =
    Math.max(
      1.5,
      fontSize * 0.025
    );

  ctx.strokeStyle =
    "rgba(255,255,255,0.5)";

  ctx.strokeText(
    character,
    x,
    y
  );

  ctx.restore();
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

  context.moveTo(
    x + radius,
    y
  );

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

// Convert a hex colour to transparent RGBA.
function hexToRgba(hex, alpha = 1) {
  const cleanedHex =
    hex.replace("#", "");

  const expandedHex =
    cleanedHex.length === 3
      ? cleanedHex
          .split("")
          .map(
            (character) =>
              character + character
          )
          .join("")
      : cleanedHex;

  const colourNumber =
    parseInt(expandedHex, 16);

  const red =
    (colourNumber >> 16) & 255;

  const green =
    (colourNumber >> 8) & 255;

  const blue =
    colourNumber & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

// Close the colour palette when clicking elsewhere.
document.addEventListener("click", (event) => {
  const clickedLetterControl =
    event.target.closest(".letter-control");

  const clickedPalette =
    event.target.closest(
      ".shared-palette-panel"
    );

  if (
    !clickedLetterControl &&
    !clickedPalette
  ) {
    selectedLetterIndex = null;

    sharedPalettePanel.classList.add(
      "hidden"
    );

    buildLetterControls();
  }
});

// Initial setup.
letterColours =
  createDefaultLetterColours(
    getCurrentText()
  );

loadMochiFont();
