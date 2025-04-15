import type { ProtocolsSchema } from '@/types/protocols'

import { getFile } from './_/get-file'
import { outputScriptStatus } from './_/output-script-status'
import { validateList } from './_/validate-list'
import { validateProtocolImages } from './_/validate-protocol-images'

const schema = getFile('schema/protocols-schema.json')
const path = 'src/protocols.json'
const protocols: ProtocolsSchema = getFile(path)

const validateProtocols = async () => {
  const errors: Array<string> = []
  const protocolIds = new Set<string>()

  validateList({ errors, list: protocols, schema, type: 'protocols' })
  const promisedProtocolDetails = protocols.protocols.map(async (protocol) => {
    if (protocolIds.has(protocol.id)) {
      errors.push(
        `Error in protocols: Duplicate protocol id found: ${protocol.id}`,
      )
    }
    protocolIds.add(protocol.id)

    return await validateProtocolImages({
      errors,
      protocol,
      type: 'protocols',
    })
  })
  await Promise.all(promisedProtocolDetails)
  outputScriptStatus({ errors, type: 'Protocols' })
}

await validateProtocols()
