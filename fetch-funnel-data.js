import fs from 'fs';
import path from 'path';

// Google Sheets JSON URLs configuration
const FUNNEL_DATA_SOURCES = {
  'locations': {
    url: 'https://docs.google.com/spreadsheets/d/1Ewhi3YCL-dUWZ3YrHpsmWt4goza-5c1FbDyfDcw26lw/gviz/tq?tqx=out:json&gid=880351439',
    filename: 'locations.json'
  },
  'timeseries': {
    url: 'https://docs.google.com/spreadsheets/d/1Ewhi3YCL-dUWZ3YrHpsmWt4goza-5c1FbDyfDcw26lw/gviz/tq?tqx=out:json&gid=478356689',
    filename: 'timeseries.json'
  },
  'funnel-default': {
    url: 'https://docs.google.com/spreadsheets/d/14Z3M53yZB8Fh0bhMp2SaPvdzeFulMi_N6HWglSFW3yY/gviz/tq?tqx=out:json&gid=0',
    filename: 'funnel-default.json'
  },
  'funnel-global': {
    url: 'https://docs.google.com/spreadsheets/d/14Z3M53yZB8Fh0bhMp2SaPvdzeFulMi_N6HWglSFW3yY/gviz/tq?tqx=out:json&gid=603895130',
    filename: 'funnel-global.json'
  },
  'config': {
    url: 'https://docs.google.com/spreadsheets/d/1Ewhi3YCL-dUWZ3YrHpsmWt4goza-5c1FbDyfDcw26lw/gviz/tq?tqx=out:json&gid=940884547',
    filename: 'config.json'
  }
};

async function fetchGoogleSheetJson(name, config) {
  console.log(`Fetching ${name}...`);
  
  const response = await fetch(config.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name}: ${response.statusText}`);
  }
  
  const text = await response.text();
  
  // Parse Google Sheets JSONP response
  const jsonStartIndex = text.indexOf('(') + 1;
  const jsonEndIndex = text.lastIndexOf('}') + 1;
  const jsonText = text.substring(jsonStartIndex, jsonEndIndex);
  const data = JSON.parse(jsonText);
  
  if (!data.table || !data.table.rows) {
    throw new Error(`No data found in ${name}`);
  }
  
  // Convert to our format
  const headers = data.table.cols?.map(col => col.label || '') || [];
  const rows = data.table.rows.map(row => 
    row.c?.map(cell => cell?.v || '') || []
  );
  
  return {
    headers,
    rows,
    lastUpdated: new Date().toISOString(),
    timestamp: Date.now(),
    source: `Google Sheets - ${name}`,
    url: config.url,
    rowCount: rows.length
  };
}

async function main() {
  try {
    console.log('🔄 Fetching fresh funnel data from Google Sheets...');
    
    // Create cache directory
    const cacheDir = path.join(process.cwd(), 'public', 'cached-data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Fetch all data sources
    const allData = {};
    const savedFiles = [];
    
    for (const [name, config] of Object.entries(FUNNEL_DATA_SOURCES)) {
      try {
        const sheetData = await fetchGoogleSheetJson(name, config);
        allData[name] = sheetData;
        console.log(`✅ ${name}: ${sheetData.rows.length} rows`);
        
        // Save individual JSON file for this data source
        const filePath = path.join(cacheDir, config.filename);
        const content = JSON.stringify(sheetData, null, 2);
        fs.writeFileSync(filePath, content);
        
        // Force update the file timestamp to ensure git sees it as changed
        const now = new Date();
        fs.utimesSync(filePath, now, now);
        
        savedFiles.push(config.filename);
        console.log(`📁 Saved: ${config.filename} (${sheetData.rows.length} rows)`);
        
      } catch (error) {
        console.error(`❌ Failed to fetch ${name}:`, error.message);
        // Continue with other sources instead of failing completely
        console.log(`⚠️ Skipping ${name} and continuing...`);
      }
    }
    
    // Create a combined metadata file
    const metadata = {
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now(),
      sources: Object.keys(FUNNEL_DATA_SOURCES),
      totalSources: Object.keys(FUNNEL_DATA_SOURCES).length,
      successfulSources: Object.keys(allData).length,
      savedFiles: savedFiles
    };
    
    const metadataPath = path.join(cacheDir, 'funnel-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Force update metadata timestamp
    const now = new Date();
    fs.utimesSync(metadataPath, now, now);
    
    console.log(`\n✅ Funnel cache updated successfully!`);
    console.log(`📊 Total data sources: ${metadata.totalSources}`);
    console.log(`✅ Successfully fetched: ${metadata.successfulSources}`);
    console.log(`📄 Individual files saved: ${savedFiles.length}`);
    savedFiles.forEach(file => console.log(`   • ${file}`));
    console.log(`📁 Metadata: funnel-metadata.json`);
    console.log(`🕒 Timestamp: ${metadata.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ Funnel cache update failed:', error);
    process.exit(1);
  }
}

main();
