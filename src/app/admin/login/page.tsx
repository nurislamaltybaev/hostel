"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Не удалось войти");
    } catch {
      setError("Нет связи с сервером");
    }
    setPending(false);
  }

  return (
    <main className="grid flex-1 place-items-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <span className="grid size-11 place-items-center rounded-lg bg-slate-900 text-white">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Вход для персонала</h1>
        <p className="mt-1 text-sm text-slate-500">Панель администратора хостела</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Логин
          <input name="username" autoComplete="username" required autoFocus className={inputClass} />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Пароль
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Войти
        </button>
      </form>
    </main>
  );
}
