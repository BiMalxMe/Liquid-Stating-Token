import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { mintTokens } from "./mintTokens";

dotenv.config();
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const VAULT = "AjmTvNjtzX4L67jXQYyXQv4B2khBVo8okSvJzP2UecLW";
const HELIUS_RESPONSE = {
  nativeTransfers: [
    {
      amount: 900000000,
      fromUserAccount: "2iveeevEF3kZ9HYi3m5moT3RQZXnbjNF1MeLfXggjpBy",
      toUserAccount: VAULT,
    },
  ],
};

app.post("/helius", async (req: Request, res: Response): Promise<void> => {
  try {
    const incomingTx = HELIUS_RESPONSE.nativeTransfers.find(
      (x) => x.toUserAccount === VAULT
    );
    
    if (!incomingTx) {
      res.status(200).json({ message: "no matching transaction found" });
      return;
    }

    const fromAddress = incomingTx.fromUserAccount;
    const amount = incomingTx.amount;

    await mintTokens(fromAddress, amount / 1e9); // Convert lamports to SOL

    res.status(200).json({ message: "Transaction successful" });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ message: "Transaction failed" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});