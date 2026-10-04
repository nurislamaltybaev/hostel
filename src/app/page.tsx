import {
  BedDouble,
  Clock,
  Coffee,
  CookingPot,
  Lock,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  WashingMachine,
  Wifi,
} from "lucide-react";
import { RoomBrowser } from "@/components/RoomBrowser";

// TODO: placeholder contact details — replace with the real hostel data.
const HOSTEL = {
  name: "Уют Хостел",
  address: "г. Алматы, пр. Абая, 1",
  phone: "+7 700 000 00 00",
  whatsapp: "https://wa.me/77000000000",
  telegram: "https://t.me/your_hostel",
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wifi, title: "Бесплатный Wi-Fi", text: "Быстрый интернет во всех номерах и зонах отдыха" },
  { icon: CookingPot, title: "Общая кухня", text: "Плита, холодильник, посуда — готовьте как дома" },
  { icon: Clock, title: "Ресепшн 24/7", text: "Заселим в любое время дня и ночи" },
  { icon: Coffee, title: "Бесплатный кофе и чай", text: "Весь день в общей зоне" },
  { icon: Lock, title: "Шкафчики с замками", text: "Личный шкафчик для каждого гостя" },
  { icon: WashingMachine, title: "Прачечная", text: "Стиральная и сушильная машины" },
];

const NAV = [
  { href: "#rooms", label: "Номера" },
  { href: "#features", label: "Удобства" },
  { href: "#contacts", label: "Контакты" },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2 whitespace-nowrap text-base font-bold text-stone-900 sm:text-lg">
            <BedDouble className="size-6 text-amber-500" aria-hidden />
            {HOSTEL.name}
          </a>
          <nav className="flex gap-3 text-sm font-medium text-stone-600 sm:gap-6">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-amber-600">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <RoomBrowser />

        <section id="features" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">Всё для комфорта</h2>
            <p className="mt-2 text-stone-600">Включено в стоимость проживания</p>
            <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-3xl bg-stone-50 p-5 ring-1 ring-stone-200/70">
                  <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contacts" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900">Контакты</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200/70">
              <p className="flex items-start gap-3 text-stone-700">
                <MapPin className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                {HOSTEL.address}
              </p>
              <a
                href={`tel:${HOSTEL.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-stone-700 hover:text-amber-600"
              >
                <Phone className="size-5 shrink-0 text-amber-600" aria-hidden />
                {HOSTEL.phone}
              </a>
              <p className="flex items-center gap-3 text-stone-700">
                <Clock className="size-5 shrink-0 text-amber-600" aria-hidden />
                Круглосуточно, без выходных
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a
                  href={HOSTEL.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  <MessageCircle className="size-5" aria-hidden />
                  WhatsApp
                </a>
                <a
                  href={HOSTEL.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  <Send className="size-5" aria-hidden />
                  Telegram
                </a>
              </div>
            </div>
            <iframe
              title="Хостел на карте"
              src={`https://www.google.com/maps?q=${encodeURIComponent(HOSTEL.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full rounded-3xl border-0 shadow-sm ring-1 ring-stone-200/70 lg:h-full"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {HOSTEL.name}
          </p>
          <p>{HOSTEL.address}</p>
        </div>
      </footer>
    </>
  );
}
