import { CurrencyMismatchError } from "../errors/currency-mismatch.error";
import { DomainError } from "../errors/domain.error";

export type CurrencyCode = "EUR" | "USD" | "GBP";

const SUPPORTED_CURRENCIES: ReadonlySet<string> = new Set<CurrencyCode>(["EUR", "USD", "GBP"]);

export class Money {
  private readonly _amountInMinorUnits: number;
  private readonly _currency: CurrencyCode;

  private constructor(amountInMinorUnits: number, currency: CurrencyCode) {
    if (!Number.isSafeInteger(amountInMinorUnits)) {
      throw new DomainError("Money amount in minor units must be a safe integer");
    }
    if (!SUPPORTED_CURRENCIES.has(currency)) {
      throw new DomainError(`Unsupported currency: ${currency}`);
    }

    this._amountInMinorUnits = amountInMinorUnits;
    this._currency = currency;
    Object.freeze(this);
  }

  public static fromMinorUnits(amountInMinorUnits: number, currency: CurrencyCode): Money {
    return new Money(amountInMinorUnits, currency);
  }

  public static fromDecimal(decimalAmount: number, currency: CurrencyCode): Money {
    if (typeof decimalAmount !== "number" || isNaN(decimalAmount)) {
      throw new DomainError("Decimal amount must be a valid number");
    }
    // Round to avoid floating point conversion issues (e.g., 19.99 * 100 = 1998.9999999999998)
    const minorUnits = Math.round(decimalAmount * 100);
    return new Money(minorUnits, currency);
  }

  public get amountInMinorUnits(): number {
    return this._amountInMinorUnits;
  }

  public get currency(): CurrencyCode {
    return this._currency;
  }

  public toDecimal(): number {
    return this._amountInMinorUnits / 100;
  }

  public add(other: Money): Money {
    this.assertCurrencyMatch(other);
    return new Money(this._amountInMinorUnits + other._amountInMinorUnits, this._currency);
  }

  public subtract(other: Money): Money {
    this.assertCurrencyMatch(other);
    return new Money(this._amountInMinorUnits - other._amountInMinorUnits, this._currency);
  }

  public multiplyBy(factor: number): Money {
    if (typeof factor !== "number" || isNaN(factor)) {
      throw new DomainError("Factor must be a valid number");
    }
    const result = Math.round(this._amountInMinorUnits * factor);
    return new Money(result, this._currency);
  }

  /**
   * Hare-Niemeyer (Largest Remainder) split algorithm.
   * Guarantees exact minor unit conservation: sum(splits) === total.
   */
  public split(parts: number): Money[] {
    if (!Number.isInteger(parts) || parts <= 0) {
      throw new DomainError("Split parts must be a positive integer");
    }

    const baseAmount = Math.floor(this._amountInMinorUnits / parts);
    const remainder = this._amountInMinorUnits % parts;

    const result: Money[] = [];
    for (let i = 0; i < parts; i++) {
      // Distribute 1 minor unit (cent) to the first `remainder` splits
      const extra = i < remainder ? 1 : 0;
      result.push(new Money(baseAmount + extra, this._currency));
    }

    return result;
  }

  public format(): string {
    const decimal = this.toDecimal();
    const formattedNumber = decimal.toFixed(2);

    switch (this._currency) {
      case "EUR":
        return `${formattedNumber} €`;
      case "USD":
        return `$${formattedNumber}`;
      case "GBP":
        return `£${formattedNumber}`;
      default:
        return `${formattedNumber} ${this._currency}`;
    }
  }

  public equals(other: Money): boolean {
    return (
      this._amountInMinorUnits === other._amountInMinorUnits &&
      this._currency === other._currency
    );
  }

  private assertCurrencyMatch(other: Money): void {
    if (this._currency !== other._currency) {
      throw new CurrencyMismatchError(this._currency, other._currency);
    }
  }
}
