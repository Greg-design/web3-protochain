import { beforeAll, describe, expect, test } from "@jest/globals";
import TransactionOutput from "../src/lib/__mocks__/transactionOutput";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";
import TransactionType from "../src/lib/transactionType";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Transaction tests", () => {
  const exampleDifficulty: number = 1;
  const exampleFee: number = 1;
  const exampleTx: string = "5f64s16fg5s14gf6s4f86s41f68sr14g64rdg16dr5g16drg16rdg1rd6";
  let alice: Wallet, bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (Txo hash !== tx hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    tx.txOutputs[0].tx = "oleele";

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (inputs < outputs)", () => {
    const tx = new Transaction({
      txInputs: [
        new TransactionInput({
          amount: 1,
        } as TransactionInput),
      ],
      txOutputs: [
        new TransactionOutput({
          amount: 2,
        } as TransactionOutput),
      ],
    } as Transaction);

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (Invalid hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should be valid (FEE)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInputs = undefined;
    tx.hash = tx.getHash();

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (invalid to)", () => {
    const tx = new Transaction();

    const valid = tx.isValid(exampleDifficulty, exampleFee);
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

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should get fee", () => {
    const txIn = new TransactionInput({
      amount: 11,
      fromAddress: alice.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);

    txIn.sign(alice.privateKey);

    const txOut = new TransactionOutput({
      amount: 10,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut],
    } as Transaction);

    const result = tx.getFee();

    expect(result).toBeGreaterThan(0);
  });

  test("Should get zero fee", () => {
    const tx = new Transaction();
    tx.txInputs = undefined;
    const result = tx.getFee();

    expect(result).toEqual(0);
  });

  test("Should create from reward", () => {
    const tx = Transaction.fromReward({
      amount: 10,
      toAddress: alice.publicKey,
      tx: exampleTx,
    } as TransactionOutput);
    tx.txInputs = undefined;
    const result = tx.isValid(exampleDifficulty, exampleFee);

    expect(result.success).toBeTruthy();
  });

  test("Should NOT be valid (fee excess)", () => {
    const txOut = new TransactionOutput({
      amount: Number.MAX_VALUE,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txOut],
    } as Transaction);

    const result = tx.isValid(exampleDifficulty, exampleFee);

    expect(result.success).toBeFalsy();
  });
});
