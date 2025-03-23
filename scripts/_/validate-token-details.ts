import type { PublicClient } from 'viem'

import type { ProtocolsSchema } from '@/types/protocols'
import type { TokensSchema } from '@/types/tokens'

import { getFile } from './get-file'
import { validateDecimals } from './validate-decimals'
import { validateImage } from './validate-image'
import { validateSymbol } from './validate-symbol'

const protocolsList: ProtocolsSchema = getFile('src/protocols.json')

const validateProtocol = ({
  errors,
  token,
}: {
  errors: Array<string>
  token: TokensSchema['tokens'][number]
}) => {
  if (!('protocol' in token)) {
    return
  }

  const protocol = protocolsList.protocols.find(
    ({ id }) => id === token.protocol,
  )

  if (!protocol) {
    errors.push(`${token.symbol} does not have a protocol (token validation)`)
  }
}

export const validateTokenDetails = async ({
  errors,
  publicClient,
  tokens,
}: {
  errors: Array<string>
  publicClient: PublicClient
  tokens: TokensSchema['tokens']
}) => {
  for (const token of tokens) {
    validateProtocol({ errors, token })
    await validateSymbol({ errors, publicClient, token })
    await validateDecimals({ errors, publicClient, token })
    await validateImage({
      errors,
      item: token,
      required: false,
      type: 'tokens',
    })
  }
}
