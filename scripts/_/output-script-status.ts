export const outputScriptStatus = ({
  chain,
  errors,
  type,
}: {
  chain?: string
  errors: Array<string>
  type: string
}) => {
  if (errors.length > 0) {
    console.error(`Validation failed${chain ? ` for ${chain}` : ''}`)
    errors.forEach((error) => console.error(error))
    process.exit(1)
  }

  console.log(`${type} validation successful${chain ? ` for ${chain}` : ''}`)
}
