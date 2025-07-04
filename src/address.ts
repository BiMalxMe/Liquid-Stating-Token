import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const PUBLIC_KEY = process.env.PUBLIC_KEY;
export const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
