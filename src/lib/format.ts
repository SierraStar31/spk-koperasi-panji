export function formatThousands(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseThousands(raw: string | undefined | null): string {
  return (raw ?? "").replace(/\D/g, "");
}
