import nodemailer from 'nodemailer'
import { getSupabaseServerClient } from '@/lib/supabase'

// Initialize SMTP transporter
let transporter: nodemailer.Transporter | null = null

export function initializeTransporter() {
  if (transporter) return transporter

  // Get SMTP configuration from environment variables
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || smtpUser

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[SMTP] Missing SMTP configuration. Email sending is disabled.')
    return null
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  return transporter
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  orderId?: string,
  userId?: string,
  emailType?: string
) {
  const transport = initializeTransporter()

  if (!transport) {
    console.warn(`[SMTP] Email not sent to ${to} - SMTP not configured`)
    // Log to database anyway
    if (orderId || userId) {
      await logEmail(orderId, userId, emailType || 'unknown', to, subject, 'failed', 'SMTP not configured')
    }
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: htmlContent,
    }

    const info = await transport.sendMail(mailOptions)
    console.log(`[SMTP] Email sent to ${to}:`, info.messageId)

    // Log successful email
    if (orderId || userId) {
      await logEmail(orderId, userId, emailType || 'unknown', to, subject, 'sent')
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[SMTP] Failed to send email to ${to}:`, error)

    // Log failed email
    if (orderId || userId) {
      await logEmail(
        orderId,
        userId,
        emailType || 'unknown',
        to,
        subject,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function logEmail(
  orderId: string | undefined,
  userId: string | undefined,
  emailType: string,
  recipient: string,
  subject: string,
  status: 'pending' | 'sent' | 'failed',
  errorMessage?: string
) {
  try {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('email_logs').insert({
      order_id: orderId || null,
      user_id: userId || null,
      email_type: emailType,
      recipient_email: recipient,
      subject,
      status,
      error_message: errorMessage || null,
      retry_count: 0,
    })

    if (error) {
      console.error('[EMAIL_LOG] Failed to log email:', error)
    }
  } catch (err) {
    console.error('[EMAIL_LOG] Exception while logging email:', err)
  }
}

export async function retryFailedEmails() {
  try {
    const supabase = getSupabaseServerClient()

    // Get failed emails that haven't exceeded max retries
    const { data: failedEmails, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) {
      console.error('[RETRY_EMAIL] Failed to fetch failed emails:', error)
      return
    }

    // Note: Implement actual retry logic based on email type
    // This is a placeholder for now
    console.log(`[RETRY_EMAIL] Found ${failedEmails?.length || 0} emails to retry`)
  } catch (err) {
    console.error('[RETRY_EMAIL] Exception during retry:', err)
  }
}
