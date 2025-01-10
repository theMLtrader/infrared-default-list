import { readdirSync } from 'node:fs'

import { supportedChains } from '@/config/chains'
import type { GaugeListSchema } from '@/types/gauge-list'

import { getFile } from './_/get-file'
import { getListFile } from './_/get-list-file'
import { outputScriptStatus } from './_/output-script-status'
import { validateGaugeNames } from './_/validate-gauge-names'
import { validateList } from './_/validate-list'

const schema = getFile('schema/gauge-list-schema.json')

const validateGaugeList = async ({
  network,
}: {
  network: keyof typeof supportedChains
}) => {
  const errors: Array<string> = []
  const list: GaugeListSchema = getListFile({
    listPath: `src/gauges/${network}.json`,
    network,
  })

  const chain = supportedChains[network]

  validateList({ errors, list, schema })
  await validateGaugeNames({ chain, errors, list })
  outputScriptStatus({ errors, network, type: 'Gauge' })
}

readdirSync('src/gauges').forEach(async (file) => {
  const network = file.replace('.json', '') as keyof typeof supportedChains

  if (!Object.keys(supportedChains).includes(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  await validateGaugeList({
    network,
  })
})
