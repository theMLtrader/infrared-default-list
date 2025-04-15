import { readdirSync } from 'node:fs'
import { createPublicClient, http } from 'viem'

import { supportedChains } from '@/config/chains'
import type { VaultsSchema } from '@/types/vaults'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { outputScriptStatus } from './_/output-script-status'
import { validateList } from './_/validate-list'
import { validateVaultDetails } from './_/validate-vault-details'

const schema = getFile('schema/vaults-schema.json')
const folderPath = 'src/vaults'

const validateVaults = async ({
  chain,
}: {
  chain: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const path = `${folderPath}/${chain}.json`
  const vaults: VaultsSchema = getJsonFile({
    chain,
    path,
  })

  const publicClient = createPublicClient({
    chain: supportedChains[chain],
    transport: http(),
  })

  validateList({ errors, list: vaults, schema, type: 'vaults' })
  await validateVaultDetails({
    chain,
    errors,
    publicClient,
    vaults: vaults.vaults,
  })
  outputScriptStatus({ chain, errors, type: 'Vaults' })
}

readdirSync(folderPath).forEach(async (file) => {
  const chain = file.replace('.json', '')

  if (!isValidChain(chain)) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  await validateVaults({
    chain,
  })
})
