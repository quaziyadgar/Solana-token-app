// src/App.jsx
import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import TokenManager from './components/TokenManager';

function App() {
  const [connection, setConnection] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Solana Token Manager</h1>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <WalletConnector 
          setConnection={setConnection}
          setPublicKey={setPublicKey}
          setBalance={setBalance}
        />

        {publicKey && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <p className="text-sm break-all"><span className="font-semibold">Wallet Address:</span> {publicKey.toString()}</p>
            <p className="mt-1"><span className="font-semibold">Balance:</span> {balance !== null ? balance.toFixed(6) : 'Loading...'} SOL</p>
          </div>
        )}

        {connection && publicKey && (
          <TokenManager 
            connection={connection}
            publicKey={publicKey}
            setBalance={setBalance}
          />
        )}
      </main>
    </div>
  );
}

export default App;