// src/components/TokenManager.jsx
import React, { useState } from 'react';
import * as splToken from '@solana/spl-token';
import * as solanaWeb3 from '@solana/web3.js';

const TokenManager = ({ connection, publicKey }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [tokenMint, setTokenMint] = useState(null);
  const [tokenAccount, setTokenAccount] = useState(null);
  const [lastTxSignature, setLastTxSignature] = useState(null);

  const createToken = async () => {
    try {
      if (!connection || !publicKey) {
        throw new Error('Wallet not connected properly');
      }

      setStatus('Creating token...');
      console.log('Creating mint with:', { connection, payer: publicKey.toString() });

      const mint = await splToken.createMint(
        connection,
        publicKey,          // Payer
        publicKey,          // Mint Authority
        null,              // Freeze Authority
        9                  // Decimals
      );

      console.log('Mint created:', mint);

      if (!mint || !(mint instanceof solanaWeb3.PublicKey)) {
        throw new Error('Failed to create mint - invalid mint object');
      }

      const associatedTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey
      );

      console.log('Associated token account:', associatedTokenAccount);

      setTokenMint(mint);
      setTokenAccount(associatedTokenAccount.address);
      setStatus(`Token created successfully! Mint Address: ${mint.toString()}`);
    } catch (err) {
      console.error('Token creation error:', err);
      setStatus(`Error: ${err.message}`);
    }
  };

  const mintTokens = async () => {
    try {
      if (!tokenMint) throw new Error('Create a token first');
      setStatus('Minting tokens...');
      const txSignature = await splToken.mintTo(
        connection,
        publicKey,
        tokenMint,
        tokenAccount,
        publicKey,
        parseInt(mintAmount)
      );
      setLastTxSignature(txSignature);
      setStatus('Tokens minted successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const sendTokens = async () => {
    try {
      if (!tokenMint) throw new Error('Create a token first');
      setStatus('Sending tokens...');
      const destPublicKey = new solanaWeb3.PublicKey(recipient);
      const destAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        tokenMint,
        destPublicKey
      );
      const txSignature = await splToken.transfer(
        connection,
        publicKey,
        tokenAccount,
        destAccount.address,
        publicKey,
        parseInt(mintAmount)
      );
      setLastTxSignature(txSignature);
      setStatus('Tokens sent successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
        {status && (
        <div className={`mt-2 p-2 rounded ${status.includes('Error') ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
          <p>{status}</p>
          {lastTxSignature && !status.includes('Error') && (
            <p className="text-sm mt-1">
              Transaction Signature: 
              <a 
                href={`https://explorer.solana.com/tx/${lastTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500"
              >
                {lastTxSignature.slice(0, 8)}...{lastTxSignature.slice(-8)}
              </a>
            </p>
          )}
        </div>
      )}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Create Token</h2>
        <input
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createToken}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Create Token
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Mint Tokens</h2>
        <input
          type="number"
          placeholder="Amount to mint"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={mintTokens}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Mint Tokens
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Send Tokens</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Amount to send"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendTokens}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Send Tokens
        </button>
      </div>
    </div>
  );
};

export default TokenManager;