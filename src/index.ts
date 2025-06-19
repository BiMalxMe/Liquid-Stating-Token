require("dotenv").config();
console.log(process.env.PUBLIC_KEY);
import express from "express";
import { mintTokens } from "./mintTokens";

const app = express();

const HELIUS_RESPONSE = {
  nativeTransfers: [
    {
      amount: 900000000,
      fromUserAccount: "5nSxdM8kzfoncH6ryjR1BsfPCMWnGsvDQbnb1gownRzb",
      toUserAccount: "AjmTvNjtzX4L67jXQYyXQv4B2khBVo8okSvJzP2UecLW",
    },
  ],
};

const VAULT = "AjmTvNjtzX4L67jXQYyXQv4B2khBVo8okSvJzP2UecLW";

app.post("/helius", async (req, res) => {
  const incomingTx = HELIUS_RESPONSE.nativeTransfers.find(
    (x) => x.toUserAccount === VAULT
  );
  if (!incomingTx) {
    res.json({ message: "processed" });
    return;
  }
  const fromAddress = incomingTx.fromUserAccount;
  const toAddress = VAULT;
  const amount = incomingTx.amount;
  const type = "received_native_sol";
  await mintTokens(fromAddress, amount);

  // if (type === "received_native_sol") {
  // } else {
  //     // What could go wrong here?
  //     await burnTokens(fromAddress, toAddress, amount);
  //     await sendNativeTokens(fromAddress, toAddress, amount);
  // }

  res.send("Transaction successful");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
