const Web3 = require('web3');

const web3 = new Web3(window.ethereum);

window.ethereum.autoRefreshOnNetworkChange = false;

export default web3;