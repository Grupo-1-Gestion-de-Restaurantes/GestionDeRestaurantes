import { Resend } from 'resend';

const BRAND_NAME = 'Express';
const BRAND_TAGLINE = 'Express Space Station';

function isResendEnabled() {
    const flag = (process.env.RESEND_ENABLED ?? 'true').toString().toLowerCase();
    return flag !== 'false' && flag !== '0';
}

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        throw new Error(
            'Resend API key is not configured. Set RESEND_API_KEY in the environment.'
        );
    }
    return new Resend(apiKey);
}

function getFromEmail() {
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (from) return from;
    const name = process.env.EMAIL_FROM_NAME?.trim() || BRAND_NAME;
    return `${name} <onboarding@resend.dev>`;
}

function getAdminEmail() {
    return (
        process.env.ADMIN_EMAIL?.trim() ||
        process.env.EMAIL_FROM?.trim() ||
        null
    );
}

function getUserFrontendUrl() {
    return (process.env.FRONTEND_USER_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function getAdminFrontendUrl() {
    return (process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174').replace(/\/$/, '');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Layout HTML alineado con AuthService (EmailService.BuildEmailLayout).
 */
function buildEmailLayout({
    title,
    subtitle,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    ctaBackground = '#C1292E',
    ctaColor = '#FFFFFF',
    fallbackUrl,
}) {
    const safeTitle = escapeHtml(title);
    const safeSubtitle = escapeHtml(subtitle);
    const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : '';
    const safeCtaUrl = ctaUrl ? escapeHtml(ctaUrl) : '';
    const safeFallback = fallbackUrl ? escapeHtml(fallbackUrl) : safeCtaUrl;
    const year = new Date().getUTCFullYear();

    const ctaBlock =
        ctaLabel && ctaUrl
            ? `
          <tr>
            <td align="center" style="padding:20px 28px 8px 28px;">
              <a href="${safeCtaUrl}"
                 style="display:inline-block;background-color:${ctaBackground};color:${ctaColor};text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.04em;padding:14px 28px;border-radius:10px;border:3px solid #000000;box-shadow:4px 4px 0 #000000;">
                ${safeCtaLabel}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px 28px;">
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;line-height:1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.5;">
                <a href="${safeFallback}" style="color:#F1D302;text-decoration:underline;">${safeFallback}</a>
              </p>
            </td>
          </tr>`
            : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#111317;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#111317;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#16181f;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:4px;background-color:#C1292E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;text-align:center;">
              <div style="font-family:Impact,Haettenschweiler,'Arial Black',sans-serif;font-size:28px;letter-spacing:0.12em;color:#f0f0f2;text-transform:uppercase;">
                EXPRESS
              </div>
              <div style="margin-top:6px;font-size:11px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:#F1D302;">
                ${escapeHtml(BRAND_TAGLINE)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px 28px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#f0f0f2;font-weight:700;">
                ${safeTitle}
              </h1>
              <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.5;">
                ${safeSubtitle}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px 28px;">
              ${bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding:28px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 4px;color:rgba(245,245,247,0.4);font-size:11px;text-align:center;line-height:1.5;">
                © ${year} ${escapeHtml(BRAND_TAGLINE)}. Todos los derechos reservados.
              </p>
              <p style="margin:0;color:rgba(245,245,247,0.35);font-size:11px;text-align:center;line-height:1.5;">
                La estación espacial de la gestión de restaurantes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendViaResend({ to, subject, html, attachments }) {
    if (!isResendEnabled()) {
        console.info('[email] Resend deshabilitado (RESEND_ENABLED=false). Se omite el envío.');
        return { skipped: true };
    }

    if (!to) {
        throw new Error('Destinatario de correo no definido');
    }

    const resend = getResendClient();
    const payload = {
        from: getFromEmail(),
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
    };

    if (attachments?.length) {
        payload.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
        console.error('[email] Resend error:', error);
        throw new Error(error.message || 'Resend failed to send email');
    }

    console.info('[email] Enviado vía Resend:', data?.id || subject);
    return data;
}

/**
 * Factura PDF por correo (órdenes).
 */
export const sendInvoiceEmail = async (clientEmail, invoiceBuffer, invoiceNumber) => {
    const safeNumber = escapeHtml(invoiceNumber);
    const historyUrl = `${getUserFrontendUrl()}/dashboard/history`;

    const bodyHtml = `
      <p style="margin:0 0 16px;color:#f0f0f2;font-size:16px;line-height:1.6;">
        Estimado cliente,
      </p>
      <p style="margin:0 0 16px;color:#9ca3af;font-size:15px;line-height:1.6;">
        Adjunto encontrarás la factura <strong style="color:#F1D302;">No. ${safeNumber}</strong>
        correspondiente a tu pedido en <strong style="color:#f0f0f2;">${escapeHtml(BRAND_NAME)}</strong>.
      </p>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
        Gracias por elegirnos. Puedes revisar tu historial de pedidos en la app cuando quieras.
      </p>`;

    const html = buildEmailLayout({
        title: 'Tu factura',
        subtitle: `Factura No. ${invoiceNumber}`,
        bodyHtml,
        ctaLabel: 'Ver historial de pedidos',
        ctaUrl: historyUrl,
        ctaBackground: '#C1292E',
        ctaColor: '#FFFFFF',
        fallbackUrl: historyUrl,
    });

    const contentBase64 = Buffer.isBuffer(invoiceBuffer)
        ? invoiceBuffer.toString('base64')
        : Buffer.from(invoiceBuffer).toString('base64');

    return sendViaResend({
        to: clientEmail,
        subject: `Factura No. ${invoiceNumber} · ${BRAND_NAME}`,
        html,
        attachments: [
            {
                filename: `Factura-${invoiceNumber}.pdf`,
                content: contentBase64,
            },
        ],
    });
};

/**
 * Estado de solicitud de partner (aprobado / rechazado).
 */
export const sendPartnerStatusEmail = async (clientEmail, contactName, status) => {
    const safeName = escapeHtml(contactName);
    const approved = status === 'APPROVED';
    const adminUrl = getAdminFrontendUrl();
    const partnersUrl = `${getUserFrontendUrl()}/partners`;

    let subject;
    let title;
    let subtitle;
    let bodyHtml;
    let ctaLabel;
    let ctaUrl;
    let ctaBackground;
    let ctaColor;

    if (approved) {
        subject = `¡Tu solicitud de restaurante ha sido aprobada! · ${BRAND_NAME}`;
        title = 'Solicitud aprobada';
        subtitle = 'Bienvenido a la red Express';
        bodyHtml = `
          <p style="margin:0 0 16px;color:#f0f0f2;font-size:16px;line-height:1.6;">
            Hola <strong style="color:#F1D302;">${safeName}</strong>,
          </p>
          <p style="margin:0 0 16px;color:#9ca3af;font-size:15px;line-height:1.6;">
            Nos complace informarte que tu solicitud para registrar tu restaurante ha sido
            <strong style="color:#f0f0f2;">APROBADA</strong>.
          </p>
          <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
            Ya puedes acceder al panel de administración con tu cuenta para gestionar tu restaurante.
            ¡Bienvenido a la estación!
          </p>`;
        ctaLabel = 'Ir al panel admin';
        ctaUrl = adminUrl;
        ctaBackground = '#C1292E';
        ctaColor = '#FFFFFF';
    } else {
        subject = `Actualización sobre tu solicitud de restaurante · ${BRAND_NAME}`;
        title = 'Actualización de solicitud';
        subtitle = 'Estado de tu registro como partner';
        bodyHtml = `
          <p style="margin:0 0 16px;color:#f0f0f2;font-size:16px;line-height:1.6;">
            Hola <strong style="color:#F1D302;">${safeName}</strong>,
          </p>
          <p style="margin:0 0 16px;color:#9ca3af;font-size:15px;line-height:1.6;">
            Gracias por tu interés en unirte a nuestra red. Lamentamos informarte que por el momento
            no podemos aprobar tu solicitud de registro.
          </p>
          <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
            Si tienes alguna duda, puedes contactarnos o revisar de nuevo la información de partners.
          </p>`;
        ctaLabel = 'Ver partners';
        ctaUrl = partnersUrl;
        ctaBackground = '#F1D302';
        ctaColor = '#111317';
    }

    const html = buildEmailLayout({
        title,
        subtitle,
        bodyHtml,
        ctaLabel,
        ctaUrl,
        ctaBackground,
        ctaColor,
        fallbackUrl: ctaUrl,
    });

    return sendViaResend({
        to: clientEmail,
        subject,
        html,
    });
};

/**
 * Alertas internas al administrador del sistema.
 */
export const sendAdminAlertEmail = async (subject, htmlContent) => {
    const adminTo = getAdminEmail();
    if (!adminTo) {
        console.warn(
            '[email] ADMIN_EMAIL / EMAIL_FROM no configurado. Se omite alerta admin:',
            subject
        );
        return { skipped: true };
    }

    const bodyHtml = `
      <div style="color:#9ca3af;font-size:14px;line-height:1.6;">
        ${htmlContent}
      </div>`;

    const html = buildEmailLayout({
        title: 'Alerta del sistema',
        subtitle: subject,
        bodyHtml,
    });

    return sendViaResend({
        to: adminTo,
        subject: `${subject} · ${BRAND_NAME}`,
        html,
    });
};

/**
 * Confirmación de inscripción a un evento.
 */
export const sendEventSubscriptionEmail = async (
    clientEmail,
    clientName,
    eventName,
    eventDateTime,
    restaurantName,
    finalPrice
) => {
    const safeName = escapeHtml(clientName);
    const safeEvent = escapeHtml(eventName);
    const safeRestaurant = escapeHtml(restaurantName);
    const price = Number(finalPrice);
    const safePrice = Number.isFinite(price) ? price.toFixed(2) : String(finalPrice ?? '0.00');

    const eventDate = new Date(eventDateTime).toLocaleDateString('es-GT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const eventsUrl = `${getUserFrontendUrl()}/dashboard/events`;

    const bodyHtml = `
      <p style="margin:0 0 16px;color:#f0f0f2;font-size:16px;line-height:1.6;">
        Hola <strong style="color:#F1D302;">${safeName}</strong>,
      </p>
      <p style="margin:0 0 16px;color:#9ca3af;font-size:15px;line-height:1.6;">
        ¡Te has inscrito exitosamente al evento
        <strong style="color:#f0f0f2;">"${safeEvent}"</strong>!
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 0 16px;background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
        <tr>
          <td style="padding:16px 18px;color:#9ca3af;font-size:14px;line-height:1.7;">
            <div><strong style="color:#f0f0f2;">📅 Fecha y hora:</strong> ${escapeHtml(eventDate)}</div>
            <div><strong style="color:#f0f0f2;">🏪 Restaurante:</strong> ${safeRestaurant}</div>
            <div><strong style="color:#f0f0f2;">💰 Precio pagado:</strong> Q${escapeHtml(safePrice)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
        ¡Te esperamos en la estación!
      </p>`;

    const html = buildEmailLayout({
        title: 'Inscripción confirmada',
        subtitle: eventName,
        bodyHtml,
        ctaLabel: 'Ver mis eventos',
        ctaUrl: eventsUrl,
        ctaBackground: '#C1292E',
        ctaColor: '#FFFFFF',
        fallbackUrl: eventsUrl,
    });

    return sendViaResend({
        to: clientEmail,
        subject: `¡Te has inscrito al evento: ${eventName}! · ${BRAND_NAME}`,
        html,
    });
};
