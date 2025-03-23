import { readdirSync } from 'node:fs'

import type { supportedChains } from '@/config/chains'
import type { ValidatorsSchema } from '@/types/validators'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidNetwork } from './_/is-valid-network'
import { outputScriptStatus } from './_/output-script-status'
import { sortValidators } from './_/sort-validators'
import { validateList } from './_/validate-list'

const schema = getFile('schema/validators-schema.json')
const validatorsFolderPath = 'src/validators'

const validateValidators = async ({
  network,
}: {
  network: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const path = `${validatorsFolderPath}/${network}.json`
  const validators: ValidatorsSchema = getJsonFile({
    network,
    path,
  })

  validateList({ errors, list: validators, schema, type: 'validators' })
  outputScriptStatus({ errors, network, type: 'Validator' })
  await sortValidators({
    path,
    validators: validators.validators,
  })
}

readdirSync(validatorsFolderPath).forEach(async (file) => {
  const network = file.replace('.json', '')

  if (!isValidNetwork(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  await validateValidators({ network })
})
