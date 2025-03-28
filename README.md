# Solana Token App

A React application built with Vite and Tailwind CSS that allows users to interact with the Solana blockchain on Devnet. Users can connect their Phantom wallet, create SPL tokens, mint tokens, and send tokens to other addresses.

## Features
- **Wallet Integration**: Connect and disconnect Phantom wallet
- **Token Creation**: Create new SPL tokens with custom name and symbol
- **Token Minting**: Mint additional tokens to your wallet
- **Token Sending**: Send tokens to other Solana addresses
- **Transaction Feedback**: Real-time status updates and transaction signatures
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)
- Phantom Wallet extension installed in your browser
- A browser (Chrome, Firefox, Edge) with Phantom support

## Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/quaziyadgar/solana-token-app.git
   cd solana-token-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Usage

1. **Connect Wallet**
   - Click "Connect Phantom Wallet"
   - Approve the connection in Phantom (ensure you're on Devnet)

2. **Create a Token**
   - Enter a token name and symbol
   - Click "Create Token"
   - Approve the transaction in Phantom

3. **Mint Tokens**
   - Enter an amount
   - Click "Mint Tokens"
   - Approve the transaction

4. **Send Tokens**
   - Enter a recipient address and amount
   - Click "Send Tokens"
   - Approve the transaction

## Testing

> **Important**: To test this application, you must have some SOL in your wallet on Devnet. If you have 0 SOL, token creation will fail due to insufficient funds for rent and transaction fees.

### Steps to Test
1. **Get Devnet SOL**
   - Open Phantom Wallet (set to Devnet)
   - Copy your wallet address
   - Visit https://faucet.solana.com/
   - Request 2-5 SOL
   - Wait for the balance to update in Phantom

2. **Test Token Creation**
   - Connect your wallet
   - Verify your SOL balance is > 0.0021 SOL
   - Create a token and check the success message with mint address

3. **Test Minting and Sending**
   - Mint some tokens
   - Send tokens to another Devnet address
   - Verify transaction signatures in the UI

## Deployment

To deploy to Vercel:
```bash
npm install -g vercel
vercel
```
Follow the prompts to deploy your app.

## Project Structure
```
solana-token-app/
├── src/
│   ├── components/
│   │   ├── WalletConnector.jsx
│   │   └── TokenManager.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## Dependencies
- `@solana/web3.js`: Solana blockchain interaction
- `@solana/spl-token`: SPL Token program functionality
- `tailwindcss`: Styling
- `vite-plugin-node-polyfills`: Node.js polyfills for browser
- `@headlessui/react`: UI components

## Troubleshooting
- **"Phantom wallet not detected"**: Install Phantom from https://phantom.app/
- **"Insufficient SOL"**: Request Devnet SOL from the faucet
- **Errors during token creation**: Check console logs and ensure wallet is funded

## Video Explanation
A 5-10 minute video explanation is available, covering:
- Project setup and approach
- Solana wallet integration
- Smart contract interactions
- Challenges and solutions

## License
MIT License - feel free to use and modify this code!


### Key Highlights
- **Testing Section**: Clearly states that you shouldn't have 0 SOL:
  ```markdown
  > **Important**: To test this application, you must have some SOL in your wallet on Devnet. If you have 0 SOL, token creation will fail due to insufficient funds for rent and transaction fees.
  ```
- **Steps to Test**: Includes instructions to get SOL and verify balance
- **Troubleshooting**: Addresses the insufficient SOL scenario


This README provides clear setup, usage, and testing instructions while emphasizing the need for SOL to test token creation successfully. Let me know if you'd like to add more details or adjust anything!

Hoisted link - https://solana-token-app.vercel.app/