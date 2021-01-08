const HDWalletprovider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const compiledFactory = require('./build/CampaignFactory.json');

const provdier = new HDWalletprovider(
    'page basic neutral unaware target rather tattoo poet dutch flag luxury minute',
    'https://ropsten.infura.io/v3/9ba5464e1e3e43da9d605d467f5b4f74'
);

const web3 = new Web3(provdier);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({
            data: compiledFactory.bytecode,
        })
        .send({
            gas: '1000000',
            from: accounts[0]
        });

        console.log('Contract deployed to ', result.options.address);
    };

deploy();