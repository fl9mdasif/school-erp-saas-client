// Money is an integer number of poisha (1 BDT = 100 poisha) on the wire. The UI shows Taka.
// Business dates are "YYYY-MM-DD" strings in Asia/Dhaka. No client-side money math beyond display.

export type TFormatOptions = { lang?: "bn" | "en"; banglaDigits?: boolean };

const locale = ({ lang = "en", banglaDigits = false }: TFormatOptions) =>
  `${lang === "bn" ? "bn-BD" : "en-BD"}-u-nu-${banglaDigits ? "beng" : "latn"}`;

export const formatNumber = (n: number, opts: TFormatOptions = {}): string =>
  new Intl.NumberFormat(locale(opts)).format(n);

/** 125050 poisha becomes "৳ 1,250.50". Integer arithmetic only: no floating point artifacts. */
export const formatMoney = (poisha: number, opts: TFormatOptions = {}): string => {
  const negative = poisha < 0;
  const abs = Math.abs(Math.round(poisha));
  const taka = Math.floor(abs / 100);
  const paisa = abs % 100;
  const nf = new Intl.NumberFormat(locale(opts));
  const paisaText = nf.format(paisa).padStart(paisa < 10 ? nf.format(0).length + nf.format(paisa).length : 0, nf.format(0));
  return `${negative ? "-" : ""}৳ ${nf.format(taka)}.${paisaText}`;
};

/** Text typed in a money field ("1,250.5", "1250") to integer poisha. Returns null if it is not a valid amount. */
export const takaToPoisha = (input: string): number | null => {
  const clean = input.replace(/[,\s৳]/g, "").trim();
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null;
  const [whole, fraction = ""] = clean.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
};

/** Integer poisha to the text a money field shows when editing, with no grouping: 125000 becomes "1250". */
export const poishaToTakaInput = (poisha: number): string => {
  const whole = Math.floor(poisha / 100);
  const frac = poisha % 100;
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
};

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-09" to "09 Mar 2026". The string is never turned into a local Date, so timezone cannot shift it. */
export const formatLocalDate = (date: string, opts: TFormatOptions = {}): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  const [, y, mo, d] = m;
  if (opts.lang === "bn") {
    const d0 = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
    return new Intl.DateTimeFormat(locale(opts), {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d0);
  }
  const text = `${d} ${MONTHS_EN[Number(mo) - 1]} ${y}`;
  return opts.banglaDigits ? text.replace(/\d/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]) : text;
};

/** Today's business date in Asia/Dhaka, as YYYY-MM-DD. */
export const todayLocal = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

/** 0 = Sunday ... 5 = Friday, 6 = Saturday. */
export const dayOfWeek = (date: string): number =>
  new Date(`${date}T00:00:00.000Z`).getUTCDay();

export const addDays = (date: string, days: number): string => {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Bangladesh mobile number to 01XXXXXXXXX, or null if invalid. */
export const normalizeBdPhone = (input: string): string | null => {
  const digits = input.replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+?88)?(01[3-9]\d{8})$/);
  return m ? m[1] : null;
};
