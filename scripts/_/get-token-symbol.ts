import {
  type Address,
  type Chain,
  createPublicClient,
  erc20Abi,
  http,
} from 'viem'

export const getTokenSymbol = async ({
  chain,
  errors,
  token,
}: {
  chain: Chain
  errors: Array<string>
  token: Address
}) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })
  const symbol = await publicClient.readContract({
    abi: erc20Abi,
    address: token,
    functionName: 'symbol',
  })
  if (!symbol) {
    errors.push(`${token} does not have a symbol on the contract.`)
  }
  return symbol
}
