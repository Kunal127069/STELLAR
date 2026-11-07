# Raw Lunar Satellite Datasets (GeoTIFF)

This directory is designed to store raw 16-bit planetary satellite GeoTIFF rasters from missions such as:
- **ISRO Chandrayaan-2 / Chandrayaan-3** (TMC & OHRC instruments)
- **NASA Lunar Reconnaissance Orbiter (LRO)** (LROC NAC)

### Directory Structure:
```text
Moon Craters/
├── shackleton/
├── shoemaker/
├── faustini/
├── haworth/
├── de gerlache/
├── nobile/
├── amundsen/
├── cabeus/
└── sverdrup/
```

> **Note:** Raw satellite rasters (typically 65MB – 100MB+ per scene) are excluded from the git repository via `.gitignore` to keep repository clones fast.
> The web dashboard and interactive comparison sliders operate out-of-the-box using the bundled benchmark samples in `public/images/processed/` and `crater_data.json`.
