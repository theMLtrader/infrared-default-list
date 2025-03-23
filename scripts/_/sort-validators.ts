import { writeFile } from 'node:fs/promises'

import type { ValidatorsSchema } from '@/types/validators'

import { formatDataToJson } from './format-data-to-json'

export const sortValidators = async ({
  path,
  validators,
}: {
  path: string
  validators: ValidatorsSchema['validators']
}) => {
  const sortedValidators = validators.sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  await writeFile(
    path,
    formatDataToJson({ data: { validators: sortedValidators } }),
  )
}
