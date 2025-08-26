import { PoolKey } from "../constants/types";
import { createWalletClient, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Create a new pool
export const createPool = async (
  poolManager: any,
  poolKey: PoolKey,
  startingPrice: number
) => {
  try {
    

    return true;
  } catch (error) {
    throw new Error("Error creating new pool." + error);
  }
};
