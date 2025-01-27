import { beforeAll, describe, expect, test } from "@jest/globals";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

describe("TransactionInput tests", () => {
  let alice: Wallet;
  let bob: Wallet;

  const exampleTx: string = "156g16dg16fg1fd5g1dfgh4df8g4df8g4df6g51df6g1dg1f65g1df56g";

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Should be valid", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);

    txInput.sign(alice.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (defaults)", () => {
    const txInput = new TransactionInput();
    txInput.sign(alice.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (empty signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (negative amount)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);
    txInput.sign(alice.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);
    txInput.sign(bob.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid previousTx)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);
    txInput.sign(alice.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should create form Txo", () => {
    const txi = TransactionInput.fromTxo({
      amount: 10,
      toAddress: alice.publicKey,
      tx: exampleTx,
    } as TransactionOutput);
    txi.sign(alice.privateKey);

    txi.amount = 1;
    const result = txi.isValid();
    expect(result.success).toBeFalsy();
  });
});
