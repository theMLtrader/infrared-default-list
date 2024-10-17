const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/gauge-list-schema.json'), 'utf-8'));

function validateGaugeList(network) {
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
    // Check if protocol exists
    if (!gaugeList.protocols.some(p => p.id === gauge.protocol)) {
      errors.push(`Error in gauge "${gauge.name}" (index ${index}): Invalid protocol ID "${gauge.protocol}"`);
    }

    // Check if types are valid
    if (Array.isArray(gauge.types)) {
      gauge.types.forEach(type => {
        if (!gaugeList.types[type]) {
          errors.push(`Error in gauge "${gauge.name}" (index ${index}): Invalid type "${type}"`);
        }
      });
    } else if (gauge.type) {
      errors.push(`Error in gauge "${gauge.name}" (index ${index}): 'type' field found instead of 'types'. Please change 'type' to 'types'.`);
    } else {
      errors.push(`Error in gauge "${gauge.name}" (index ${index}): Missing 'types' field.`);
    }

    // Check if underlying tokens exist in token list
    gauge.underlyingTokens.forEach(token => {
      if (!tokenList.tokens.some(t => t.address.toLowerCase() === token.toLowerCase())) {
        errors.push(`Error in gauge "${gauge.name}" (index ${index}): Invalid underlying token "${token}"`);
      }
    });
  });

  // Check if all logo files exist
  const assetsDir = path.join(__dirname, '../src/assets');
  gaugeList.protocols.forEach(protocol => {
    if (!fs.existsSync(path.join(assetsDir, protocol.logo))) {
      errors.push(`Logo file "${protocol.logo}" not found for protocol "${protocol.name}"`);
    }
  });
  gaugeList.gauges.forEach((gauge, index) => {
    if (gauge.logo && !fs.existsSync(path.join(assetsDir, gauge.logo))) {
      errors.push(`Error in gauge "${gauge.name}" (index ${index}): Logo file "${gauge.logo}" not found`);
    }
  });

  if (errors.length > 0) {
    console.error(`Validation failed for network ${network}:`);
    errors.forEach(error => console.error(error));
    process.exit(1);
  }

  console.log(`Validation successful for network: ${network}`);
}

// Run validation for all networks
const networksDir = path.join(__dirname, '../src/gauges');
fs.readdirSync(networksDir).forEach(network => {
  validateGaugeList(network);
});