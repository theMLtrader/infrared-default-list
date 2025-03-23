import { writeFile } from 'node:fs/promises'

import type { TokensSchema } from '@/types/tokens'

import { formatDataToJson } from './format-data-to-json'

export const sortTokens = async ({
  path,
  tokens,
}: {
  path: string
  tokens: TokensSchema['tokens']
}) => {
  const sortedTokens = tokens.sort((a, b) => a.symbol.localeCompare(b.symbol))

  await writeFile(path, formatDataToJson({ data: { tokens: sortedTokens } }))
}
