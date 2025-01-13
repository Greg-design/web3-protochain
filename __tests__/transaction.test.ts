import { describe, expect, test } from "@jest/globals";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";

describe("Transaction tests", () => {
  test("Should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      data: "block 2",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (Invalid hash)", () => {
    const tx = new Transaction({
      data: "block 2",
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should be valid (FEE)", () => {
    const tx = new Transaction({
      data: "block 2",
      type: TransactionType.FEE,
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (invalid data)", () => {
    const tx = new Transaction();

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
