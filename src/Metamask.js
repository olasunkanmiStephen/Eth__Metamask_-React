import React, { useEffect, useState } from 'react';

const Metamask = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

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

  const accountChanged = (accountName) => {
    setDefaultAccount(accountName);
    getUserBalance(accountName);
  };

  const getUserBalance = (accountAddress) => {
    window.ethereum
      .request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest'],
      })
      .then(balance => {
        // Convert hex balance (wei) → decimal ETH
        const ethBalance = parseFloat(parseInt(balance, 16) / 1e18).toFixed(4);
        setUserBalance(ethBalance);
      })
      .catch(err => setErrorMessage(err.message));
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accountChanged);

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // Send Transaction
  const sendTransaction = async (e) => {
    e.preventDefault();

    if (!defaultAccount) {
      setErrorMessage("Please connect MetaMask first");
      return;
    }

    try {
      const txParams = {
        from: defaultAccount,
        to: "0x9d9bEA3C852BE30c4738C9fFcB18622fE8a2e5FF", 
        gas: "0x5208", 
        gasPrice: "0x2540be400",
        value: "0x2386f26fc10000", 
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

  return (
    <div>
      <h1>Metamask Wallet Connection</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <h3>Address: {defaultAccount}</h3>
      <h3>Balance: {userBalance} ETH</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={sendTransaction}>
        <input type="submit" value="Send 0.01 ETH" />
      </form>
    </div>
  );
};

export default Metamask;
