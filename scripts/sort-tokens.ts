import { readdirSync } from 'node:fs'

import type { TokensSchema } from '@/types/tokens'

import { getJsonFile } from './_/get-json-file'
import { isValidNetwork } from './_/is-valid-network'
import { sortTokens } from './_/sort-tokens'

const folderPath = 'src/tokens'

readdirSync(folderPath).forEach(async (file) => {
  const network = file.replace('.json', '')

  if (!isValidNetwork(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  const path = `${folderPath}/${network}.json`
  const tokens: TokensSchema = getJsonFile({
    network,
    path,
  })

  await sortTokens({
    path,
    tokens: tokens.tokens,
  })
})
