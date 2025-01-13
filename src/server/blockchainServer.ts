import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import Block from "../lib/block";
import Blockchain from "../lib/blockchain";

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3000}`);

const app = express();

/* c8 ignore start */
if (process.argv.includes("--run")) app.use(morgan("tiny"));
/* c8 ignore end */

app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
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

/* c8 ignore start */
if (process.argv.includes("--run"))
  app.listen(PORT, () => {
    console.log(`Blockchain server is running at ${PORT}}`);
  });
/* c8 ignore end */

export { app };
