import { DomainError } from "./domain.error";

export class CurrencyMismatchError extends DomainError {
  constructor(c1: string, c2: string) {
    super(`Cannot perform arithmetic operations on different currencies: '${c1}' and '${c2}'`);
    this.name = "CurrencyMismatchError";
  }
}
