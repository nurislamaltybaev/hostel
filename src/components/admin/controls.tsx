"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { BookingStatus } from "@/generated/prisma/client";

/** PATCHes JSON to an admin endpoint, then re-renders the server-fetched page data. */
function usePatch(url: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function patch(body: unknown) {
    setPending(true);
    setError(undefined);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return setError(typeof data?.error === "string" ? data.error : "Не удалось сохранить");
      }
      router.refresh();
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setPending(false);
    }
  }

  return { patch, pending, error };
}

const ErrorText = ({ children }: { children?: string }) =>
  children ? (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {children}
    </p>
  ) : null;

const smallButton =
  "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function NavLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Бронирования" },
    { href: "/admin/rooms", label: "Комнаты" },
  ];
  return (
    <nav className="flex gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 aria-[current=page]:bg-slate-900 aria-[current=page]:text-white"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function BookingActions({ id, status }: { id: string; status: BookingStatus }) {
  const { patch, pending, error } = usePatch(`/api/admin/bookings/${id}`);
  if (status === "CANCELLED") return <span className="text-xs text-slate-400">—</span>;
  return (
    <div>
      <div className="flex gap-1.5">
        {status === "PENDING" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => patch({ status: "CONFIRMED" })}
            className={`${smallButton} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            Подтвердить
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => patch({ status: "CANCELLED" })}
          className={`${smallButton} border border-slate-300 text-slate-700 hover:bg-slate-100`}
        >
          Отменить
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function RoomPriceForm({ id, price }: { id: string; price: number }) {
  const { patch, pending, error } = usePatch(`/api/admin/rooms/${id}`);
  const [value, setValue] = useState(String(price));
  const parsed = Number(value);
  const canSave = value.trim() !== "" && parsed > 0 && parsed !== price;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (canSave) patch({ pricePerNight: parsed });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          aria-label="Цена за ночь, ₸"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-900"
        />
        <span className="text-sm text-slate-500">₸</span>
        <button
          type="submit"
          disabled={!canSave || pending}
          className={`${smallButton} bg-slate-900 text-white hover:bg-slate-700`}
        >
          Сохранить
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </form>
  );
}

export function RoomAvailabilityToggle({ id, isAvailable }: { id: string; isAvailable: boolean }) {
  const { patch, pending, error } = usePatch(`/api/admin/rooms/${id}`);
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={isAvailable}
        disabled={pending}
        onClick={() => patch({ isAvailable: !isAvailable })}
        className="group flex items-center gap-2 text-sm text-slate-700 disabled:opacity-50"
      >
        <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors group-aria-checked:bg-emerald-600">
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform group-aria-checked:translate-x-5" />
        </span>
        {isAvailable ? "Доступна" : "Скрыта"}
      </button>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
