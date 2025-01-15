import type { Address, PublicClient } from 'viem'

import type { GaugeListSchema } from '@/types/gauge-list'
import { ProtocolsSchema } from '@/types/protocols'

import { delay } from './delay'
import { getFile } from './get-file'
import { getTokenSymbol } from './get-token-symbol'

const RPC_REQUESTS_PER_SECOND = 10
const ONE_SECOND = 1000

const validateName = async ({
  errors,
  gauge,
  publicClient,
  rpcLookupCount,
}: {
  errors: Array<string>
  gauge: GaugeListSchema['gauges'][number]
  publicClient: PublicClient
  rpcLookupCount: number
}) => {
  const symbols = await Promise.all(
    gauge.underlyingTokens.map(async (underlyingToken) => {
      rpcLookupCount += 1
      if (rpcLookupCount % RPC_REQUESTS_PER_SECOND === 0) {
        await delay(ONE_SECOND)
      }
      return await getTokenSymbol({
        errors,
        publicClient,
        token: underlyingToken as Address,
      })
    }),
  )
  const underlyingTokenSymbols = symbols.join('-')

  if (gauge.name !== underlyingTokenSymbols) {
    rpcLookupCount += 1
    if (rpcLookupCount % RPC_REQUESTS_PER_SECOND === 0) {
      await delay(ONE_SECOND)
    }
    const lpTokenSymbol = await getTokenSymbol({
      errors,
      publicClient,
      token: gauge.lpTokenAddress as Address,
    })

    if (gauge.name !== lpTokenSymbol) {
      errors.push(
        `${gauge.name} does not match ${lpTokenSymbol} or ${underlyingTokenSymbols}.`,
      )
    }
  }
}

const protocolsList: ProtocolsSchema = getFile('src/protocols.json')

const validateProtocol = async ({
  errors,
  gauge,
}: {
  errors: Array<string>
  gauge: GaugeListSchema['gauges'][number]
}) => {
  const matchingProtocol = protocolsList.protocols.find(
    ({ id }) => id === gauge.protocol,
  )

  if (!matchingProtocol) {
    errors.push(`${gauge.name} does not have a protocol for ${gauge.protocol}.`)
  }
}

export const validateGaugeDetails = async ({
  errors,
  list,
  publicClient,
}: {
  errors: Array<string>
  list: GaugeListSchema
  publicClient: PublicClient
}) => {
  const gauges: GaugeListSchema['gauges'] = list.gauges
  let rpcLookupCount = 0

  for (const gauge of gauges) {
    await validateName({ errors, gauge, publicClient, rpcLookupCount })
    await validateProtocol({ errors, gauge })
  }
}
