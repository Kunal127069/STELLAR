/* PROJECT STELLAR: STARRY SPACE CANVAS WITH CINEMATIC TIMEJUMP HYPERSPACE WARP */

let isWarping = false;
let warpFactor = 1.0;

function initSpaceCanvas() {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const STAR_COUNT = 350;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.3,
                baseAlpha: Math.random() * 0.7 + 0.3,
                alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.03 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15
            });
        }
    }

    createStars();

    let time = 0;
    function animateSpace() {
        time += 0.02;

        // Clear canvas
        ctx.fillStyle = isWarping ? 'rgba(0, 0, 0, 0.25)' : '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw Radial Nebula Glow
        if (!isWarping) {
            const bgGlow = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.7);
            bgGlow.addColorStop(0, 'rgba(15, 20, 30, 0.4)');
            bgGlow.addColorStop(0.6, 'rgba(5, 7, 12, 0.8)');
            bgGlow.addColorStop(1, '#000000');
            ctx.fillStyle = bgGlow;
            ctx.fillRect(0, 0, width, height);
        }

        const centerX = width / 2;
        const centerY = height / 2;

        // Draw and Update Stars
        stars.forEach(star => {
            if (isWarping) {
                // Accelerate outward radial movement during Hyperspace Warp
                let dx = star.x - centerX;
                let dy = star.y - centerY;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;

                star.x += (dx / dist) * warpFactor * 0.8;
                star.y += (dy / dist) * warpFactor * 0.8;

                if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) {
                    star.x = centerX + (Math.random() - 0.5) * 100;
                    star.y = centerY + (Math.random() - 0.5) * 100;
                }
            } else {
                star.x += star.vx;
                star.y += star.vy;

                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;
            }

            star.alpha = star.baseAlpha + Math.sin(time + star.twinklePhase) * 0.35;
            star.alpha = Math.max(0.1, Math.min(1, star.alpha));

            if (isWarping && warpFactor > 2.0) {
                // Draw Hyperspace Radial Warp Lines
                let dx = star.x - centerX;
                let dy = star.y - centerY;
                let len = Math.sqrt(dx * dx + dy * dy) || 1;
                let streakLen = warpFactor * 3.5;

                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x + (dx / len) * streakLen, star.y + (dy / len) * streakLen);
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, star.alpha * 1.5)})`;
                ctx.lineWidth = Math.min(4, star.radius * (1 + warpFactor * 0.08));
                ctx.stroke();
            } else {
                // Draw Twinkling Star Points
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            }
        });

        requestAnimationFrame(animateSpace);
    }

    animateSpace();
}

// Hyperspace Timejump Warp Trigger Function
function triggerTimejumpWarp(onComplete) {
    if (isWarping) return;
    isWarping = true;

    const startTime = performance.now();
    const warpDuration = 750; // milliseconds

    function updateWarp(now) {
        const elapsed = now - startTime;
        if (elapsed < warpDuration) {
            const progress = elapsed / warpDuration;
            warpFactor = 1.0 + Math.pow(progress, 3) * 45.0; // Exponential acceleration
            requestAnimationFrame(updateWarp);
        } else {
            if (onComplete) onComplete();
            setTimeout(() => {
                isWarping = false;
                warpFactor = 1.0;
            }, 600);
        }
    }

    requestAnimationFrame(updateWarp);
}

document.addEventListener('DOMContentLoaded', initSpaceCanvas);
