import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

const ECPair = ECPairFactory(ecc);

export default class Wallet {
  privateKey: string;
  publicKey: string;

  constructor(wifOrPrivateKey?: string) {
    let keys;
    if (wifOrPrivateKey) {
      if (wifOrPrivateKey.length === 64) {
        keys = ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, "hex"));
      } else {
        keys = ECPair.fromWIF(wifOrPrivateKey);
      }
    } else {
      keys = ECPair.makeRandom();
    }

    /* c8 ignore next */
    this.privateKey = keys.privateKey?.toString() || "";
    this.publicKey = keys.publicKey.toString();
  }
}
