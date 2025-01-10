import { berachainTestnetbArtio } from 'viem/chains'

import { berachainTestnetcArtio } from './berachain-testnet-cartio'

export const supportedChains = {
  bartio: berachainTestnetbArtio,
  cartio: berachainTestnetcArtio,
} as const
