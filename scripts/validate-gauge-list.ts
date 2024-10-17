import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

import type { GaugeListSchema } from '../src/types/gauge-list'
import { checkImageSize } from './_/check-image-size'
import { ASSETS_FOLDER } from './_/constants'
import { getErrorMessage } from './_/get-error-message'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// @ts-expect-error hack fix for __dirname. See https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const schema = JSON.parse(
  readFileSync(
    path.join(__dirname, '../schema/gauge-list-schema.json'),
    'utf-8',
  ),
)

const validateGaugeList = async ({ network }: { network: string }) => {
  const gaugeListPath = path.join(
    __dirname,
    `../src/gauges/${network}/defaultGaugeList.json`,
  )

  let gaugeList: GaugeListSchema

  try {
    gaugeList = JSON.parse(readFileSync(gaugeListPath, 'utf-8'))
  } catch (error) {
    console.error(
      `Error reading JSON files for network ${network}:`,
      getErrorMessage(error),
    )
    process.exit(1)
  }

  const errors: Array<string> = []

  // Validate the overall structure
  const validate = ajv.compile(schema)
  const valid = validate(gaugeList)

  if (!valid) {
    validate.errors?.forEach((error) => {
      errors.push(
        `Error in gauge list: ${error.message} at ${error.instancePath}`,
      )
    })
  }

  // Check if all image files exist and have correct dimensions
  for (const protocol of gaugeList.protocols) {
    const imagePath = path.join(`${ASSETS_FOLDER}/protocols`, protocol.image)
    if (!existsSync(imagePath)) {
      errors.push(
        `Image file "${protocol.image}" not found for protocol "${protocol.name}"`,
      )
    } else if (path.extname(imagePath).toLowerCase() === '.png') {
      const isCorrectSize = await checkImageSize(imagePath)
      if (!isCorrectSize) {
        errors.push(
          `Image file "${protocol.image}" for protocol "${protocol.name}" is not 128x128 pixels`,
        )
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Validation failed for network ${network}:`)
    errors.forEach((error) => console.error(error))
    process.exit(1)
  }

  console.log(`Gauge validation successful for network: ${network}`)
}

// Run validation for all networks
const networksDir = path.join(__dirname, '../src/gauges')
readdirSync(networksDir).forEach(async (network) => {
  await validateGaugeList({ network })
})
