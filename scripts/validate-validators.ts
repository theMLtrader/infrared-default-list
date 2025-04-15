import { readdirSync } from 'node:fs'

import type { supportedChains } from '@/config/chains'
import type { ValidatorsSchema } from '@/types/validators'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { outputScriptStatus } from './_/output-script-status'
import { validateList } from './_/validate-list'

const schema = getFile('schema/validators-schema.json')
const folderPath = 'src/validators'

const validateValidatorsByChain = async ({
  chain,
}: {
  chain: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const path = `${folderPath}/${chain}.json`
  const validators: ValidatorsSchema = getJsonFile({
    chain,
    path,
  })

  validateList({ errors, list: validators, schema, type: 'validators' })
  outputScriptStatus({ chain, errors, type: 'Validator' })
}

const validateValidators = async () => {
  const promises = readdirSync(folderPath).map(async (file) => {
    const chain = file.replace('.json', '')

    if (!isValidChain(chain)) {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    await validateValidatorsByChain({ chain })
  })

  await Promise.all(promises)
}

await validateValidators()
