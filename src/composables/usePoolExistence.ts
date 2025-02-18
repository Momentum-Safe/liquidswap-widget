import { Ref, ref, watch } from 'vue';

import { ICreateToken, IPoolExist, TVersionType } from '@/types';
import { useStore } from "@/store";

type CurveType = 'stable' | 'uncorrelated';

export function usePoolExistence() {
  const mainStore = useStore();
  const sdk = mainStore.sdk;

  const poolExists = ref<boolean>(false);
  const isFetching = ref<boolean>(false);

  async function checkExistence(params: IPoolExist): Promise<boolean> {
    isFetching.value = true;
    if (params.curve === undefined) {
      throw new Error('Curve type is undefined');
    }
    try {
      const response = await sdk.value.Swap.getLiquidityPoolResource({
        fromToken: params.fromCoin,
        toToken: params.toCoin,
        curveType: params.curve as CurveType,
        version: params.version,
      });
      isFetching.value = false;
      return !!response.liquidityPoolResource;
    } catch (error) {

      console.log('check Pool Existence error', error);
      return false;
    } finally {
      isFetching.value = false;
    }
  }

  async function check(params: IPoolExist) {
    poolExists.value = await checkExistence(params);
  }

  function reset() {
    poolExists.value = false;
  }

  function watchChanges(
    from: ICreateToken,
    to: ICreateToken,
    curve: Ref<CurveType>,
    version: Ref<TVersionType>,
  ) {
    watch(
      [from.token, to.token, curve.value, version.value],
      async () => {
        if (!from.token || !to.token) {
          reset();
        } else {
          await check({
            fromCoin: from.token,
            toCoin: to.token,
            curve: curve.value,
            version: version.value
          });
        }
      },
      {
        immediate: true,
      },
    );
  }

  return {
    // data
    isFetching,
    poolExists,

    // methods
    check,
    watch: watchChanges,
    reset,
  };
}
