const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve main ISRO Mission Control Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pre-cooked benchmark sample datasets
app.get('/api/samples', (req, res) => {
    try {
        const craterData = JSON.parse(fs.readFileSync(path.join(__dirname, 'crater_data.json'), 'utf8'));
        res.json({ status: 'success', samples: craterData.samples });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to load crater data' });
    }
});

const { execSync } = require('child_process');

// Process uploaded file or dataset ID (Connects to Python AI Backend or returns sample)
app.post('/api/process', (req, res) => {
    const { dataset_id } = req.body;
    const key = dataset_id || 'shackleton';

    try {
        const craterData = JSON.parse(fs.readFileSync(path.join(__dirname, 'crater_data.json'), 'utf8'));
        if (craterData.samples && craterData.samples[key]) {
            const sample = craterData.samples[key];
            return res.json({
                status: 'success',
                dataset_id: sample.dataset_id,
                name: sample.name || sample.dataset_id,
                metadata: sample.metadata,
                metrics: sample.metrics,
                hazard_stats: sample.hazard_stats,
                landing_ellipse: sample.landing_ellipse,
                sfd_data: sample.sfd_data,
                elevation_profile: sample.elevation_profile,
                images: sample.images
            });
        }
        
        // Execute Python processor for custom/unknown datasets
        const command = `python3 process_crater.py --crater ${key}`;
        const output = execSync(command, { cwd: __dirname, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        const result = JSON.parse(output.substring(output.indexOf('{')));

        res.json({
            status: 'success',
            dataset_id: result.dataset_id,
            name: result.name || result.dataset_id,
            metadata: result.metadata,
            metrics: result.metrics,
            hazard_stats: result.hazard_stats,
            landing_ellipse: result.landing_ellipse,
            sfd_data: result.sfd_data,
            elevation_profile: result.elevation_profile,
            images: result.images
        });
    } catch (err) {
        console.error(`Processing failed for ${key}:`, err.message);
        res.status(500).json({ status: 'error', message: 'Processing error' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`\n===============================================================`);
    console.log(`PROJECT STELLAR: ISRO Mission Control Dashboard Running!`);
    console.log(`Server listening locally at: http://localhost:${PORT}`);
    console.log(`===============================================================\n`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        const altPort = 3001;
        console.log(`Port ${PORT} is occupied. Retrying on alternative port http://localhost:${altPort}...`);
        app.listen(altPort, () => {
            console.log(`\n===============================================================`);
            console.log(`PROJECT STELLAR Dashboard running on fallback port!`);
            console.log(`Open in browser: http://localhost:${altPort}`);
            console.log(`===============================================================\n`);
        });
    }
});
