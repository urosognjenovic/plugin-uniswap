import { slice } from "viem";

// Get the position info of a pool with a specific position ID
export const getPositionInfoWithPositionID = async (
  stateView: any,
  poolId: `0x${string}`,
  positionId: `0x${string}`
) => {
  try {
    const [liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128] =
      await stateView.read.getPositionInfo(poolId, positionId);

    return {
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
    };
  } catch (error) {
    throw new Error("Error fetching position info: " + error);
  }
};

// Get the pool keys of a pool: currency0, currency1, fee, tickSpacing, hooks
export const getPoolKeys = async (
  positionManager: any,
  poolId: `0x${string}`
) => {
  try {
    const poolIdBytes25 = slice(poolId, 0, 25);
    const [currency0, currency1, fee, tickSpacing, hooks] =
      await positionManager.read.poolKeys([poolIdBytes25]);

    return {
      currency0,
      currency1,
      fee,
      tickSpacing,
      hooks,
    };
  } catch (error) {
    throw new Error("Error fetching pool keys: " + error);
  }
};
