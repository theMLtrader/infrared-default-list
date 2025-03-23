import { readdirSync } from 'node:fs'

import type { VaultsSchema } from '@/types/vaults'

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
  const vaults: VaultsSchema = getJsonFile({
    network,
    path,
  })

  await sortVaults({
    path,
    vaults: vaults.gauges,
  })
})
