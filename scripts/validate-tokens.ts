import { readdirSync } from 'node:fs'
import { createPublicClient, http } from 'viem'

import { supportedChains } from '@/config/chains'
import type { TokensSchema } from '@/types/tokens'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { outputScriptStatus } from './_/output-script-status'
import { validateList } from './_/validate-list'
import { validateTokenDetails } from './_/validate-token-details'

const schema = getFile('schema/tokens-schema.json')
const folderPath = 'src/tokens'

const validateTokensByChain = async ({
  chain,
}: {
  chain: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const path = `${folderPath}/${chain}.json`
  const tokens: TokensSchema = getJsonFile({
    chain,
    path,
  })

  const publicClient = createPublicClient({
    chain: supportedChains[chain],
    transport: http(),
  })

  validateList({ errors, list: tokens, schema, type: 'tokens' })
  await validateTokenDetails({ errors, publicClient, tokens: tokens.tokens })
  outputScriptStatus({ chain, errors, type: 'Token' })
}

const validateTokens = async () => {
  const promises = readdirSync(folderPath).map(async (file) => {
    const chain = file.replace('.json', '')

    if (!isValidChain(chain)) {
      throw new Error(`Unsupported chain: ${chain}`)
    }
    await validateTokensByChain({ chain })
  })

  await Promise.all(promises)
}

await validateTokens()
