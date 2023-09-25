export default [
  {
    api: {
      url: 'https://api-goerli.etherscan.io/api',
      key: '',
    },
    chainId: '5',
    networkId: '5',
    internalId: '5',
    name: 'Görli',
    features: ['EIP1559'],
    debug: false,
    contracts: ['0xD9D74a29307cc6Fc8BF424ee4217f1A587FBc8Dc'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      'https://eth-goerli.public.blastapi.io',
      'https://rpc.ankr.com/eth_goerli',
      'https://rpc.goerli.mudit.blog',
      'https://eth-goerli.g.alchemy.com/v2/demo',
    ],
    watch: ['rpc'],
    tokens: [
      {
        name: 'OUSDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0xa0321efEb50c46C17A7D72A52024eeA7221b215A',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x6b56404816A1CB8ab8E8863222d8C1666De942d5',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c8f9D9C1D74c38c8Aeb5033126EA1133728b32f',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address: '0xFEf68eb974c562B0dCBF307d9690e0BD10e35cEa',
      },
    ],
    router: {
      '0xc7a54a6ec85344fabb645bf9ff9b2e88066fe601': 'OrbiterRouterV3',
    },
    xvmList: ['0x2096D6DD537CF7A7ee1662BBbEc8C2809fCf2647'],
    faucets: [
      'https://goerli-faucet.slock.it/?address=${ADDRESS}',
      'https://faucet.goerli.mudit.blog',
    ],
    infoURL: 'https://goerli.etherscan.io',
  },
  {
    api: {
      url: 'https://api-goerli.arbiscan.io/api',
      key: '',
    },
    chainId: '421613',
    networkId: '421613',
    internalId: '22',
    name: 'Arbitrum(G)',
    features: ['EIP1559'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://goerli-rollup.arbitrum.io/rpc',
      'https://arb-goerli.g.alchemy.com/v2/demo',
      'https://endpoints.omniatech.io/v1/arbitrum/goerli/public',
    ],
    watch: ['rpc'],
    contracts: ['0x1AC6a2965Bd55376ec27338F45cfBa55d8Ba380a'],
    tokens: [
      {
        name: 'OUSDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0xa3fdf06e3c59df2deaae6d597353477fc3daaeaf',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x6b56404816A1CB8ab8E8863222d8C1666De942d5',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c8f9D9C1D74c38c8Aeb5033126EA1133728b32f',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address: '0xFEf68eb974c562B0dCBF307d9690e0BD10e35cEa',
      },
    ],
    xvmList: ['0x8D6363511418F5871107b6C2Dac78Cfb1174f3EB'],
    faucets: [],
    explorers: [
      {
        name: 'Arbitrum Nova Chain Explorer',
        url: 'https://goerli-rollup.arbitrum.io/',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
    ],
    infoURL: 'https://testnet.arbiscan.io',
    parent: {},
  },
  {
    api: {
      url: '',
      key: '',
      intervalTime: 60000,
    },
    chainId: 'SN_GOERLI',
    networkId: 'goerli-alpha',
    internalId: '44',
    name: 'Starknet(G)',
    debug: false,
    contracts: [
      '0x0457bf9a97e854007039c43a6cc1a81464bd2a4b907594dabc9132c162563eb3',
    ],
    nativeCurrency: {
      id: 0,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      address:
        '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    },
    rpc: [],
    watch: ['rpc'],
    tokens: [
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address:
          '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address:
          '0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address:
          '0x0386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a',
      },
    ],
    infoURL: 'https://testnet.starkscan.co',
  },
  {
    api: {
      url: 'https://api-testnet.polygonscan.com/api',
      key: '',
    },
    chainId: '80001',
    networkId: '80001',
    internalId: '66',
    name: 'Polygon Mumbai',
    nativeCurrency: {},
    rpc: [
      'https://polygon-mumbai.gateway.tenderly.co',
      'https://matic-testnet-archive-rpc.bwarelabs.com',
      'https://polygon-testnet.public.blastapi.io',
      'https://rpc.ankr.com/polygon_mumbai',
      'https://matic-mumbai.chainstacklabs.com',
    ],
    watch: ['rpc'],
    contracts: [],
    tokens: [
      {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
        address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x6b56404816A1CB8ab8E8863222d8C1666De942d5',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c8f9D9C1D74c38c8Aeb5033126EA1133728b32f',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address: '0xFEf68eb974c562B0dCBF307d9690e0BD10e35cEa',
      },
    ],
    xvmList: ['0x2096D6DD537CF7A7ee1662BBbEc8C2809fCf2647'],
    faucets: ['https://faucet.matic.network/'],
    infoURL: 'https://matic.network/',
  },
  {
    api: {
      url: 'https://api-goerli-optimism.etherscan.io/api',
      key: '',
    },
    chainId: '420',
    networkId: '420',
    internalId: '77',
    name: 'Optimism(G)',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://goerli.optimism.io',
      'https://opt-goerli.g.alchemy.com/v2/demo',
    ],
    watch: ['rpc'],
    contracts: ['0x89EBCf7253f5E27b45E82cd228c977Fd03E47f54'],
    tokens: [
      {
        name: 'OUSDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x17464cffd501430302f20f37145e36cc47842790',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x6b56404816A1CB8ab8E8863222d8C1666De942d5',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c8f9D9C1D74c38c8Aeb5033126EA1133728b32f',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address: '0xFEf68eb974c562B0dCBF307d9690e0BD10e35cEa',
      },
    ],
    xvmList: ['0x2096d6dd537cf7a7ee1662bbbec8c2809fcf2647'],
    faucets: [],
    infoURL: 'https://goerli-optimism.etherscan.io/',
  },
  {
    api: {
      url: 'https://zksync2-testnet.zkscan.io/api',
      key: '',
    },
    chainId: '280',
    networkId: '280',
    internalId: '514',
    debug: false,
    name: 'zkSync Era(G)',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://zksync2-testnet.zksync.dev'],
    watch: ['rpc', 'api'],
    contracts: ['0x9147eE8678C27a2E677A84aB14F7303E451E99Fb'],
    tokens: [
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x0faF6df7054946141266420b43783387A78d82A9',
      },
    ],
    faucets: [],
    infoURL: 'https://goerli.explorer.zksync.io/',
  },
  {
    api: {
      url: 'https://api-testnet.bscscan.com/api',
      key: '',
    },
    chainId: '97',
    networkId: '97',
    internalId: '515',
    name: 'BSC(G)',
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://data-seed-prebsc-1-s1.binance.org:8545',
      'https://bsc-testnet.public.blastapi.io',
    ],
    watch: ['rpc'],
    tokens: [
      {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
        address: '0x2ceEA9FeAD4584aBA77eCdE697E9fc80C9BD4c56',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x6b56404816A1CB8ab8E8863222d8C1666De942d5',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c8f9D9C1D74c38c8Aeb5033126EA1133728b32f',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        decimals: 18,
        address: '0xFEf68eb974c562B0dCBF307d9690e0BD10e35cEa',
      },
    ],
    xvmList: ['0x2096D6DD537CF7A7ee1662BBbEc8C2809fCf2647'],
    faucets: ['https://testnet.binance.org/faucet-smart'],
    infoURL: 'https://testnet.binance.org/',
  },
  {
    api: {
      url: 'https://explorer.public.zkevm-test.net/api',
      key: '',
      intervalTime: 10000,
    },
    chainId: '1442',
    networkId: '1442',
    internalId: '517',
    name: 'zkEVM(G)',
    debug: false,
    contracts: ['0x99c0b2B824D7291E832DC9018B24CaA6B68673E2'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://rpc.public.zkevm-test.net'],
    xvmList: [],
    watch: ['rpc', 'api'],
    tokens: [
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x6aB2235c5F8FbEf7834c051C029B8F2af02DEF55',
      },
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0xB3E5fd0FC4e7854f9c22250F2d8a9B135c9a476b',
      },
    ],
    infoURL: 'https://testnet-zkevm.polygonscan.com',
  },
  {
    api: {
      url: 'https://l2scan.scroll.io/api',
      key: '',
    },
    chainId: '534353',
    networkId: '534353',
    internalId: '519',
    name: 'Scroll Alpha(G)',
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://alpha-rpc.scroll.io/l2'],
    watch: ['rpc'],
    tokens: [],
    faucets: [],
    infoURL: 'https://blockscout.scroll.io/',
  },
  {
    api: {
      url: 'https://l2explorer.a2.taiko.xyz/api',
      key: '',
      intervalTime: 60000,
    },
    chainId: '167005',
    networkId: '167005',
    internalId: '520',
    name: 'Taiko(G)',
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://rpc.test.taiko.xyz'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://explorer.test.taiko.xyz',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '84531',
    networkId: '84531',
    internalId: '521',
    name: 'Base(G)',
    debug: false,
    contracts: [],
    features: ['Etherscan'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://goerli.base.org'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://goerli.basescan.org',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '59140',
    networkId: '59140',
    internalId: '523',
    name: 'Linea(G)',
    debug: false,
    features: ['EIP1559', 'Etherscan'],
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    tokens: [
      {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        address: '0x81a8cD37af3F5570E79E75Ccd17A877159cF226E',
      },
    ],
    router: {
      '0xa14113c142e1b3f33f1da3ee43eccb9e0471ff2d': 'OrbiterRouterV3',
    },
    rpc: ['https://rpc.goerli.linea.build'],
    watch: ['rpc'],
    infoURL: 'https://goerli.lineascan.build',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '5001',
    networkId: '5001',
    internalId: '524',
    name: 'mantle(G)',
    debug: false,
    contracts: ['0xf1e276a6518dff455fdabfdc582591fda35797ea'],
    features: ['Etherscan'],
    nativeCurrency: {
      name: 'MNT',
      symbol: 'MNT',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://rpc.testnet.mantle.xyz',
      'https://rpc.ankr.com/mantle_testnet',
    ],
    watch: ['rpc'],
    tokens: [
      {
        name: 'Ether (WETH)',
        symbol: 'ETH',
        decimals: 18,
        address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
      },
    ],
    router: {
      '0xf06a54463c6dbc6d64547760891167aff9de76c5': 'OrbiterRouterV3',
    },
    infoURL: 'https://explorer.testnet.mantle.xyz',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '5611',
    networkId: '5611',
    internalId: '525',
    name: 'opBSC(G)',
    debug: false,
    features: ['Etherscan'],
    contracts: [],
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'BNB',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://opbnb-testnet-rpc.bnbchain.org'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://opbnbscan.com',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '11155111',
    networkId: '11155111',
    internalId: '526',
    name: 'Sepolia(G)',
    features: ['Etherscan'],
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://rpc.sepolia.org'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://sepolia.etherscan.io',
  },
  {
    api: {
      url: 'https://okbrpc.okbchain.org/v1',
      key: '',
    },
    chainId: '195',
    networkId: '195',
    internalId: '527',
    name: 'OKB(G)',
    debug: false,
    contracts: [],
    features: ['Etherscan'],
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://okbtestrpc.okbchain.org'],
    watch: ['rpc'],
    tokens: [
      {
        name: 'Ether (WETH)',
        symbol: 'ETH',
        decimals: 18,
        address: '0xaf99998DCFaB1A506213B73Fe50E3f31166B7EB1',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        address: '0x01a22c7aB5dc856884eB61be019044C8f844A005',
      },
    ],
    infoURL: 'https://www.okx.com/explorer/okbc-test',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '534351',
    networkId: '534351',
    internalId: '528',
    name: 'Scroll Sepolia',
    swapContract: '0xC9ed54B77c4929bCC773a6e0021dfBd1d0BcEb31',
    features: [],
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: [
      'https://sepolia-rpc.scroll.io',
      'http://scroll-testnet-public.unifra.io/',
      'https://rpc.ankr.com/scroll_sepolia_testnet',
    ],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://sepolia-blockscout.scroll.io',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '91715',
    networkId: '91715',
    internalId: '529',
    name: 'Combo Görli',
    swapContract: '0x2ec02e3DB531F9c4eA04590a9A55C5791399538E',
    features: [],
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://test-rpc.combonetwork.io'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://combotrace-testnet.nodereal.io',
  },
  {
    api: {
      url: '',
      key: '',
    },
    chainId: '999',
    networkId: '999',
    internalId: '530',
    name: 'Zora Görli',
    swapContract: '0x6aca21c6c79066F41B4D0c32574DDb07FC2e7131',
    features: [],
    debug: false,
    contracts: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    rpc: ['https://testnet.rpc.zora.energy'],
    watch: ['rpc'],
    tokens: [],
    infoURL: 'https://testnet.explorer.zora.energy',
  },
]
