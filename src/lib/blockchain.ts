import Block from "./block";

/**
 * Blockchain class documentation
 */
export default class Blockchain {
  blocks: Block[];

  constructor() {
    this.blocks = [new Block(0, "", "Genesis Block")];
  }
}
