pragma solidity ^0.4.17;

contract BinaryContract{

    struct Transaction {
        address from;
        address to;
        uint amount;
        uint date;
    }

    // We have that struct as it stores the current contract status (the "sum" of all the contract's transactions)
    // It saves power/money for the caller - every time a user adds a debt - it changes the ContractDebt as well
    struct ContractDebt{
        address debtor;
        address creditor;
        uint amountOwned;
    }

    uint creationDate;
    uint validityInDays;
    bool isValid = true;
    address playerOne;
    address playerTwo;

    ContractDebt currentDebt;

    Transaction[] binContractTransactionsLog;

    // E.g. BinaryContract(player1, 2, player2) == deploy a new contract, where player 1 owes 2 shekels to player 2
    function BinaryContract(address providedCreditor, uint amount, address providedDebtor) public{
        playerOne = providedDebtor;
        playerTwo = providedCreditor;

        addTransaction(providedCreditor, amount, providedDebtor);
    }

    function addTransaction (address sender, uint amount, address receiver) public {
        Transaction memory transaction = Transaction({
            from: sender,
            to: receiver,
            amount: amount,
            date: block.timestamp
        });

        binContractTransactionsLog.push(transaction);

        updateContractDebt(sender, amount, receiver);
    }

    function updateContractDebt (address sender, uint amount, address receiver) public {
        if(binContractTransactionsLog.length != 1){ // in the constructor we just pushed the only transaction
            if (currentDebt.debtor != sender){ // means the debtor now in a bigger debt
            currentDebt.amountOwned += amount;
            } else { // means the debtor is the sender
                if (amount > currentDebt.amountOwned){
                     updateDebtor(receiver);
                     updateCreditor(sender);
                     currentDebt.amountOwned =  amount - currentDebt.amountOwned;
                } else{
                    currentDebt.amountOwned -= amount;
                }
            }
        } else {
            currentDebt.debtor = receiver;
            currentDebt.creditor = sender;
            currentDebt.amountOwned = amount;
        }
    }

    function updateDebtor(address newDebtor) public {
        currentDebt.debtor = newDebtor;
    }

    function updateCreditor(address newCreditor) public {
        currentDebt.creditor = newCreditor;
    }

    function getCurrentDebtorAddress() public view returns(address){
        return currentDebt.debtor;
    }

    // not implemented yet
    //// function getCurrentDebtorName() public view returns(string memory){
    ////     //return currentDebt.debtor name
    //// }

    function getCurrentCreditorAddress() public view returns(address){
        return currentDebt.creditor;
    }

    // not implemented yet
    //// function getCurrentCreditorName() public view returns(string memory){
    ////     //return currentDebt.creditor name
    //// }

    function getCurrentDebtAmount() public view returns(uint){
        return currentDebt.amountOwned;
    }

    function getCurrentDebt() public view returns(ContractDebt){
        return currentDebt;
    }

    modifier ifValid(){
        if (block.timestamp > creationDate + validityInDays * 1 days){
            isValid = false;
        }
        require(isValid);
        _;
    }
}