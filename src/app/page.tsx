import {
  AirVent,
  Baby,
  BedDouble,
  CigaretteOff,
  Clock,
  Coffee,
  CookingPot,
  CreditCard,
  Dumbbell,
  Languages,
  Laptop,
  type LucideIcon,
  MapPin,
  MessageCircle,
  PartyPopper,
  PawPrint,
  Phone,
  Send,
  ShowerHead,
  Sofa,
  SquareParking,
  Star,
  WashingMachine,
  Wifi,
} from "lucide-react";
import { RoomBrowser } from "@/components/RoomBrowser";

// Hostel facts below are synced from the property's Booking.com profile.
const HOSTEL = {
  name: "Kazakhstan Hostel",
  city: "г. Астана",
  address: "ул. Желтоксан, 22/3",
  phone: "+7 (708) 010 19 76",
  whatsapp: "https://wa.me/77080101976",
  telegram: "https://t.me/kazakhstan_hostel",
  checkIn: "с 14:00 до 00:00",
  checkOut: "до 12:00",
  rating: "9,4",
  reviews: 38,
};
const FULL_ADDRESS = `${HOSTEL.city}, ${HOSTEL.address}`;
// Google geocodes the street address itself, so the pin follows the address above.
const MAP_URL = `https://www.google.com/maps?q=${encodeURIComponent("Астана, улица Желтоксан 22/3")}&z=16&output=embed`;

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wifi, title: "Бесплатный Wi-Fi", text: "На всей территории — гости оценивают на 10 из 10" },
  { icon: SquareParking, title: "Бесплатная парковка", text: "Частная, на территории, бронировать не нужно" },
  { icon: ShowerHead, title: "Душ и туалет в номере", text: "Свой санузел, тапочки и постельное бельё" },
  { icon: CookingPot, title: "Общая кухня и столовая", text: "Духовка, микроволновка, холодильник, посуда" },
  { icon: Coffee, title: "Чай и кофе", text: "Кофемашина, чайник и всё необходимое" },
  { icon: WashingMachine, title: "Стирка и глажка", text: "Стиральная машина, сушилка для одежды, утюг" },
  { icon: AirVent, title: "Кондиционер и отопление", text: "Комфортно в любой сезон, звукоизоляция" },
  { icon: Sofa, title: "Лаундж и бар", text: "Общая гостиная с телевизором и настольными играми" },
  { icon: Dumbbell, title: "Тренажёрный зал", text: "Поддерживайте форму, не выходя из хостела" },
  { icon: Laptop, title: "Коворкинг", text: "Рабочая зона и письменные столы" },
];

const RULES: { icon: LucideIcon; text: string }[] = [
  { icon: Clock, text: `Заезд ${HOSTEL.checkIn}, выезд ${HOSTEL.checkOut}` },
  { icon: CreditCard, text: "Оплата картой — наличные не принимаются" },
  { icon: Baby, text: "Размещение детей невозможно, дополнительные кровати не предоставляются" },
  { icon: PawPrint, text: "Размещение с домашними животными не допускается" },
  { icon: PartyPopper, text: "Вечеринки и мероприятия проводить нельзя" },
  { icon: CigaretteOff, text: "Курение на всей территории запрещено" },
  { icon: Languages, text: "Персонал говорит на русском и английском" },
];

const NEARBY = [
  ["Музей первого президента РК", "1 км"],
  ["Памятник хану Кенесары", "1,7 км"],
  ["Железнодорожный вокзал Астана", "3,1 км"],
  ["Этно-мемориальный комплекс «Атамекен»", "3,2 км"],
  ["Монумент «Байтерек»", "6 км"],
  ["Аэропорт Нурсултан Назарбаев", "20 км"],
];

const NAV = [
  { href: "#rooms", label: "Номера" },
  { href: "#features", label: "О хостеле" },
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
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">О хостеле</h2>
            <p className="mt-3 max-w-3xl text-stone-600">
              {HOSTEL.name} — новый хостел в Астане со свежим ремонтом. В номерах есть собственный
              душ и туалет, холодильник и кондиционер, а в общем пользовании — большая кухня со
              столовой, лаундж, бар, тренажёрный зал и коворкинг. Wi-Fi и парковка бесплатные.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-stone-700">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              {HOSTEL.rating} из 10 на Booking.com · {HOSTEL.reviews} отзывов
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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

        <section id="rules" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">Условия проживания</h2>
              <ul className="mt-6 space-y-3">
                {RULES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-stone-700">
                    <Icon className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">Что рядом</h2>
              <ul className="mt-6 divide-y divide-stone-200">
                {NEARBY.map(([place, distance]) => (
                  <li key={place} className="flex justify-between gap-4 py-2.5 text-stone-700">
                    <span>{place}</span>
                    <span className="shrink-0 font-medium text-stone-900">{distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="contacts" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900">Контакты</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200/70">
              <p className="flex items-start gap-3 text-stone-700">
                <MapPin className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                {FULL_ADDRESS}
              </p>
              <a
                href={`tel:${HOSTEL.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 text-stone-700 hover:text-amber-600"
              >
                <Phone className="size-5 shrink-0 text-amber-600" aria-hidden />
                {HOSTEL.phone}
              </a>
              <p className="flex items-start gap-3 text-stone-700">
                <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                Заезд {HOSTEL.checkIn}, выезд {HOSTEL.checkOut}
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
              src={MAP_URL}
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
          <p>
            {FULL_ADDRESS} · {HOSTEL.phone}
          </p>
          <p>
            Заезд {HOSTEL.checkIn}, выезд {HOSTEL.checkOut}
          </p>
        </div>
      </footer>
    </>
  );
}
