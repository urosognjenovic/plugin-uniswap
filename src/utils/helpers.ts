import { ERC20_ABI, POOL_MANAGER_ABI } from "../constants/abi";
import { setUpContract } from "./clients";
import { ZERO_ADDRESS } from "../constants/constants";
import { getERC20TokenName } from "./gettersERC20";
import {
  Chain,
  keccak256,
  slice,
  encodeAbiParameters,
  type Hex,
  encodeFunctionData,
  type PublicClient,
} from "viem";
import { PoolKey } from "../constants/types";

// Convert fee to percent (i.e. if fee = 500, the function returns "0.05%")
export const convertFeeToPercent = (fee: number) => {
  return fee / 10_000 + "%";
};

// Get the names of the pair tokens/coins
export const getPairNames = async (
  token0: `0x${string}`,
  token1: `0x${string}`,
  chain: Chain | undefined,
  client: PublicClient
) => {
  let currency0Name: string | undefined;
  let currency1Name: string | undefined;

  if (token0 != ZERO_ADDRESS) {
    const currency0Contract = setUpContract(token0, ERC20_ABI, client);
    currency0Name = await getERC20TokenName(currency0Contract);
  } else {
    currency0Name = chain?.nativeCurrency.name;
  }

  if (token1 != ZERO_ADDRESS) {
    const currency1Contract = setUpContract(token1, ERC20_ABI, client);
    currency1Name = await getERC20TokenName(currency1Contract);
  } else {
    currency1Name = chain?.nativeCurrency.name;
  }

  return { currency0Name, currency1Name };
};

// Get poolId from poolKey
export const getPoolIdFromPoolKey = (poolKey: PoolKey) => {
  const { currency0, currency1, fee, tickSpacing, hooks } = poolKey;

  const encodedParams = encodeAbiParameters(
    [
      { name: "currency0", type: "address" },
      { name: "currency1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickSpacing", type: "int24" },
      { name: "hooks", type: "address" },
    ],
    [currency0, currency1, fee, tickSpacing, hooks]
  );

  return slice(keccak256(encodedParams), 0, 25);
};

// Encode the data to initialize a pool
export const encodeCreatePoolData = (
  poolKey: PoolKey,
  startingPrice: bigint
): Hex => {
  const encodedParams = encodeFunctionData({
    abi: POOL_MANAGER_ABI,
    functionName: "initialize",
    args: [poolKey, startingPrice],
  });

  return encodedParams;
};
