import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import Block from "../lib/block";
import Blockchain from "../lib/blockchain";
import Transaction from "../lib/transaction";
import Wallet from "../lib/wallet";

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3000}`);

const app = express();

/* c8 ignore start */
if (process.argv.includes("--run")) app.use(morgan("tiny"));
/* c8 ignore end */

app.use(express.json());

const wallet = new Wallet(process.env.BLOCKCHAIN_WALLET);

const blockchain = new Blockchain(wallet.publicKey);

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    mempool: blockchain.mempool.length,
    blocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
});

app.get("/blocks/next", (req: Request, res: Response, next: NextFunction) => {
  res.json(blockchain.getNextBlock());
});

// pegar um bloco
//@ts-ignore
app.get("/blocks/:indexOrHash", (req: Request, res: Response, next: NextFunction) => {
  const { indexOrHash } = req.params;
  let block;
  if (/^[0-9]+$/.test(indexOrHash)) {
    block = res.json(blockchain.blocks[parseInt(indexOrHash)]);
  } else {
    block = res.json(blockchain.getBlock(indexOrHash));
  }

  /* c8 ignore start */
  if (!block) {
    return res.sendStatus(404);
  } else {
    return res.json(block);
  }
  /* c8 ignore end */
});

// adição de novos blocos
//@ts-ignore
app.post("/blocks", (req: Request, res: Response, next: NextFunction) => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const block = new Block(req.body as Block);
  const validation = blockchain.addBlock(block);

  if (validation.success) {
    res.status(201).json(block);
  } else {
    res.status(400).json(validation);
  }
});

//@ts-ignore
app.get("/transactions/:hash?", (req: Request, res: Response, next: NextFunction) => {
  if (req.params.hash) {
    res.json(blockchain.getTransaction(req.params.hash));
  } else {
    res.json({
      next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.mempool.length,
    });
  }
});

//@ts-ignore
app.post("/transactions", (req: Request, res: Response, next: NextFunction) => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const tx = new Transaction(req.body as Transaction);
  const validation = blockchain.addTransaction(tx);

  if (validation.success) {
    res.status(201).json(tx);
  } else {
    res.status(400).json(validation);
  }
});

//@ts-ignore
app.get("/wallets/:wallet", (req: Request, res: Response, next: NextFunction) => {
  const wallet = req.params.wallet;

  const utxo = blockchain.getUtxo(wallet);
  const balance = blockchain.getBalance(wallet);
  const fee = blockchain.getFeePerTx();

  return res.json({ balance, fee, utxo });
});

/* c8 ignore start */
if (process.argv.includes("--run"))
  app.listen(PORT, () => {
    console.log(`Blockchain server is running at ${PORT}}. Wallet: ${wallet.publicKey}`);
  });
/* c8 ignore end */

export { app };
