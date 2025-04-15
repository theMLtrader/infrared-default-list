import { readdirSync } from 'node:fs'
import { createPublicClient, http } from 'viem'

import { supportedChains } from '@/config/chains'
import type { TokensSchema } from '@/types/tokens'
import type { VaultsSchema } from '@/types/vaults'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { outputScriptStatus } from './_/output-script-status'
import { validateList } from './_/validate-list'
import { validateVaultDetails } from './_/validate-vault-details'

const schema = getFile('schema/vaults-schema.json')
const folderPath = 'src/vaults'

const validateVaultsByChain = async ({
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
  const tokens: TokensSchema = getJsonFile({
    chain,
    path: `src/tokens/${chain}.json`,
  })
  const publicClient = createPublicClient({
    chain: supportedChains[chain],
    transport: http(),
  })
  const slugs: Array<string> = []
  const beraRewardsVaults = new Set<string>()

  validateList({ errors, list: vaults, schema, type: 'vaults' })
  const promisedVaultDetails = vaults.vaults.map(
    async (vault) =>
      await validateVaultDetails({
        beraRewardsVaults,
        errors,
        publicClient,
        slugs,
        tokens,
        vault,
      }),
  )
  await Promise.all(promisedVaultDetails)
  outputScriptStatus({ chain, errors, type: 'Vaults' })
}

const validateVaults = async () => {
  const promises = readdirSync(folderPath).map(async (file) => {
    const chain = file.replace('.json', '')

    if (!isValidChain(chain)) {
      throw new Error(`Unsupported chain: ${chain}`)
    }
    await validateVaultsByChain({ chain })
  })

  await Promise.all(promises)
}

await validateVaults()
