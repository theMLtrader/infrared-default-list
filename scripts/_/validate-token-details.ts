import type { Address, PublicClient } from 'viem'

import type { ProtocolsSchema } from '@/types/protocols'
import type { TokensSchema } from '@/types/tokens'

import { delay } from './delay'
import { getFile } from './get-file'
import { getTokenSymbol } from './get-token-symbol'
import { validateDecimals } from './validate-decimals'
import { validateImage } from './validate-image'
import { validateSymbol } from './validate-symbol'

const RPC_REQUESTS_PER_SECOND = 10
const ONE_SECOND = 1000

interface Counter {
  value: number
}

const validateName = async ({
  errors,
  publicClient,
  rpcLookupCount,
  token,
}: {
  errors: Array<string>
  publicClient: PublicClient
  rpcLookupCount: Counter
  token: TokensSchema['tokens'][number]
}) => {
  const tokenSymbol = await getTokenSymbol({
    errors,
    publicClient,
    tokenAddress: token.address as Address,
  })

  if (token.name !== tokenSymbol) {
    if ('underlyingTokens' in token) {
      const symbols = await Promise.all(
        token.underlyingTokens.map(async (underlyingToken) => {
          rpcLookupCount.value += 1
          if (rpcLookupCount.value % RPC_REQUESTS_PER_SECOND === 0) {
            await delay(ONE_SECOND)
          }
          return await getTokenSymbol({
            errors,
            publicClient,
            tokenAddress: underlyingToken as Address,
          })
        }),
      )
      const underlyingTokenSymbols = symbols.join('-')

      if (token.name !== underlyingTokenSymbols) {
        rpcLookupCount.value += 1
        if (rpcLookupCount.value % RPC_REQUESTS_PER_SECOND === 0) {
          await delay(ONE_SECOND)
        }

        errors.push(
          `${token.name} does not match ${tokenSymbol} or ${underlyingTokenSymbols}`,
        )
      }
    } else {
      errors.push(`${token.name} does not match ${tokenSymbol}`)
    }
  }
}

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

const validateMintUrl = ({
  errors,
  token,
}: {
  errors: Array<string>
  token: TokensSchema['tokens'][number]
}) => {
  if (!('mintUrl' in token) || !token.mintUrl) {
    return
  }

  if (token.protocol === 'bex') {
    const expectedMintUrl = `https://hub.berachain.com/pools/`
    if (!token.mintUrl.startsWith(expectedMintUrl)) {
      errors.push(
        `${token.symbol} mintUrl is incorrect. It should start with ${expectedMintUrl}`,
      )
    }
  } else if (token.protocol === 'dolomite') {
    const expectedMintUrl = `https://app.dolomite.io/balances`
    if (!token.mintUrl.startsWith(expectedMintUrl)) {
      errors.push(
        `${token.symbol} mintUrl is incorrect. It should be ${expectedMintUrl}`,
      )
    }
  } else if (token.protocol === 'kodiak') {
    const expectedMintUrl = `https://app.kodiak.finance/#/liquidity/pools/${token.address}?chain=berachain_mainnet`
    if (token.mintUrl !== expectedMintUrl) {
      errors.push(
        `${token.symbol} mintUrl is incorrect. It should be ${expectedMintUrl}`,
      )
    }
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
  const rpcLookupCount = { value: 0 }

  for (const token of tokens) {
    await validateDecimals({ errors, publicClient, token })
    await validateImage({
      errors,
      item: token,
      required: false,
      type: 'tokens',
    })
    await validateMintUrl({ errors, token })
    await validateName({ errors, publicClient, rpcLookupCount, token })
    validateProtocol({ errors, token })
    await validateSymbol({ errors, publicClient, token })
  }
}
