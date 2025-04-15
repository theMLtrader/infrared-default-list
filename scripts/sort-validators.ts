import { readdirSync } from 'node:fs'

import type { ValidatorsSchema } from '@/types/validators'

import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { sortValidators } from './_/sort-validators'

const folderPath = 'src/validators'

readdirSync(folderPath).forEach(async (file) => {
  const chain = file.replace('.json', '')

  if (!isValidChain(chain)) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  const path = `${folderPath}/${chain}.json`
  const validators: ValidatorsSchema = getJsonFile({
    chain,
    path,
  })

  await sortValidators({
    path,
    validators: validators.validators,
  })
})
