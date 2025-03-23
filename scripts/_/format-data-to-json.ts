const SPACES = 2

export const formatDataToJson = ({ data }: { data: object }) =>
  `${JSON.stringify(data, null, SPACES)}\n`
