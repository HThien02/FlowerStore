import { escapeHtml } from './escape-html'

type ShellOpts = {
  /** Shown in <title> and main heading */
  title: string
  /** Inner HTML (already safe or from escapeHtml) */
  bodyHtml: string
  /** Short line for email clients that support preview text */
  preheader?: string
  brandName?: string
}

/**
 * Simple responsive-friendly HTML shell for transactional mail (Resend, etc.).
 */
export function emailShell({
  title,
  bodyHtml,
  preheader,
  brandName = 'Flower Shop',
}: ShellOpts): string {
  const pre = preheader ? `<span style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  ${pre}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td style="background:linear-gradient(135deg, #e75480 0%, #f0689e 100%);padding:20px 24px;text-align:center;">
              <span style="font-size:20px;color:#fff;font-weight:700;">🌸 ${escapeHtml(brandName)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 32px;color:#18181b;font-size:15px;line-height:1.6;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">${escapeHtml(title)}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;text-align:center;">
              ${escapeHtml(brandName)} · ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Helper function to wrap content in email layout
 */
export function getEmailLayout(content: string, recipientName: string = 'Customer'): string {
  return emailShell({
    title: 'Flower Store Notification',
    bodyHtml: content,
    brandName: 'Flower Store',
    preheader: `Hello ${recipientName}`,
  })
}
