import { readdirSync } from 'node:fs'

import type { TokensSchema } from '@/types/tokens'

import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { sortTokens } from './_/sort-tokens'

const folderPath = 'src/tokens'

readdirSync(folderPath).forEach(async (file) => {
  const chain = file.replace('.json', '')

  if (!isValidChain(chain)) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  const path = `${folderPath}/${chain}.json`
  const tokens: TokensSchema = getJsonFile({
    chain,
    path,
  })

  await sortTokens({
    path,
    tokens: tokens.tokens,
  })
})
