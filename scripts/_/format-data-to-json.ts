export const formatDataToJson = ({ data }: { data: object }) =>
  `${JSON.stringify(data, null, 2)}\n`
