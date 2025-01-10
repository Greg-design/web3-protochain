import Validation from "../validation";

/**
 *  Mocked Block class
 */
export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;

  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.data = block?.data || "";
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    return this.data || "abc";
  }

  /**
   * Validates the block
   * @returns Returns if the mock block is valid
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (!previousHash || previousIndex < 0 || this.index < 0) {
      return new Validation(false, "Invalid mock block");
    }
    return new Validation();
  }
}
