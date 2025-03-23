import { writeFile } from 'node:fs/promises'

import type { ProtocolsSchema } from '@/types/protocols'

import { formatDataToJson } from './format-data-to-json'

export const sortProtocols = async ({
  path,
  protocols,
}: {
  path: string
  protocols: ProtocolsSchema['protocols']
}) => {
  const sortedProtocols = protocols.sort((a, b) => a.id.localeCompare(b.id))

  await writeFile(
    path,
    formatDataToJson({ data: { protocols: sortedProtocols } }),
  )
}
