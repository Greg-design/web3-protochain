import sha256 from "crypto-js/sha256";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
import TransactionType from "./transactionType";
import Validation from "./validation";

/**
 * Transaction class
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInputs: TransactionInput[] | undefined;
  txOutputs: TransactionOutput[];

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();

    this.txInputs = tx?.txInputs ? tx.txInputs.map((txi) => new TransactionInput(txi)) : undefined;

    this.txOutputs = tx?.txOutputs ? tx.txOutputs.map((txo) => new TransactionOutput(txo)) : [];

    this.hash = tx?.hash || this.getHash();
    this.txOutputs.forEach((txo, index, arr) => (arr[index].tx = this.hash));
  }

  getHash(): string {
    const from = this.txInputs && this.txInputs.length ? this.txInputs.map((txi) => txi.signature).join(",") : "";

    const to = this.txOutputs && this.txOutputs.length ? this.txOutputs.map((txi) => txi.getHash()).join(",") : "";

    return sha256(this.type + from + to + this.timestamp).toString();
  }

  isValid(): Validation {
    if (this.hash !== this.getHash()) {
      return new Validation(false, "Invalid hash.");
    }

    if (
      !this.txOutputs ||
      !this.txOutputs.length ||
      this.txOutputs.map((txo) => txo.isValid()).some((v) => !v.success)
    ) {
      return new Validation(false, "Invalid TXO.");
    }

    if (this.txInputs && this.txInputs.length) {
      const validations = this.txInputs.map((txi) => txi.isValid()).filter((v) => !v.success);
      if (validations && validations.length) {
        const message = validations.map((v) => v.message).join(" ");
        return new Validation(false, `Invalid tx: ${message}`);
      }
    }

    const inputSum = this.txInputs?.map((txi) => txi.amount).reduce((a, b) => a + b, 0) || 0;
    const inputOutput = this.txOutputs?.map((txo) => txo.amount).reduce((a, b) => a + b, 0);

    if (inputSum < inputOutput) {
      return new Validation(false, "Invalid TX: input amounts must be equals or greater than oupts amounts");
    }

    if (this.txOutputs.some((txo) => txo.tx !== this.hash)) {
      return new Validation(false, "Invalid txo reference hash.");
    }
    //TODO: validar as taxas e recompensas qunado tx.type === FEE

    return new Validation();
  }
}
