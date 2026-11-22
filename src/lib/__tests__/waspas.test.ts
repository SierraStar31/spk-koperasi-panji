import { describe, it, expect } from "vitest";
import { calculateWaspas, AlternativeInput } from "../waspas";
import { criteria, calculateRocWeights, convertToScore } from "../criteria";
import { testFixtures } from "../__tests__/fixtures";

describe("WASPAS Method Calculation", () => {
  it("should calculate WASPAS correctly for a small manual test case", () => {
    /*
      Manual Test Case:
      Alternatives: A1 ("Alpha"), A2 ("Beta")
      Criteria:
      - C1: benefit, weight = 0.6
      - C2: cost, weight = 0.4
      
      Decision Matrix X:
      Alpha: C1 = 10, C2 = 5
      Beta:  C1 = 20, C2 = 10

      Column extremes:
      - C1 (benefit): max = max(10, 20) = 20
      - C2 (cost): min = min(5, 10) = 5

      Normalized Matrix R:
      Alpha:
        - C1 (benefit): 10 / 20 = 0.5
        - C2 (cost): 5 / 5 = 1.0
      Beta:
        - C1 (benefit): 20 / 20 = 1.0
        - C2 (cost): 5 / 10 = 0.5

      WSM (Weighted Sum Model): WSM_i = sum(r_ij * w_j)
      - Alpha WSM = (0.5 * 0.6) + (1.0 * 0.4) = 0.3 + 0.4 = 0.7
      - Beta WSM  = (1.0 * 0.6) + (0.5 * 0.4) = 0.6 + 0.2 = 0.8

      WPM (Weighted Product Model): WPM_i = product(r_ij ^ w_j)
      - Alpha WPM = (0.5 ^ 0.6) * (1.0 ^ 0.4) ≈ 0.659754 * 1.0 = 0.659754
      - Beta WPM  = (1.0 ^ 0.6) * (0.5 ^ 0.4) = 1.0 * 0.757858 ≈ 0.757858

      Qi = 0.5 * WSM + 0.5 * WPM
      - Alpha Qi = 0.5 * 0.7 + 0.5 * 0.659754 = 0.35 + 0.329877 = 0.679877
      - Beta Qi  = 0.5 * 0.8 + 0.5 * 0.757858 = 0.4 + 0.378929 = 0.778929

      Ranking: Beta (1), Alpha (2)
    */

    const manualAlternatives: AlternativeInput[] = [
      { id: "1", name: "Alpha", scores: { C1: 10, C2: 5 } },
      { id: "2", name: "Beta", scores: { C1: 20, C2: 10 } },
    ];

    const manualCriteria = [
      { code: "C1", type: "benefit" as const, weight: 0.6 },
      { code: "C2", type: "cost" as const, weight: 0.4 },
    ];

    const output = calculateWaspas(manualAlternatives, manualCriteria);

    expect(output.results).toHaveLength(2);
    expect(output.results[0].name).toBe("Beta");
    expect(output.results[0].rank).toBe(1);
    expect(output.results[0].wsm).toBeCloseTo(0.8, 4);
    expect(output.results[0].wpm).toBeCloseTo(0.757858, 4);
    expect(output.results[0].qi).toBeCloseTo(0.778929, 4);

    expect(output.results[1].name).toBe("Alpha");
    expect(output.results[1].rank).toBe(2);
    expect(output.results[1].wsm).toBeCloseTo(0.7, 4);
    expect(output.results[1].wpm).toBeCloseTo(0.659754, 4);
    expect(output.results[1].qi).toBeCloseTo(0.679877, 4);
  });

  it("should reject zero or negative values with a clear error", () => {
    const invalidAlternatives: AlternativeInput[] = [
      { id: "1", name: "Invalid", scores: { C1: 0, C2: 5 } },
    ];
    const manualCriteria = [
      { code: "C1", type: "benefit" as const, weight: 0.6 },
      { code: "C2", type: "cost" as const, weight: 0.4 },
    ];

    expect(() => calculateWaspas(invalidAlternatives, manualCriteria)).toThrowError(
      /tidak boleh 0 atau negatif/
    );
  });

  it("should throw error on empty alternatives", () => {
    expect(() => calculateWaspas([], [])).toThrowError(/kosong/);
  });

  it("should match expected ranking and Qi values for the 7 test fixtures using ROC weights", () => {
    const rocWeights = calculateRocWeights(criteria.length);
    const criteriaConfig = criteria.map((c, idx) => ({
      code: c.code,
      type: c.type,
      weight: rocWeights[idx],
    }));

    const alternatives: AlternativeInput[] = testFixtures.map((f, idx) => ({
      id: String(idx + 1),
      name: f.nama,
      scores: {
        C1: convertToScore("C1", f.simpanan),
        C2: convertToScore("C2", f.pinjamanDiajukan),
        C3: convertToScore("C3", f.urgensi),
        C4: convertToScore("C4", f.tanggungan),
        C5: convertToScore("C5", f.umur),
      },
    }));

    const output = calculateWaspas(alternatives, criteriaConfig);

    const expectedOrder = [
      { name: "Siti Fatimah", qi: 0.9700 },
      { name: "Nurul Ida Katiyem", qi: 0.8169 },
      { name: "Ramnah Widiati", qi: 0.7456 },
      { name: "Siti Aminah", qi: 0.6887 },
      { name: "Dewi Erlina", qi: 0.5736 },
      { name: "Kartinah", qi: 0.4411 },
      { name: "Aminatun", qi: 0.4185 },
    ];

    expect(output.results).toHaveLength(expectedOrder.length);

    output.results.forEach((res, idx) => {
      expect(res.name).toBe(expectedOrder[idx].name);
      expect(res.qi).toBeCloseTo(expectedOrder[idx].qi, 4);
    });
  });
});
