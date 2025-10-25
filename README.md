# CHOWK — on-chain Upwork/Fiverr (Minimal hackathon README)

**One-liner:** CHOWK — a simple gig marketplace where makers post gigs and pay escrow upfront in MON; acceptors accept, submit work, and receive *instant on-chain payment* when the maker marks the gig complete. Built to **show Monad’s sub-second finality and parallel throughput** in a consumer-ready demo.

---

## Key features (MVP)

* Single dashboard for both **Gig Maker** and **Gig Acceptor**.
* Buttons: **Send Gig**, **Open Gigs**, **On-going Gigs**.
* **Upfront escrow:** maker stakes MON into a `JobEscrow` contract when creating a gig.
* **Accept & work:** acceptor accepts job — money is already secured.
* **Instant payout:** when maker marks complete, escrow sends MON to acceptor automatically.
* Simple **NFT badge** mint for completed jobs (optional).
* One-tap onboarding via gas sponsorship (Privy/Pimlico) so judges can play in <15s.
* Live metrics: end-to-end latency (send → inclusion → finality) and concurrent jobs counter (showcase Monad).

---

## Tech stack (what we'll use)

* **Smart contracts:** Solidity → **Foundry** (fast tests). `JobEscrow.sol` (OpenZeppelin).
* **Frontend:** **Next.js** (Scaffold-ETH starter) + **Tailwind** + **wagmi / viem** for wallet interactions
* **Backend / API:** **NestJS** (host on Render) — matchmaking, file metadata, optional dispute engine.
* **Auth & storage:** **Firebase** (Firestore + Storage) — profiles, job metadata, attachments.
* **Indexing / metrics:** **QuickNode Streams** or **Envio HyperIndex** + `eth_getBlockReceipts` to compute TPS/latency.
* **Wallet UX:** MetaMask/Rabby + **Privy / Pimlico / Dynamic** for gas sponsorship / smart wallets.
* **Hosting:** Vercel (Next.js) + Render (NestJS).
* **Verification:** **Sourcify** (BlockVision / Sourcify API for Monad).
* **Avoid CryptoJS** for signing — use **ethers.js / Web Crypto / viem**.

---

## Project layout (suggested)

```
/contracts
  JobEscrow.sol
  BadgeNFT.sol (optional)
  
/frontend         # nextjs (Scaffold-ETH)
  /pages
  /components
  /lib (wagmi/viem + eth_getBlockReceipts helper)
  
/backend         # nestjs
  /jobs (APIs for create/list/metadata)
  /worker (bot for spawning test transactions)
  
/firebase.json   # hosting / firestore rules
/foundry.toml
/hardhat.config.ts (optional)
README.md
```

---

## Quickstart — Local (fastest loop)

1. Scaffold (if not done):

   ```bash
   npx create-eth@latest .   # choose foundry
   yarn
   ```
2. Start local chain (terminal A):

   ```bash
   yarn chain
   ```
3. Deploy contracts to local chain (terminal B):

   ```bash
   yarn deploy
   ```
4. Start frontend (terminal C):

   ```bash
   yarn start
   # open http://localhost:3000
   ```

---

## Deploy to Monad Testnet (LIVE DEPLOYMENT)

* **RPC:** `https://testnet-rpc.monad.xyz`
* **Chain ID:** `41454` (`0xa1f6`)
* **Faucet / test tokens:** [https://testnet.monad.xyz](https://testnet.monad.xyz)
* **Explorer:** [https://testnet.monadexplorer.com/](https://testnet.monadexplorer.com/)

### Step 1: Configure your wallet private key

```bash
# Edit packages/foundry/.env and add your private key
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### Step 2: Deploy JobEscrow to Monad Testnet

```bash
cd packages/foundry
forge script script/DeployToMonad.s.sol --rpc-url monad_testnet --broadcast --verify
```

### Step 3: Create demo gigs (optional)

```bash
# Set the deployed contract address
export JOB_ESCROW_ADDRESS=0x_your_deployed_address_here

# Create demo gigs
forge script script/CreateDemoGigs.s.sol --rpc-url monad_testnet --broadcast
```

### Step 4: Verify contract (Sourcify)

```bash
forge verify-contract \
  --rpc-url https://testnet-rpc.monad.xyz \
  --verifier sourcify \
  --verifier-url 'https://sourcify-api-monad.blockvision.org' \
  <CONTRACT_ADDRESS> \
  src/JobEscrow.sol:JobEscrow
```

### Why Monad?

* **Sub-second finality:** Payments clear in <1 second
* **Parallel execution:** Handle 100+ concurrent gigs without congestion  
* **Low fees:** Minimal gas costs for escrow operations
* **EVM compatible:** Same Solidity code, better performance

---

## Important Monad resources & links (use these)

* **Monad docs / architecture:** [https://docs.monad.xyz/](https://docs.monad.xyz/)
* **Testnet RPC / faucet / chain details:** `https://testnet-rpc.monad.xyz` — ChainID `10143` — [https://testnet.monad.xyz](https://testnet.monad.xyz)
* **Explorer:** [https://testnet.monadexplorer.com/](https://testnet.monadexplorer.com/)
* **Sourcify verifier URL:** `https://sourcify-api-monad.blockvision.org`
* **Canonical tokens (testnet):** USDC, USDT, WETH, WMON (addresses provided in Monad resources) — use Uniswap testnet deploy for demo payouts.
* **Indexers:** Envio HyperIndex guide, QuickNode Streams (docs in the resource pack).
* **Account abstraction / gas sponsor docs:** Privy / Pimlico / Dynamic (https://www.dynamic.xyz/).
* **Scaffold-ETH starter:** `npx create-eth@latest` (the Blitz guide recommends this).

---

## Demo checklist (what to prepare for judges)

* [ ] Deploy & **verify** JobEscrow on Monad testnet (Sourcify).
* [ ] Pre-fund **3 judge wallets** (QR codes) and enable gas sponsorship so they can join in <15s.
* [ ] Prepare a **30s recorded perfect demo** (fallback).
* [ ] Live metrics UI: show **send→inclusion→finality** stopwatch (use `eth_getBlockReceipts`) and **concurrent jobs** counter.
* [ ] Show instant payout flow: Maker creates gig → stakes MON → Acceptor accepts → Maker marks complete → funds transfer in <1s.
* [ ] Provide GitHub link & README with deploy/verif commands (so community can inspect).

**Measured targets to display:** median end-to-end latency < 1s, 95th percentile < 2s, 10–50 concurrent jobs without failures, low gas cost per job.

---

## Security & implementation notes (short)

* Use **per-job escrow** (mapping or separate escrow contracts) to avoid hot-spot storage and maximize parallelism on Monad.
* Protect against reentrancy (OpenZeppelin `ReentrancyGuard`). Keep on-chain logic minimal.
* Don't loop over dynamic arrays in contracts (use events + indexer to compute lists off-chain).
* Unit test extensively with Foundry (happy path + failure + re-exec cases).

---

## Demo pitch (1-liner for stage)

“CHOWK — the gig marketplace where buyers stake MON upfront and sellers get paid instantly when the job is accepted and completed — proof: watch a payout clear in under one second on Monad.”

---

If you want, I’ll now **generate `JobEscrow.sol` + minimal Foundry test**, and the exact places to paste it in your scaffold (plus the deploy & verify command lines ready with Monad RPC). Say **“generate JobEscrow”** and I’ll produce the code.

---

## 🚀 Live Demo & Deployment

**Live Demo:** Deploy your own on Vercel!
**Contract:** `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519` on Monad Testnet
**Explorer:** [View on Monad Explorer](https://testnet.monadexplorer.com/address/0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519)

### 🎯 Quick Start (Production)

1. **Connect MetaMask to Monad Testnet:**
   - Network: `Monad Testnet`
   - RPC: `https://testnet-rpc.monad.xyz`
   - Chain ID: `10143`
   - Symbol: `MON`

2. **Get test MON tokens:** [Monad Faucet](https://testnet.monad.xyz)

3. **Use CHOWK:**
   - Create gigs with MON escrow
   - Accept gigs from other users  
   - Experience instant payouts (<1s finality)

### 📦 Deploy Your Own on Vercel

```bash
# 1. Fork/clone this repo
git clone https://github.com/AnshumanAtrey/monad.git
cd monad

# 2. Push to your GitHub
git remote set-url origin https://github.com/YourUsername/your-repo.git
git push
```

**Vercel Settings:**
- **Framework Preset:** Next.js
- **Root Directory:** `packages/nextjs`
- **Build Command:** `cd packages/nextjs && yarn build`
- **Output Directory:** `packages/nextjs/.next`
- **Install Command:** `yarn install && cd packages/nextjs && yarn install`

### 🔧 Environment Variables (Vercel)
No environment variables needed! Everything runs client-side with MetaMask.

---

## 🏆 Hackathon Highlights

✅ **Deployed on Monad Testnet** - Real sub-second finality
✅ **No backend required** - Pure on-chain architecture  
✅ **MetaMask integration** - Seamless Web3 UX
✅ **Instant payouts** - Showcase Monad's speed advantage
✅ **Production ready** - Deployed on Vercel
✅ **Open source** - Full code available on GitHub

**Perfect for judges to test in <30 seconds!**
