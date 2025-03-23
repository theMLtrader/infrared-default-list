import { getFile } from './_/get-file'
import { sortProtocols } from './_/sort-protocols'

const path = 'src/protocols.json'
const protocols = getFile(path)

const sortProtocolsScript = async () => {
  await sortProtocols({
    path,
    protocols: protocols.protocols,
  })
}

sortProtocolsScript()
