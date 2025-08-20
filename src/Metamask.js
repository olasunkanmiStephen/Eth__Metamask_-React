import React, { useEffect, useState } from 'react';

const Metamask = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [salesValue, setSalesValue] = useState("0x0"); // store product price here

  // 🔹 Connect to MetaMask wallet
  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(result => {
          accountChanged(result[0]);
        })
        .catch(err => setErrorMessage(err.message));
    } else {
      setErrorMessage('Please install MetaMask!');
    }
  };

  // 🔹 Update account when changed
  const accountChanged = (accountName) => {
    setDefaultAccount(accountName);
    getUserBalance(accountName);
  };

  // 🔹 Get account balance in ETH
  const getUserBalance = (accountAddress) => {
    window.ethereum
      .request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest'],
      })
      .then(balance => {
        const ethBalance = parseFloat(parseInt(balance, 16) / 1e18).toFixed(4);
        setUserBalance(ethBalance);
      })
      .catch(err => setErrorMessage(err.message));
  };

  // 🔹 Listen for account/chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accountChanged);
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // 🔹 Send ETH Transaction
  const sendTransaction = async (e) => {
    e.preventDefault();

    if (!defaultAccount) {
      setErrorMessage("Please connect MetaMask first");
      return;
    }

    try {
      const txParams = {
        from: defaultAccount,                       // sender = connected wallet
        to: e.target.to_address.value,              // receiver from input field
        gas: "0x5208",                              // 21000 gas
        gasPrice: "0x2540be400",                    // ~10 gwei
        value: salesValue,                          // dynamic product value
      };

      const result = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      console.log("Transaction Hash:", result);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  };

  // 🔹 Product picker form (sets product price)
  const productPicker = (e) => {
    e.preventDefault();

    let selectedProduct = e.target.product_form.value; // access selected option
    let sales_value;

    if (selectedProduct === "product1") {
      sales_value = 1000000000000000; // 0.001 ETH in wei
    }
    if (selectedProduct === "product2") {
      sales_value = 2000000000000000; // 0.002 ETH
    }
    if (selectedProduct === "product3") {
      sales_value = 3000000000000000; // 0.003 ETH
    }

    // Convert number → hex with 0x prefix
    setSalesValue("0x" + sales_value.toString(16));
    console.log("Selected Product:", selectedProduct, "Value:", sales_value);
  };

  return (
    <div>
      <h1>Metamask Wallet Connection</h1>

      {/* Connect MetaMask */}
      <button onClick={connectWallet}>Connect Wallet</button>

      <h3>Address: {defaultAccount}</h3>
      <h3>Balance: {userBalance} ETH</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Transaction Form */}
      <form onSubmit={sendTransaction}>
        <h3>Enter Transaction Address</h3>
        <input type='text' name="to_address" placeholder="Receiver Address" required />
        <input type="submit" value="Send Payment" />
      </form>

      <hr />

      {/* Product Picker */}
      <form onSubmit={productPicker}>
        <label>Book a session: </label>
        <select name="product_form" id="product_form">
          <option value="product1">Product 1 - 0.001 ETH</option>
          <option value="product2">Product 2 - 0.002 ETH</option>
          <option value="product3">Product 3 - 0.003 ETH</option>
        </select>
        <input type='submit' value="Select Product" />
      </form>

      <h3>Selected Product Value: {parseInt(salesValue, 16) / 1e18} ETH</h3>
    </div>
  );
};

export default Metamask;
