import { writeFile } from 'node:fs/promises'

import type { GaugesSchema } from '@/types/gauges'

import { formatDataToJson } from './format-data-to-json'

export const sortGauges = async ({
  gauges,
  path,
}: {
  gauges: GaugesSchema['gauges']
  path: string
}) => {
  const sortedGauges = gauges.sort((a, b) => a.name.localeCompare(b.name))

  await writeFile(path, formatDataToJson({ data: { gauges: sortedGauges } }))
}
