/* PROJECT STELLAR: MAIN APP, NAVIGATION, 10 SPOTS & ISRO/NASA TELEMETRY LOGIC */

let currentData = null;
let currentMode = 'super_res'; // 'super_res', 'hazard', or 'slope'
let currentSpotId = 'shackleton';
let currentTheme = localStorage.getItem('theme') || 'dark';

const SPOTS_LIST = [
    { id: 'shackleton', name: 'Shackleton' },
    { id: 'shoemaker', name: 'Shoemaker' },
    { id: 'faustini', name: 'Faustini' },
    { id: 'haworth', name: 'Haworth' },
    { id: 'sverdrup', name: 'Sverdrup' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Apply initial theme
    applyTheme(currentTheme);

    // Render 10 Landing Spots Pill Bar
    renderSpotsBar();

    // Load default landing spot (Shackleton)
    loadSample('shackleton');
});

// Toggle Light / Dark Neumorphic Theme
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    const themeBtn = document.getElementById('theme-icon');
    if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (themeBtn) themeBtn.innerText = 'DARK MODE';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeBtn) themeBtn.innerText = 'LIGHT MODE';
    }
}

// Toggle Native Fullscreen for the Image Comparison Stage Viewfinder
function toggleStageFullscreen() {
    const stageCard = document.getElementById('stage-card');
    if (!stageCard) return;

    if (!document.fullscreenElement) {
        if (stageCard.requestFullscreen) {
            stageCard.requestFullscreen();
        } else if (stageCard.webkitRequestFullscreen) {
            stageCard.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// Render 10 Landing Spots Pill Bar with Actual Crater Names
function renderSpotsBar() {
    const grid = document.getElementById('spots-grid');
    if (!grid) return;

    grid.innerHTML = '';
    SPOTS_LIST.forEach(spot => {
        const btn = document.createElement('button');
        btn.className = `spot-pill-btn ${spot.id === currentSpotId ? 'active' : ''}`;
        btn.id = `spot-btn-${spot.id}`;
        btn.innerText = spot.name; // Display actual crater name on button
        btn.title = spot.name;
        btn.onclick = () => selectSpot(spot.id);
        grid.appendChild(btn);
    });
}

// Select a specific crater spot
function selectSpot(spotId) {
    currentSpotId = spotId;
    document.querySelectorAll('.spot-pill-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`spot-btn-${spotId}`);
    if (activeBtn) activeBtn.classList.add('active');

    loadSample(spotId);
}

// Switch between Startup Screen, Workspace, and Dedicated About Us Page
function switchView(targetView) {
    const startupView = document.getElementById('view-startup');
    const workspaceView = document.getElementById('view-workspace');
    const aboutView = document.getElementById('view-about');

    if (targetView === 'workspace') {
        const goStage = document.querySelector('.startup-go-stage');
        const container = document.querySelector('.startup-container');
        const flashOverlay = document.getElementById('timejump-flash');

        if (goStage && container && flashOverlay && typeof triggerTimejumpWarp === 'function' && !startupView.classList.contains('hidden')) {
            goStage.classList.add('warping');
            container.classList.add('warping');
            
            // Trigger star streaks hyperspace warp + camera zoom blur
            triggerTimejumpWarp(() => {
                flashOverlay.classList.add('active');
                setTimeout(() => {
                    startupView.classList.add('hidden');
                    if (aboutView) aboutView.classList.add('hidden');
                    workspaceView.classList.remove('hidden');
                    goStage.classList.remove('warping');
                    container.classList.remove('warping');
                    setTimeout(() => {
                        flashOverlay.classList.remove('active');
                    }, 250);
                }, 300);
            });
        } else {
            startupView.classList.add('hidden');
            if (aboutView) aboutView.classList.add('hidden');
            workspaceView.classList.remove('hidden');
        }
    } else if (targetView === 'about') {
        startupView.classList.add('hidden');
        workspaceView.classList.add('hidden');
        if (aboutView) aboutView.classList.remove('hidden');
    } else {
        workspaceView.classList.add('hidden');
        if (aboutView) aboutView.classList.add('hidden');
        startupView.classList.remove('hidden');
    }
}

// Toggle Analytics & SFD Modal Popup
function toggleAnalyticsModal(show) {
    const modal = document.getElementById('analytics-modal');
    if (modal) {
        modal.classList.toggle('active', show);
        if (show && currentData) {
            renderAnalyticsCharts();
        }
    }
}

// Render SFD Bar Chart and Elevation Curve in Modal
function renderAnalyticsCharts() {
    if (!currentData) return;
    
    const spotLabel = document.getElementById('chart-spot-name');
    if (spotLabel) spotLabel.innerText = `(${currentData.name.replace(/^\d+\.\s*/, '')})`;
    
    // 1. Render Boulder Size Frequency Distribution (SFD) Bar Chart
    const sfdContainer = document.getElementById('sfd-chart-container');
    if (sfdContainer && currentData.sfd_data) {
        const maxCount = Math.max(...currentData.sfd_data.map(d => d.count));
        sfdContainer.innerHTML = currentData.sfd_data.map(d => {
            const pct = Math.max(15, (d.count / maxCount) * 100);
            return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; height: 100%; justify-content: flex-end;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #ffffff; font-family: monospace;">${d.count}</span>
                    <div style="width: 28px; height: ${pct}%; background: linear-gradient(180deg, #ffffff 0%, #4a4540 100%); border-radius: 6px 6px 0 0; box-shadow: 0 2px 10px rgba(0,0,0,0.5);"></div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">${d.size}</span>
                </div>
            `;
        }).join('');
    }

    // 2. Render Elevation Cross-Section Curve SVG
    const elevContainer = document.getElementById('elevation-chart-container');
    if (elevContainer && currentData.elevation_profile) {
        const pts = currentData.elevation_profile;
        const minVal = Math.min(...pts);
        const maxVal = Math.max(...pts);
        const range = (maxVal - minVal) || 1;
        
        const w = 320;
        const h = 120;
        
        const svgPoints = pts.map((val, idx) => {
            const x = (idx / (pts.length - 1)) * w;
            const y = h - ((val - minVal) / range) * (h - 20) - 10;
            return `${x},${y}`;
        }).join(' ');

        elevContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="overflow: visible;">
                <defs>
                    <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                <polygon points="0,${h} ${svgPoints} ${w},${h}" fill="url(#elevGrad)" />
                <polyline points="${svgPoints}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;
    }

    if (currentData.landing_ellipse) {
        const safeProb = document.getElementById('modal-safe-prob');
        if (safeProb) safeProb.innerText = `${currentData.landing_ellipse.safe_prob}% (${currentData.landing_ellipse.risk_level})`;
    }
}

// Animated Counter Function
function animateValue(id, start, end, duration, prefix = '', suffix = '', decimals = 2) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = (progress * (end - start) + start).toFixed(decimals);
        obj.innerText = `${prefix}${currentVal}${suffix}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Load sample dataset with simulated high-tech loading bar
async function loadSample(sampleId) {
    // Show Progress Overlay Bar
    const overlay = document.getElementById('processing-overlay');
    const fill = document.getElementById('progress-fill');
    if (overlay && fill) {
        overlay.classList.add('active');
        fill.style.width = '0%';
        setTimeout(() => fill.style.width = '70%', 100);
        setTimeout(() => fill.style.width = '100%', 300);
    }

    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataset_id: sampleId })
        });
        const data = await response.json();
        
        setTimeout(() => {
            if (overlay) overlay.classList.remove('active');
            if (data.status === 'success') {
                currentData = data;
                renderDashboard();
            }
        }, 350);

    } catch (err) {
        console.error("Failed to load sample:", err);
        if (overlay) overlay.classList.remove('active');
    }
}

// Toggle between 3 Modes: 4X Super-Res, Hazard Mask, and Slope Map
function setMode(mode) {
    currentMode = mode;
    document.getElementById('toggle-superres').classList.toggle('active', mode === 'super_res');
    document.getElementById('toggle-hazard').classList.toggle('active', mode === 'hazard');
    document.getElementById('toggle-slope').classList.toggle('active', mode === 'slope');
    
    if (currentData) {
        const afterImgElement = document.getElementById('img-after');
        if (mode === 'hazard') {
            afterImgElement.src = currentData.images.hazard_mask;
        } else if (mode === 'slope') {
            afterImgElement.src = currentData.images.slope_map;
        } else {
            afterImgElement.src = currentData.images.enhanced_shadow;
        }
        afterImgElement.style.visibility = 'visible';
    }
}

// Render Dashboard Data & Metrics with Live Counter Animations
function renderDashboard() {
    if (!currentData) return;

    // Set images
    const imgBefore = document.getElementById('img-before');
    const imgAfter = document.getElementById('img-after');

    imgBefore.src = currentData.images.raw_original;
    imgBefore.style.visibility = 'visible';
    
    if (currentMode === 'hazard') {
        imgAfter.src = currentData.images.hazard_mask;
    } else if (currentMode === 'slope') {
        imgAfter.src = currentData.images.slope_map;
    } else {
        imgAfter.src = currentData.images.enhanced_shadow;
    }
    imgAfter.style.visibility = 'visible';

    // Set Metrics with Counter Animations
    const metrics = currentData.metrics;
    const hazard = currentData.hazard_stats;
    const meta = currentData.metadata;

    animateValue('val-psnr', 0, metrics.psnr_db, 350, '+', ' dB', 2);
    animateValue('val-ssim', 0, metrics.ssim_score, 350, '', '', 3);
    animateValue('val-fidelity', 90, metrics.radiometric_fidelity_percent, 350, '', '%', 2);
    animateValue('val-safe', 50, hazard.safe_landing_zone_percent, 350, '', '%', 1);

    document.getElementById('val-boulders').innerText = hazard.boulder_count;
    document.getElementById('val-slope').innerText = `${hazard.max_slope_degrees}°`;
    document.getElementById('val-illumination').innerText = meta.illumination || '0.4%';

    // Render Inline Analytics & SFD Graphs inside HAZARD LANDING SUMMARY Card
    renderInlineCharts();
}

// Render Inline SFD Bar Chart and Elevation Curve inside Summary Card
function renderInlineCharts() {
    if (!currentData) return;

    // 1. Render Inline SFD Bar Chart (Filtered to Boulders >1m: 1-2m & >2m)
    const sfdContainer = document.getElementById('inline-sfd-chart');
    if (sfdContainer && currentData.sfd_data) {
        const filteredData = currentData.sfd_data.filter(d => d.size === '1-2m' || d.size === '>2m');
        const maxCount = Math.max(...filteredData.map(d => d.count));
        sfdContainer.innerHTML = filteredData.map(d => {
            const pct = Math.max(25, (d.count / maxCount) * 100);
            return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; justify-content: flex-end;">
                    <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-primary); font-family: 'Google Sans Flex', sans-serif;">${d.count}</span>
                    <div style="width: 18px; height: ${pct}%; background: var(--text-primary); border-radius: 4px 4px 0 0; opacity: 0.85;"></div>
                    <span style="font-size: 0.62rem; font-weight: 600; color: var(--text-muted); font-family: 'Google Sans Flex', sans-serif;">${d.size}</span>
                </div>
            `;
        }).join('');
    }

    // 2. Render Smooth Elevation Profile Curve SVG (Solid Theme Stroke, No Gradients)
    const elevContainer = document.getElementById('inline-elevation-chart');
    if (elevContainer && currentData.elevation_profile) {
        const pts = currentData.elevation_profile;
        const minVal = Math.min(...pts);
        const maxVal = Math.max(...pts);
        const range = (maxVal - minVal) || 1;
        
        const w = 150;
        const h = 50;
        
        const coords = pts.map((val, idx) => {
            const x = (idx / (pts.length - 1)) * w;
            const y = h - ((val - minVal) / range) * (h - 16) - 8;
            return { x, y };
        });

        // Smooth cubic Spline curve
        let curvePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const p0 = coords[Math.max(0, i - 1)];
            const p1 = coords[i];
            const p2 = coords[i + 1];
            const p3 = coords[Math.min(coords.length - 1, i + 2)];

            const cp1x = p1.x + (p2.x - p0.x) * 0.25;
            const cp1y = p1.y + (p2.y - p0.y) * 0.25;
            const cp2x = p2.x - (p3.x - p1.x) * 0.25;
            const cp2y = p2.y - (p3.y - p1.y) * 0.25;

            curvePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }

        elevContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="overflow: visible;">
                <path d="${curvePath}" fill="none" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;
    }
}
