import { describe, it, expect } from "vitest";
import { criteria, calculateRocWeights, convertToScore } from "../criteria";
import { testFixtures } from "./fixtures";

describe("Criteria and ROC Weights Configuration", () => {
  it("should define 5 criteria with correct types and priority order C1 > C2 > C3 > C4 > C5", () => {
    expect(criteria).toHaveLength(5);
    expect(criteria[0].code).toBe("C1");
    expect(criteria[0].type).toBe("benefit");
    expect(criteria[1].code).toBe("C2");
    expect(criteria[1].type).toBe("cost");
    expect(criteria[2].code).toBe("C3");
    expect(criteria[2].type).toBe("benefit");
    expect(criteria[3].code).toBe("C4");
    expect(criteria[3].type).toBe("cost");
    expect(criteria[4].code).toBe("C5");
    expect(criteria[4].type).toBe("cost");
  });

  it("should calculate ROC weights correctly summing to 1 with expected values", () => {
    const weights = calculateRocWeights(criteria.length);
    expect(weights).toHaveLength(5);

    // Expected ROC weights: 0.4567; 0.2567; 0.1567; 0.0900; 0.0400 (tolerance 0.0001)
    const expectedWeights = [0.4567, 0.2567, 0.1567, 0.0900, 0.0400];
    weights.forEach((w, idx) => {
      expect(w).toBeCloseTo(expectedWeights[idx], 4);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBeCloseTo(1, 4);
  });

  it("should convert raw applicant values to correct ordinal scores 1-5 for all test fixtures", () => {
    for (const fixture of testFixtures) {
      expect(convertToScore("C1", fixture.simpanan)).toBe(fixture.expectedScores.c1);
      expect(convertToScore("C2", fixture.pinjamanDiajukan)).toBe(fixture.expectedScores.c2);
      expect(convertToScore("C3", fixture.urgensi)).toBe(fixture.expectedScores.c3);
      expect(convertToScore("C4", fixture.tanggungan)).toBe(fixture.expectedScores.c4);
      expect(convertToScore("C5", fixture.umur)).toBe(fixture.expectedScores.c5);
    }
  });
});
