import { betterAuth } from 'better-auth'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import type { AppConfig } from '../../config/env.js'
import { getPrismaClient } from '../prisma.js'
import { sendEmail } from '../email.js'
import { buildSocialProviders, buildTrustedOrigins } from './social-providers.js'

function renderEmailLayout(
  title: string,
  body: string,
  ctaUrl: string,
  ctaLabel: string,
): { html: string; text: string } {
  return {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">${title}</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${body}</p>
        <p style="margin-bottom: 24px;">
          <a href="${ctaUrl}" style="display: inline-block; padding: 12px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;">${ctaLabel}</a>
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="font-size: 14px; line-height: 1.6; word-break: break-word; color: #2563eb;">${ctaUrl}</p>
      </div>
    `,
    text: `${title}\n\n${body}\n\n${ctaLabel}: ${ctaUrl}`,
  }
}

export async function createAuth(config: AppConfig) {
  const prisma = getPrismaClient()
  const socialProviders = await buildSocialProviders(config)

  return betterAuth({
    appName: config.APP_NAME,
    baseURL: config.BETTER_AUTH_URL,
    basePath: '/auth',
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: buildTrustedOrigins(config),
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 30,
      sendResetPassword: async ({ user, url }) => {
        const email = renderEmailLayout(
          'Reset your password',
          `We received a request to reset your ${config.APP_NAME} password. If this was you, use the link below to continue.`,
          url,
          'Reset password',
        )

        await sendEmail(config, {
          to: user.email,
          subject: `Reset your ${config.APP_NAME} password`,
          html: email.html,
          text: email.text,
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        const email = renderEmailLayout(
          'Verify your email',
          `Confirm your email address to activate your ${config.APP_NAME} account.`,
          url,
          'Verify email',
        )

        await sendEmail(config, {
          to: user.email,
          subject: `Verify your ${config.APP_NAME} account`,
          html: email.html,
          text: email.text,
        })
      },
    },
    socialProviders,
  })
}
