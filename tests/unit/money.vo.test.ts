import { describe, it, expect } from "vitest";
import { Money } from "@/core/domain/value-objects/money.vo";
import { CurrencyMismatchError } from "@/core/domain/errors/currency-mismatch.error";

describe("Money Value Object (Constitution Principle IV)", () => {
  it("creates a valid Money instance with minor units and currency", () => {
    const money = Money.fromMinorUnits(2500, "EUR");
    expect(money.amountInMinorUnits).toBe(2500);
    expect(money.currency).toBe("EUR");
    expect(money.toDecimal()).toBe(25.0);
    expect(money.format()).toBe("25.00 €");
  });

  it("creates Money from decimal value without floating point inaccuracy", () => {
    const money = Money.fromDecimal(19.99, "USD");
    expect(money.amountInMinorUnits).toBe(1999);
    expect(money.currency).toBe("USD");
    expect(money.format()).toBe("$19.99");
  });

  it("throws when amount is not a safe integer in fromMinorUnits", () => {
    expect(() => Money.fromMinorUnits(12.34, "EUR")).toThrowError(
      "Money amount in minor units must be a safe integer"
    );
  });

  it("rejects unsupported currencies", () => {
    // @ts-expect-error Testing runtime check of invalid currency
    expect(() => Money.fromMinorUnits(100, "JPY")).toThrowError(
      "Unsupported currency: JPY"
    );
  });

  it("adds two Money instances of the same currency immutably", () => {
    const m1 = Money.fromMinorUnits(1000, "EUR");
    const m2 = Money.fromMinorUnits(1550, "EUR");
    const result = m1.add(m2);

    expect(result.amountInMinorUnits).toBe(2550);
    expect(result.currency).toBe("EUR");
    expect(m1.amountInMinorUnits).toBe(1000); // Immutability
    expect(m2.amountInMinorUnits).toBe(1550);
  });

  it("subtracts two Money instances of the same currency immutably", () => {
    const m1 = Money.fromMinorUnits(3000, "GBP");
    const m2 = Money.fromMinorUnits(1200, "GBP");
    const result = m1.subtract(m2);

    expect(result.amountInMinorUnits).toBe(1800);
    expect(result.currency).toBe("GBP");
  });

  it("throws CurrencyMismatchError when adding or subtracting different currencies", () => {
    const eur = Money.fromMinorUnits(1000, "EUR");
    const usd = Money.fromMinorUnits(1000, "USD");

    expect(() => eur.add(usd)).toThrow(CurrencyMismatchError);
    expect(() => eur.subtract(usd)).toThrow(CurrencyMismatchError);
  });

  it("splits amount into N equal parts with exact penny conservation (Hare-Niemeyer)", () => {
    // 100.00 EUR split among 3 people = 33.34, 33.33, 33.33 (sum = 100.00)
    const total = Money.fromMinorUnits(10000, "EUR");
    const splits = total.split(3);

    expect(splits).toHaveLength(3);
    expect(splits[0].amountInMinorUnits).toBe(3334);
    expect(splits[1].amountInMinorUnits).toBe(3333);
    expect(splits[2].amountInMinorUnits).toBe(3333);

    const sum = splits.reduce((acc, s) => acc + s.amountInMinorUnits, 0);
    expect(sum).toBe(10000);
  });

  it("rejects splitting into less than 1 part", () => {
    const money = Money.fromMinorUnits(1000, "EUR");
    expect(() => money.split(0)).toThrowError("Split parts must be a positive integer");
    expect(() => money.split(-2)).toThrowError("Split parts must be a positive integer");
  });
});
