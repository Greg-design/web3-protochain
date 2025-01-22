import axios from "axios";
import dotenv from "dotenv";
import readline from "readline";
import Transaction from "../lib/transaction";
import TransactionInput from "../lib/transactionInput";
import TransactionOutput from "../lib/transactionOutput";
import Wallet from "../lib/wallet";

dotenv.config();

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = "";
let myWalletPriv = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function menu() {
  setTimeout(() => {
    console.clear();

    if (myWalletPub) {
      console.log(`Você está logado com a chave ${myWalletPub}`);
    } else {
      console.log("Você não está logado.");
    }

    console.log("1 - Criar Wallet");
    console.log("2 - Recuperar Wallet");
    console.log("3 - Saldo Wallet");
    console.log("4 - Enviar Transação(tx)");
    console.log("5 - Consultar Transação(tx)");

    rl.question("Escolha sua opção", (answer) => {
      switch (answer) {
        case "1":
          createWallet();
          break;
        case "2":
          recoverWallet();
          break;
        case "3":
          getBalance();
          break;
        case "4":
          sendTx();
          break;
        case "5":
          searchTx();
          break;
        default: {
          console.log("Opção inválida!");
          menu();
        }
      }
    });
  }, 1000);
}

function preMenu() {
  rl.question("Pressione qualquer tecla para continuar...", () => {
    menu();
  });
}

function createWallet() {
  console.clear();
  const wallet = new Wallet();
  console.log(`Sua nova Wallet:`);
  console.log(wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

// recuperar carteira
function recoverWallet() {
  console.clear();
  rl.question(`Qual é a sua private key ou WIF`, (wifOrPrivateKey) => {
    const wallet = new Wallet(wifOrPrivateKey);
    console.log(`Sua Wallet recuperada:`);
    console.log(wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;
    preMenu();
  });
}

// ver saldo
async function getBalance() {
  console.clear();

  if (!myWalletPub) {
    console.log("Você ainda não tem uma wallet(carteira);");
    return preMenu();
  }

  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}wallets/${myWalletPub}`);
  console.log("Balance: " + data.balance);
  preMenu();
}

// enviar transação
function sendTx() {
  console.clear();

  if (!myWalletPub) {
    console.log("Você ainda não tem uma wallet(carteira);");
    return preMenu();
  }

  //send tx via api
  console.log(`Sua Wallet é ${myWalletPub}`);
  rl.question(`Para wallet: `, (toWallet) => {
    if (toWallet.length < 66) {
      console.log("Wallet inválida");
      return preMenu();
    }

    rl.question(`Amount: `, async (amountStr) => {
      const amount = parseInt(amountStr);
      if (!amount) {
        console.log("Valor inválido");
        return preMenu();
      }

      const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}wallet/${myWalletPub}`);
      const balance = walletResponse.data.balance as number;
      const fee = walletResponse.data.fee as number;
      const utxo = walletResponse.data.utxo as TransactionOutput[];

      if (balance < amount + fee) {
        console.log("Saldo insuficiente");
        return preMenu();
      }

      const txInputs = utxo.map((txo) => TransactionInput.fromTxo(txo));
      txInputs.forEach((txi, index, arr) => arr[index].sign(myWalletPriv));

      // transação de transferencia
      const txOutputs = [] as TransactionOutput[];
      txOutputs.push(
        new TransactionOutput({
          toAddress: toWallet,
          amount,
        } as TransactionOutput)
      );

      // transação do troco
      const remainingBalance = balance - amount - fee;
      txOutputs.push(
        new TransactionOutput({
          toAddress: myWalletPub,
          amount: remainingBalance,
        } as TransactionOutput)
      );

      const tx = new Transaction({
        txInputs,
        txOutputs,
      } as Transaction);

      tx.hash = tx.getHash();
      tx.txOutputs.forEach((txo, index, arr) => (arr[index].tx = tx.hash));

      console.log(tx);
      console.log("Saldo Restante: " + remainingBalance);

      try {
        const txResponse = await axios.post(`${BLOCKCHAIN_SERVER}transaction/`, tx);
        console.log(`Transação aceita. Esperando mineradores!`);
        console.log(txResponse.data.hash);
      } catch (err: any) {
        console.log(err.response ? err.reponse.data : err.message);
      }
      return preMenu();
    });
  });

  preMenu();
}

function searchTx() {
  console.clear();
  rl.question(`Seu hash de tx: `, async (hash) => {
    const response = await axios.get(`${BLOCKCHAIN_SERVER}transactions/${hash}`);
    console.log(response.data);
    return preMenu();
  });
}

menu();
