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
import { getPoolKeys } from "../utils/gettersPositionManager";
import { POSITION_MANAGER_ABI, ERC20_ABI } from "../constants/abi";
import { initializeClient, setUpContract } from "../utils/clients";
import {
  validateAndExtractPoolIdFromUserMessage,
  extractChainFromUserMessage,
} from "../utils/validation";
import { Chain } from "viem";
import { ChainAndProviderURL } from "../constants/types";
import { convertFeeToPercent } from "../utils/helpers";
import { getPairNames } from "../utils/helpers";

export const getPoolKeysAction: Action = {
  name: "GET_POOL_KEYS",
  description:
    "Get the keys of a v4 pool: currency0, currency1, fee, tickSpacing, hooks",

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
      let poolId: String | undefined = "";

      try {
        poolId = await validateAndExtractPoolIdFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text:
            "Error fetching pool keys. Error validating poolId: " +
            error +
            `The poolId you provided is ${poolId}.`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      let chainAndProviderURL: ChainAndProviderURL | undefined;
      let chain: Chain | undefined;
      let providerURL: string | undefined;

      try {
        chainAndProviderURL = await extractChainFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text: "Error fetching pool keys: " + error + `The chain is ${chain}`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      chain = chainAndProviderURL?.chain;
      providerURL = chainAndProviderURL?.providerURL;
      let positionManagerAddress =
        chainAndProviderURL?.positionManagerAddress as `0x${string}`;

      const client = initializeClient(chain, providerURL);

      const positionManager = setUpContract(
        positionManagerAddress,
        POSITION_MANAGER_ABI,
        client
      );
      const poolKeys = await getPoolKeys(positionManager, poolId);

      const currency0 = poolKeys?.currency0;
      const currency1 = poolKeys?.currency1;
      const fee = poolKeys?.fee;
      const tickSpacing = poolKeys?.tickSpacing;
      const hooks = poolKeys?.hooks;

      const pairNames = await getPairNames(currency0, currency1, chain, client);
      const currency0Name = pairNames.currency0Name;
      const currency1Name = pairNames.currency1Name;

      const responseText = `The pool keys are:

currency0: ${currency0} (${currency0Name})
currency1: ${currency1} (${currency1Name})
fee: ${convertFeeToPercent(fee)}
tickSpacing: ${tickSpacing}
hooks: ${hooks}`;

      const responseContent: Content = {
        text: responseText,
        actions: ["GET_POOL_KEYS"],
      };

      await callback(responseContent);

      return {
        success: true,
      };
    } catch (error) {
      throw new Error("Error fetching pool keys.");
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can you get the keys of the pool *poolId* on the *network*",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "Will do, sir!",
          action: "GET_POOL_KEYS",
        },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "What are the keys of the pool *poolId* on Avalanche?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "",
          action: "GET_POOL_KEYS",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
