function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getMinimumDueDateTime(now = new Date()): string {
  const minimum = new Date(now);
  minimum.setSeconds(0, 0);
  return formatLocalDateTime(minimum);
}

export function isValidDueDateTime(value: string, now = new Date()): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const date = new Date(value);
  if (
    !Number.isFinite(date.getTime()) ||
    formatLocalDateTime(date) !== value
  ) {
    return false;
  }

  return date.getTime() >= new Date(getMinimumDueDateTime(now)).getTime();
}
