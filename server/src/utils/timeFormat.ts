function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toHms(hours: number, minutes: number, seconds: number): string {
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function isValidTime(hours: number, minutes: number, seconds: number): boolean {
  return (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    Number.isInteger(seconds) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59 &&
    seconds >= 0 &&
    seconds <= 59
  );
}

function fromDayFraction(raw: number): string | null {
  if (!Number.isFinite(raw) || raw < 0) {
    return null;
  }

  const fractional = raw % 1;

  if (fractional === 0 && raw >= 1) {
    return null;
  }

  const totalSeconds = Math.round((fractional || raw) * 24 * 60 * 60) % (24 * 60 * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return toHms(hours, minutes, seconds);
}

function fromDigitOnly(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.length === 3 || digits.length === 4) {
    const hours = Number(digits.slice(0, digits.length - 2));
    const minutes = Number(digits.slice(-2));

    if (isValidTime(hours, minutes, 0)) {
      return toHms(hours, minutes, 0);
    }

    return null;
  }

  if (digits.length === 5 || digits.length === 6) {
    const normalized = digits.length === 5 ? `0${digits}` : digits;
    const hours = Number(normalized.slice(0, 2));
    const minutes = Number(normalized.slice(2, 4));
    const seconds = Number(normalized.slice(4, 6));

    if (isValidTime(hours, minutes, seconds)) {
      return toHms(hours, minutes, seconds);
    }
  }

  return null;
}

function parseWithSeparators(input: string): string | null {
  const matched = input.match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/);

  if (!matched) {
    return null;
  }

  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  const seconds = matched[3] ? Number(matched[3]) : 0;

  if (!isValidTime(hours, minutes, seconds)) {
    return null;
  }

  return toHms(hours, minutes, seconds);
}

function parseAmPm(input: string): string | null {
  const matched = input.match(/^(\d{1,2})(?:[:.](\d{1,2}))?(?:[:.](\d{1,2}))?\s*([AP]M)$/i);

  if (!matched) {
    return null;
  }

  let hours = Number(matched[1]);
  const minutes = matched[2] ? Number(matched[2]) : 0;
  const seconds = matched[3] ? Number(matched[3]) : 0;
  const suffix = matched[4]?.toUpperCase();

  if (!Number.isInteger(hours) || hours < 1 || hours > 12 || minutes > 59 || seconds > 59) {
    return null;
  }

  if (suffix === "AM") {
    hours = hours % 12;
  } else {
    hours = hours % 12 + 12;
  }

  return toHms(hours, minutes, seconds);
}

function parseDateTime(input: string): string | null {
  if (!/[T\s]/.test(input) || !/\d{1,2}:\d{1,2}/.test(input)) {
    return null;
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toHms(parsed.getHours(), parsed.getMinutes(), parsed.getSeconds());
}

export function normalizeTimeToHms(value: unknown): string | null {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const upper = raw.toUpperCase();

  const amPm = parseAmPm(upper);
  if (amPm) return amPm;

  const separatorValue = parseWithSeparators(upper);
  if (separatorValue) return separatorValue;

  const numeric = Number(upper);

  if (Number.isFinite(numeric)) {
    const fractionValue = fromDayFraction(numeric);
    if (fractionValue) return fractionValue;

    const digitValue = fromDigitOnly(upper);
    if (digitValue) return digitValue;
  }

  const datetimeValue = parseDateTime(raw);
  if (datetimeValue) return datetimeValue;

  return null;
}

export function normalizeTimeToHmsOrThrow(value: unknown, field: string, rowNumber?: number): string {
  const normalized = normalizeTimeToHms(value);

  if (normalized) {
    return normalized;
  }

  const rowText = rowNumber ? `Row ${rowNumber}: ` : "";
  throw new Error(
    `${rowText}Invalid ${field} '${String(value ?? "").trim()}'. Use a valid time and it will be stored as hh:mm:ss.`,
  );
}
