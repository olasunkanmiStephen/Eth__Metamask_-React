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

  return (
    <div>
      <h1>Metamask Wallet Connection</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <h3>Address: {defaultAccount}</h3>
      <h3>Balance: {userBalance} ETH</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Metamask;
