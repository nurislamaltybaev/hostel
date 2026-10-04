import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin, unauthorized } from "@/lib/session";

const patchSchema = z.object({ status: z.enum(["CONFIRMED", "CANCELLED"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return Response.json({ error: "status должен быть CONFIRMED или CANCELLED" }, { status: 400 });
  }
  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return Response.json({ error: "Бронирование не найдено" }, { status: 404 });
    // A cancelled booking has released its beds; reviving it could overbook the room.
    if (booking.status === "CANCELLED") {
      return Response.json({ error: "Отменённую бронь нельзя изменить" }, { status: 409 });
    }
    const updated = await prisma.booking.update({ where: { id }, data: parsed.data });
    return Response.json(updated);
  } catch (err) {
    console.error("PATCH /api/admin/bookings/[id] failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
