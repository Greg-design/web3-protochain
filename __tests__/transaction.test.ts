import { describe, expect, test } from "@jest/globals";
import TransactionOutput from "../src/lib/__mocks__/transactionOutput";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";
import TransactionType from "../src/lib/transactionType";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Transaction tests", () => {
  test("Should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (Invalid hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should be valid (FEE)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInputs = undefined;
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (invalid to)", () => {
    const tx = new Transaction();

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid txInput)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      txInputs: [
        new TransactionInput({
          amount: -10,
          fromAddress: "carteiraFrom",
          signature: "abc",
        } as TransactionInput),
      ],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
