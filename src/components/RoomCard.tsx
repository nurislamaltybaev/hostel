import {
  AirVent,
  Bath,
  BedDouble,
  Check,
  Lock,
  type LucideIcon,
  Plug,
  Tv,
  Users,
  Wifi,
} from "lucide-react";
import type { Room } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format";

/** Room as returned by /api/rooms; `availableBeds` is present only when dates were passed. */
export type RoomDto = Pick<
  Room,
  "id" | "title" | "description" | "category" | "totalBeds" | "pricePerNight"
> & { images: string[]; amenities: string[]; availableBeds?: number };

export const CATEGORY_LABELS: Record<Room["category"], string> = {
  DORM_MALE: "Мужской дорм",
  DORM_FEMALE: "Женский дорм",
  DORM_MIXED: "Общий дорм",
  PRIVATE: "Приватная",
};

const AMENITY_ICONS: Record<string, LucideIcon> = {
  "Wi-Fi": Wifi,
  Кондиционер: AirVent,
  "Розетка у кровати": Plug,
  "Индивидуальный шкафчик": Lock,
  "Собственная ванная": Bath,
  Телевизор: Tv,
};

export function RoomCard({ room, onBook }: { room: RoomDto; onBook: (room: RoomDto) => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-shadow hover:shadow-lg">
      {/* Photo is layered over a gradient, so a missing image still looks intentional. */}
      <div className="relative grid h-48 place-items-center bg-linear-to-br from-amber-100 via-orange-100 to-rose-100">
        <BedDouble className="size-12 text-amber-600/40" aria-hidden />
        {room.images[0] && (
          <div
            role="img"
            aria-label={room.title}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${room.images[0]}")` }}
          />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur">
          {CATEGORY_LABELS[room.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{room.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{room.description}</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {room.amenities.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity] ?? Check;
            return (
              <li
                key={amenity}
                className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
              >
                <Icon className="size-3.5" aria-hidden />
                {amenity}
              </li>
            );
          })}
        </ul>

        <p className="flex items-center gap-1.5 text-sm text-stone-600">
          <Users className="size-4 text-amber-600" aria-hidden />
          {room.availableBeds === undefined
            ? `Мест в номере: ${room.totalBeds}`
            : `Свободно мест: ${room.availableBeds} из ${room.totalBeds}`}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <p className="text-stone-900">
            <span className="text-xl font-bold">{formatPrice(room.pricePerNight)}</span>
            <span className="text-sm text-stone-500"> / ночь</span>
          </p>
          <button
            type="button"
            onClick={() => onBook(room)}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Забронировать
          </button>
        </div>
      </div>
    </article>
  );
}
