import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import type { GaugeTypesSchema } from '@/types/gauge-types'
import type { GaugesSchema } from '@/types/gauges'
import type { ProtocolsSchema } from '@/types/protocols'
import type { TokensSchema } from '@/types/tokens'
import type { ValidatorsSchema } from '@/types/validators'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export const validateList = ({
  errors,
  list,
  schema,
}: {
  errors: Array<string>
  list:
    | GaugesSchema
    | GaugeTypesSchema
    | ProtocolsSchema
    | TokensSchema
    | ValidatorsSchema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}) => {
  // Validate the overall structure
  const validate = ajv.compile(schema)
  const valid = validate(list)

  if (!valid) {
    validate.errors?.forEach((error) => {
      errors.push(`Error in list: ${error.message} at ${error.instancePath}`)
    })
  }
}
