export const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₸`;

/** Short human-facing booking number shown to guests and staff. */
export const bookingNumber = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;
