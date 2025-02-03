import { berachainTestnetbArtio } from 'viem/chains'

import { berachainTestnetcArtio } from './berachain-testnet-cartio'
import { berachainMainnet } from '@/config/berachain-mainnet'

export const supportedChains = {
  bartio: berachainTestnetbArtio,
  cartio: berachainTestnetcArtio,
  mainnet: berachainMainnet,
} as const
