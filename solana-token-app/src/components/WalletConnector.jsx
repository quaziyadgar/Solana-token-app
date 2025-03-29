import React, { useState } from 'react';
import * as solanaWeb3 from '@solana/web3.js';

const WalletConnector = ({ setConnection, setPublicKey, setBalance }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [solBalance, setSolBalance] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not detected. Please install from https://phantom.app/');
      }

      const response = await window.solana.connect();
      const pubKey = new solanaWeb3.PublicKey(response.publicKey.toString());
      setPublicKey(pubKey);

      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('devnet'),
        'confirmed'
      );
      setConnection(connection);

      const balanceLamports = await connection.getBalance(pubKey);
      console.log('Initial balance (lamports):', balanceLamports);
      const balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Initial balance (SOL):', balanceSol);

      if (balanceLamports < 0) {
        throw new Error('Negative lamports detected. Something is wrong with the balance fetch.');
      }
      if (balanceSol < 0) {
        throw new Error('Negative SOL balance calculated. Check conversion logic.');
      }

      setBalance(balanceSol);
      setSolBalance(balanceSol);

      if (balanceSol < 0.005) {
        setError('Insufficient SOL. Need at least 0.005 SOL for token operations. Get more from https://faucet.solana.com/');
      }

      setWalletConnected(true);
    } catch (err) {
      console.error('Wallet connection error:', err);
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
    setSolBalance(null);
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
        <>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Disconnect Wallet
          </button>
          {solBalance !== null && (
            <p className="mt-2 text-gray-700">Balance: {solBalance.toFixed(6)} SOL</p>
          )}
        </>
      )}
      {error && (
        <p className="text-red-500 mt-2">
          {error.includes('Phantom') || error.includes('SOL') ? (
            <>
              {error}{' '}
              <a
                href={error.includes('Phantom') ? 'https://phantom.app/' : 'https://faucet.solana.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500"
              >
                {error.includes('Phantom') ? 'Download here' : 'Get SOL here'}
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