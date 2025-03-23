import { readdirSync } from 'node:fs'

import type { TokensSchema } from '@/types/tokens'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { outputScriptStatus } from './_/output-script-status'
import { validateImages } from './_/validate-images'
import { validateList } from './_/validate-list'

const schema = getFile('schema/tokens-schema.json')

const validateTokens = async ({ network }: { network: string }) => {
  const errors: Array<string> = []
  const tokens: TokensSchema = getJsonFile({
    network,
    path: `src/tokens/${network}.json`,
  })

  validateList({ errors, list: tokens, schema })
  await validateImages({ errors, listItem: tokens.tokens, type: 'tokens' })
  outputScriptStatus({ errors, network, type: 'Token' })
}

readdirSync('src/tokens').forEach(async (network) => {
  await validateTokens({ network: network.replace('.json', '') })
})
