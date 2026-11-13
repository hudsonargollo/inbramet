import nodemailer from "nodemailer";
import { formatPrice } from "./format";
import { getStoreSettings } from "./settings";

async function alertAddress(): Promise<string> {
  const fromSettings = (await getStoreSettings()).notifications.orderEmail;
  return fromSettings || process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "";
}

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  branchName?: string;
  fulfillment?: "DELIVERY" | "PICKUP";
  paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: /gmail|googlemail/i.test(process.env.SMTP_HOST ?? "")
        ? process.env.SMTP_PASS?.replace(/\s+/g, "")
        : process.env.SMTP_PASS,
    },
  });
}

function itemsTable(o: OrderEmailData): string {
  const rows = o.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a">
          ${escape(i.name)} <span style="color:#475569">× ${i.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a">
          ${formatPrice(i.price * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr><td style="padding:8px 0;color:#475569">Subtotal</td><td style="padding:8px 0;text-align:right;color:#0f172a">${formatPrice(o.subtotal)}</td></tr>
      <tr><td style="padding:8px 0;color:#475569">Frete</td><td style="padding:8px 0;text-align:right;color:#0f172a">${o.shipping === 0 ? "Grátis" : formatPrice(o.shipping)}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:700;color:#0f172a">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#0f172a">${formatPrice(o.total)}</td></tr>
    </table>`;
}

function shell(title: string, inner: string): string {
  return `
  <div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#0f172a;padding:22px;text-align:center">
        <div style="color:#E6FF57;font-size:24px;letter-spacing:6px;font-weight:700">INBRAMET</div>
        <div style="color:#cbd5e1;font-size:13px;margin-top:4px">Móveis funcionais e design para o seu espaço</div>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 8px;color:#0f172a;font-size:22px">${title}</h1>
        ${inner}
      </div>
      <div style="background:#0f172a;padding:16px;text-align:center;color:#94a3b8;font-size:12px">
        Inbramet · Móveis e equipamentos
      </div>
    </div>
  </div>`;
}

function customerHtml(o: OrderEmailData): string {
  return shell(
    "Obrigado pelo seu pedido!",
    `<p style="color:#0f172a;font-size:14px">Olá ${escape(o.customerName)}, recebemos seu pedido e nossa equipe entrará em contato em breve.</p>
     <p style="color:#0f172a;font-size:14px">Número do pedido: <strong>${escape(o.orderNumber)}</strong><br/>
     Pagamento: <strong>${escape(o.paymentMethod)}</strong></p>
     <div style="margin:18px 0">${itemsTable(o)}</div>
     <p style="color:#475569;font-size:13px">Entrega em: ${escape(o.address)}, ${escape(o.city)}<br/>Telefone: ${escape(o.phone)}</p>
     ${o.paymentMethod === "COD" ? `<p style="color:#475569;font-size:13px">Se você escolheu pagamento na entrega, deixe o valor combinado disponível ao receber seu pedido.</p>` : ""}`
  );
}

function adminHtml(o: OrderEmailData): string {
  return shell(
    "Novo pedido",
    `<p style="color:#0f172a;font-size:14px">Pedido <strong>${escape(o.orderNumber)}</strong> — ${formatPrice(o.total)} (${escape(o.paymentMethod)})</p>
     <p style="color:#0f172a;font-size:14px"><strong>${escape(o.customerName)}</strong><br/>
     ${escape(o.email)} · ${escape(o.phone)}<br/>
     ${escape(o.address)}, ${escape(o.city)}</p>
     <div style="margin:18px 0">${itemsTable(o)}</div>`
  );
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] SMTP not configured — skipping order emails.");
    return;
  }

  const from = process.env.MAIL_FROM || `Inbramet <${process.env.SMTP_USER}>`;
  const adminTo = await alertAddress();

  try {
    const transport = getTransport();
    await Promise.all([
      transport.sendMail({
        from,
        to: o.email,
        subject: `Seu pedido na Inbramet ${o.orderNumber}`,
        html: customerHtml(o),
      }),
      transport.sendMail({
        from,
        to: adminTo,
        subject: `Novo pedido ${o.orderNumber} — ${formatPrice(o.total)}`,
        html: adminHtml(o),
      }),
    ]);
  } catch (err) {
    console.error("[email] Failed to send order emails:", err);
  }
}

export async function sendPasswordResetEmail(p: { to: string; name: string; url: string }): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] SMTP not configured — password reset email not sent.");
    return;
  }
  const from = process.env.MAIL_FROM || `Inbramet <${process.env.SMTP_USER}>`;
  try {
    await getTransport().sendMail({
      from,
      to: p.to,
      subject: "Redefina sua senha da Inbramet",
      html: shell(
        "Redefinir senha",
        `<p style="color:#0f172a;font-size:14px">Olá ${escape(p.name)}, recebemos uma solicitação para redefinir a sua senha.</p>
         <p style="margin:22px 0"><a href="${escape(p.url)}" style="background:#0f172a;color:#E6FF57;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700">Escolher nova senha</a></p>
         <p style="color:#475569;font-size:13px">Este link expira em 1 hora e pode ser usado apenas uma vez. Se você não solicitou, pode ignorar este e-mail.</p>`
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
  }
}

export async function sendContactNotification(m: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  topic?: string;
}): Promise<void> {
  if (!emailConfigured()) return;
  const from = process.env.MAIL_FROM || `Inbramet <${process.env.SMTP_USER}>`;
  const to = await alertAddress();
  try {
    await getTransport().sendMail({
      from,
      to,
      replyTo: m.email,
      subject: `Nova mensagem: ${m.subject || m.topic || "Formulário de contato"} — ${m.name}`,
      html: shell(
        "Nova mensagem de contato",
        `<p style="color:#0f172a;font-size:14px"><strong>${escape(m.name)}</strong> · ${escape(m.email)}${
          m.phone ? ` · ${escape(m.phone)}` : ""
        }</p>
         ${m.subject ? `<p style="color:#0f172a;font-size:14px"><strong>${escape(m.subject)}</strong></p>` : ""}
         <p style="color:#0f172a;font-size:14px;white-space:pre-wrap">${escape(m.message)}</p>`
      ),
    });
  } catch (err) {
    console.error("[email] Failed to send contact notification:", err);
  }
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "register" | "verify"
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`\n[email] SMTP not configured — DEV ONLY verification code for ${to}: ${code}\n`);
      return { ok: true };
    }
    console.error("[email] SMTP not configured — cannot send verification code");
    return { ok: false, error: "Não foi possível enviar o e-mail de verificação agora. Tente mais tarde ou entre em contato." };
  }
  const from = process.env.MAIL_FROM || `Inbramet <${process.env.SMTP_USER}>`;
  const spaced = code.split("").join(" ");
  const title = purpose === "register" ? "Confirme seu e-mail" : "Verifique seu e-mail";
  try {
    await getTransport().sendMail({
      from,
      to,
      subject: `${code} é o seu código de verificação da Inbramet`,
      text: `Seu código de verificação da Inbramet é ${code}. Ele expira em 10 minutos. Se você não solicitou, ignore este e-mail.`,
      html: shell(
        title,
        `<p style="color:#0f172a;font-size:14px">Use este código para ${
          purpose === "register" ? "concluir a criação da sua conta Inbramet" : "verificar seu endereço de e-mail"
        }:</p>
         <p style="margin:22px 0;text-align:center">
           <span style="display:inline-block;background:#f8fafc;border:1px solid #0f172a;border-radius:10px;padding:14px 22px;font-size:30px;font-weight:700;letter-spacing:8px;color:#0f172a;font-family:'Courier New',monospace">${escape(spaced)}</span>
         </p>
         <p style="color:#475569;font-size:13px">Este código expira em <strong>10 minutos</strong>. Nunca compartilhe este código — a Inbramet não solicita códigos por telefone ou WhatsApp.</p>
         <p style="color:#475569;font-size:13px">Se não foi você quem solicitou, basta ignorar este e-mail.</p>`
      ),
    });
    return { ok: true };
  } catch (err) {
    console.error("[email] Failed to send verification code:", err);
    const e = err as { code?: string; responseCode?: number; rejected?: string[] };
    const badRecipient = e.code === "EENVELOPE" || Boolean(e.rejected?.length) || (e.responseCode ?? 0) === 550;
    return {
      ok: false,
      error: badRecipient
        ? "Não conseguimos enviar o código para esse endereço. Confira o e-mail e tente novamente."
        : "Não foi possível enviar o e-mail de verificação agora. Tente novamente em instantes ou entre em contato.",
    };
  }
}
