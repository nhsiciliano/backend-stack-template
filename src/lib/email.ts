import { Resend } from 'resend'
import type { AppConfig } from '../config/env.js'

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

let resendClient: Resend | undefined

function getResendClient(apiKey: string): Resend {
  resendClient ??= new Resend(apiKey)
  return resendClient
}

export async function sendEmail(config: AppConfig, input: SendEmailInput): Promise<void> {
  const resend = getResendClient(config.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: config.EMAIL_FROM,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  if (error) {
    throw new Error(`Failed to send email with Resend: ${error.message}`)
  }
}
