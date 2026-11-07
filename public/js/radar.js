/* PROJECT STELLAR: LIVE POLAR RADAR SWEEPER CANVAS */

function initRadarCanvas() {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let angle = 0;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawRadar() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw Concentric Radar Rings
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 1;

        for (let r = 0.25; r <= 1; r += 0.25) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw Crosshair Lines
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();

        // Draw Rotating Radar Beam Sweep
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        const gradient = ctx.createConicGradient(0, 0, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, 0, Math.PI / 2);
        ctx.fill();
        ctx.restore();

        // Draw Target Blips (Lander Site & Crater Targets)
        const blips = [
            { x: centerX + radius * 0.4, y: centerY - radius * 0.3, label: 'SITE-A' },
            { x: centerX - radius * 0.5, y: centerY + radius * 0.2, label: 'PSR-01' },
            { x: centerX + radius * 0.2, y: centerY + radius * 0.6, label: 'LANDER' }
        ];

        blips.forEach((blip) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(blip.x, blip.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '9px "Google Sans Flex", monospace';
            ctx.fillStyle = '#888888';
            ctx.fillText(blip.label, blip.x + 6, blip.y + 3);
        });

        // Increment rotation angle
        angle += 0.025;
        requestAnimationFrame(drawRadar);
    }

    drawRadar();
}

document.addEventListener('DOMContentLoaded', initRadarCanvas);
