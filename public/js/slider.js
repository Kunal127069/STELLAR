/* PROJECT STELLAR: INTERACTIVE BEFORE/AFTER SLIDER LOGIC */

function initSlider() {
    const rangeInput = document.getElementById('slider-range');
    const overlay = document.getElementById('img-overlay');
    const handle = document.getElementById('slider-handle');

    if (!rangeInput || !overlay || !handle) return;

    function updateSliderPosition(val) {
        const percentage = val + '%';
        overlay.style.clipPath = `polygon(0 0, ${percentage} 0, ${percentage} 100%, 0 100%)`;
        handle.style.left = percentage;
    }

    rangeInput.addEventListener('input', (e) => {
        updateSliderPosition(e.target.value);
    });

    // Set initial position at 50%
    updateSliderPosition(50);
}

document.addEventListener('DOMContentLoaded', initSlider);
