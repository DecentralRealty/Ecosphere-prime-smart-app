import { ISmartNode } from '@hsuite/types';

export const customTestnetConfig: {
  nodes: Array<ISmartNode.IOperator>,
  utilities: Array<ISmartNode.IUtility>
} = ({
  nodes: [
    {
      accountId: "0.0.5161507",
      publicKey: "302a300506032b6570032100e32312d6a74f0de6d19e4b19b4888ade1bc928a4194aa10c9895e048eb4d7ae9",
      url: "http://127.0.0.1:3001"
    },
    // {
    //   accountId: "0.0.5161701",
    //   publicKey: "302a300506032b657003210088ffa3cb4266f9ef5e6f6cc65c9e60ded20f85857f4c685a2eea64a18be31c23",
    //   url: "http://127.0.0.1:3002"
    // },
    // {
    //   accountId: "0.0.5161846",
    //   publicKey: "302a300506032b65700321003e56830f3a39d690b94425cf4b1e209d77765f66ed052c32400b8cf9bdf3b0a0",
    //   url: "http://127.0.0.1:3003"
    // },
    // {
    //   accountId: "0.0.5162510",
    //   publicKey: "302a300506032b657003210001d1cc15a0dd5996faeccb18aade77fd35324d0ff961b2893982b40bb682e6d0",
    //   url: "http://127.0.0.1:3004"
    // },
    // {
    //   accountId: "0.0.4422809",
    //   publicKey: "302d300706052b8104000a032200022fc21db893c71cfa36bdf4022c3974ecec63f6b19dd5fcf2c1bc865433841672",
    //   url: "http://10.0.0.232:3005"
    // },
    // {
    //   accountId: "0.0.4422811",
    //   publicKey: "302d300706052b8104000a03220002fdc933862db69e8847a1e2adeed0f1d1b149681c90837f42d137eba2e5b91134",
    //   url:  "http://10.0.0.232:3006"
    // }
  ],
  utilities: [
    // you can config your utilities here...
    {
      name: 'hsuite',
      id: '0.0.2203022',
      treasury: '0.0.2193470',
      decimals: '4'
    },
    {
      name: 'veHsuite',
      id: '0.0.2203405',
      treasury: '0.0.2203617',
      decimals: '4'
    },
    {
      name: 'lpHSuite',
      id: '0.0.2666544',
      treasury: '0.0.2193470'
    },
    {
      name: 'nftDexHSuite',
      id: '0.0.2666543',
      treasury: '0.0.2193470'
    },
    {
      name: 'shibar',
      id: '0.0.2203306',
      treasury: '0.0.2193470',
      decimals: '4'
    }
  ]
});
