import type { NextRequest } from "next/server";
import { z } from "zod";
import { bookedBedsByRoom, freeBeds } from "@/lib/availability";
import { isoDate } from "@/lib/booking-schema";
import { prisma } from "@/lib/prisma";

const querySchema = z
  .object({ checkIn: isoDate.optional(), checkOut: isoDate.optional() })
  .refine((q) => !q.checkIn === !q.checkOut, {
    message: "checkIn и checkOut нужно передавать вместе",
  })
  .refine((q) => !q.checkIn || !q.checkOut || q.checkOut > q.checkIn, {
    message: "checkOut должен быть позже checkIn",
  });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = querySchema.safeParse({
    checkIn: params.get("checkIn") ?? undefined,
    checkOut: params.get("checkOut") ?? undefined,
  });
  if (!query.success) {
    return Response.json({ error: z.flattenError(query.error) }, { status: 400 });
  }
  const { checkIn, checkOut } = query.data;

  try {
    const rooms = await prisma.room.findMany({
      where: { isAvailable: true },
      orderBy: { pricePerNight: "asc" },
    });
    if (!checkIn || !checkOut) return Response.json(rooms);

    const booked = await bookedBedsByRoom(prisma, checkIn, checkOut);
    return Response.json(
      rooms
        .map((room) => ({ ...room, availableBeds: freeBeds(room, booked.get(room.id) ?? 0) }))
        .filter((room) => room.availableBeds > 0),
    );
  } catch (err) {
    console.error("GET /api/rooms failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
