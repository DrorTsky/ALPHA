import React, { lazy, Component } from "react";

// TEST RELATED
import web3 from "../../web3.js";
import profileAbi from "../../profile";

import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormGroup,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInputGroupAppend,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

const playerOne = "0xC3E4e88A37A5Cfd425E8aAb987b2e4F789De639d";

// I make then 2 different variables as I try to make these 2 different scenarios detailed as possible.
// In our frontend these 2 variables will be the same one
const address = playerOne;

// For testing purposes only!
const playerTwo = "0xe5CC286DeB70167dab81c776e1f7cDfaDA43F8ca";

const compiledBinaryContract = require("../../solidity/build/BinaryContract.json");

const profile = new web3.eth.Contract(profileAbi, playerOne);
// **************************** */

// const WidgetsDropdown = lazy(() => import("../widgets/WidgetsDropdown.js"));
// const WidgetsBrand = lazy(() => import("../widgets/WidgetsBrand.js"));

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friendsAddress: playerTwo,
      friendRequestIndex: "",
      playerOne: playerOne,
      providedAmount: "",
      playerTwo: playerTwo,
      friendsList: [],
      exchanges: {},
      contractsList: [],
    };

    this.onChangeFormInput = this.onChangeFormInput.bind(this);
    this.addFriendFormSubmit = this.addFriendFormSubmit.bind(this);
    this.onSubmitConfirmFriendRequest = this.onSubmitConfirmFriendRequest.bind(
      this
    );
    this.onCheckMyFriends = this.onCheckMyFriends.bind(this);
    this.onRemoveFriendsList = this.onRemoveFriendsList.bind(this);
    this.updateRemovedFriends = this.updateRemovedFriends.bind(this);
    this.onSubmitAddDebtRequest = this.onSubmitAddDebtRequest.bind(this);
    this.onSubmitConfirmDebtRequest = this.onSubmitConfirmDebtRequest.bind(
      this
    );
  }

  async componentDidMount() {
    console.log(this.state.friendsList);
    let ethereum = window.ethereum;
    if (typeof ethereum !== "undefined") {
      await ethereum.enable();
    }
    this.onCheckMyExchanges();
    this.onCheckMyContracts();
    this.onCheckMyFriends();
  }

  // *****************************************************
  //                  ADD FRIEND
  // *****************************************************
  addFriendFormSubmit = async (event) => {
    event.preventDefault();

    // Getting accounts list
    const accounts = await web3.eth.getAccounts();
    // Getting a reference to a friendsProfile - NOTE: it will work only if the user provided us friendsProfile address
    const friendsProfile = new web3.eth.Contract(
      profileAbi,
      this.state.friendsAddress
    );

    // NOTE: that's how I convert between a batch request and 2 seperate "send" requests:

    makeBatchRequest([
      // add both of the exchanges in a batch request.
      profile.methods.addFriendRequest(this.state.friendsAddress).send,
      friendsProfile.methods.addFriendRequestNotRestricted(address).send,
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

  // *****************************************************
  //                  CONFIRM FRIEND
  // *****************************************************
  async onSubmitConfirmFriendRequest(event) {
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
  }
  // *****************************************************
  //                  GET FRIENDS
  // *****************************************************

  onCheckMyFriends = async () => {
    // console.log("your friends are:");
    // console.log(await profile.methods.getFriends().call());
    this.setState({ friendsList: await profile.methods.getFriends().call() });
    // console.log(this.state.friendsList);
  };

  // *****************************************************
  //                  REMOVE FRIENDS
  // *****************************************************
  async updateRemovedFriends() {
    console.log("in remove friends");
    Promise.resolve(this.onRemoveFriendsList()).then(
      this.setState({ friendsList: await profile.methods.getFriends().call() })
      // this.setState({
      //   ...this.state,
      //   friendsList: {
      //     ...this.state.friendsList,
      //     [address]: await profile.methods.getFriends().call(),
      //   },
      // })
    );
  }
  onRemoveFriendsList = async () => {
    // event.preventDefault();
    console.log("in onRemoveFriendsList");
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

  // *****************************************************
  //               BINARY_CONTRACT PART
  // *****************************************************

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
  onCheckMyExchanges = async () => {
    console.log("your exchanges are:");
    if ((await profile.methods.getAllExchanges().call())[0] !== undefined) {
      console.log((await profile.methods.getAllExchanges().call())[0]);
      var exchange = {};
      Promise.resolve(
        (exchange = (await profile.methods.getAllExchanges().call())[0]
          .transaction)
      ).then(
        this.setState({
          exchanges: (await profile.methods.getAllExchanges().call())[0]
            .transaction,
        })
      );
    }
  };
  //////////////////////////////////////////////////////////////////////////////////////

  // Getting my contracts
  onCheckMyContracts = async () => {
    // console.log("your contracts are:");
    // console.log(await profile.methods.getContracts().call());
    this.setState({
      contractsList: await profile.methods.getContracts().call(),
    });
    console.log(this.state.exchanges);
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

  // *****************************************************
  //                  FORM CHANGE HANDLERS
  // *****************************************************

  onChangeFormInput(event) {
    event.preventDefault();
    const {
      target: { name, value },
    } = event;
    this.setState({ [name]: value });
  }

  // *****************************************************
  //                       RENDER
  // *****************************************************

  render() {
    return (
      <>
        <CRow>
          <CCol xs="12" md="4">
            <CCard>
              <CForm
                action=""
                method="post"
                className="form-horizontal"
                onSubmit={this.addFriendFormSubmit}
              >
                <CCardHeader>Add Friend</CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="12">
                      <CInputGroup>
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          id="input1-group1"
                          name="friendsAddress"
                          placeholder="Username"
                          value={this.state.friendsAddress}
                          onChange={this.onChangeFormInput}
                        />
                      </CInputGroup>
                    </CCol>
                  </CFormGroup>
                </CCardBody>
                <CCardFooter>
                  <CButton type="submit" size="sm" color="success">
                    <CIcon name="cil-scrubber" /> Submit
                  </CButton>
                  <CButton type="reset" size="sm" color="danger">
                    <CIcon name="cil-ban" /> Reset
                  </CButton>
                </CCardFooter>
              </CForm>
            </CCard>
          </CCol>
          <CCol xs="12" md="4">
            <CCard>
              <CForm
                action=""
                method="post"
                className="form-horizontal"
                onSubmit={this.onSubmitConfirmFriendRequest}
              >
                <CCardHeader>Confirm Friend</CCardHeader>
                <CCardBody>
                  <CFormGroup row>
                    <CCol md="12">
                      <CInputGroup>
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          id="input2-group2"
                          name="input2-group2"
                          placeholder="Confirmation"
                          value={this.state.friendsAddress}
                          onChange={this.onChangeFormInput}
                        />
                      </CInputGroup>
                    </CCol>
                  </CFormGroup>
                </CCardBody>
                <CCardFooter>
                  <CButton type="submit" size="sm" color="success">
                    <CIcon name="cil-scrubber" /> Submit
                  </CButton>
                  <CButton type="reset" size="sm" color="danger">
                    <CIcon name="cil-ban" /> Reset
                  </CButton>
                </CCardFooter>
              </CForm>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol xs="12" md="6" xl="6">
            <CCard>
              <CCardHeader>Friends List</CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <table className="table table-hover table-outline mb-0 ">
                    <thead className="thead-light">
                      <tr>
                        <th>Friends Address</th>
                        <th>Friends Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.friendsList.map((friend) => (
                        <tr key={friend}>
                          <td>
                            <div>{friend}</div>
                          </td>
                          <td>
                            <div>friend name</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  color="success"
                  onClick={this.onCheckMyFriends}
                >
                  <CIcon name="cil-user" /> Check Friends
                </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  onClick={this.updateRemovedFriends}
                >
                  <CIcon name="cil-user-unfollow" /> Remove Friends
                </CButton>
              </CCardFooter>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol xs="12" sm="4">
            <CCard>
              <CCardHeader>Send Debt Request</CCardHeader>
              <CCardBody>
                <CForm
                  action=""
                  method="post"
                  onSubmit={this.onSubmitAddDebtRequest}
                >
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="fromDebtRequest"
                        name="playerOne"
                        placeholder="From"
                        autoComplete="name"
                        value={this.state.playerOne}
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="toDebtRequest"
                        name="friendsAddress"
                        placeholder="To"
                        autoComplete="To"
                        value={this.state.friendsAddress}
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="amountDebt"
                        name="providedAmount"
                        placeholder="Amount"
                        autoComplete="amount"
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-dollar" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup className="form-actions">
                    <CButton type="submit" size="sm" color="secondary">
                      Send a Debt Request
                    </CButton>
                  </CFormGroup>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs="12" sm="4">
            <CCard>
              <CCardHeader>Confirm Debt Request</CCardHeader>
              <CCardBody>
                <CForm
                  action=""
                  method="post"
                  onSubmit={this.onSubmitConfirmDebtRequest}
                >
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="fromConfirm"
                        name="friendsAddress"
                        placeholder="from"
                        autoComplete="From"
                        value={this.state.friendsAddress}
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="toConfirm"
                        name="playerOne"
                        placeholder="To"
                        autoComplete="to"
                        value={this.state.playerOne}
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup>
                    <CInputGroup>
                      <CInput
                        id="amount"
                        name="providedAmount"
                        placeholder="Amount"
                        autoComplete="amount"
                        onChange={this.onChangeFormInput}
                      />
                      <CInputGroupAppend>
                        <CInputGroupText>
                          <CIcon name="cil-dollar" />
                        </CInputGroupText>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CFormGroup>
                  <CFormGroup className="form-actions">
                    <CButton type="submit" size="sm" color="secondary">
                      Confirm a Debt Request
                    </CButton>
                  </CFormGroup>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol xs="12" md="4" xl="4">
            <CCard>
              <CCardHeader>Contracts</CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <table className="table table-hover table-outline mb-0 ">
                    <thead className="thead-light">
                      <tr>
                        <th>Friends Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.contractsList.map((contract) => (
                        <tr key={contract}>
                          <td>
                            <div>{contract}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  color="success"
                  onClick={this.onCheckMyContracts}
                >
                  <CIcon name="cil-user" /> Check Contracts
                </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  onClick={this.onRemoveContractsList}
                >
                  <CIcon name="cil-user-unfollow" /> Remove Contracts
                </CButton>
              </CCardFooter>
            </CCard>
          </CCol>
          <CCol xs="12" md="8" xl="8">
            <CCard>
              <CCardHeader>Exchanges</CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <table className="table table-hover table-outline mb-0 ">
                    <thead className="thead-light">
                      <tr>
                        <th>from Address</th>
                        <th>to Address</th>
                        <th>amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.exchanges === undefined ? (
                        <p>loading..</p>
                      ) : (
                        <tr key={this.state.exchanges.date}>
                          <td>
                            <div>{this.state.exchanges.from}</div>
                          </td>
                          <td>
                            <div>{this.state.exchanges.to}</div>
                          </td>
                          <td>
                            <div>{this.state.exchanges.amount}</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  color="success"
                  onClick={this.onCheckMyExchanges}
                >
                  <CIcon name="cil-user" /> Check Exchanges
                </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  onClick={this.onRemoveExchangesList}
                >
                  <CIcon name="cil-user-unfollow" /> Remove Exchanges
                </CButton>
              </CCardFooter>
            </CCard>
          </CCol>
        </CRow>
      </>
    );
  }
}

export default Dashboard;
