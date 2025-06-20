import {
  createAssociatedTokenAccountInstruction,
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from "./address";

//wait until the connection is confirmed
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

function base58ToKeypair(base58PrivateKey: string): Keypair {
  try {
    const privateKeyBuffer = bs58.decode(base58PrivateKey);
    return Keypair.fromSecretKey(privateKeyBuffer);
  } catch (error) {
    throw new Error(`Invalid base58 private key: ${error}`);
  }
}

if (!PRIVATE_KEY || !TOKEN_MINT_ADDRESS) {
  throw new Error("Missing required environment variables: PRIVATE_KEY or TOKEN_MINT_ADDRESS");
}

const wallet = base58ToKeypair(PRIVATE_KEY);
const mint = new PublicKey(TOKEN_MINT_ADDRESS);

export async function mintTokens(fromAddress: string, amount: number) {
  try {
    const recipient = new PublicKey(fromAddress);
    console.log(`Minting ${amount} tokens to ${fromAddress}`);

    // Get the associated token account address
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      recipient,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Check if the token account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log(`Creating ATA for ${fromAddress}`);
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // Payer
          tokenAccount, // ATA address
          recipient, // Owner
          mint, // Mint
          TOKEN_2022_PROGRAM_ID
        )
      );
      // This line sends the signed transaction to the Solana network and waits until it's
      //  confirmed by validators. It returns the transaction’s unique signature (ID) once processed.

      const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
        commitment: "confirmed",
      });
      console.log(`Created ATA for ${fromAddress}: ${signature}`);
    }

    // Mint tokens
    const mintSignature = await mintTo(
      connection,
      wallet, // Payer
      mint,
      tokenAccount,
      wallet, // Mint authority
      Math.floor(amount * 1e9), // Assuming 9 decimals for the token
      [],
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID
    );

    console.log(`Minted ${amount} tokens to ${fromAddress}, tx: ${mintSignature}`);
    return mintSignature;
  } catch (error) {
    console.error(`Minting failed for ${fromAddress}:`, error);
    throw error;
  }
}

export async function burnTokens(amount: number) {
  try {
    const burnAmount = Math.floor(amount * 1e9);

    // Get the protocol's ATA for the mint
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const burnInstruction = createBurnCheckedInstruction(
      tokenAccount,
      mint,
      wallet.publicKey,
      burnAmount,
      9,
      [],
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(burnInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: "confirmed",
    });

    console.log(`Burned ${amount} tokens from protocol wallet, tx: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Burning tokens failed:", error);
    throw error;
  }
}

export async function sendNativeTokens(fromAddress:string,toAddress: string, amount: number) {
  try {
    const recipient = new PublicKey(toAddress);
    const lamports = Math.floor(amount * 1e9);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(fromAddress),
        toPubkey: recipient,
        lamports,
      })
    );
// This line sends the signed transaction to the Solana network and waits until it's
//  confirmed by validators. It returns the transaction’s unique signature (ID) once processed.

    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: "confirmed",
    });

    console.log(`Sent ${amount} SOL to ${toAddress}, tx: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Sending native tokens failed:", error);
    throw error;
  }
}
