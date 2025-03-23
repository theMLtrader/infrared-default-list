import slug from 'slug'
import { type Address, type PublicClient, zeroAddress } from 'viem'

import type { supportedChains } from '@/config/chains'
import type { ProtocolsSchema } from '@/types/protocols'
import type { TokensSchema } from '@/types/tokens'
import type { VaultsSchema } from '@/types/vaults'

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
  publicClient,
  rpcLookupCount,
  vault,
}: {
  errors: Array<string>
  publicClient: PublicClient
  rpcLookupCount: Counter
  vault: VaultsSchema['vaults'][number]
}) => {
  const symbols = await Promise.all(
    vault.underlyingTokens.map(async (underlyingToken) => {
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

  if (vault.name !== underlyingTokenSymbols) {
    rpcLookupCount.value += 1
    if (rpcLookupCount.value % RPC_REQUESTS_PER_SECOND === 0) {
      await delay(ONE_SECOND)
    }
    const lpTokenSymbol = await getTokenSymbol({
      errors,
      publicClient,
      tokenAddress: vault.lpTokenAddress as Address,
    })

    if (vault.name !== lpTokenSymbol) {
      errors.push(
        `${vault.name} does not match ${lpTokenSymbol} or ${underlyingTokenSymbols}`,
      )
    }
  }
}

const protocolsList: ProtocolsSchema = getFile('src/protocols.json')

const validateProtocol = ({
  errors,
  vault,
}: {
  errors: Array<string>
  vault: VaultsSchema['vaults'][number]
}) => {
  const matchingProtocol = protocolsList.protocols.find(
    ({ id }) => id === vault.protocol,
  )

  if (!matchingProtocol) {
    errors.push(`${vault.name} does not have a protocol for ${vault.protocol}`)
  }
}

const validateToken = ({
  errors,
  tokens,
  vault,
}: {
  errors: Array<string>
  tokens: TokensSchema['tokens']
  vault: VaultsSchema['vaults'][number]
}) => {
  for (const underlyingToken of vault.underlyingTokens) {
    if (underlyingToken === zeroAddress) {
      errors.push(`${zeroAddress} is not a valid underlying token`)
    } else {
      const matchingToken = tokens.find(
        ({ address }) => address === underlyingToken,
      )
      if (!matchingToken) {
        errors.push(
          `${vault.name} does not have a token for ${underlyingToken}`,
        )
      }
    }
  }
}

const validateStakeTokenAndSlug = ({
  errors,
  slugs,
  vault,
                                   }: {
  errors: Array<string>
  slugs: Array<string>
  vault: VaultsSchema['vaults'][number]
}) => {
  const expectedSlug = `${slug(vault.protocol)}-${slug(vault.name)}`

  if (vault.slug !== expectedSlug) {
    if (slugs.includes(expectedSlug)) {
      if (!vault.slug.startsWith(expectedSlug)) {
        errors.push(`${vault.slug}’s slug does not start with ${expectedSlug}`)
      }
    } else {
      errors.push(`${vault.slug}’s slug does not match ${expectedSlug}`)
    }
  }

  if (slugs.includes(vault.slug)) {
    errors.push(
      `Slug "${vault.slug}" is not unique. Vault slugs must be unique`,
    )
  }
  slugs.push(vault.slug)
}

export const validateVaultDetails = async ({
  errors,
  network,
  publicClient,
  vaults,
}: {
  errors: Array<string>
  network: keyof typeof supportedChains
  publicClient: PublicClient
  vaults: VaultsSchema['vaults']
}) => {
  const rpcLookupCount = { value: 0 }

  const tokens: TokensSchema = getJsonFile({
    network,
    path: `src/tokens/${network}.json`,
  })
  const slugs: Array<string> = []

  for (const vault of vaults) {
    await validateName({ errors, publicClient, rpcLookupCount, vault })
    validateProtocol({ errors, vault })
    validateToken({ errors, tokens: tokens.tokens, vault })
    validateStakeTokenAndSlug({ errors, slugs, vault })
  }
}
