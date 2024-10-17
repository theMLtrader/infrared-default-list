const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/gauge-list-schema.json'), 'utf-8'));

async function checkImageSize(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return metadata.width === 128 && metadata.height === 128;
  } catch (error) {
    console.error(`Error checking image size for ${filePath}:`, error.message);
    return false;
  }
}

async function validateGaugeList(network) {
  const gaugeListPath = path.join(__dirname, `../src/gauges/${network}/defaultGaugeList.json`);
  const tokenListPath = path.join(__dirname, `../src/tokens/${network}/defaultTokenList.json`);
  
  let gaugeList, tokenList;

  try {
    gaugeList = JSON.parse(fs.readFileSync(gaugeListPath, 'utf-8'));
    tokenList = JSON.parse(fs.readFileSync(tokenListPath, 'utf-8'));
  } catch (error) {
    console.error(`Error reading JSON files for network ${network}:`, error.message);
    process.exit(1);
  }

  const errors = [];

  // Validate the overall structure
  const validate = ajv.compile(schema);
  const valid = validate(gaugeList);

  if (!valid) {
    validate.errors.forEach(error => {
      errors.push(`Error in gauge list: ${error.message} at ${error.instancePath}`);
    });
  }

  // Additional custom validations for each gauge
  gaugeList.gauges.forEach((gauge, index) => {
    // ... (previous validations remain the same)
  });

  // Check if all logo files exist and have correct dimensions
  const assetsDir = path.join(__dirname, '../src/assets');
  for (const protocol of gaugeList.protocols) {
    const logoPath = path.join(assetsDir, protocol.logo);
    if (!fs.existsSync(logoPath)) {
      errors.push(`Logo file "${protocol.logo}" not found for protocol "${protocol.name}"`);
    } else if (path.extname(logoPath).toLowerCase() === '.png') {
      const isCorrectSize = await checkImageSize(logoPath);
      if (!isCorrectSize) {
        errors.push(`Logo file "${protocol.logo}" for protocol "${protocol.name}" is not 128x128 pixels`);
      }
    }
  }
  for (const gauge of gaugeList.gauges) {
    if (gauge.logo) {
      const logoPath = path.join(assetsDir, gauge.logo);
      if (!fs.existsSync(logoPath)) {
        errors.push(`Logo file "${gauge.logo}" not found for gauge "${gauge.name}"`);
      } else if (path.extname(logoPath).toLowerCase() === '.png') {
        const isCorrectSize = await checkImageSize(logoPath);
        if (!isCorrectSize) {
          errors.push(`Logo file "${gauge.logo}" for gauge "${gauge.name}" is not 128x128 pixels`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Validation failed for network ${network}:`);
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  console.log(`Validation successful for network: ${network}`);
}

// Run validation for all networks
const networksDir = path.join(__dirname, '../src/gauges');
fs.readdirSync(networksDir).forEach(async (network) => {
  await validateGaugeList(network);
});