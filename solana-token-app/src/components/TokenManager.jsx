import React, { useState } from 'react';
import * as splToken from '@solana/spl-token';
import * as solanaWeb3 from '@solana/web3.js';

const TokenManager = ({ connection, publicKey, setBalance }) => {
  const [tokenName, setTokenName] = useState('');
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
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not detected');
      }

      setStatus('Creating token...');
      console.log('Public Key:', publicKey.toString());

      // Fetch and log balance before transaction
      let balanceLamports = await connection.getBalance(publicKey);
      let balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Balance before creation (lamports):', balanceLamports);
      console.log('Balance before creation (SOL):', balanceSol);
      if (balanceSol < 0.005) {
        throw new Error('Insufficient SOL. Need at least 0.005 SOL for mint and ATA creation.');
      }

      const mintKeypair = solanaWeb3.Keypair.generate();
      const lamports = await splToken.getMinimumBalanceForRentExemptMint(connection);

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: splToken.MINT_SIZE,
          lamports,
          programId: splToken.TOKEN_PROGRAM_ID,
        }),
        splToken.createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          publicKey,
          null,
          splToken.TOKEN_PROGRAM_ID
        )
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Sending transaction to Phantom for signing...');
      const signedTransaction = await window.solana.signTransaction(transaction);
      if (!signedTransaction) {
        throw new Error('Phantom failed to sign the transaction');
      }

      signedTransaction.partialSign(mintKeypair);

      console.log('Sending signed transaction...');
      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('Transaction sent, signature:', txSignature);

      const confirmation = await connection.confirmTransaction({
        signature: txSignature,
        blockhash,
        lastValidBlockHeight,
      });
      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + confirmation.value.err.toString());
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const mint = mintKeypair.publicKey;
      console.log('Attempting to create ATA for mint:', mint.toString());

      let associatedTokenAccount;
      let ataAttempts = 0;
      const maxAttempts = 3;
      while (ataAttempts < maxAttempts) {
        try {
          associatedTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            publicKey,
            mint,
            publicKey
          );
          break;
        } catch (ataError) {
          ataAttempts++;
          if (ataAttempts === maxAttempts) {
            throw new Error('Failed to create ATA after retries: ' + ataError.message);
          }
          console.log(`ATA attempt ${ataAttempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Fetch and update balance after creation
      balanceLamports = await connection.getBalance(publicKey);
      balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Balance after creation (lamports):', balanceLamports);
      console.log('Balance after creation (SOL):', balanceSol);
      if (balanceSol < 0) {
        console.error('Negative balance detected after creation!');
      }
      setBalance(balanceSol);

      setTokenMint(mint);
      setTokenAccount(associatedTokenAccount.address);
      setLastTxSignature(txSignature);
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

      const balanceLamports = await connection.getBalance(publicKey);
      const balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Balance after minting (SOL):', balanceSol);
      setBalance(balanceSol);
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

      const balanceLamports = await connection.getBalance(publicKey);
      const balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      console.log('Balance after sending (SOL):', balanceSol);
      setBalance(balanceSol);
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