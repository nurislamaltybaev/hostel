import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin, unauthorized } from "@/lib/session";

const patchSchema = z
  .strictObject({
    pricePerNight: z.number().positive().max(10_000_000).optional(),
    isAvailable: z.boolean().optional(),
  })
  .refine((d) => d.pricePerNight !== undefined || d.isAvailable !== undefined, {
    message: "Нужно передать pricePerNight или isAvailable",
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return unauthorized();

  const parsed = patchSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return Response.json(
      { error: "Некорректные данные: цена должна быть положительным числом" },
      { status: 400 },
    );
  }
  const { id } = await params;

  try {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return Response.json({ error: "Комната не найдена" }, { status: 404 });
    return Response.json(await prisma.room.update({ where: { id }, data: parsed.data }));
  } catch (err) {
    console.error("PATCH /api/admin/rooms/[id] failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
