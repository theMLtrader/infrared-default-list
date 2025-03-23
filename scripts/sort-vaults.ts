import { readdirSync } from 'node:fs'

import type { GaugesSchema } from '@/types/vaults'

import { getJsonFile } from './_/get-json-file'
import { isValidNetwork } from './_/is-valid-network'
import { sortVaults } from './_/sort-vaults'

const folderPath = 'src/gauges'

readdirSync(folderPath).forEach(async (file) => {
  const network = file.replace('.json', '')

  if (!isValidNetwork(network)) {
    throw new Error(`Unsupported network: ${network}`)
  }

  const path = `${folderPath}/${network}.json`
  const gauges: GaugesSchema = getJsonFile({
    network,
    path,
  })

  await sortVaults({
    gauges: gauges.gauges,
    path,
  })
})
