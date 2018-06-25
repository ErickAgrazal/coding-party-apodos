const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compiled/Apodos.json');

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let contract;

removeNullPadding = (s) => {
    return s.replace(/\0/g, '');
}

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    contract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
    contract.setProvider(provider);
})

describe('Apodos', () => {
    it('Deploys the contract', async () => {
        assert.ok(contract.options.address);
    });

    it('Register, retrieve and transfer a nickname', async () => {
        // Creates a nickname
        const nickname = 'Ficha';
        const nicknameInHex = web3.utils.asciiToHex(nickname);
        const registeredNicknameResponse = await contract.methods
            .registerNickname(nicknameInHex)
            .send({ from: accounts[0], gas: '1000000' });
        const { registeredNickname } = registeredNicknameResponse
            .events
            .LogNickname
            .returnValues;

        // Assertions
        assert.equal(nickname, removeNullPadding(web3.utils.toAscii(registeredNickname)));

        // Retrieve a stored nickname
        const retrievedNickname = await contract.methods
            .getMyNickname()
            .call({ from: accounts[0], gas: '1000000' });

        // Assertions
        assert.equal(nickname, removeNullPadding(web3.utils.toAscii(retrievedNickname)));
    
        // Transfer nickname
        const transferedNicknameResponse = await contract.methods
            .transferNickname(accounts[1])
            .send({ from: accounts[0], gas: '1000000' });

        const { newOwner, transferedNickname } = transferedNicknameResponse
            .events
            .LogTransferNickname
            .returnValues;
        
        // Assertions
        assert.equal(accounts[1], newOwner);
        assert.equal(nickname, removeNullPadding(web3.utils.toAscii(transferedNickname)));
    });

    it('Fails to register an already registed nickname', async () => {
        // Creates a nickname
        const nickname = 'Ficha';
        const nicknameInHex = web3.utils.asciiToHex(nickname);
        const registeredNicknameResponse1 = await contract.methods
            .registerNickname(nicknameInHex)
            .send({ from: accounts[0], gas: '1000000' });
        const { registeredNickname1 } = registeredNicknameResponse1
            .events
            .LogNickname
            .returnValues;

        try {
            const registeredNicknameResponse2 = await contract.methods
                .registerNickname(nicknameInHex)
                .send({ from: accounts[1], gas: '1000000' });
            const { registeredNickname2 } = registeredNicknameResponse2
                .events
                .LogNickname
                .returnValues;
            assert(false, 'the contract not register an already registered nick.') 
        } catch (error) { 
            assert( /invalid opcode|revert/.test(error), 
                   'the error message should be invalid opcode or revert' ) 
        }

    })
})