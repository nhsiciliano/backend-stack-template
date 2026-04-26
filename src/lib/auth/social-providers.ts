import { SignJWT, importPKCS8 } from 'jose'
import type { AppConfig } from '../../config/env.js'

type SocialProviderConfig = {
  google?: {
    clientId: string
    clientSecret: string
  }
  microsoft?: {
    clientId: string
    clientSecret: string
    tenantId?: string
    authority?: string
    prompt?: 'select_account'
  }
  apple?: {
    clientId: string
    clientSecret: string
    appBundleIdentifier?: string
  }
}

function hasValue(value: string | undefined): value is string {
  return Boolean(value && value.trim().length > 0)
}

async function generateAppleClientSecret(config: AppConfig): Promise<string> {
  const clientId = config.APPLE_CLIENT_ID
  const teamId = config.APPLE_TEAM_ID
  const keyId = config.APPLE_KEY_ID
  const privateKey = config.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!hasValue(clientId) || !hasValue(teamId) || !hasValue(keyId) || !hasValue(privateKey)) {
    throw new Error('Apple Sign In requires APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY.')
  }

  const key = await importPKCS8(privateKey, 'ES256')
  const now = Math.floor(Date.now() / 1000)

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key)
}

export async function buildSocialProviders(config: AppConfig): Promise<SocialProviderConfig> {
  const socialProviders: SocialProviderConfig = {}

  if (hasValue(config.GOOGLE_CLIENT_ID) && hasValue(config.GOOGLE_CLIENT_SECRET)) {
    socialProviders.google = {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    }
  }

  if (hasValue(config.MICROSOFT_CLIENT_ID) && hasValue(config.MICROSOFT_CLIENT_SECRET)) {
    socialProviders.microsoft = {
      clientId: config.MICROSOFT_CLIENT_ID,
      clientSecret: config.MICROSOFT_CLIENT_SECRET,
      tenantId: config.MICROSOFT_TENANT_ID ?? 'common',
      authority: 'https://login.microsoftonline.com',
      prompt: 'select_account',
    }
  }

  if (
    hasValue(config.APPLE_CLIENT_ID) &&
    hasValue(config.APPLE_TEAM_ID) &&
    hasValue(config.APPLE_KEY_ID) &&
    hasValue(config.APPLE_PRIVATE_KEY)
  ) {
    socialProviders.apple = {
      clientId: config.APPLE_CLIENT_ID,
      clientSecret: await generateAppleClientSecret(config),
    }

    if (hasValue(config.APPLE_APP_BUNDLE_IDENTIFIER)) {
      socialProviders.apple.appBundleIdentifier = config.APPLE_APP_BUNDLE_IDENTIFIER
    }
  }

  return socialProviders
}

export function buildTrustedOrigins(config: AppConfig): string[] {
  const origins = new Set<string>()
  const rawOrigins = config.TRUSTED_ORIGINS

  if (hasValue(rawOrigins)) {
    rawOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => origins.add(origin))
  }

  if (hasValue(config.CORS_ORIGIN)) {
    origins.add(config.CORS_ORIGIN)
  }

  if (hasValue(config.APPLE_CLIENT_ID)) {
    origins.add('https://appleid.apple.com')
  }

  return [...origins]
}
