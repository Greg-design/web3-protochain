import { beforeAll, describe, expect, test } from "@jest/globals";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";

describe("Block tests", () => {
  const exampleDifficulty = 0;
  const exampleMiner = "Gregory";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({ data: "Genesis Block" } as Block);
  });

  test("Should be valid", () => {
    const block = new Block({ index: 1, previousHash: genesis.hash, data: "block 2" } as Block);
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Should create from block info", () => {
    const block = Block.fromBlockInfo({
      data: "Block 2",
      difficulty: exampleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (fallbacks)", () => {
    const block = new Block();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (previous hash)", () => {
    const block = new Block({ index: 1, previousHash: "abc", data: "block 2" } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (timestamp)", () => {
    const block = new Block({ index: 1, previousHash: genesis.hash, data: "block 2" } as Block);
    block.timestamp = -1;
    block.hash = block.getHash();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (empty hash)", () => {
    const block = new Block({ index: 1, previousHash: genesis.hash, data: "block 2" } as Block);
    block.mine(exampleDifficulty, exampleMiner);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (no mined)", () => {
    const block = new Block({ index: 1, previousHash: genesis.hash, data: "block 2" } as Block);

    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (data)", () => {
    const block = new Block({ index: 1, previousHash: genesis.hash, data: "" } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should Not be valid (index)", () => {
    const block = new Block({ index: -1, previousHash: genesis.hash, data: "block 2" } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });
});
