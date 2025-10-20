const Web3 = require("web3");
const Web3EthAccounts = require("web3-eth-accounts");
console.log("RPC_URI", process.env.RPC_URI);

const web3 = new Web3();


const newWeb3Connection = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Connect to the main Web3 blockchain
      web3.setProvider(new web3.providers.HttpProvider(process.env.RPC_URI));
      global.web3 = web3;
      const account = new Web3EthAccounts(process.env.RPC_URI);
      global.account = account;
      console.log("Connected to WEB3 Blockchain!");
      resolve();
    } catch (e) {
      console.log(`Error connecting to blockchain: ${e.message}`);
      console.log("Retrying connection to blockchain...");
      setTimeout(newWeb3Connection, 5000);
    }
  });
};

module.exports = newWeb3Connection;
