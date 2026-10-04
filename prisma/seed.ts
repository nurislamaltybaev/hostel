import assert from "node:assert";
import type { Prisma } from "../src/generated/prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

const dormAmenities = ["Wi-Fi", "Собственный душ", "Собственный туалет", "Кондиционер", "Холодильник"];

const rooms: Prisma.RoomCreateInput[] = [
  {
    title: "4-местный мужской номер",
    description:
      "Общий номер для мужчин на четыре спальных места. В номере собственный душ и туалет, кондиционер и холодильник.",
    category: "DORM_MALE",
    totalBeds: 4,
    pricePerNight: 7500,
    images: ["/images/rooms/dorm-male-4-1.jpg", "/images/rooms/dorm-male-4-2.jpg"],
    amenities: dormAmenities,
  },
  {
    title: "4-местный женский номер",
    description:
      "Общий номер только для девушек на четыре спальных места. В номере собственный душ и туалет, кондиционер и холодильник.",
    category: "DORM_FEMALE",
    totalBeds: 4,
    pricePerNight: 7500,
    images: ["/images/rooms/dorm-female-4-1.jpg", "/images/rooms/dorm-female-4-2.jpg"],
    amenities: dormAmenities,
  },
  {
    title: "Двухместный номер Double",
    description: "Отдельный номер на двоих с одной двуспальной кроватью. Подходит для пар.",
    category: "PRIVATE",
    totalBeds: 2,
    pricePerNight: 22000,
    images: ["/images/rooms/private-double-1.jpg", "/images/rooms/private-double-2.jpg"],
    amenities: ["Wi-Fi", "1 двуспальная кровать"],
  },
  {
    title: "Двухместный номер Twin",
    description: "Отдельный номер на двоих с двумя раздельными кроватями. Подходит для друзей и коллег.",
    category: "PRIVATE",
    totalBeds: 2,
    pricePerNight: 22000,
    images: ["/images/rooms/private-twin-1.jpg", "/images/rooms/private-twin-2.jpg"],
    amenities: ["Wi-Fi", "2 отдельные кровати"],
  },
];

async function main() {
  // Rooms are matched by title, so re-running the seed updates them in place.
  for (const room of rooms) {
    const existing = await prisma.room.findFirst({ where: { title: room.title } });
    if (existing) {
      // Price and availability are managed in the admin panel — don't overwrite them.
      await prisma.room.update({
        where: { id: existing.id },
        data: { ...room, pricePerNight: undefined },
      });
    } else {
      await prisma.room.create({ data: room });
    }
  }

  // Rooms removed from the list: delete if never booked, otherwise only hide (bookings reference them).
  const stale = await prisma.room.findMany({
    where: { title: { notIn: rooms.map((r) => r.title) } },
    include: { _count: { select: { bookings: true } } },
  });
  for (const room of stale) {
    if (room._count.bookings > 0) {
      await prisma.room.update({ where: { id: room.id }, data: { isAvailable: false } });
      console.log(`Hidden (has bookings): ${room.title}`);
    } else {
      await prisma.room.delete({ where: { id: room.id } });
      console.log(`Deleted: ${room.title}`);
    }
  }

  const passwordHash = hashPassword("admin123");
  assert(verifyPassword("admin123", passwordHash) && !verifyPassword("wrong", passwordHash));
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash },
  });

  console.log(`Seeded: ${await prisma.room.count()} rooms, ${await prisma.adminUser.count()} admin(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
