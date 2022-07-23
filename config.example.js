// it is not recommended to edit this configuration directly, use the provided UI instead
export default {
    appNetwork: 'ropsten',
    // Immutable X Generic Configurations
    // to submit a new contract for registration on immutable x use: https://submitcontract.x.immutable.com/
    linkSDK: 'https://link.x.immutable.com',
    linkSDKRopsten: 'https://link.ropsten.x.immutable.com',
    publicApiUrl: 'https://api.x.immutable.com/v1',
    publicApiUrlRopsten: 'https://api.ropsten.x.immutable.com/v1',
    publicApiUrlV2: 'https://api.x.immutable.com/v2',
    publicApiUrlV2Ropsten: 'https://api.ropsten.x.immutable.com/v2',
    // Address of your registered contract on Immutable X
    // Your contract address, please note its different for Ropsten and Mainnet
    tokenContractAddress: '',
    // frontend configuration
    mintCost: 0.04,
    collectionSize: 10000,
    maxMintsForUser: 1000000,
    whitelistedAddresses: [],
    depositWalletAddress: '',
    isMintingEnabled: false,
    whitelistOnly: false,
    backgroundColor: '#070D2B',
    textColor: '#6BF6F0',
    textSizePx: '12',
    buttonBackgroundColor: '#f900ff',
    buttonColor: '#FFFFFF',
    logoMaxWidth: 'auto',
    pageHeading: 'Public Mint for Demo Collection',
    mintButtonBorderStyle: 'rounded', // rounded, rectangular
    mintButtonLabel: 'MINT',
    currentPriceLabel: 'MINT PRICE:',
    countdownDate: '',
    mintLayer: 'l1', // can be l1 (ETH Mainnet) or l2 (ImmutableX L2)
}
