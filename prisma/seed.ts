import assert from "node:assert";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

const rooms = [
  {
    title: "6-местный мужской номер",
    description:
      "Просторный общий номер для мужчин с двухъярусными кроватями, индивидуальными шторками, розетками и лампами у каждого места. Общая ванная на этаже.",
    category: "DORM_MALE",
    totalBeds: 6,
    pricePerNight: 6000,
    images: ["/images/rooms/dorm-male-6-1.jpg", "/images/rooms/dorm-male-6-2.jpg"],
    amenities: ["Wi-Fi", "Кондиционер", "Индивидуальный шкафчик", "Розетка у кровати", "Постельное бельё"],
  },
  {
    title: "4-местный женский номер",
    description:
      "Уютный номер только для девушек: четыре спальных места, собственная ванная комната с феном и большое зеркало.",
    category: "DORM_FEMALE",
    totalBeds: 4,
    pricePerNight: 7500,
    images: ["/images/rooms/dorm-female-4-1.jpg", "/images/rooms/dorm-female-4-2.jpg"],
    amenities: ["Wi-Fi", "Кондиционер", "Собственная ванная", "Фен", "Индивидуальный шкафчик", "Постельное бельё"],
  },
  {
    title: "8-местный общий номер",
    description:
      "Самый бюджетный вариант для компаний и путешественников-одиночек. Смешанный номер с двухъярусными кроватями и общей зоной отдыха рядом.",
    category: "DORM_MIXED",
    totalBeds: 8,
    pricePerNight: 5000,
    images: ["/images/rooms/dorm-mixed-8-1.jpg"],
    amenities: ["Wi-Fi", "Индивидуальный шкафчик", "Розетка у кровати", "Постельное бельё"],
  },
  {
    title: "Отдельный Double Люкс",
    description:
      "Приватный номер с двуспальной кроватью, собственной ванной, рабочим столом и видом на город. Подходит для пар.",
    category: "PRIVATE",
    totalBeds: 2,
    pricePerNight: 22000,
    images: ["/images/rooms/private-double-1.jpg", "/images/rooms/private-double-2.jpg"],
    amenities: ["Wi-Fi", "Кондиционер", "Собственная ванная", "Телевизор", "Чайник", "Полотенца", "Рабочий стол"],
  },
] as const;

async function main() {
  // Rooms have no natural unique key, so seed them only into an empty table.
  if ((await prisma.room.count()) === 0) {
    for (const room of rooms) {
      await prisma.room.create({
        data: { ...room, images: [...room.images], amenities: [...room.amenities] },
      });
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
