"use client";

import { ArrowLeft, CircleCheck, LoaderCircle, X } from "lucide-react";
import { type ComponentProps, type FormEvent, useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { countNights } from "@/lib/availability";
import { bookingSchema } from "@/lib/booking-schema";
import { nextDay, todayLocal } from "@/lib/dates";
import { bookingNumber, formatPrice } from "@/lib/format";
import type { RoomDto } from "./RoomCard";

export type StaySelection = { checkIn: string; checkOut: string; guests: number };

type Props = {
  room: RoomDto;
  initial: StaySelection;
  onClose: () => void;
  /** Called after a booking is created so the room list can refresh availability. */
  onBooked: () => void;
};

export const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-base text-stone-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200 aria-invalid:border-red-400";

const primaryButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60";

function Field({ label, error, ...input }: { label: string; error?: string } & ComponentProps<"input">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingModal({ room, initial, onClose, onBooked }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const guestsId = useId();
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [stay, setStay] = useState(() => ({
    ...initial,
    guests: Math.min(initial.guests, room.totalBeds),
  }));
  const [guest, setGuest] = useState({ guestName: "", guestEmail: "", guestPhone: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const today = todayLocal();
  const stayError =
    !stay.checkIn || !stay.checkOut
      ? "Выберите даты заезда и выезда"
      : stay.checkIn < today
        ? "Дата заезда не может быть в прошлом"
        : stay.checkOut <= stay.checkIn
          ? "Дата выезда должна быть позже даты заезда"
          : undefined;
  const nights = stayError ? 0 : countNights(new Date(stay.checkIn), new Date(stay.checkOut));
  const total = nights * room.pricePerNight;

  function updateGuest(field: keyof typeof guest, value: string) {
    setGuest((g) => ({ ...g, [field]: value }));
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
  }

  function goToGuestStep(e: FormEvent) {
    e.preventDefault();
    setFormError(stayError);
    if (!stayError) setStep(2);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      roomId: room.id,
      ...guest,
      checkInDate: stay.checkIn,
      checkOutDate: stay.checkOut,
      guestsCount: stay.guests,
    };
    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors;
      setFieldErrors({
        guestName: errors.guestName?.[0],
        guestEmail: errors.guestEmail?.[0],
        guestPhone: errors.guestPhone?.[0],
      });
      setFormError(errors.checkInDate?.[0] ?? errors.checkOutDate?.[0]);
      return;
    }
    setFieldErrors({});
    setFormError(undefined);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(
          typeof body?.error === "string"
            ? body.error
            : "Не удалось создать бронирование. Проверьте данные и попробуйте ещё раз.",
        );
        return;
      }
      setBookingId(body.id);
      setStep("done");
      onBooked();
    } catch {
      setFormError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby={`${guestsId}-title`}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-stone-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {step !== "done" && (
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Шаг {step} из 2
              </p>
            )}
            <h2 id={`${guestsId}-title`} className="text-xl font-bold text-stone-900">
              {step === "done" ? "Заявка принята" : room.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={goToGuestStep} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Заезд"
                type="date"
                min={today}
                value={stay.checkIn}
                onChange={(e) => {
                  const checkIn = e.target.value;
                  setStay((s) => ({
                    ...s,
                    checkIn,
                    checkOut: checkIn && s.checkOut <= checkIn ? nextDay(checkIn) : s.checkOut,
                  }));
                }}
              />
              <Field
                label="Выезд"
                type="date"
                min={stay.checkIn ? nextDay(stay.checkIn) : today}
                value={stay.checkOut}
                onChange={(e) => setStay((s) => ({ ...s, checkOut: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor={guestsId} className="mb-1.5 block text-sm font-medium text-stone-700">
                Гостей
              </label>
              <select
                id={guestsId}
                className={inputClass}
                value={stay.guests}
                onChange={(e) => setStay((s) => ({ ...s, guests: Number(e.target.value) }))}
              >
                {Array.from({ length: room.totalBeds }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm text-stone-700" aria-live="polite">
              {nights > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>
                      {formatPrice(room.pricePerNight)} × {nights} ноч.
                    </span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-amber-200 pt-2 text-base font-bold text-stone-900">
                    <span>Итого</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </>
              ) : (
                "Выберите даты, чтобы увидеть стоимость"
              )}
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <button type="submit" className={primaryButtonClass}>
              Продолжить
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submit} noValidate className="space-y-4">
            <p className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-600">
              {stay.checkIn} → {stay.checkOut} · гостей: {stay.guests} ·{" "}
              <span className="font-semibold text-stone-900">{formatPrice(total)}</span>
            </p>
            <Field
              label="ФИО"
              autoComplete="name"
              placeholder="Иван Иванов"
              value={guest.guestName}
              error={fieldErrors.guestName}
              onChange={(e) => updateGuest("guestName", e.target.value)}
            />
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={guest.guestEmail}
              error={fieldErrors.guestEmail}
              onChange={(e) => updateGuest("guestEmail", e.target.value)}
            />
            <Field
              label="Телефон"
              type="tel"
              autoComplete="tel"
              placeholder="+7 700 000 00 00"
              value={guest.guestPhone}
              error={fieldErrors.guestPhone}
              onChange={(e) => updateGuest("guestPhone", e.target.value)}
            />

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormError(undefined);
                  setStep(1);
                }}
                disabled={submitting}
                aria-label="Назад"
                className="rounded-full border border-stone-200 p-3 text-stone-600 transition-colors hover:bg-stone-100"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
              <button type="submit" disabled={submitting} className={primaryButtonClass}>
                {submitting && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
                {submitting ? "Отправляем…" : "Забронировать"}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <CircleCheck className="mx-auto size-16 text-emerald-500" aria-hidden />
            <p className="text-stone-600">Номер вашей брони</p>
            <p className="break-all rounded-2xl bg-stone-100 px-4 py-3 font-mono text-lg font-bold text-stone-900">
              {bookingNumber(bookingId)}
            </p>
            <p className="text-stone-600">
              Мы свяжемся с вами в течение 15 минут для подтверждения.
            </p>
            <button type="button" onClick={close} className={primaryButtonClass}>
              Отлично
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
