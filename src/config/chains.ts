import { berachainTestnetbArtio } from 'viem/chains'

import { berachainMainnet } from '@/config/berachain-mainnet'

import { berachainTestnetcArtio } from './berachain-testnet-cartio'

export const supportedChains = {
  bartio: berachainTestnetbArtio,
  cartio: berachainTestnetcArtio,
  mainnet: berachainMainnet,
} as const
