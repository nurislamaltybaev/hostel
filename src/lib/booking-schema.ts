import { z } from "zod";

// Shared by POST /api/bookings and the client booking form.

/** "2026-10-10" or a full ISO datetime with offset. */
export const isoDate = z
  .union([z.iso.date(), z.iso.datetime({ offset: true })], "Укажите дату")
  .pipe(z.coerce.date());

export const bookingSchema = z
  .object({
    roomId: z.uuid(),
    guestName: z.string().trim().min(2, "Укажите имя и фамилию").max(100, "Слишком длинное имя"),
    guestEmail: z.email("Некорректный email"),
    guestPhone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/, "Некорректный номер телефона"),
    checkInDate: isoDate,
    checkOutDate: isoDate,
    guestsCount: z.int().min(1),
  })
  .refine((b) => b.checkOutDate > b.checkInDate, {
    path: ["checkOutDate"],
    message: "Дата выезда должна быть позже даты заезда",
  })
  .refine((b) => b.checkInDate.getTime() >= new Date().setUTCHours(0, 0, 0, 0), {
    path: ["checkInDate"],
    message: "Дата заезда не может быть в прошлом",
  });
