import React, { Component } from "react";
// import "./App.css";
import web3 from "./web3.js";
import profileAbi from "./profile";

const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));

const playerOne = "0xe5CC286DeB70167dab81c776e1f7cDfaDA43F8ca";

// I make then 2 different variables as I try to make these 2 different scenarios detailed as possible.
// In our frontend these 2 variables will be the same one
const address = playerOne;

// For testing purposes only!
const playerTwo = "0xC3E4e88A37A5Cfd425E8aAb987b2e4F789De639d";

const compiledBinaryContract = require("./solidity/build/BinaryContract.json");

const profile = new web3.eth.Contract(profileAbi, playerOne);

class Test extends Component {
  state = {
    friendsAddress: "",
    friendRequestIndex: "",
    playerOne: "",
    providedAmount: "",
    playerTwo: "",
    // validityInDays: "",
    // message: "",
  };

  async componentDidMount() {
    let ethereum = window.ethereum;
    if (typeof ethereum !== "undefined") {
      await ethereum.enable();
    }
  }

  // TODO Omer: rename exchange -> request
  //////////////////////////////////////////////////////////////////////////////////////

  // Add a friend exchange for both our exchanges and friend exchanges
  onSubmitAddFriendRequest = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us friendsProfile address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.friendsAddress
    );

    // NOTE: that's how I convert between a batch request and 2 seperate "send" requests:

    // // Sending friend requests
    // await friendsProfile.methods
    //   .addFriendRequestNotRestricted(playerOne)
    //   .send({ from: accounts[0], gas: 1000000 });

    // // Sending profile requests
    // await profile.methods
    //   .addFriendRequest(this.state.friendsAddress)
    //   .send({ from: accounts[0], gas: 1000000 });

    makeBatchRequest([
      // add both of the exchanges in a batch request.
      profile.methods.addFriendRequest(this.state.friendsAddress).send,
      friendsProfile.methods.addFriendRequestNotRestricted(address).send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();
      console.log(accounts[0]);

      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "1000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////

  // Confirm a friend exchange for both our exchanges and friend exchanges
  onSubmitConfirmFriendRequest = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us friendsProfile address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.friendsAddress
    );

    //Finding friend's exchange index:
    let friendExchanges = await friendsProfile.methods.getAllExchanges().call();

    let friendRequestIndex;

    for (let index = 0; index < friendExchanges.length; index++) {
      const friendExchange = friendExchanges[index];

      //"0" represents addFriendRequest Enum
      if (
        // if it is a friendRequest and the source is my friend
        friendExchange.exchangePurpose === "0" &&
        friendExchange.exchangeDetails.source === this.state.friendsAddress
      ) {
        friendRequestIndex = index;
      }
    }

    makeBatchRequest([
      // add both of the exchanges in a batch request.

      // In our frontend the user will choose the correct request, here I test it with 0 as there is only one request
      profile.methods.confirmFriendRequest(0).send,
      friendsProfile.methods.confirmFriendRequestNotRestricted(
        friendRequestIndex
      ).send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "1000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////

  // Getting my friends
  onCheckMyFriends = async (event) => {
    event.preventDefault();

    console.log("your friends are:");
    console.log(await profile.methods.getFriends().call());
  };

  //////////////////////////////////////////////////////////////////////////////////////
  // Remove Friends list for both our friends and friend's friends
  onRemoveFriendsList = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us friend's profile address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.friendsAddress
    );

    makeBatchRequest([
      // remove both of the exchanges in a batch request.
      profile.methods.removeAllFriends().send,
      friendsProfile.methods.removeAllFriends().send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "1000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////    BINARY_CONTRACT PART         //////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////

  // Add a debt request for both our exchanges and target exchanges
  onSubmitAddDebtRequest = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us friendsProfile address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.playerTwo
    );

    makeBatchRequest([
      // add both of the exchanges in a batch request.
      // the difference: addDebtRequest(destination, same other args), addDebtRequestNotRestricted(source, same other args)
      profile.methods.addDebtRequest(
        this.state.playerTwo,
        this.state.playerOne,
        this.state.providedAmount,
        this.state.playerTwo
      ).send,
      friendsProfile.methods.addDebtRequestNotRestricted(
        this.state.playerOne,
        this.state.playerOne,
        this.state.providedAmount,
        this.state.playerTwo
      ).send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      // let promises = calls.map(call => {
      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "1000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////

  // Confirm a debt request for both our exchanges and target exchanges
  onSubmitConfirmDebtRequest = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Setting this.state.{playerOne, Two, amount} from the request details:
    let myExchanges = await profile.methods.getAllExchanges().call();
    let choosenRequest = myExchanges[0]; // TODO: I use myExchanges[0] for testing only! The user will pick the correct one

    this.setState({ playerTwo: choosenRequest.transaction.from });
    this.setState({ playerOne: choosenRequest.transaction.to });
    this.setState({ providedAmount: choosenRequest.transaction.amount });

    let myContracts = await profile.methods.getContracts().call();

    let existedContractAddress; // if a contract will be deployed, we will use this variable. Otherwise, we will use deployedContractAddress
    let deployedContractAddress;
    let contractExisted = false;

    for (var i = 0; i < myContracts.length; i++) {
      // in this for loop we try to find if a contract exist, or we should create one
      let currentBinaryContract = await new web3.eth.Contract(
        JSON.parse(compiledBinaryContract.interface),
        (existedContractAddress = myContracts[i])
      );

      let currentDebtOfCurrentBinaryContract = await currentBinaryContract.methods
        .getCurrentDebt()
        .call();
      let accountsOfTransaction = [this.state.playerOne, this.state.playerTwo];

      if (
        accountsOfTransaction.includes(
          String(currentDebtOfCurrentBinaryContract.debtor)
        ) &&
        accountsOfTransaction.includes(
          String(currentDebtOfCurrentBinaryContract.creditor)
        )
      ) {
        // it means that the contract already exist

        await currentBinaryContract.methods
          .addTransaction(
            this.state.playerOne,
            this.state.providedAmount,
            this.state.playerTwo
          )
          .send({
            from: accounts[0],
            gas: "2000000",
          });

        contractExisted = true;

        break;
      }
    } // end of for loop - now we know if the contract existed or not

    if (!contractExisted) {
      // deploy a binaryContract
      await profile.methods
        .createBinaryContract(
          this.state.playerOne,
          this.state.providedAmount,
          this.state.playerTwo
        )
        .send({
          from: accounts[0],
          gas: "4000000",
        });

      console.log("Binary contract was created successfully!");

      deployedContractAddress = await profile.methods.getLastContract().call();
    }

    let currentBinaryContractAddress = contractExisted
      ? existedContractAddress
      : deployedContractAddress;
    let currentBinaryContract = await new web3.eth.Contract(
      JSON.parse(compiledBinaryContract.interface),
      currentBinaryContractAddress
    );

    let friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.playerTwo
    );

    // we assign a zeroAddress if the contract already existed. Otherwise, the deployed contract address
    let newContractAddress = contractExisted
      ? await profile.methods.getZeroAddress().call()
      : deployedContractAddress;

    makeBatchRequest([
      // remove both of the exchanges in a batch request.

      // We call this method in order to remove our exchange on the profile (solidity)
      // TODO: when implementing it with the actual frontend, we should send the actual index instead of "0"
      profile.methods.confirmDebtRequest(0).send,

      // We call this method in order to remove friend's exchange (solidity method)
      // TODO: when implementing it with the actual frontend, we should send the actual index instead of "0"
      friendsProfile.methods.confirmDebtRequestNotRestricted(
        0,
        newContractAddress
      ).send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      // let promises = calls.map(call => {
      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "2000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////

  // Getting my exchanges
  onCheckMyExchanges = async (event) => {
    event.preventDefault();

    console.log("your exchanges are:");
    console.log(await profile.methods.getAllExchanges().call());
  };
  //////////////////////////////////////////////////////////////////////////////////////

  // Getting my contracts
  onCheckMyContracts = async (event) => {
    event.preventDefault();

    console.log("your contracts are:");
    console.log(await profile.methods.getContracts().call());
  };
  //////////////////////////////////////////////////////////////////////////////////////

  // Remove Exchanges list for both our exchanges and friend exchanges
  onRemoveExchangesList = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us playerTwo's address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.playerTwo
    );

    makeBatchRequest([
      // remove both of the exchanges in a batch request.
      profile.methods.removeAllExchanges().send,
      friendsProfile.methods.removeAllExchanges().send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "2000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////
  // Remove Contracts list for both our contracts and friend contracts
  onRemoveContractsList = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();

    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us playerTwo's address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.playerTwo
    );

    makeBatchRequest([
      // remove both of the exchanges in a batch request.
      profile.methods.removeContracts().send,
      friendsProfile.methods.removeContracts().send,
    ]);
    function makeBatchRequest(calls) {
      let batch = new web3.BatchRequest();

      calls.map((call) => {
        return new Promise((res, rej) => {
          let req = call.request(
            { from: accounts[0], gas: "2000000" },
            (err, data) => {
              if (err) rej(err);
              else res(data);
            }
          );
          batch.add(req);
        });
      });
      batch.execute();
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////

  // All the handlers:

  handleChangeFriendAddress = (event) => {
    event.preventDefault();
    this.setState({ friendsAddress: event.target.value });
  };

  handleChangeFriendRequestIndex = (event) => {
    event.preventDefault();
    this.setState({ friendRequestIndex: event.target.value });
  };

  handleChangePlayerOne = (event) => {
    event.preventDefault();
    this.setState({ playerOne: event.target.value });
  };

  handleChangeProvidedAmount = (event) => {
    event.preventDefault();
    this.setState({ providedAmount: event.target.value });
  };

  handleChangePlayerTwo = (event) => {
    event.preventDefault();
    this.setState({ playerTwo: event.target.value });
  };

  render() {
    return (
      <Dashboard />
      // <div>
      //   {/* <Dashboard /> */}
      //   <h2>Friends Part</h2>
      //   <form onSubmit={this.onSubmitAddFriendRequest}>
      //     <label>
      //       Add a friend: insert here the friend's address
      //       <input
      //         type="text"
      //         value={this.state.friendsAddress}
      //         onChange={this.handleChangeFriendAddress}
      //         name="name"
      //       />
      //     </label>
      //     <input type="submit" value="Send a friend Request!" />
      //   </form>

      //   <form onSubmit={this.onSubmitConfirmFriendRequest}>
      //     <label>
      //       Confirm a friend request (insert friend's address)
      //       <input
      //         type="text"
      //         value={this.state.friendsAddress}
      //         onChange={this.handleChangeFriendAddress}
      //         name="name"
      //       />
      //     </label>
      //     <input type="submit" value="Confirm a friend Request!" />
      //   </form>

      //   <form onSubmit={this.onCheckMyFriends}>
      //     <label>Click here to check your Friends!</label>
      //     <input type="submit" value="Check your Friends!" />
      //   </form>

      //   <form onSubmit={this.onRemoveFriendsList}>
      //     <label>Click here to remove your Friends!</label>
      //     <input type="submit" value="Remove your Friends!" />
      //   </form>
      //   <hr />
      //   {/* ****************************************************************** */}
      //   <h2>BinaryContract Part</h2>

      //   <form onSubmit={this.onSubmitAddDebtRequest}>
      //     <label>
      //       playerOne-amount-playerTwo
      //       <input
      //         type="text"
      //         value={this.state.playerOne}
      //         onChange={this.handleChangePlayerOne}
      //         name="name"
      //       />
      //       <input
      //         type="text"
      //         value={this.state.providedAmount}
      //         onChange={this.handleChangeProvidedAmount}
      //         name="name"
      //       />
      //       <input
      //         type="text"
      //         value={this.state.playerTwo}
      //         onChange={this.handleChangePlayerTwo}
      //         name="name"
      //       />
      //     </label>
      //     <input type="submit" value="Send a Debt Request!" />
      //   </form>

      //   <form onSubmit={this.onSubmitConfirmDebtRequest}>
      //     <label>
      //       playerOne-amount-playerTwo
      //       <input
      //         type="text"
      //         value={this.state.playerOne}
      //         onChange={this.handleChangePlayerOne}
      //         name="name"
      //       />
      //       <input
      //         type="text"
      //         value={this.state.providedAmount}
      //         onChange={this.handleChangeProvidedAmount}
      //         name="name"
      //       />
      //       <input
      //         type="text"
      //         value={this.state.playerTwo}
      //         onChange={this.handleChangePlayerTwo}
      //         name="name"
      //       />
      //     </label>
      //     <input type="submit" value="Confirm a Debt Request!" />
      //   </form>

      //   <form onSubmit={this.onCheckMyContracts}>
      //     <label>Click here to check your contracts!</label>
      //     <input type="submit" value="Check your contracts!" />
      //   </form>

      //   <form onSubmit={this.onCheckMyExchanges}>
      //     <label>Click here to check your Exchanges!</label>
      //     <input type="submit" value="Check your Exchanges!" />
      //   </form>

      //   <form onSubmit={this.onRemoveContractsList}>
      //     <label>Click here to remove your Contracts!</label>
      //     <input type="submit" value="Remove your Contracts!" />
      //   </form>

      //   <form onSubmit={this.onRemoveExchangesList}>
      //     <label>Click here to remove your Exchanges!</label>
      //     <input type="submit" value="Remove your Exchanges!" />
      //   </form>
      // </div>
    );
  }
}

export default Test;
