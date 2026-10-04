import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return Response.json({ error: "Комната не найдена" }, { status: 404 });
    return Response.json(room);
  } catch (err) {
    console.error("GET /api/rooms/[id] failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
