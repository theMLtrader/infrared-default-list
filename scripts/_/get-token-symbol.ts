import { type Address, erc20Abi, type PublicClient } from 'viem'

export const getTokenSymbol = async ({
  errors,
  publicClient,
  token,
}: {
  errors: Array<string>
  publicClient: PublicClient
  token: Address
}) => {
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
