import { after } from "next/server";
import { z } from "zod";
import { bookedBedsByRoom, countNights, freeBeds } from "@/lib/availability";
import { bookingSchema } from "@/lib/booking-schema";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: z.flattenError(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  try {
    // Availability check and insert share one transaction so two requests can't take the same beds.
    const result = await prisma.$transaction(async (tx) => {
      // Row lock: concurrent bookings of the same room queue up here, so they can't both pass the check below.
      await tx.$queryRaw`SELECT id FROM "Room" WHERE id = ${data.roomId} FOR UPDATE`;
      const room = await tx.room.findUnique({ where: { id: data.roomId } });
      if (!room || !room.isAvailable) {
        return { status: 404, error: "Комната не найдена или недоступна" } as const;
      }

      const booked = await bookedBedsByRoom(tx, data.checkInDate, data.checkOutDate, room.id);
      const free = freeBeds(room, booked.get(room.id) ?? 0);
      if (data.guestsCount > free) {
        return {
          status: 409,
          error:
            free === 0
              ? "Комната занята на выбранные даты"
              : `На выбранные даты свободно мест: ${free}`,
        } as const;
      }

      const booking = await tx.booking.create({
        data: {
          ...data,
          totalPrice: countNights(data.checkInDate, data.checkOutDate) * room.pricePerNight,
        },
      });
      return { booking, roomTitle: room.title };
    });

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    // Sent after the response so a slow Telegram API doesn't delay the guest.
    after(() => sendBookingNotification(result.booking, result.roomTitle));
    return Response.json(result.booking, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
