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
import { type PoolKey } from "../constants/types";
import { validateAndExtractPoolKeysFromUserMessage } from "../utils/validation";
import { getPoolIdFromPoolKey } from "../utils/helpers";

export const calculatePoolIdAction: Action = {
  name: "CALCULATE_POOL_ID",
  description:
    "Calculate the id of a pool using pool keys: currency0, currency1, fee, tickSpacing, hooks",

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
    _options: any,
    callback: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const userMessage = message.content.text;
      let poolKey: PoolKey | undefined;

      try {
        poolKey = await validateAndExtractPoolKeysFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text: "Error calculating pool keys. " + error,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      const poolId = getPoolIdFromPoolKey(poolKey) as "0x${string}";
      const responseContent: Content = {
        text: `The poolId is ${poolId}.`,
        action: "CALCULATE_POOL_ID",
      };

      await callback(responseContent);

      return {
        success: false,
      };
    } catch (error) {
      throw new Error("Error calculating poolId.");
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "What is the poolId for the pool keys: currency0: *currency0*, currency1: *currency1*, fee: *fee*, tickSpacing: *tickSpacing*, hooks: *hooks*?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "",
          action: "CALCULATE_POOL_ID",
        },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can you calculate the poolId for the following data: *currency0*, *currency1*, *fee*, *tickSpacing*, *hooks*?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "",
          action: "CALCULATE_POOL_ID",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
