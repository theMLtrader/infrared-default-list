import { writeFile } from 'node:fs/promises'

import type { VaultsSchema } from '@/types/vaults'

import { formatDataToJson } from './format-data-to-json'

export const sortVaults = async ({
  path,
  vaults,
}: {
  path: string
  vaults: VaultsSchema['vaults']
}) => {
  const sortedVaults = vaults.sort((a, b) => a.slug.localeCompare(b.slug))

  await writeFile(path, formatDataToJson({ data: { vaults: sortedVaults } }))
}
