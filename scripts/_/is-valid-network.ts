import { supportedChains } from '@/config/chains'

export const isValidNetwork = (
  name: string,
): name is keyof typeof supportedChains =>
  Object.keys(supportedChains).includes(name)
