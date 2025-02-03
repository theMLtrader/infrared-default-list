import { defineChain } from 'viem'

export const berachainMainnet = defineChain({
  blockExplorers: {
    default: {
      name: 'Berachain Beratrail',
      url: 'https://80094.routescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0, // TODO
    },
  },
  id: 80094,
  name: 'Berachain',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: {
      http: [
        'https://frosty-cosmopolitan-vineyard.furtim-network.quiknode.pro/086110f727c512b759cabb81560528ff964653aa',
      ],
    },
  },
})
