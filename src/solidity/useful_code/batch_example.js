// BATCH example
    // // let [returnValueFromCall,publicProp,txid] =
    // makeBatchRequest([
    //   binaryContract.methods.addTransaction(address, 8, address).send,
    //   binaryContract.methods.addTransaction(address, 6, address).send,
    //   // contract.methods.makeAChange().send
    // ])
    // function makeBatchRequest(calls) {
    //   let batch = new web3.BatchRequest();

    //   // let promises = calls.map(call => {
    //   calls.map(call => {
    //     return new Promise((res, rej) => {
    //       let req = call.request({ from: accounts[0], gas: "2000000" }, (err, data) => {
    //         if (err) rej(err);
    //         else res(data)
    //       });
    //       batch.add(req)
    //     })
    //   })
    //   batch.execute()

    //   // return Promise.all(promises)
    // }