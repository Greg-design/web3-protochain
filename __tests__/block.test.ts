import { beforeAll, describe, expect, test } from "@jest/globals";
import TransactionOutput from "../src/lib/__mocks__/transactionOutput";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";
import TransactionType from "../src/lib/transactionType";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Block tests", () => {
  const exampleFee: number = 1;
  const exampleDifficulty: number = 1;
  const exampleTx: string = "2651g5f1dgdf4151gf5d1g51g5h1gf5h15h156g1fd56g1df56g1df56g1";
  let alice: Wallet, bob: Wallet;
  let genesis: Block;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
    genesis = new Block({
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
  });

  function getFullBlock(): Block {
    const txIn = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);

    const txOut = new TransactionOutput({
      amount: 10,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut],
    } as Transaction);

    const txFee = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          amount: 1,
          toAddress: alice.publicKey,
        } as TransactionOutput),
      ],
    } as Transaction);

    const block = new Block({
      index: 1,
      transactions: [tx, txFee],
      previousHash: genesis.hash,
    } as Block);

    block.mine(exampleDifficulty, alice.publicKey);

    return block;
  }

  test("Should be valid", () => {
    const block = getFullBlock();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (different hash)", () => {
    const block = getFullBlock();

    block.hash = "abc";
    block.mine(exampleDifficulty, alice.publicKey);
    block.hash = "abc";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (no fee)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should create from block info", () => {
    const block = Block.fromBlockInfo({
      transactions: [],
      difficulty: exampleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);

    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          toAddress: alice.publicKey,
          amount: 1,
        } as TransactionOutput),
      ],
    } as Transaction);

    block.transactions.push(tx);
    block.hash = block.getHash();

    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (2 FEE)", () => {
    const block = getFullBlock();
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()],
    } as Transaction);
    tx.txInputs = undefined;

    block.transactions.push(tx);
    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid tx)", () => {
    const block = getFullBlock();
    block.transactions[0].timestamp = -1;

    block.hash = block.getHash();
    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (fallbacks)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (invalid previous hash)", () => {
    const block = getFullBlock();
    block.previousHash = "invalidHash";

    block.hash = block.getHash();
    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (invalid timestamp)", () => {
    const block = getFullBlock();
    block.timestamp = -1;

    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (empty hash)", () => {
    const block = getFullBlock();
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (no mined)", () => {
    const block = getFullBlock();
    block.nonce = 0;
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (invalid index)", () => {
    const block = getFullBlock();
    block.index = -1;
    block.hash = block.getHash();
    block.mine(exampleDifficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });
});
