import { Chain } from "viem";

export function createPoolKey({
  currency0 = "0x0000000000000000000000000000000000000000",
  currency1 = "0x0000000000000000000000000000000000000000",
  fee = 3000,
  tickSpacing = 60,
  hooks = "0x0000000000000000000000000000000000000000",
}) {
  return {
    currency0,
    currency1,
    fee,
    tickSpacing,
    hooks,
  };
}

export type ChainAndProviderURL = {
  chain: Chain | undefined;
  providerURL: string | undefined;
  stateViewAddress: string | undefined;
  positionManagerAddress: string | undefined;
};

export type PoolKey = {
  currency0: '0x${string}';
  currency1: '0x${string}';
  fee: number;
  tickSpacing: number;
  hooks: '0x${string}';
};
