// Helpers for "YYYY-MM-DD" strings as used by <input type="date">.

/** Today in the user's local timezone. */
export const todayLocal = () => new Date().toLocaleDateString("sv-SE");

export function nextDay(date: string): string {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
