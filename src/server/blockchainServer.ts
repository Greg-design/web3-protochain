import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import Block from "../lib/block";
import Blockchain from "../lib/blockchain";

const PORT: number = 3000;

const app = express();

// middleware
app.use(morgan("tiny"));
app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
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

  if (!block) {
    return res.sendStatus(404);
  } else {
    return res.json(block);
  }
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

app.listen(PORT, () => {
  console.log(`Blockchain server is running at ${PORT}}`);
});
