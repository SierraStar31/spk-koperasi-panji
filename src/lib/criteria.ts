export interface Criterion {
  code: string;
  name: string;
  type: "benefit" | "cost";
  priority: number;
}

export const criteria: Criterion[] = [
  { code: "C1", name: "Jumlah Simpanan", type: "benefit", priority: 1 },
  { code: "C2", name: "Pinjaman yang Diajukan", type: "cost", priority: 2 },
  { code: "C3", name: "Tingkat Urgensi", type: "benefit", priority: 3 },
  { code: "C4", name: "Jumlah Anggota Keluarga yang Ditanggung", type: "cost", priority: 4 },
  { code: "C5", name: "Umur", type: "cost", priority: 5 },
];

export const urgencyOptions = [
  { value: 1, description: "Tidak Mendesak (kebutuhan konsumtif/bisa ditunda)" },
  { value: 2, description: "Mendesak (kebutuhan usaha/keluarga)" },
  { value: 3, description: "Sangat Mendesak (biaya medis/darurat)" },
];

export function calculateRocWeights(m: number): number[] {
  const weights: number[] = [];
  for (let j = 1; j <= m; j++) {
    let sum = 0;
    for (let i = j; i <= m; i++) {
      sum += 1 / i;
    }
    weights.push((1 / m) * sum);
  }

  const total = weights.reduce((acc, w) => acc + w, 0);
  if (Math.abs(total - 1) > 0.0001) {
    throw new Error(`Total ROC weight must equal 1, got ${total}`);
  }

  return weights;
}

export function convertToScore(code: string, value: number): number {
  switch (code) {
    case "C1": // Jumlah Simpanan (benefit)
      if (value <= 2500000) return 1;
      if (value <= 3000000) return 2;
      if (value <= 3500000) return 3;
      if (value <= 4000000) return 4;
      return 5;

    case "C2": // Pinjaman yang Diajukan (cost)
      if (value <= 600000) return 1;
      if (value <= 1200000) return 2;
      if (value <= 1800000) return 3;
      if (value <= 2400000) return 4;
      return 5;

    case "C3": // Tingkat Urgensi (benefit)
      if (value <= 1) return 1;
      if (value === 2) return 2;
      return 3;

    case "C4": // Jumlah Anggota Keluarga yang Ditanggung (cost)
      if (value === 0) return 1;
      if (value === 1) return 2;
      if (value === 2) return 3;
      if (value === 3) return 4;
      return 5;

    case "C5": // Umur (cost)
      if (value <= 30) return 1;
      if (value <= 40) return 2;
      if (value <= 50) return 3;
      if (value <= 60) return 4;
      return 5;

    default:
      throw new Error(`Unknown criterion code: ${code}`);
  }
}
