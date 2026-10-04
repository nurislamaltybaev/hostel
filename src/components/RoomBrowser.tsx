"use client";

import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { nextDay, todayLocal } from "@/lib/dates";
import { BookingModal, inputClass, type StaySelection } from "./BookingModal";
import { RoomCard, type RoomDto } from "./RoomCard";

type Result = { key: string; rooms?: RoomDto[]; error?: boolean };

/** Hero with the quick search form plus the room list it drives. */
export function RoomBrowser() {
  const [form, setForm] = useState<StaySelection>({ checkIn: "", checkOut: "", guests: 1 });
  const [search, setSearch] = useState(form);
  const [formError, setFormError] = useState<string>();
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<Result>();
  const [selected, setSelected] = useState<RoomDto>();

  const hasDates = Boolean(search.checkIn && search.checkOut);
  const query = hasDates ? `?checkIn=${search.checkIn}&checkOut=${search.checkOut}` : "";
  const key = `${query}#${refresh}`;

  useEffect(() => {
    let stale = false;
    fetch(`/api/rooms${query}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((rooms: RoomDto[]) => !stale && setResult({ key, rooms }))
      .catch(() => !stale && setResult({ key, error: true }));
    return () => {
      stale = true;
    };
  }, [query, key]);

  const loading = result?.key !== key;
  const rooms = result?.rooms?.filter((r) => (r.availableBeds ?? r.totalBeds) >= search.guests);
  // Server and client may be on different calendar days around midnight, hence suppressHydrationWarning below.
  const today = todayLocal();

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (Boolean(form.checkIn) !== Boolean(form.checkOut)) {
      return setFormError("Укажите обе даты: заезд и выезд");
    }
    if (form.checkIn && form.checkOut <= form.checkIn) {
      return setFormError("Дата выезда должна быть позже даты заезда");
    }
    setFormError(undefined);
    setSearch(form);
    document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-amber-50 via-orange-50 to-rose-100">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-amber-200/50 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-rose-200/50 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-amber-700 shadow-sm">
            <MapPin className="size-4" aria-hidden />
            Астана, ул. Желтоксан, 22/3
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-6xl">
            Твой уютный дом в Астане
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-600">
            Новый хостел со свежим ремонтом: душ и туалет прямо в номере, большая кухня, тренажёрный
            зал и бесплатная парковка. Оценка гостей на Booking.com — 9,4.
          </p>

          <form
            onSubmit={onSearch}
            noValidate
            className="mt-8 grid grid-cols-1 gap-3 rounded-3xl bg-white p-4 shadow-xl shadow-amber-900/5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end"
          >
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <CalendarDays className="size-4 text-amber-600" aria-hidden />
                Заезд
              </span>
              <input
                type="date"
                className={inputClass}
                min={today}
                suppressHydrationWarning
                value={form.checkIn}
                onChange={(e) => {
                  const checkIn = e.target.value;
                  setForm((f) => ({
                    ...f,
                    checkIn,
                    checkOut: checkIn && f.checkOut <= checkIn ? nextDay(checkIn) : f.checkOut,
                  }));
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <CalendarDays className="size-4 text-amber-600" aria-hidden />
                Выезд
              </span>
              <input
                type="date"
                className={inputClass}
                min={form.checkIn ? nextDay(form.checkIn) : today}
                suppressHydrationWarning
                value={form.checkOut}
                onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                <Users className="size-4 text-amber-600" aria-hidden />
                Гостей
              </span>
              <select
                className={inputClass}
                value={form.guests}
                onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <Search className="size-5" aria-hidden />
              Найти номер
            </button>
            {formError && (
              <p role="alert" className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">
                {formError}
              </p>
            )}
          </form>
        </div>
      </section>

      <section id="rooms" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">Наши номера</h2>
        <p className="mt-2 text-stone-600" aria-live="polite">
          {hasDates
            ? `Свободно на ${search.checkIn} → ${search.checkOut}, гостей: ${search.guests}`
            : "Выберите даты в форме выше, чтобы увидеть свободные места"}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-stone-200/70" />
            ))
          ) : result?.error ? (
            <div className="col-span-full rounded-3xl bg-white p-8 text-center ring-1 ring-stone-200">
              <p className="text-stone-700">Не удалось загрузить номера.</p>
              <button
                type="button"
                onClick={() => setRefresh((n) => n + 1)}
                className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Попробовать снова
              </button>
            </div>
          ) : rooms?.length ? (
            rooms.map((room) => <RoomCard key={room.id} room={room} onBook={setSelected} />)
          ) : (
            <p className="col-span-full rounded-3xl bg-white p-8 text-center text-stone-700 ring-1 ring-stone-200">
              На выбранные даты нет номеров с нужным количеством свободных мест. Попробуйте другие
              даты или меньше гостей.
            </p>
          )}
        </div>
      </section>

      {selected && (
        <BookingModal
          room={selected}
          initial={form}
          onClose={() => setSelected(undefined)}
          onBooked={() => setRefresh((n) => n + 1)}
        />
      )}
    </>
  );
}
