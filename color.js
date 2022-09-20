function hexToRgb(hex) {
    // Convert a hex color to rgb
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function weightedMix(start, stop, weight) {
    // Given two hex colors, mix them by the specified weight
    let start_rgb = hexToRgb(start);
    let stop_rgb = hexToRgb(stop);
    let r = Math.floor(start_rgb.r * weight + stop_rgb.r * (1 - weight));
    let g = Math.floor(start_rgb.g * weight + stop_rgb.g * (1 - weight));
    let b = Math.floor(start_rgb.b * weight + stop_rgb.b * (1 - weight));
    return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
    // Convert an rgb color to hex
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
}
function precompute_colorsteps(start, stop, steps) {
    // Given two hex colors, grad between them in the specified series of steps, returning a tuple of hex codes
    let start_rgb = hexToRgb(start);
    let stop_rgb = hexToRgb(stop);
    let colorsteps = [];
    for (let i = 0; i < steps + 1; i++) {
        let r = Math.floor(start_rgb.r + (stop_rgb.r - start_rgb.r) * i / steps);
        let g = Math.floor(start_rgb.g + (stop_rgb.g - start_rgb.g) * i / steps);
        let b = Math.floor(start_rgb.b + (stop_rgb.b - start_rgb.b) * i / steps);
        colorsteps.push(rgbToHex(r, g, b));
    }
    return colorsteps

}

function randomRGB() {
    // Return a random rgb color
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return [r, g, b]
}

function randomHex() {
    // Return a random hex color
    return rgbToHex(...randomRGB());

}



function hexWithAberrance(hex, aberrance_factor) {
    // Apply a degree of chromatic abberance to a hex string
    // Abberance, e.g 0.1 = random +/-10% variance across each of rgb
    let rgb = hexToRgb(hex);
    let r = Math.floor(rgb.r * (1 + aberrance_factor * (Math.random() - 0.5)));
    let g = Math.floor(rgb.g * (1 + aberrance_factor * (Math.random() - 0.5)));
    let b = Math.floor(rgb.b * (1 + aberrance_factor * (Math.random() - 0.5)));

    return rgbToHex(r, g, b);
}