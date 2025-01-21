// software de mineração
import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import Block from "../lib/block";
import BlockInfo from "../lib/blockInfo";
import Transaction from "../lib/transaction";
import TransactionOutput from "../lib/transactionOutput";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

const minerWallet = new Wallet(process.env.MINER_WALLET);

console.log("Logado com a carteira: " + minerWallet.privateKey);

let totalMined = 0;

// pegar recompensa
function getRewardTx(): Transaction {
  const txo = new TransactionOutput({
    toAddress: minerWallet.publicKey,
    amount: 10,
  } as TransactionOutput);

  const tx = new Transaction({
    txOutputs: [txo],
    type: TransactionType.FEE,
  } as Transaction);

  tx.hash = tx.getHash();
  tx.txOutputs[0].tx = tx.hash;

  return tx;
}

async function mine() {
  console.log("Obtendo informações do próximo bloco...");
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
  if (!data) {
    console.log("Não encontrou transações. Esperando...");
    return setTimeout(() => {
      mine();
    }, 5000);
  }
  const blockInfo = data as BlockInfo;

  const newBlock = Block.fromBlockInfo(blockInfo);

  newBlock.transactions.push(getRewardTx());

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  console.log("Começando a mineração block #" + blockInfo.index);
  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

  console.log("Bloco minerado, enviando para a blockchain...");

  try {
    await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
    console.log("Bloco enviado e aceito!");
    totalMined++;
    console.log("Total de blocos minerados: " + totalMined);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  setTimeout(() => {
    mine();
  }, 1000);

  console.log(data);
}

mine();
