import { readdirSync } from 'node:fs'

import type { ValidatorsSchema } from '@/types/validators'

import { getJsonFile } from './_/get-json-file'
import { isValidNetwork } from './_/is-valid-network'
import { sortValidators } from './_/sort-validators'

const folderPath = 'src/validators'

readdirSync(folderPath).forEach(async (file) => {
  const network = file.replace('.json', '')

  if (!isValidNetwork(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  const path = `${folderPath}/${network}.json`
  const validators: ValidatorsSchema = getJsonFile({
    network,
    path,
  })

  await sortValidators({
    path,
    validators: validators.validators,
  })
})
