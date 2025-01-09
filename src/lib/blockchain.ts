import Block from "./block";
import Validation from "./validation";

/**
 * Blockchain class documentation
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;

  constructor() {
    this.blocks = [new Block({ index: this.nextIndex, previousHash: "", data: "Genesis Block" } as Block)];
    this.nextIndex++;
  }

  // pega o atual ultimo bloco
  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();

    const validation = block.isValid(lastBlock.hash, lastBlock.index);

    if (!validation.success) return new Validation(false, `Invalid Block ${validation.message}`);
    this.blocks.push(block);
    this.nextIndex++;
    return new Validation();
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => b.hash === hash);
  }

  // verificar se a blockchain toda é valida - varre todos os blocos comparando se o anterior é valido
  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(previousBlock.hash, previousBlock.index);
      if (!validation.success)
        return new Validation(false, `Invalid Block ${currentBlock.index}: ${validation.message}`);
    }
    return new Validation();
  }
}
