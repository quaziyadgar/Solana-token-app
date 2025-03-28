// src/components/WalletConnector.jsx
import React, { useState } from 'react';
import * as solanaWeb3 from '@solana/web3.js';

const WalletConnector = ({ setConnection, setPublicKey, setBalance }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.solana) {
        throw new Error(
          'Phantom wallet not detected. Please install the Phantom extension from https://phantom.app/'
        );
      }

      if (!window.solana.isPhantom) {
        throw new Error('Please use the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const pubKey = new solanaWeb3.PublicKey(response.publicKey.toString());
      setPublicKey(pubKey);

      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('devnet'),
        'confirmed'
      );
      setConnection(connection);

      const balance = await connection.getBalance(pubKey);
      setBalance(balance / solanaWeb3.LAMPORTS_PER_SOL);
      
      setWalletConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    window.solana.disconnect();
    setWalletConnected(false);
    setPublicKey(null);
    setConnection(null);
    setBalance(null);
    setError(null);
  };

  return (
    <div className="p-4">
      {!walletConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
        </button>
      ) : (
        <button
          onClick={disconnectWallet}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Disconnect Wallet
        </button>
      )}
      {error && (
        <p className="text-red-500 mt-2">
          {error.includes('Phantom') ? (
            <>
              {error}{' '}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500"
              >
                Download here
              </a>
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
};

export default WalletConnector;