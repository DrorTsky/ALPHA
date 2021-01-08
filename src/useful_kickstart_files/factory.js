import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xB6D8e8cFB5E6e0C0a10B2EDe3D107cB123bC2141'
);

export default instance;