import { redirect } from "next/navigation";
import { RoomAvailabilityToggle, RoomPriceForm } from "@/components/admin/controls";
import { CATEGORY_LABELS } from "@/components/RoomCard";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/session";

export default async function AdminRoomsPage() {
  if (!(await getAdmin())) redirect("/admin/login");

  const rooms = await prisma.room.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <h1 className="text-2xl font-bold">Комнаты</h1>
      <p className="mt-1 text-sm text-slate-500">
        Новая цена действует только для новых бронирований. Скрытая комната не показывается гостям
        на сайте.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["Комната", "Тип", "Мест", "Цена за ночь", "Доступность"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.id} className="align-top">
                <td className="px-4 py-3 font-medium">{room.title}</td>
                <td className="whitespace-nowrap px-4 py-3">{CATEGORY_LABELS[room.category]}</td>
                <td className="px-4 py-3">{room.totalBeds}</td>
                <td className="px-4 py-3">
                  <RoomPriceForm key={room.pricePerNight} id={room.id} price={room.pricePerNight} />
                </td>
                <td className="px-4 py-3">
                  <RoomAvailabilityToggle id={room.id} isAvailable={room.isAvailable} />
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Комнат пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
