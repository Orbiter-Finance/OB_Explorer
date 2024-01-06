export const appMainnet = Boolean(
  process.env['NEXT_PUBLIC_APP_MAINNET'] == 'true',
)

export const thegraphBaseUrl = process.env.NEXT_PUBLIC_THEGRAPH_BASE_URL!
console.log('Log env thegraphBaseUrl:', thegraphBaseUrl)

export const submitterBaseUrl = process.env.NEXT_PUBLIC_SUBMITTER_BASE_URL!
console.log('Log env submitterBaseUrl:', submitterBaseUrl)

export const openapiBaseUrl = process.env.NEXT_PUBLIC_OPENAPI_BASE_URL!
console.log('Log env openapiBaseUrl:', openapiBaseUrl)

export const bountyWhitelistAddresses = (
  process.env.NEXT_PUBLIC_BOUNTY_WHITELIST_ADDRESSES || ''
)
  .split(',')
  .filter((item) => item.startsWith('0x'))
console.log('Log env bountyWhitelistAddresses:', bountyWhitelistAddresses)
