# Funnel Data Cache

This folder contains automatically updated cache data for funnel analytics from multiple Google Sheets JSON endpoints.

## How it works

1. **GitHub Action** runs daily at 4 AM UTC
2. **Fetches fresh JSON data** from 5 different Google Sheets endpoints
3. **Updates cache files** in `public/cached-data/`
4. **Commits changes** back to the repository

## Data Sources

The system fetches data from 5 different Google Sheets:

1. **locations.json** - Main locations data (584 rows)
2. **timeseries.json** - Time series data (571 rows)  
3. **funnel-default.json** - Funnel default data (531 rows)
4. **funnel-global.json** - Funnel global data (8044 rows)
5. **config.json** - Config/settings data (67 rows)

## Files

- `locations.json` - Main locations data
- `timeseries.json` - Time series analytics data
- `funnel-default.json` - Default funnel configuration
- `funnel-global.json` - Global funnel data
- `config.json` - Configuration and settings
- `funnel-metadata.json` - Metadata with timestamps and update information
- `fetch-funnel-data.js` - Script to fetch and update cache data
- `.github/workflows/refresh-funnel-cache.yml` - GitHub Action workflow

## Manual Update

You can manually trigger a cache update:

1. Go to the "Actions" tab in GitHub
2. Click "Auto-refresh Funnel data cache" 
3. Click "Run workflow"

## Data Structure

Each JSON file contains structured data with:

```json
{
  "headers": ["Column names from Google Sheets"],
  "rows": [["Row data arrays"]],
  "lastUpdated": "2025-09-22T18:55:17.745Z",
  "timestamp": 1758567317745,
  "source": "Google Sheets - [source name]",
  "url": "Original Google Sheets URL",
  "rowCount": 584
}
```

## Metadata Structure

The metadata file tracks all sources:

```json
{
  "lastUpdated": "2025-09-22T18:55:17.745Z",
  "timestamp": 1758567317745,
  "sources": ["locations", "timeseries", "funnel-default", "funnel-global", "config"],
  "totalSources": 5,
  "successfulSources": 5,
  "savedFiles": ["locations.json", "timeseries.json", ...]
}
```

## Access

The cache files are publicly accessible via GitHub raw files:
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/locations.json`
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/timeseries.json`
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/funnel-default.json`
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/funnel-global.json`
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/config.json`
- `https://raw.githubusercontent.com/dealroom-caching/funnel-data/main/public/cached-data/funnel-metadata.json`

## Time Validation

Use the timestamp in any JSON file or the metadata file to implement time-based validation (e.g., 26-hour cache expiry) in your applications.

## Error Handling

The script continues fetching other sources even if one fails, ensuring maximum data availability. Check the metadata file to see which sources were successfully fetched.
