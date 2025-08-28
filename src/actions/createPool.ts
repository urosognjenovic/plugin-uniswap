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
import { initializeClient } from "../utils/clients";
import {
  extractChainFromUserMessage,
  validateAndExtractPoolKeyFromUserMessage,
  validateAndExtractStartingPriceFromUserMessage,
} from "../utils/validation";
import { Chain, createWalletClient, http } from "viem";
import { ZERO_VALUE } from "../constants/constants";
import { ChainData, PoolKey } from "../constants/types";
import {
  getPairNames,
  convertFeeToPercent,
  encodeCreatePoolData,
} from "../utils/helpers";
import { privateKeyToAccount } from "viem/accounts";
import "viem/window";

export const createPoolAction: Action = {
  name: "CREATE_POOL",
  description: "Create a new pool",

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
      let poolKey: PoolKey | undefined;
      let startingPrice: bigint;

      // TO DO: Check if pool already exists
      // TO DO: Simulate tx before executing

      try {
        poolKey = await validateAndExtractPoolKeyFromUserMessage(
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

      try {
        startingPrice = await validateAndExtractStartingPriceFromUserMessage(
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

      let chainData: ChainData | undefined;
      let chain: Chain | undefined;
      let providerURL: string | undefined;

      try {
        chainData = await extractChainFromUserMessage(userMessage, _runtime);
      } catch (error) {
        const responseContent: Content = {
          text: "Error fetching pool keys: " + error + `The chain is ${chain}`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      chain = chainData?.chain;
      providerURL = chainData?.providerURL;
      let poolManagerAddress = chainData?.poolManagerAddress as `0x${string}`;

      const client = initializeClient(chain, providerURL);

      const currency0 = poolKey?.currency0;
      const currency1 = poolKey?.currency1;
      const fee = poolKey?.fee;
      const tickSpacing = poolKey?.tickSpacing;
      const hooks = poolKey?.hooks;

      const pairNames = await getPairNames(currency0, currency1, chain, client);
      const currency0Name = pairNames.currency0Name;
      const currency1Name = pairNames.currency1Name;

      const account = privateKeyToAccount(
        process.env?.EVM_PRIVATE_KEY as `0x${string}`
      );

      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(providerURL),
      });

      const data = encodeCreatePoolData(poolKey, startingPrice);

      const hash = await walletClient.sendTransaction({
        account,
        to: poolManagerAddress,
        value: ZERO_VALUE,
        chain,
        data,
      });

      const txURL = chainData?.blockExplorerURL + "/tx/" + hash;

      const responseText = `Successfully created a new pool on ${chain?.name} with the following parameters:

currency0: ${currency0} (${currency0Name})
currency1: ${currency1} (${currency1Name})
fee: ${convertFeeToPercent(fee)}
tickSpacing: ${tickSpacing}
hooks: ${hooks}

The transaction hash is ${hash} (${txURL}).`;

      const responseContent: Content = {
        text: responseText,
        actions: ["CREATE_POOL"],
      };

      await callback(responseContent);

      return {
        success: true,
      };
    } catch (error) {
      throw new Error("Error creating new pool." + error);
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can you create a new pool with the following parameters: currency0: *currency0*, currency1: *currency1*, fee: *fee*, tickSpacing: *tickSpacing*, hooks: *hooks*, startingPrice: *startingPrice* on the  *network*",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "Will do, sir!",
          action: "CREATE_POOL",
        },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Create a new pool on *chain name* with *currency0*, *currency1*, *fee*, *tickSpacing*, *hooks*, *startingPrice*?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'm on it.",
          action: "CREATE_POOL",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
