import {
    createBurnCheckedInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_2022_PROGRAM_ID,
  } from "@solana/spl-token";
  import bs58 from "bs58"
  import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import { PRIVATE_KEY, PUBLIC_KEY, TOKEN_MINT_ADDRESS } from "./address";
  
  const connection = new Connection("https://api.devnet.solana.com");
  function base58ToKeypair(base58PrivateKey: string): Keypair {
    try {
        console.log(base58PrivateKey)
      const privateKeyBuffer = bs58.decode(base58PrivateKey);
      return Keypair.fromSecretKey(privateKeyBuffer);
    } catch (error) {
      throw new Error("Invalid base58 private key.");
    }
}
  const wallet = base58ToKeypair(PRIVATE_KEY!);
  const mint = new PublicKey(TOKEN_MINT_ADDRESS!);
  
  export async function mintTokens(fromAddres: string, amount: number) {
    const recipient = new PublicKey(fromAddres);
    console.log(wallet.publicKey);
  
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      recipient,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  
    await mintTo(
      connection,
      wallet,
      mint,
      tokenAccount.address,
      wallet.publicKey,
      amount,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  }
  
  export const burnToken = async (fromAddress: string, amount: number) => {
    const owner = wallet.publicKey;
  
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
  
    const transaction = new Transaction().add(
      createBurnCheckedInstruction(
        tokenAccount,
        mint,
        owner,
        amount,
        9,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
  
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ]);
    console.log("burned tokens txns: ", signature);
  };
  
  export const sendNativeToken = async (toAddress: string, amount: number) => {
    const recipient = new PublicKey(toAddress);
  
    const transaction = new Transaction().add(
      createTransferInstruction(
        wallet.publicKey,
        recipient,
        wallet.publicKey,
        amount * 1e9
      )
    );
  
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ]);
  
    console.log("SOL SENT: ", signature);
  };