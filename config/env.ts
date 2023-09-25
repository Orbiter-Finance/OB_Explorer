export const appMainnet = Boolean(
  process.env['NEXT_PUBLIC_APP_MAINNET'] == 'true',
)

export const thegraphBaseUrl = process.env.NEXT_PUBLIC_THEGRAPH_BASE_URL!

export const submitterBaseUrl = process.env.NEXT_PUBLIC_SUBMITTER_BASE_URL!

export const openapiBaseUrl = process.env.NEXT_PUBLIC_OPENAPI_BASE_URL!
