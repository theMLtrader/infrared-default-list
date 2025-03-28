import { type Address, erc20Abi, type PublicClient, zeroAddress } from 'viem'

export const getTokenName = async ({
  errors,
  publicClient,
  tokenAddress,
}: {
  errors: Array<string>
  publicClient: PublicClient
  tokenAddress: Address
}) => {
  if (tokenAddress === zeroAddress) {
    return 'BERA' // hack for BERA
  }

  const name = await publicClient.readContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'name',
  })
  if (!name) {
    errors.push(`${tokenAddress} does not have a name on the contract`)
  }
  return name
}
