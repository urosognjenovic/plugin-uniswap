import {
  type Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
  Content,
  ActionResult,
} from "@elizaos/core";
import { getPoolLiquidity } from "../utils/gettersStateView";
import { STATE_VIEW_ABI } from "../constants/abi";
import { Chain } from "viem";
import { initializeClient, setUpContract } from "../utils/clients";
import {
  validateAndExtractPoolIdFromUserMessage,
  extractChainFromUserMessage,
} from "../utils/validation";
import { ChainData } from "../constants/types";

export const getPoolLiquidityAction: Action = {
  name: "GET_POOL_LIQUIDITY",
  description: "Get the liquidity of a v4 pool",

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    options: {
      [key: string]: unknown;
    },
    callback: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const userMessage = message.content.text;
      let poolId: `0x${string}` | undefined;

      try {
        poolId = await validateAndExtractPoolIdFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text:
            "Error fetching liquidity: " +
            error +
            `The poolId you provided is ${poolId}.`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      let chainData: ChainData | undefined;
      let chain: Chain | undefined;
      let providerURL: string | undefined;

      try {
        chainData = await extractChainFromUserMessage(userMessage, _runtime);
      } catch (error) {
        const responseContent: Content = {
          text: "Error fetching liquidity: " + error + `The chain is ${chain}`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      chain = chainData?.chain;
      providerURL = chainData?.providerURL;
      let stateViewAddress = chainData?.stateViewAddress as `0x${string}`;

      const client = initializeClient(chain, providerURL);

      const stateView = setUpContract(stateViewAddress, STATE_VIEW_ABI, client);
      const liquidity = await getPoolLiquidity(stateView, poolId);
      const responseText = `The liquidity of the pool is ${liquidity}`;

      const responseContent: Content = {
        text: responseText,
        actions: ["GET_POOL_LIQUIDITY"],
      };

      await callback(responseContent);

      return {
        success: true,
      };
    } catch (error) {
      throw new Error("Error fetching pool liquidity.");
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can you get the liquidity of the pool *poolId* on the Ethereum network?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "Will do, sir!",
          action: "GET_POOL_LIQUIDITY",
        },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "What's the liquidity of the pool *poolId* on the Avalanche network?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "",
          action: "GET_POOL_LIQUIDITY",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
