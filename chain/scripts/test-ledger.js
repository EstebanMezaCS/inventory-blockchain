const hre = require("hardhat");

async function main() {
  const addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const Ledger = await hre.ethers.getContractFactory("TransferLedger");
  const ledger = await Ledger.attach(addr);

  const itemsHash = hre.ethers.id(JSON.stringify([{ sku: "ABC-123", qty: 5 }]));

  // 1) Send tx
  const tx = await ledger.requestTransfer("T-0002", "WH-A", "STORE-1", itemsHash);

  // 2) Wait for mining and get receipt
  const receipt = await tx.wait();

  console.log("tx hash:", receipt.hash);
  console.log("block number:", receipt.blockNumber);

  // 3) Read state back
  const t = await ledger.transfers("T-0002");
  console.log("Transfer:", t);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
