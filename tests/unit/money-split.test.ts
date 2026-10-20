import { describe, it, expect } from "vitest";
import { Money } from "@/core/domain/value-objects/money.vo";

describe("Hare-Niemeyer Remainder Allocation Algorithm (US4 / Constitution Principle IV)", () => {
  it("divides cleanly divisible amounts without remainder", () => {
    const money = Money.fromDecimal(10.0, "EUR");
    const splits = money.split(4);

    expect(splits).toHaveLength(4);
    splits.forEach((s) => expect(s.amountInMinorUnits).toBe(250));
    const sum = splits.reduce((acc, s) => acc + s.amountInMinorUnits, 0);
    expect(sum).toBe(1000);
  });

  it("handles non-divisible minor units: 100.00 EUR among 3 people", () => {
    const money = Money.fromDecimal(100.0, "EUR"); // 10000 cents
    const splits = money.split(3);

    expect(splits).toHaveLength(3);
    // 10000 / 3 = 3333 with remainder 1
    expect(splits[0].amountInMinorUnits).toBe(3334);
    expect(splits[1].amountInMinorUnits).toBe(3333);
    expect(splits[2].amountInMinorUnits).toBe(3333);

    const sum = splits.reduce((acc, s) => acc + s.amountInMinorUnits, 0);
    expect(sum).toBe(10000);
  });

  it("handles extreme split: 1 cent among 3 people", () => {
    const money = Money.fromMinorUnits(1, "EUR");
    const splits = money.split(3);

    expect(splits).toHaveLength(3);
    expect(splits[0].amountInMinorUnits).toBe(1);
    expect(splits[1].amountInMinorUnits).toBe(0);
    expect(splits[2].amountInMinorUnits).toBe(0);

    const sum = splits.reduce((acc, s) => acc + s.amountInMinorUnits, 0);
    expect(sum).toBe(1);
  });

  it("conserves pennies across 100 diverse random split scenarios", () => {
    for (let i = 0; i < 100; i++) {
      const randomCents = Math.floor(Math.random() * 100000) + 1; // 1 cent to 1000.00 EUR
      const randomParts = Math.floor(Math.random() * 20) + 1; // 1 to 20 people

      const money = Money.fromMinorUnits(randomCents, "EUR");
      const splits = money.split(randomParts);

      expect(splits).toHaveLength(randomParts);
      const sum = splits.reduce((acc, s) => acc + s.amountInMinorUnits, 0);
      expect(sum).toBe(randomCents);
    }
  });
});
