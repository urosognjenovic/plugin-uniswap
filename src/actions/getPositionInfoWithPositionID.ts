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
import { getPositionInfoWithPositionID } from "../utils/gettersPositionManager";
import { STATE_VIEW_ABI } from "../constants/abi";
import { Chain } from "viem";
import { initializeClient, setUpContract } from "../utils/clients";
import {
  validateAndExtractPoolIdFromUserMessage,
  extractChainFromUserMessage,
  validateAndExtractPositionIdFromUserMessage,
} from "../utils/validation";
import { ChainData } from "../constants/types";

export const getPositionInfoWithPositionIDAction: Action = {
  name: "GET_POSITION_INFO_WITH_POSITION_ID",
  description:
    "Get the position info of a v4 pool using the positionId: liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128,",

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
      let positionId: `0x${string}` | undefined;

      try {
        poolId = await validateAndExtractPoolIdFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text:
            "Error fetching position info: " +
            error +
            `The poolId you provided is ${poolId}.`,
        };

        await callback(responseContent);

        return {
          success: false,
        };
      }

      try {
        positionId = await validateAndExtractPositionIdFromUserMessage(
          userMessage,
          _runtime
        );
      } catch (error) {
        const responseContent: Content = {
          text:
            "Error fetching position info: " +
            error +
            `The positionId you provided is ${positionId}`,
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
          text:
            "Error fetching position info: " + error + `The chain is ${chain}`,
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
      const positionInfo = await getPositionInfoWithPositionID(
        stateView,
        poolId,
        positionId
      );
      const responseText = `The position info is:

        liquidity:  ${positionInfo?.liquidity};
        feeGrowthInside0LastX128: ${positionInfo?.feeGrowthInside0LastX128}
        feeGrowthInside1LastX128: ${positionInfo?.feeGrowthInside1LastX128}`;

      const responseContent: Content = {
        text: responseText,
        actions: ["GET_POSITION_INFO_WITH_POSITION_ID"],
      };

      await callback(responseContent);

      return {
        success: true,
      };
    } catch (error) {
      throw new Error("Error fetching position info.");
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Can you get the position info for the pool *poolId* and positionId *positionId* on the Ethereum network?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "Sure I can!",
          action: "GET_POSITION_INFO_WITH_POSITION_ID",
        },
      },
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "What's the liquidity of the position *positionId* for the pool  *poolId* on the Avalanche network?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "",
          action: "GET_POSITION_INFO_WITH_POSITION_ID",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
