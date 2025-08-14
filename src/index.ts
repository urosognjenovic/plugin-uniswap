import { Plugin } from "@elizaos/core";
import { getPoolLiquidityAction } from "./actions/getPoolLiquidity";
import { getPoolStateAction } from "./actions/getPoolState";
import { getPoolKeysAction } from "./actions/getPoolKeys";
import { getPositionInfoWithPositionIDAction } from "./actions/getPositionInfoWithPositionID";
import { logger } from "@elizaos/core";
import { calculatePoolIdAction } from "./actions/calculatePoolId";

export const uniswapPlugin: Plugin = {
  name: "plugin-uniswap",
  description: "ElizaOS plugin for interacting with Uniswap v4 contracts",
  actions: [
    getPoolLiquidityAction,
    getPoolStateAction,
    getPoolKeysAction,
    getPositionInfoWithPositionIDAction,
    calculatePoolIdAction,
  ],
  init: async (config) => {
    logger.info("Initializing plugin-uniswap");
  },
};

export default uniswapPlugin;
