import { readdirSync } from 'node:fs'
import { createPublicClient, http } from 'viem'

import { supportedChains } from '@/config/chains'
import type { GaugesSchema } from '@/types/gauges'

import { getFile } from './_/get-file'
import { getJsonFile } from './_/get-json-file'
import { isValidNetwork } from './_/is-valid-network'
import { outputScriptStatus } from './_/output-script-status'
import { sortGauges } from './_/sort-gauges'
import { validateGaugeDetails } from './_/validate-gauge-details'
import { validateList } from './_/validate-list'

const schema = getFile('schema/gauges-schema.json')
const folderPath = 'src/gauges'

const validateGauges = async ({
  network,
}: {
  network: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const path = `${folderPath}/${network}.json`
  const gauges: GaugesSchema = getJsonFile({
    network,
    path,
  })

  const chain = supportedChains[network]
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })

  validateList({ errors, list: gauges, schema, type: 'gauges' })
  await validateGaugeDetails({
    errors,
    gauges: gauges.gauges,
    network,
    publicClient,
  })
  outputScriptStatus({ errors, network, type: 'Gauge' })
  await sortGauges({
    gauges: gauges.gauges,
    path,
  })
}

readdirSync(folderPath).forEach(async (file) => {
  const network = file.replace('.json', '')

  if (!isValidNetwork(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  await validateGauges({
    network,
  })
})
