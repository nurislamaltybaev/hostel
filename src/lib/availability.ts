import type { Prisma, Room } from "../generated/prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export function countNights(checkIn: Date, checkOut: Date): number {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}

/** Beds taken per room by PENDING/CONFIRMED bookings overlapping [checkIn, checkOut). */
export async function bookedBedsByRoom(
  db: Prisma.TransactionClient,
  checkIn: Date,
  checkOut: Date,
  roomId?: string,
): Promise<Map<string, number>> {
  const rows = await db.booking.groupBy({
    by: ["roomId"],
    where: {
      roomId,
      status: { in: ["PENDING", "CONFIRMED"] },
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    },
    _sum: { guestsCount: true },
  });
  return new Map(rows.map((r) => [r.roomId, r._sum.guestsCount ?? 0]));
}

/** Dorms are sold per bed; a private room is taken entirely by any overlapping booking. */
export function freeBeds(room: Pick<Room, "category" | "totalBeds">, bookedBeds: number): number {
  if (room.category === "PRIVATE") return bookedBeds > 0 ? 0 : room.totalBeds;
  return Math.max(0, room.totalBeds - bookedBeds);
}
