import { readdirSync } from 'node:fs'

import type { VaultsSchema } from '@/types/vaults'

import { getJsonFile } from './_/get-json-file'
import { isValidChain } from './_/is-valid-chain'
import { sortVaults } from './_/sort-vaults'

const folderPath = 'src/vaults'

readdirSync(folderPath).forEach(async (file) => {
  const chain = file.replace('.json', '')

  if (!isValidChain(chain)) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  const path = `${folderPath}/${chain}.json`
  const vaults: VaultsSchema = getJsonFile({
    chain,
    path,
  })

  await sortVaults({
    path,
    vaults: vaults.vaults,
  })
})
