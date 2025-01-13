// software de mineração
import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import Block from "../lib/block";
import BlockInfo from "../lib/blockInfo";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

const minerWallet = {
  privateKey: "123456",
  publicKey: `${process.env.MINER_WALLET}`,
};

console.log("Logado com a carteira: " + minerWallet.privateKey);

let totalMined = 0;

async function mine() {
  console.log("Obtendo informações do próximo bloco...");
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
  const blockInfo = data as BlockInfo;

  const newBlock = Block.fromBlockInfo(blockInfo);

  //TODO: adicionar transação tx de recompensa

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
