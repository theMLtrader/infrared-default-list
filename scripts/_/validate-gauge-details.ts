import slug from 'slug'
import { type Address, type PublicClient, zeroAddress } from 'viem'

import type { supportedChains } from '@/config/chains'
import type { GaugesSchema } from '@/types/gauges'
import type { ProtocolsSchema } from '@/types/protocols'
import type { TokensSchema } from '@/types/tokens'

import { delay } from './delay'
import { getFile } from './get-file'
import { getJsonFile } from './get-json-file'
import { getTokenSymbol } from './get-token-symbol'

const RPC_REQUESTS_PER_SECOND = 10
const ONE_SECOND = 1000

interface Counter {
  value: number
}

slug.charmap['.'] = '.' // allow periods in urls. They are valid
slug.charmap['₮'] = '₮' // allow some unicode characters

const validateName = async ({
  errors,
  gauge,
  publicClient,
  rpcLookupCount,
}: {
  errors: Array<string>
  gauge: GaugesSchema['gauges'][number]
  publicClient: PublicClient
  rpcLookupCount: Counter
}) => {
  const symbols = await Promise.all(
    gauge.underlyingTokens.map(async (underlyingToken) => {
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

  if (gauge.name !== underlyingTokenSymbols) {
    rpcLookupCount.value += 1
    if (rpcLookupCount.value % RPC_REQUESTS_PER_SECOND === 0) {
      await delay(ONE_SECOND)
    }
    const lpTokenSymbol = await getTokenSymbol({
      errors,
      publicClient,
      tokenAddress: gauge.lpTokenAddress as Address,
    })

    if (gauge.name !== lpTokenSymbol) {
      errors.push(
        `${gauge.name} does not match ${lpTokenSymbol} or ${underlyingTokenSymbols}`,
      )
    }
  }
}

const protocolsList: ProtocolsSchema = getFile('src/protocols.json')

const validateProtocol = ({
  errors,
  gauge,
}: {
  errors: Array<string>
  gauge: GaugesSchema['gauges'][number]
}) => {
  const matchingProtocol = protocolsList.protocols.find(
    ({ id }) => id === gauge.protocol,
  )

  if (!matchingProtocol) {
    errors.push(`${gauge.name} does not have a protocol for ${gauge.protocol}`)
  }
}

const validateToken = ({
  errors,
  gauge,
  tokens,
}: {
  errors: Array<string>
  gauge: GaugesSchema['gauges'][number]
  tokens: TokensSchema['tokens']
}) => {
  for (const underlyingToken of gauge.underlyingTokens) {
    if (underlyingToken === zeroAddress) {
      errors.push(`${zeroAddress} is not a valid underlying token`)
    } else {
      const matchingToken = tokens.find(
        ({ address }) => address === underlyingToken,
      )
      if (!matchingToken) {
        errors.push(
          `${gauge.name} does not have a token for ${underlyingToken}`,
        )
      }
    }
  }
}

const validateStakeTokenAndSlug = ({
  errors,
  gauge,
  slugs,
}: {
  errors: Array<string>
  gauge: GaugesSchema['gauges'][number]
  slugs: Array<string>
}) => {
  const expectedSlug = `${slug(gauge.protocol)}-${slug(gauge.name)}`

  if (gauge.slug !== expectedSlug) {
    if (slugs.includes(expectedSlug)) {
      if (!gauge.slug.startsWith(expectedSlug)) {
        errors.push(`${gauge.slug}’s slug does not start with ${expectedSlug}`)
      }
    } else {
      errors.push(`${gauge.slug}’s slug does not match ${expectedSlug}`)
    }
  }

  if (slugs.includes(gauge.slug)) {
    errors.push(
      `Slug "${gauge.slug}" is not unique. Gauge slugs must be unique`,
    )
  }
  slugs.push(gauge.slug)
}

export const validateGaugeDetails = async ({
  errors,
  gauges,
  network,
  publicClient,
}: {
  errors: Array<string>
  gauges: GaugesSchema['gauges']
  network: keyof typeof supportedChains
  publicClient: PublicClient
}) => {
  const rpcLookupCount = { value: 0 }

  const tokens: TokensSchema = getJsonFile({
    network,
    path: `src/tokens/${network}.json`,
  })
  const slugs: Array<string> = []

  for (const gauge of gauges) {
    await validateName({ errors, gauge, publicClient, rpcLookupCount })
    validateProtocol({ errors, gauge })
    validateToken({ errors, gauge, tokens: tokens.tokens })
    validateStakeTokenAndSlug({ errors, gauge, slugs })
  }
}
