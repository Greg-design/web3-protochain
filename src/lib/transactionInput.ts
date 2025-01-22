import sha256 from "crypto-js/sha256";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import TransactionOutput from "./transactionOutput";
import Validation from "./validation";

const ECPair = ECPairFactory(ecc);

export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;
  previousTx: string;

  /**
   * Creates a new TransactionInput
   * @param txInput
   */
  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx || "";
    this.fromAddress = txInput?.fromAddress || "";
    this.amount = txInput?.amount || 0;
    this.signature = txInput?.signature || "";
  }

  /**
   * funçao de assinatura de um input de transação
   * @param privateKey the 'from' private key
   */
  sign(privateKey: string): void {
    this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"))
      .sign(Buffer.from(this.getHash(), "hex"))
      .toString();
  }

  /**
   * Generates the tx input hash
   * @returns the tx input hash
   */
  getHash(): string {
    return sha256(this.previousTx + this.fromAddress + this.amount).toString();
  }

  /**
   * Validates if the tx input is ok
   * @returns return a validation result object
   */
  isValid(): Validation {
    if (!this.previousTx || !this.signature) {
      return new Validation(false, "Signature and previousTx are required");
    }

    if (this.amount < 1) {
      return new Validation(false, "Amount must be greater than zero");
    }

    const hash = Buffer.from(this.getHash(), "hex");
    const isValid = ECPair.fromPublicKey(Buffer.from(this.fromAddress, "hex")).verify(
      hash,
      Buffer.from(this.signature, "hex")
    );

    return isValid ? new Validation() : new Validation(false, "Invalid tx input signature.");
  }

  static fromTxo(txo: TransactionOutput): TransactionInput {
    return new TransactionInput({
      amount: txo.amount,
      fromAddress: txo.toAddress,
      previousTx: txo.tx,
    } as TransactionInput);
  }
}
