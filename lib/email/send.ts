import nodemailer from 'nodemailer'

export type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string }

function getFromAddress(): string {
  const name = process.env.EMAIL_BRAND_NAME ?? 'TFlowers'
  const addr = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? 'noreply@localhost'
  return process.env.SMTP_FROM_FORMAT === 'plain'
    ? addr
    : `"${name}" <${addr}>`
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  )
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    console.warn('[email] SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS')
    return { ok: false, skipped: true, reason: 'smtp_not_configured' }
  }

  const port = Number(process.env.SMTP_PORT ?? 587)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'send failed'
    console.error('[email]', msg)
    return { ok: false, error: msg }
  }
}

export function getAdminNotifyEmails(): string[] {
  const raw = process.env.SMTP_ADMIN_EMAIL ?? process.env.RESEND_NOTIFY_EMAIL ?? ''
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
