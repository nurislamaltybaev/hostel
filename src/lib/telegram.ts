import type { Booking } from "../generated/prisma/client";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

/** Notifies the admin about a new booking. Never throws: failures are only logged. */
export async function sendBookingNotification(booking: Booking, roomTitle: string): Promise<void> {
  const text = [
    "🛏 <b>Новое бронирование</b>",
    "",
    `<b>Комната:</b> ${escapeHtml(roomTitle)}`,
    `<b>Гость:</b> ${escapeHtml(booking.guestName)}`,
    `<b>Телефон:</b> ${escapeHtml(booking.guestPhone)}`,
    `<b>Email:</b> ${escapeHtml(booking.guestEmail)}`,
    `<b>Даты:</b> ${formatDate(booking.checkInDate)} → ${formatDate(booking.checkOutDate)}`,
    `<b>Гостей:</b> ${booking.guestsCount}`,
    `<b>Сумма:</b> ${booking.totalPrice.toLocaleString("ru-RU")} ₸`,
    `<b>Статус:</b> ${booking.status}`,
    `<b>ID:</b> <code>${booking.id}</code>`,
  ].join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) {
    console.log(`[telegram] not configured, notification skipped:\n${text}`);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[telegram] sendMessage failed: ${res.status} ${await res.text()}`);
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
  }
}
