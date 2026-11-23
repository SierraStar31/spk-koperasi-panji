import { describe, it, expect } from "vitest";
import { formatThousands, parseThousands } from "../format";

describe("Thousand separator formatting", () => {
  it("groups digits by three", () => {
    expect(formatThousands("2000000")).toBe("2.000.000");
    expect(formatThousands("1000")).toBe("1.000");
    expect(formatThousands("999")).toBe("999");
    expect(formatThousands("100000000")).toBe("100.000.000");
  });

  it("ignores existing separators and non-digits", () => {
    expect(formatThousands("2.000.000")).toBe("2.000.000");
    expect(formatThousands("Rp 2 000 000")).toBe("2.000.000");
    expect(formatThousands("2a0b0c0")).toBe("2.000");
  });

  it("keeps empty input empty and drops leading zeros", () => {
    expect(formatThousands("")).toBe("");
    expect(formatThousands("0")).toBe("0");
    expect(formatThousands("007")).toBe("7");
    expect(formatThousands("0000")).toBe("0");
  });

  it("round-trips through parseThousands", () => {
    expect(parseThousands("2.000.000")).toBe("2000000");
    expect(parseThousands(formatThousands("3500000"))).toBe("3500000");
    expect(parseThousands(undefined)).toBe("");
  });
});
