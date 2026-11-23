export interface AlternativeInput {
  id: string;
  name: string;
  scores: Record<string, number>; // e.g. { C1: 4, C2: 5, ... }
}

export interface WasparResultItem {
  id: string;
  name: string;
  wsm: number;
  wpm: number;
  qi: number;
  rank: number;
}

export interface WaspasOutput {
  criteria: { code: string; type: "benefit" | "cost"; weight: number }[];
  decisionMatrix: { id: string; name: string; values: Record<string, number> }[];
  normalizedMatrix: { id: string; name: string; values: Record<string, number> }[];
  results: WasparResultItem[];
}

export function calculateWaspas(
  alternatives: AlternativeInput[],
  criteriaConfig: { code: string; type: "benefit" | "cost"; weight: number }[]
): WaspasOutput {
  if (!alternatives || alternatives.length === 0) {
    throw new Error("Daftar alternatif kosong.");
  }
  if (!criteriaConfig || criteriaConfig.length === 0) {
    throw new Error("Konfigurasi kriteria kosong.");
  }

  // Validate values (no zero or negative allowed)
  for (const alt of alternatives) {
    for (const crit of criteriaConfig) {
      const val = alt.scores[crit.code];
      if (val === undefined || val === null || val <= 0) {
        throw new Error(
          `Nilai untuk alternatif ${alt.name} pada kriteria ${crit.code} bernilai ${val} (tidak boleh 0 atau negatif).`
        );
      }
    }
  }

  const weights = criteriaConfig.map((c) => c.weight);

  // Find max for benefit and min for cost across columns
  const colExtremes: Record<string, number> = {};
  for (const crit of criteriaConfig) {
    const values = alternatives.map((a) => a.scores[crit.code]);
    const uniqueValues = new Set(values);
    if (uniqueValues.size === 1) {
      // All values in column are the same
      const val = values[0];
      colExtremes[crit.code] = val;
    } else {
      if (crit.type === "benefit") {
        colExtremes[crit.code] = Math.max(...values);
      } else {
        colExtremes[crit.code] = Math.min(...values);
      }
    }
  }

  const decisionMatrix: WaspasOutput["decisionMatrix"] = alternatives.map((alt) => ({
    id: alt.id,
    name: alt.name,
    values: { ...alt.scores },
  }));

  const normalizedMatrix: WaspasOutput["normalizedMatrix"] = [];
  const results: WasparResultItem[] = [];

  for (const alt of alternatives) {
    const normValues: Record<string, number> = {};
    let wsm = 0;
    let wpmLog = 0; // sum of w_j * ln(r_ij) to prevent precision loss / underflow in product

    criteriaConfig.forEach((crit, idx) => {
      const x = alt.scores[crit.code];
      const extreme = colExtremes[crit.code];
      let r = 0;

      if (extreme === 0) {
        r = 0;
      } else if (crit.type === "benefit") {
        r = x / extreme;
      } else {
        // cost
        r = extreme / x;
      }

      normValues[crit.code] = r;

      const w = weights[idx];
      wsm += r * w;
      if (r > 0) {
        wpmLog += w * Math.log(r);
      }
    });

    const wpm = Math.exp(wpmLog);
    const qi = 0.5 * wsm + 0.5 * wpm;

    normalizedMatrix.push({
      id: alt.id,
      name: alt.name,
      values: normValues,
    });

    results.push({
      id: alt.id,
      name: alt.name,
      wsm,
      wpm,
      qi,
      rank: 0,
    });
  }

  // Sort by qi descending
  results.sort((a, b) => b.qi - a.qi);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    criteria: criteriaConfig,
    decisionMatrix,
    normalizedMatrix,
    results,
  };
}
