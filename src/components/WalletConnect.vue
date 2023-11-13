<script setup>
import {createWeb3Modal, useWeb3Modal, useWeb3ModalState} from '@web3modal/wagmi/vue'
import {mainnet} from 'viem/chains'
import {EIP6963Connector, walletConnectProvider} from '@web3modal/wagmi'
import {configureChains, createConfig, getAccount, InjectedConnector} from '@wagmi/core'
import {publicProvider} from '@wagmi/core/providers/public'
import {CoinbaseWalletConnector} from '@wagmi/core/connectors/coinbaseWallet'
import {WalletConnectConnector} from '@wagmi/core/connectors/walletConnect'
import {defineEmits, ref} from 'vue'
import axios from 'axios'
import {useNotification} from 'naive-ui'
const emit = defineEmits(['tokens'])
const notification = useNotification();
// 1. Get projectId
const projectId = '3b0ac63ed1ee63169eff628af6790612'

// 2. Configure wagmi client
const {chains, publicClient} = configureChains(
    [mainnet],
    [walletConnectProvider({projectId}), publicProvider()]
)

const metadata = {
  name: 'Looperlands Map-Flow',
  description: 'Map-Flow is a tool for creating and publishing flows for your map.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({chains, options: {projectId, showQrModal: false, metadata}}),
    new EIP6963Connector({chains}),
    new InjectedConnector({chains, options: {shimDisconnect: true}}),
    new CoinbaseWalletConnector({chains, options: {appName: metadata.name}})
  ],
  publicClient
})

// 3. Create modal
createWeb3Modal({wagmiConfig, projectId, chains})

const modal = useWeb3Modal()
const state = useWeb3ModalState()
const account = ref({});
const tokens = ref(null);
const notified = ref(false);

let accountInterval = setInterval(() => {
  account.value = getAccount();
  if (account.value.isConnected && tokens.value === null) {
    loadMapTokens();
  }

  if(!account.value.isConnected) {
    tokens.value = null;
    emit('tokens', tokens.value);
  }
}, 500);

function openModal() {
  modal.open();
}

function loadMapTokens() {
  axios.get('https://loopworms.io/DEV/LooperLands/Maps/map_picker_degroot.php?WalletID=' + account.value.address).then((response) => {
    if(response.data === null) {
     tokens.value = [];
    } else {
      tokens.value = response.data.flat();
    }
    emit('tokens', tokens.value);

    if(tokens.value.length <= 0 && !notified.value) {
      notified.value = true;
      notification.warning({
        title: 'No tokens found',
        description: 'No tokens found for this wallet. Please make sure you are connected to the correct wallet.',
        duration: 5000
      });
    }
  });
}
</script>

<template>
  <n-button v-if="!account.isConnected" class="text-current" type="info" @click="openModal">Connect wallet</n-button>
  <n-button v-else class="text-green-700" type="success" @click="openModal">
    <n-ellipsis class="w-[100px]">{{ account.address }}</n-ellipsis>
  </n-button>
</template>