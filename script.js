const grid = document.querySelector('.grid');
const colorPicker = document.getElementById('colorPicker');
const dragImage = document.getElementById('dragImage');

// Generate 240 LED divs (12 rows * 20 columns)
for (let i = 0; i < 240; i++) {
    const led = document.createElement('div');
    led.classList.add('led');
    led.dataset.index = i;
    grid.appendChild(led);
}

// Adjustable parameters
const radius = 1; // Maximum radius of LEDs to light up around the cursor
const minBrightness = 1; // Minimum opacity level of LEDs just outside the radius
const fadeOutDelay = 1000; // Delay for fading out (1 second)
const lightLag = 20; // Number of milliseconds the light lags behind the cursor
const trailLength = 8; // Number of LEDs to show in the trail

// Default color
let ledColor = '#c9ff5e'; // Default color

// Store highlighted LED indexes to track fading
let highlightedIndexes = new Set();
let fadeOutTimeout;
let cursorPositions = []; // To store recent cursor positions

// Function to update the LED color
function updateColor(color) {
    ledColor = color;
}

// Convert hex color to RGB object
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}

// Function to apply color to LEDs
function applyColorToLEDs(indexes, color) {
    
    indexes.forEach(index => {
        const led = document.querySelector(`.led[data-index='${index}']`);
        if (led) {
            led.style.backgroundColor = color;
            const rgb = hexToRgb(color);
            led.style.boxShadow = `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`; // Enhanced glowing effect
        }
    });
}

// Function to clear the highlights with fade-out effect
function clearHighlights() {
    document.querySelectorAll('.led').forEach((led) => {
        led.style.opacity = '';
        led.style.boxShadow = '';
        led.style.backgroundColor = ''; // Reset background color
    });
}

// Function to update LED trail based on cursor positions
function updateLightTrail(mouseX, mouseY) {
    const rect = grid.getBoundingClientRect();
    const rows = 12;
    const cols = 20;
    
    // Calculate row and column based on mouse position
    const mouseRow = Math.floor(mouseY / (rect.height / rows));
    const mouseCol = Math.floor(mouseX / (rect.width / cols));

    // Store the current cursor position
    cursorPositions.push({ mouseRow, mouseCol });

    // Keep only the latest `trailLength` positions
    if (cursorPositions.length > trailLength) {
        cursorPositions.shift();
    }

    // Clear previous highlights
    clearHighlights();

    // Calculate and apply trail effect
    let newHighlightedIndexes = new Set();
    cursorPositions.forEach((pos, index) => {
        // Calculate brightness based on trail position
        const brightness = 1 - (index / trailLength);
        
        // Loop over a larger area around the cursor position to create a radius effect
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const row = pos.mouseRow + i;
                const col = pos.mouseCol + j;
                const dist = Math.sqrt(i * i + j * j);
                
                if (row >= 0 && row < rows && col >= 0 && col < cols && dist <= radius) {
                    const targetIndex = row * cols + col;
                    const target = document.querySelector(`.led[data-index='${targetIndex}']`);
                    if (target) {
                        target.style.opacity = Math.max(minBrightness, brightness * (1 - dist / radius));
                        newHighlightedIndexes.add(targetIndex);
                    }
                }
            }
        }
    });

    // Update the global highlighted indexes and apply the color
    highlightedIndexes = newHighlightedIndexes;
    applyColorToLEDs(highlightedIndexes, ledColor);
}

// Mouse move and leave events for the entire grid
grid.addEventListener('mousemove', (e) => {
    const rect = grid.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    
    // Smoothly update light position with lag effect
    clearTimeout(fadeOutTimeout); // Clear any pending fade-out
    setTimeout(() => {
        updateLightTrail(cursorX, cursorY);
    }, lightLag);
});

grid.addEventListener('mouseleave', () => {
    // Set a timeout to clear highlights after fadeOutDelay
    fadeOutTimeout = setTimeout(() => {
        clearHighlights();
        highlightedIndexes.clear(); // Clear highlighted indexes after fading out
    }, fadeOutDelay);
});

// Update LED color when the user selects a new color
colorPicker.addEventListener('input', (e) => {
    updateColor(e.target.value);
});

function setCustomCursor(url, x, y) {
    const cursorStyle = `url('${url}') ${x} ${y}, auto`;
    document.documentElement.style.cursor = cursorStyle;
}

document.addEventListener('DOMContentLoaded', () => {
    setCustomCursor('cursor.png', 16, 16); // Adjust path and hotspot coordinates as needed
});
