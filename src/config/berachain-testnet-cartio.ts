import { defineChain } from 'viem'

export const berachainTestnetcArtio = defineChain({
  blockExplorers: {
    default: {
      name: 'Berachain cArtio Beratrail',
      url: 'https://80000.testnet.routescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 121028,
    },
  },
  id: 80000,
  name: 'Berachain cArtio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://amberdew-eth-cartio.berachain.com'] },
  },
  testnet: true,
})
