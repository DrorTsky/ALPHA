const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

// ////////////##### only node deploy ######////////////////
const profilePath = path.resolve(__dirname, 'contracts', 'ProfileContract.sol');
const source = fs.readFileSync(profilePath, 'utf8');

// const binaryPath = path.resolve(__dirname, 'contracts', 'BinaryContract.sol');
// const source = fs.readFileSync(binaryPath, 'utf8');


// ////////////##### node compile + node deploy ######//////////

// const buildPath = path.resolve(__dirname, 'build');
// fs.removeSync(buildPath);

// const profilePath = path.resolve(__dirname, 'contracts', 'ProfileContract.sol');
// const binaryPath = path.resolve(__dirname, 'contracts', 'BinaryContract.sol');

// const profileSource = fs.readFileSync(profilePath, 'utf8');
// const binarysource = fs.readFileSync(binaryPath, 'utf8');

// const profileOutput = solc.compile(profileSource, 1).contracts;
// const binaryOutput = solc.compile(binarysource, 1).contracts;

// fs.ensureDirSync(buildPath);

// // for (let contract in profileOutput) {
// //     fs.outputJSONSync(path.resolve(buildPath, contract.replace(':', '') + '.json'), profileOutput[contract]);
// // }

// for (let contract in binaryOutput) {
//     fs.outputJSONSync(path.resolve(buildPath, contract.replace(':', '') + '.json'), binaryOutput[contract]);
// }
// module.exports = solc.compile(source, 1).contracts[':BinaryContract'];
module.exports = solc.compile(source, 1).contracts[':ProfileContract'];