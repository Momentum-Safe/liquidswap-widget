<template>
  <swap-container class="swap__container"></swap-container>
  <connect-wallet-dialog v-model:visible="mainStore.dialogs.connectWallet" />
  <swap-confirm-dialog v-model:visible="mainStore.dialogs.swapConfirm" />
  <invalid-network-dialog v-model:visible="mainStore.dialogs.invalidNetwork" />
  <price-impact-warning-dialog v-model:visible="mainStore.dialogs.priceImpact" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { SwapContainer } from './Swap';
import { usePoolsStore, useStore, useTokensStore } from "@/store";
import { ConnectWalletDialog } from '@/components/ConnectWalletDialog';
import { SwapConfirmDialog } from '@/components/SwapConfirmDialog';
import { InvalidNetworkDialog } from '@/components/InvalidNetworkDialog';
import { PriceImpactWarningDialog } from "@/components/PriceImpactWarningDialog";
import './styles/index.scss';


const props = defineProps<{
  dataAccount?: string; // account address like 0x....da14
  dataNetwork?: string; // { name?: string; chainId?: string } as JSON
  dataTransaction?: string; // { status: 'pending' | 'success' | 'error' | 'rejected'; hash: string | null } as JSON
}>();
// initialize stores
(async () => {
  const tokensStore = useTokensStore();
  await tokensStore.fetchCoinsList();
  const poolsStore = usePoolsStore();
  await poolsStore.fetchPoolsList();
  useStore();
})();
const mainStore = useStore();

function checkNativeWallet (){
  if (props.dataAccount && props.dataNetwork) {
    mainStore.insideNativeWallet.value = true;
    mainStore.dappWalletAccount.value = props.dataAccount;
    mainStore.dappNetworkData.value = JSON.parse(props.dataNetwork);
    mainStore.dappStatusTransaction.value = props?.dataTransaction && JSON.parse(props.dataTransaction).status;
    mainStore.dappTransactionHash.value = props?.dataTransaction && JSON.parse(props.dataTransaction)?.hash;
  }
}

checkNativeWallet();
watch([props], () => {
  checkNativeWallet();
})
</script>
