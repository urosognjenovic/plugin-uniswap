import { parseKeyValueXml } from "@elizaos/core/v2";
import { isHex, isAddress, extractChain } from "viem";
import { IAgentRuntime, ModelType } from "@elizaos/core";
import { SUPPORTED_CHAINS } from "../constants/constants";
import { type ChainAndProviderURL, type PoolKey } from "../constants/types";

export const validateAndExtractPoolIdFromUserMessage = async (
  message: string | undefined,
  _runtime: IAgentRuntime
): Promise<String> => {
  const prompt = `Extract the poolId from the user's message. The poolId is a hexadecimal value that starts with 0x. The message is ${message}. Return an XML block containing only the extracted value:
  
  <response>
    <poolId>
      extracted_pool_id_or_null
    </poolId>
  </response>
  `;

  let xmlResponse: string;

  try {
    xmlResponse = await _runtime.useModel(ModelType.TEXT_SMALL, {
      prompt,
    });
  } catch (error: any) {
    if (error?.error?.code === 503) {
      throw new Error("The model is overloaded. Please try again later.");
    }

    throw error;
  }

  const poolIdRequest = parseKeyValueXml(xmlResponse);
  const poolId = poolIdRequest?.poolId as string;

  if (!isHex(poolId)) {
    throw new Error(
      "poolId contains invalid characters! It should only contain hexadecimal characters (0-9 and A-F)!"
    );
  }

  if (poolId.length != 66) {
    throw new Error(
      "poolId has an invalid length! The length should be 66 characters including the '0x' prefix!"
    );
  }

  return poolId;
};

export const extractChainFromUserMessage = async (
  message: string | undefined,
  _runtime: IAgentRuntime
): Promise<ChainAndProviderURL> => {
  const prompt = `Figure out the chainId to use from the user message (${message}) for a blockchain API call and pick the match from the list of chains (${SUPPORTED_CHAINS}). Keep in mind that Ethereum is called 'mainnet' in the list. Return an XML block containing only the chainId:
  
  <response>
    <chainId>
      chainId_or_null
    </chainId>
  </response>`;

  const xmlResponse = await _runtime.useModel(ModelType.TEXT_SMALL, {
    prompt,
  });
  const chainIdRequest = parseKeyValueXml(xmlResponse);
  const chainId = chainIdRequest?.chainId as number;

  if (chainId == 0) {
    throw new Error("Error extracting chain id.");
  }

  const chainInfo = SUPPORTED_CHAINS.find((c) => c.chain.id == chainId);

  if (!chainInfo) {
    throw new Error(`No matching chain found for chainId: ${chainId}`);
  }

  const { providerURL, stateViewAddress, positionManagerAddress } = chainInfo;

  const id = chainId as (typeof SUPPORTED_CHAINS)[number]["chain"]["id"];

  const chain = extractChain({
    chains: Array.from(
      SUPPORTED_CHAINS,
      (chainAndProviderURL) => chainAndProviderURL.chain
    ),
    id,
  });

  const chainAndProviderURL: ChainAndProviderURL = {
    chain,
    providerURL,
    stateViewAddress,
    positionManagerAddress,
  };

  return chainAndProviderURL;
};

export const validateAndExtractPositionIdFromUserMessage = async (
  message: string | undefined,
  _runtime: IAgentRuntime
): Promise<String> => {
  const prompt = `Extract the positionId from the user's message. The positionId is a bytes32. The message is ${message}. Return an XML block containing only the extracted value:
  
  <response>
    <positionId>
      extracted_position_id_or_null
    </positionId>
  </response>
  `;

  let xmlResponse: string;

  try {
    xmlResponse = await _runtime.useModel(ModelType.TEXT_SMALL, {
      prompt,
    });
  } catch (error: any) {
    if (error?.error?.code === 503) {
      throw new Error("The model is overloaded. Please try again later.");
    }

    throw error;
  }

  const positionIdRequest = parseKeyValueXml(xmlResponse);
  const positionId = positionIdRequest?.positionId as string;

  if (!isHex(positionId)) {
    throw new Error(
      "positionId contains invalid characters! It should only contain hexadecimal characters (0-9 and A-F)."
    );
  }

  if (positionId.length != 66) {
    throw new Error(
      "positionId has an invalid length! The length should be 66 characters including the '0x' prefix."
    );
  }

  return positionId;
};

export const validateAndExtractPoolKeysFromUserMessage = async (
  message: string | undefined,
  _runtime: IAgentRuntime
): Promise<PoolKey> => {
  const prompt = `Extract the pool keys from the user's message. The pool keys are defined as {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}. The message is ${message}. Return an XML block containing only the extracted values in the following form:
  
    <response>
      <currency0>
        extracted_currency0_or_null
      </currency0>
      <currency1>
        extracted_currency1_or_null
      </currency1>
      <fee>
        extracted_fee_or_null
      </fee>
      <tickSpacing>
        extracted_tickSpacing_or_null
      </tickSpacing>
      <hooks>
        extracted_hooks_or_null
      </hooks>
    </response>
  `;

  let xmlResponse: string;

  try {
    xmlResponse = await _runtime.useModel(ModelType.TEXT_SMALL, {
      prompt,
    });
  } catch (error: any) {
    if (error?.error?.code === 503) {
      throw new Error("The model is overloaded. Please try again later.");
    }

    throw error;
  }

  const poolKeyRequest = parseKeyValueXml(xmlResponse);

  const currency0 = poolKeyRequest?.currency0 as "0x${string}";
  const currency1 = poolKeyRequest?.currency1 as "0x${string}";
  const fee = poolKeyRequest?.fee;
  const tickSpacing = poolKeyRequest?.tickSpacing;
  const hooks = poolKeyRequest?.hooks as "0x${string}";

  if (!isAddress(currency0)) {
    throw new Error(
      `currency0 is not a valid adddress. The value you provided is ${currency0}`
    );
  }

  if (!isAddress(currency1)) {
    throw new Error(
      `currency1 is not a valid adddress. The value you provided is ${currency1}`
    );
  }

  if (fee < 0 || fee > 1_000_000) {
    throw new Error(
      `Fee outside of valid range (0 - 1_000_000). The value you provided is ${fee}`
    );
  }

  if (tickSpacing < 1 || tickSpacing > 32_767) {
    throw new Error(
      `tickSpacing outside of valid range (1 - 32_767). The value you provided is ${tickSpacing}`
    );
  }

  if (!isAddress(hooks)) {
    throw new Error(
      `hooks is not a valid adddress. The value you provided is ${hooks}`
    );
  }

  return {
    currency0,
    currency1,
    fee,
    tickSpacing,
    hooks,
  };
};
