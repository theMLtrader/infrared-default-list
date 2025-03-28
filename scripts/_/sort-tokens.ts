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
  const sortedTokens = tokens.sort((a, b) =>
    a.hasOwnProperty('underlyingTokens')
      ? b.hasOwnProperty('underlyingTokens')
        ? 'protocol' in a && 'protocol' in b
          ? a.protocol.localeCompare(b.protocol)
          : 1
        : 1
      : b.hasOwnProperty('underlyingTokens')
        ? -1
        : a.name.localeCompare(b.name),
  )

  await writeFile(path, formatDataToJson({ data: { tokens: sortedTokens } }))
}
