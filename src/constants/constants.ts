import * as addresses from "./addresses";
import * as chains from "viem/chains";
import { ChainAndProviderURL } from "./types";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const SUPPORTED_CHAINS = [
  {
    chain: chains.avalanche,
    providerURL: process.env.ETHEREUM_PROVIDER_AVALANCHE,
    stateViewAddress: addresses.AVALANCHE_STATE_VIEW_ADDRESS,
    positionManagerAddress: addresses.AVALANCHE_POSITION_MANAGER_ADDRESS,
  },
  {
    chain: chains.mainnet,
    providerURL: process.env.EVM_PROVIDER_URL,
    stateViewAddress: addresses.ETHEREUM_STATE_VIEW_ADDRESS,
    positionManagerAddress: addresses.ETHEREUM_POSITION_MANAGER_ADDRESS,
  },
  {
    chain: chains.base,
    providerURL: process.env.ETHEREUM_PROVIDER_BASE,
    stateViewAddress: addresses.BASE_STATE_VIEW_ADDRESS,
    positionManagerAddress: addresses.BASE_POSITION_MANAGER_ADDRESS,
  },
] as const satisfies readonly ChainAndProviderURL[];
