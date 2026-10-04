import { CalendarCheck, CircleCheck, Clock, type LucideIcon, Search, Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingActions } from "@/components/admin/controls";
import type { BookingStatus, Prisma } from "@/generated/prisma/client";
import { bookingNumber, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/session";

const PAGE_SIZE = 20;

const STATUS: Record<BookingStatus, { label: string; badge: string }> = {
  PENDING: { label: "Ожидает", badge: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Подтверждена", badge: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Отменена", badge: "bg-slate-200 text-slate-600" },
};
const isStatus = (value: unknown): value is BookingStatus =>
  typeof value === "string" && value in STATUS;

const formatDate = (d: Date) => d.toLocaleDateString("ru-RU", { timeZone: "UTC" });

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await getAdmin())) redirect("/admin/login");

  const sp = await searchParams;
  const status = isStatus(sp.status) ? sp.status : undefined;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);

  // ponytail: SQLite LIKE ignores case only for ASCII, so common casings are tried for Cyrillic
  // names. Add a normalized lowercase column if staff need fully case-insensitive search.
  const nameVariants = [
    ...new Set([
      q,
      q.toLowerCase(),
      q.toUpperCase(),
      q.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
    ]),
  ];
  const where: Prisma.BookingWhereInput = {
    status,
    ...(q && {
      OR: [
        ...nameVariants.map((v) => ({ guestName: { contains: v } })),
        { id: { startsWith: q.replace(/^#/, "").toLowerCase() } },
      ],
    }),
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [bookings, total, monthCount, pendingCount, confirmed] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { room: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _count: true,
      _sum: { totalPrice: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: { status?: string; page?: number }) => {
    const params = new URLSearchParams();
    const next = { status, page: 1, ...patch };
    if (next.status) params.set("status", next.status);
    if (q) params.set("q", q);
    if (next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const tabs: { label: string; value?: BookingStatus }[] = [
    { label: "Все" },
    ...(Object.keys(STATUS) as BookingStatus[]).map((value) => ({ label: STATUS[value].label, value })),
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">Бронирования</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Бронирований за месяц" value={String(monthCount)} />
        <Stat icon={Clock} label="Ожидают подтверждения" value={String(pendingCount)} />
        <Stat icon={CircleCheck} label="Подтверждённые" value={String(confirmed._count)} />
        <Stat icon={Wallet} label="Выручка (подтверждённые)" value={formatPrice(confirmed._sum.totalPrice ?? 0)} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Фильтр по статусу" className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={href({ status: tab.value })}
              aria-current={status === tab.value ? "page" : undefined}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 aria-[current=page]:border-slate-900 aria-[current=page]:bg-slate-900 aria-[current=page]:text-white"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form action="/admin" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Имя гостя или № брони"
            aria-label="Поиск по имени гостя или номеру брони"
            className="w-56 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            aria-label="Найти"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
          >
            <Search className="size-4" aria-hidden />
          </button>
        </form>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[60rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["№ брони", "Гость", "Телефон", "Комната", "Даты", "Сумма", "Статус", "Действия"].map(
                (h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <tr key={b.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs">{bookingNumber(b.id)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{b.guestName}</p>
                  <p className="text-xs text-slate-500">
                    {b.guestEmail} · гостей: {b.guestsCount}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a href={`tel:${b.guestPhone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                    {b.guestPhone}
                  </a>
                </td>
                <td className="px-4 py-3">{b.room.title}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(b.checkInDate)} — {formatDate(b.checkOutDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(b.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[b.status].badge}`}
                  >
                    {STATUS[b.status].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <BookingActions id={b.id} status={b.status} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  {q || status ? "По заданным условиям ничего не найдено" : "Бронирований пока нет"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <p>
          Найдено: {total} · страница {Math.min(page, pageCount)} из {pageCount}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={href({ page: page - 1 })} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">
              ← Назад
            </Link>
          )}
          {page < pageCount && (
            <Link href={href({ page: page + 1 })} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">
              Вперёд →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
