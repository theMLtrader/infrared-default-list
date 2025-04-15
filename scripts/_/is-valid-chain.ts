import { supportedChains } from '@/config/chains'

export const isValidChain = (
  name: string,
): name is keyof typeof supportedChains =>
  Object.keys(supportedChains).includes(name.toLowerCase())
