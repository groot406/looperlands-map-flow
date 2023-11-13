<template>
  <div id="worksheet" class="flex flex-col w-full h-screen bg-slate-100 fixed" @mousedown="startDragSelect">
    <div v-if="dragSelect" class="bg-blue-500 opacity-10 absolute" :style="dragSelectStyle"></div>
    <div class="text-white bg-slate-800 shadow-xl select-none items-center" id="worksheet">
      <div class="flex flex-row items-center select-none justify-between">
        <div class="flex flex-row items-center gap-x-2">
          <img src="../assets/looperlandlogo.png" class="h-[100px] mx-4"/>
          <h1 class="p-4 text-2xl font-header font-thin">LooperLands Map Flow</h1>
          <div class="ml-10 flex flex-row gap-x-4">
            <n-dropdown
                :disabled="!mapFlowLoaded"
                :options="blockOptions"
                placement="bottom-start"
                trigger="hover"
                @select="addBlock"
            >
              <n-button class="text-white" :class="{'opacity-50 cursor-not-allowed' : !mapFlowLoaded }">
                Add +
              </n-button>
            </n-dropdown>
            <Icon size="36">
              <UndoFilled
                  :class="{'text-slate-600': !hasUndoState, 'text-slate-300 hover:text-slate-100 cursor-pointer': hasUndoState }"
                  @click="undo"
              ></UndoFilled>
            </Icon>
            <Icon size="36">
              <RedoFilled
                  :class="{'text-slate-600': !hasRedoState, 'text-slate-300 hover:text-slate-100 cursor-pointer': hasRedoState }"
                  @click="(hasRedoState) ? redo() : ''"
              ></RedoFilled>
            </Icon>
          </div>
        </div>

        <div class="mr-10 flex flex-row items-center">
          <div v-if="mapTokens && mapTokens.length > 0" class="mr-10 text-lg text-slate-200 hover:text-white cursor-pointer"
               @click="showSetup">
            <n-tooltip>
              <template #trigger>
                <n-icon size="32">
                  <DisplaySettingsOutlined/>
                </n-icon>
              </template>
              Update map-settings
            </n-tooltip>
          </div>
          <div v-if="mapFlowLoaded" class="mr-10 text-lg text-slate-200 hover:text-white cursor-pointer"
               @click="publishJson">
            <n-tooltip>
              <template #trigger>
                <n-icon size="32">
                  <PublishFilled/>
                </n-icon>
              </template>
              Publish flow to game
            </n-tooltip>
          </div>
          <div class="mr-10 text-lg text-slate-200 hover:text-white cursor-pointer text-white" v-if="mapFlowLoaded">
            <WalletConnect @tokens="(tokens) => mapTokens = tokens"></WalletConnect>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-slate-400 w-1/1 overflow-y-hidden overflow-x-auto flex flex-row gap-x-1 select-none"
         v-if="mapFlowLoaded">
      <div @click="clickTab(tab, tabIdx)"
           class="cursor-pointer flex flex-row items-center gap-x-2 pr-4 mt-2 rounded-t-xl shadow-xl border border-b-0 pt-2 pb-1 px-6 w-max select-none"
           :class="{'bg-slate-100' : tab === activeTab,  'bg-slate-300 hover:bg-slate-200': tab!== activeTab }"
           v-for="(tab, tabIdx) in tabs">
        <div v-if="editTab !== tabIdx">{{ tab }}</div>
        <n-input class="text-xs" size="small" v-else v-model:value="tabs[tabIdx]" @keydown.enter="renameTab"/>
        <n-icon v-if="editTab!== tabIdx" @click.stop="removeTab(tabIdx)" class="opacity-50 hover:opacity-100">
          <Close/>
        </n-icon>
      </div>
      <div
          class="cursor-pointer mt-2 rounded-t-xl shadow-xl border border-b-0 pt-2 pb-1 px-6 w-max bg-slate-300 hover:bg-slate-200"
          @click="addTab">+
      </div>
    </div>
    <div class="overflow-auto w-1/1 select-none" v-if="mapFlowLoaded">
      <div id="lines" class="lines absolute top-0">
        <Line v-for="(line, idx) in lines"
              :key="line[0] + '_' + line[1] + '_' + line[2]"
              :idx="idx"
              :from="blocks[line[0]] ? blocks[line[0]].position : {}" :fromIdx="line[0]"
              :to="blocks[line[1]] ? blocks[line[1]].position : {}" :toIdx="line[1]"
              :connector="line[2]"
              :enter="line[3] !== true"
              :disconnected="lineIsDisconnected(idx)"
              @removed="removeLine"
        />
      </div>

      <template v-for="(block, idx) in blocks">
        <Block :idx="idx"
               :key="idx"
               v-if="blockDefinitions[block.group][block.block]"
               :icon="blockDefinitions[block.group][block.block].icon"
               :type="blockDefinitions[block.group][block.block].type"
               :category="blockDefinitions[block.group][block.block].category"
               :tags="blockDefinitions[block.group][block.block].tags"
               :throws-error="blockDefinitions[block.group][block.block].throwsError"
               :lines="lines"
               :disconnected="blockIsDisconnected(idx)"
               :block="block"
               @moved="moveBlocks"
               @newLine="createNewLine"
               @remove="removeBlock"
               @start="startTestMode"
               @stop="exitTestMode"
        >

          <div class="flex flex-row py-1 gap-x-0.5">
            <template v-for="part in parseBlockTemplate(block.group, block.block, block.variables)">
              <div class="text-xs py-0.5 font-light border border-transparent" v-if="part.type === 'string'"
                   v-html="part.text"/>
              <variable v-if="part.type === 'variable'"
                        :name="part.text"
                        v-model="block.variables[part.text]"
                        :tags="getTagsForBlock(block, idx)"
                        :settings="blockDefinitions[block.group][block.block].variables ? (blockDefinitions[block.group][block.block].variables[part.text] ?? {}) : {}"
                        @updated="() => { saveBlocks(); addState(); }"
                        @update:modelValue="redrawLines"/>
            </template>
          </div>
        </Block>
      </template>
    </div>
    <div v-if="!mapFlowLoaded" class="w-full text-center mt-20">
      <h1 class="text-4xl text-slate-400">Please connect your wallet to locate your map-token</h1>
      <h2 class="text-xl text-slate-400">We use the map-token + apikey to publish the flow to looperlands.</h2>
      <div class="text-gray-700 mt-6">
        <WalletConnect @tokens="(tokens) => mapTokens = tokens"></WalletConnect>
      </div>
    </div>
  </div>
  <div
      class="shadow-md text-slate-400 absolute bottom-4 rounded-full bg-white py-3 left-[calc(50%-100px)] w-60 text-center hover:shadow-xl transition-all opacity-90 hover:opacity-100"
      v-if="testMode">
    <span class="px-4 border-r border-slate-300">
      <template v-if="testIsFinished">
      Test finished
      </template>
      <template v-else>
      Testing...
      </template>
    </span>
    <span v-if="testIsFinished" class="text-blue-400 hover:text-blue-700 px-4 hover:underline cursor-pointer"
          @click="exitTestMode">Exit</span>
    <span v-if="!testIsFinished" class="text-red-400 hover:text-red-700 px-4 hover:underline cursor-pointer"
          @click="exitTestMode">Stop</span>
  </div>

  <n-modal v-model:show="showSetupModal">
    <n-card style="width: 600px"
            title="Setup"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true">
      <n-form-item label="Select your map-token">
        <div class="grid grid-cols-3 gap-2 w-full bg-slate-100 rounded-lg p-2">
          <div v-for="mapToken in mapTokens"
               class="hover:opacity-100 cursor-pointer overflow-hidden shadow-inner rounded-lg"
               :class="{'opacity-60': mapToken !== selectedMap, 'shadow-lg': mapToken === selectedMap }"
               @click="selectMap(mapToken)"><img
              :src="'https://loopworms.io/DEV/LooperLands/Maps/img/' + mapToken + '.png'"/></div>
        </div>
      </n-form-item>
      <n-form-item label="Looperlands Map (linked to the token)">
        <n-select v-model:value="mapName" :options="mapOptions" :disabled="!selectedMap"
                  placeholder="Select the connected map"/>
      </n-form-item>
      <n-form-item label="Looperlands API-KEY">
        <n-input v-model:value="apiToken" placeholder="API-KEY"/>
      </n-form-item>
      <n-button @click="saveConfig" :disabled="!selectedMap || !apiToken || !mapName" type="primary"
                class="text-green-700">Load map-flow
      </n-button>
    </n-card>
  </n-modal>
</template>


<script setup lang="ts">
import {computed, nextTick, onMounted, provide, ref, toRaw, watch, reactive} from 'vue'
import Block from './Block.vue'
import Line from './Line.vue'
import {useMouse} from '@vueuse/core'
import {DisplaySettingsOutlined, PublishFilled, RedoFilled, UndoFilled} from '@vicons/material'
import Variable from "./Variable.vue";
import {Flow, FlowService} from '../flow';
import blockDefinitions from '../../config/blocks';
import _ from 'lodash'
import {Close} from '@vicons/ionicons5';
import axios from 'axios'
import WalletConnect from "./WalletConnect.vue";
import {useNotification} from 'naive-ui'

const {x, y} = useMouse()

const tags = {}
const mapTokens = ref([]);

const editTab = ref(-1);
const activeTab = ref('Flow #1')
const tabs = ref(['Flow #1'])
const allBlocks = reactive({});
const allLines = reactive({});

const blocks = ref({})
const lines = ref([])
const isCreatingNewLine = ref(false)
const snappedBlock = ref(null)
const newLine = ref(null)
const apiToken = ref(null)

const selectedBlocks = ref([]);
const testMode = ref(false);
const testStartBlock = ref(null);
const activatedBlocks = ref({'all': [], 'out': [], 'true': [], 'false': [], 'error': []})

const maps = ref([]);
const selectedMap = ref(null);
const mapName = ref(null);

const triggers = ref([]);
const mobs = ref({});
const npcs = ref({});
const items = ref({});
const quests = ref({});
const layers = ref([]);
const music = ref([]);
const sounds = ref([]);
const areas = ref({});
let animations = ['walk_left', 'walk_right', 'walk_up', 'walk_down', 'idle_left', 'idle_right', 'idle_up', 'idle_down', 'attack_left', 'attack_right', 'attack_up', 'attack_down', 'die_left', 'die_right', 'die_up', 'die_down', 'special_left', 'special_right', 'special_up', 'special_down'];

const notification = useNotification();

const mapFlowLoaded = ref(false);

const subTags = {
  player: {
    name: 'string',
  },
  mob: {
    kind: 'string',
    name: 'string'
  },
  npc: {
    kind: 'string',
    name: 'string'
  },
  item: {
    kind: 'string',
    name: 'string'
  },
  area: {
    topLeft: 'coordinate',
    bottomRight: 'coordinate',
    name: 'string'
  },
  quest: {
    name: {type: 'string'},
    description: {type: 'string'},
    target: {type: 'string'},
    total: {type: 'integer'},
    done: {type: 'integer'},
    remaining: {type: 'integer'},
    status: {type: 'string'},
    open: {type: 'boolean'},
    completed: {type: 'boolean'},
  },
  layer: {
    name: 'string'
  },
}

provide('mobs', mobs);
provide('npcs', npcs);
provide('items', items);
provide('quests', quests);
provide('layers', layers);
provide('music', music);
provide('sounds', sounds);
provide('animations', animations);
provide('triggers', triggers);
provide('areas', areas);

onMounted(initialize);
onMounted(loadMaps);

window.addEventListener('mouseup', handleMouseUp, false);
window.addEventListener('mouseup', stopDragSelect, false);

const showSetupModal = ref(false);
const isSyncing = ref(false);
const setupComplete = ref(false);

watch(mapTokens, (value, oldValue) => {
  if (mapTokens.value !== null && mapTokens.value.length && !setupComplete.value) {
    showSetupModal.value = true;
  }

  if (mapTokens.value === null || !mapTokens.value.length) {
    selectedMap.value = null;
    setupComplete.value = false;
    mapFlowLoaded.value = false;
  }
})

const blockOptions = computed(() => {
  let options = [];

  options.push({
    label: 'When', key: 'when', children: _.map(blockDefinitions.when, (block, key) => {
      block.group = 'when';
      return {label: block.description, key: key, block: block}
    })
  })

  options.push({
    label: 'And', key: 'and', children: _.map(blockDefinitions.and, (block, key) => {
      block.group = 'and';
      return {label: block.description, key: key, block: block}
    })
  })

  options.push({
    label: 'Then', key: 'then', children: getGroupedThenBlocks()
  })

  options.push({
    label: 'Special', key: 'special', children: _.map(blockDefinitions.special, (block, key) => {
      block.group = 'special';
      return {label: block.description, key: key, block: block}
    })
  })

  return options;
})

function getGroupedThenBlocks() {
  let blocks = _.map(blockDefinitions.then, (block, key) => {
    block.group = 'then';
    return {label: block.description, key: key, block: block}
  })

  let groupedBlocks = _.groupBy(blocks, (block) => {
    return block.block.category
  })

  let groupedBlocksArray = [];
  for (let i in groupedBlocks) {
    groupedBlocksArray.push({label: _.upperFirst(i), key: i, children: groupedBlocks[i]})
  }

  return groupedBlocksArray;
}

function parseBlockTemplate(group: string, block: string, variables: object) {
  let definition = blockDefinitions[group][block];

  if (!definition.render) {
    return definition.description;
  }

  let template = definition.render(variables);
  let templateVariables = [...template.matchAll(/{([.^\w]*)}/gm)]

  let parts = [];
  if (templateVariables.length) {
    let templateParts = template.split('{');
    for (let i in templateParts) {
      let subPart = templateParts[i];
      if (subPart.indexOf('}') === -1) {
        parts.push({type: 'string', text: subPart.trim()})
        continue;
      }

      let subParts = subPart.split('}')
      if (subPart.indexOf('}') < (subPart.length - 1)) {
        parts.push({type: 'variable', text: subParts[0].trim()})
        parts.push({type: 'string', text: subParts[1].trim()})
      } else {
        parts.push({type: 'variable', text: subParts[0].trim()})
      }
    }
  } else {
    parts.push({type: 'string', text: template.trim()})
  }

  return parts;
}

function removeLine(lineIdx) {
  lines.value.splice(lineIdx, 1);
  saveLines()
  addState()
}

function initialize() {
  apiToken.value = localStorage.getItem('apiToken');
}

function moveBlocks() {
  saveBlocks();
  addState();
}

function saveTabs() {
  localStorage.setItem('activeTab', activeTab.value);
}

function saveBlocks() {
  allBlocks[activeTab.value] = toRaw(blocks.value);
}

function saveLines() {
  allLines[activeTab.value] = toRaw(lines.value);
}

function createNewLine(blockIdx, lineType) {
  isCreatingNewLine.value = true;

  lines.value.push([blockIdx, 'new', lineType])
  newLine.value = [blockIdx, 'new', lineType]
}

function handleMouseUp() {
  let addedLine = false;
  if (snappedBlock.value) {
    newLine.value[1] = snappedBlock.value.idx;

    if (!hasLine(newLine.value)) {
      lines.value.push(newLine.value)
      addedLine = true;
    }
  }

  removeNewLine()
  saveLines()

  if (addedLine) {
    addState();
  }
}

function hasLine(line) {
  for (let i in lines.value) {
    if (lines.value[i][0] === line[0] && lines.value[i][1] === line[1] && lines.value[i][2] === line[2]) {
      return true;
    }
  }
  return false;
}

function removeNewLine() {
  newLine.value = null
  snappedBlock.value = null;
  isCreatingNewLine.value = false;

  for (let i in lines.value) {
    if (lines.value[i][0] === 'new' || lines.value[i][1] === 'new') {
      lines.value.splice(i, 1);
      return;
    }
  }
  snappedBlock.value = null;
}

function removeBlock(idx) {

  delete blocks.value[idx];

  let newLines = [];
  for (let i in lines.value) {
    if (lines.value[i][0] !== idx && lines.value[i][1] !== idx) {
      newLines.push(lines.value[i])
    }
  }

  lines.value = newLines;

  saveLines();
  saveBlocks();
  addState();
}

function addBlock(blockType, block) {

  let maxTop = 0;

  for (let i in blocks.value) {
    if (blocks.value[i].position.top > maxTop) {
      maxTop = blocks.value[i].position.top;
    }
  }

  let left = 50
  if (block.type === 'and') {
    left = 150;
  }

  if (block.type === 'then') {
    left = 300;
  }

  blocks.value[uuidv4()] = {
    position: {left: left, top: Math.max(90, maxTop) + 100},
    group: block.block.group,
    block: blockType,
    variables: {}
  };

  saveBlocks();
  addState();
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const startDragPosition = ref(null);
const dragSelect = ref(false);

function startDragSelect(event) {
  if (testMode.value) {
    return
  }
  if (event.target.id !== 'worksheet') {
    event.stopPropagation();
    return false;
  }

  for (let i in blocks.value) {
    blocks.value[i].selected = false;
  }

  dragSelect.value = true;
  startDragPosition.value = {left: event.x, top: event.y}
  window.addEventListener('mousemove', doDragSelect, false);
}

function stopDragSelect(event) {
  dragSelect.value = false;
  window.removeEventListener('mousemove', doDragSelect);
}

function doDragSelect(event) {
  let startX = Math.min(startDragPosition.value.left, x.value);
  let startY = Math.min(startDragPosition.value.top, y.value);
  let endX = Math.max(startDragPosition.value.left, x.value);
  let endY = Math.max(startDragPosition.value.top, y.value);

  let selected = [];

  for (let i in blocks.value) {
    let blockEl = document.getElementById('block_' + i);
    if (!blockEl) {
      continue;
    }

    let blockWidth = blockEl.clientWidth;
    let blockHeight = blockEl.clientHeight;
    if (
        (blocks.value[i].position.left + blockWidth) > startX &&
        (blocks.value[i].position.left) < endX &&
        (blocks.value[i].position.top + blockHeight) > startY &&
        (blocks.value[i].position.top) < endY
    ) {
      blocks.value[i].selected = true
      selected.push(i)
    } else {
      blocks.value[i].selected = false
    }
  }

  selectedBlocks.value = selected;
}

const dragSelectStyle = computed(() => {

  let startX = Math.min(startDragPosition.value.left, x.value);
  let startY = Math.min(startDragPosition.value.top, (y.value));
  let endX = Math.max(startDragPosition.value.left, x.value);
  let endY = Math.max(startDragPosition.value.top, (y.value));

  return {
    left: startX + 'px',
    top: startY + 'px',
    width: (endX - startX) + 'px',
    height: (endY - startY) + 'px',
  }
})

const currentState = ref({});
const states = ref({})
const hasUndoState = computed(() => {
  return (currentState.value[activeTab.value]) > 0;
})

const hasRedoState = computed(() => {
  return currentState.value[activeTab.value] < (Object.keys(states.value[activeTab.value] ?? {}).length - 1);
})

function addState() {
  if (!states.value[activeTab.value]) {
    states.value[activeTab.value] = [];
  }

  if (currentState.value[activeTab.value] === undefined) {
    currentState.value[activeTab.value] = -1;
  }

  states.value[activeTab.value][currentState.value[activeTab.value] + 1] = JSON.stringify({lines: toRaw(lines.value), blocks: toRaw(blocks.value)})
  currentState.value[activeTab.value] = currentState.value[activeTab.value] + 1;
  states.value[activeTab.value].splice(currentState.value[activeTab.value] + 1, states.value[activeTab.value].length)
}

function undo() {
  if (hasUndoState.value === true) {
    currentState.value[activeTab.value]--;
    reloadCurrentState()
  }
}

function redo() {
  if (hasRedoState.value === true) {
    currentState.value[activeTab.value]++;
    reloadCurrentState()
  }
}

function reloadCurrentState() {
  let backupState = JSON.parse(states.value[activeTab.value][currentState.value[activeTab.value]])
  blocks.value = {}
  nextTick(() => {

    lines.value = backupState.lines
    blocks.value = backupState.blocks

    for (let i in blocks.value) {
      blocks.value[i].selected = false
      let blockElement = document.getElementById('block_' + i);
      if (blockElement) {
        blockElement.style.top = blocks.value[i].position.top + 'px'
        blockElement.style.left = blocks.value[i].position.left + 'px'
      }
    }
    redrawLines()

    saveLines()
    saveBlocks()
  })
}

function redrawLines() {
  let storedLines = lines.value;
  lines.value = [];
  nextTick(() => {
    for (let i in storedLines) {
      storedLines[i][3] = true;
    }
    lines.value = storedLines;
  })
}

function getTagsForBlock(block, blockIdx) {
  let blockTags = getGeneratedTags(block, blockIdx)

  for (let i in tags) {
    blockTags[i] = tags[i]
  }

  return blockTags
}

function getGeneratedTags(block, blockIdx) {
  let tags = blockDefinitions[block.group][block.block].tags ?? {};

  for (let i in lines.value) {
    if (lines.value[i][1] === blockIdx) {
      let blockTags = getGeneratedTags(blocks.value[lines.value[i][0]], lines.value[i][0])
      for (let j in blockTags) {
        tags[j] = blockTags[j];
      }

      if (lines.value[i][2] === 'error') {
        tags['error'] = {tag: 'error', type: 'text', error: true}
      }
    }
  }

  return tags
}

function startTestMode(blockIdx) {
  exitTestMode()
  testStartBlock.value = blockIdx
  testMode.value = true;

  activatedBlocks.value.all.push(blockIdx);
  activatedBlocks.value.out.push(blockIdx);

  let service = new FlowService();
  let flow = service.createFlow(blockIdx, lines.value, blocks.value, blockDefinitions, (flow: Flow) => {
    blocks.value[flow.block.idx].flow = {}
    blocks.value[flow.block.idx].flow = flow

    if (flow.state !== 'blocked' && flow.state !== 'waiting') {
      activatedBlocks.value.all.push(flow.block.idx);
      if (flow.result) {
        if (flow.result.connector !== 'waiting') {
          activatedBlocks.value[flow.result.connector].push(flow.block.idx);
        }
      }

      if (flow.block.key === 'then.notification' && flow.state !== 'running' && flow.state !== 'error') {
        let message = blocks.value[flow.block.idx].variables.message
        let user = blocks.value[flow.block.idx].variables.user
        console.log('Send: ' + message + ' to: ' + user)
      }
    }
  })
  flow.start([{tag: 'user', value: 'testuser'}]);
}

const testIsFinished = computed(() => {
  if (!testMode.value) {
    return true;
  }

  for (let i in blocks.value) {
    if (blocks.value[i].flow && blocks.value[i].flow.state !== 'finished' && blocks.value[i].flow.state !== 'error' && blocks.value[i].flow.state !== 'blocked') {
      return false;
    } else {
    }
  }

  return true;
});

function blockIsDisconnected(blockIdx) {
  if (!testMode.value) {
    return false
  }

  return !getConnectedBlocks(testStartBlock.value).includes(blockIdx)
}

function lineIsDisconnected(lineIdx) {
  if (!testMode.value) {
    return false;
  }

  let connectedBlocks = getConnectedBlocks(testStartBlock.value);

  return !connectedBlocks.includes(lines.value[lineIdx][0]);
}

function getConnectedBlocks(blockIdx) {

  let connectedBlocks = [blockIdx];

  for (let i in lines.value) {
    if (lines.value[i][0] === blockIdx) {
      connectedBlocks.push(...getConnectedBlocks(lines.value[i][1]));
    }
  }

  return connectedBlocks;
}

function exitTestMode() {
  testMode.value = false;
  testStartBlock.value = null;
  activatedBlocks.value = {'all': [], 'true': [], 'false': [], 'error': [], 'out': []}

  for (let i in blocks.value) {
    blocks.value[i].flow = null;
  }
}

function addTab() {
  tabs.value.push('Flow #' + (tabs.value.length + 1))
  activeTab.value = tabs.value[tabs.value.length - 1]

  saveTabs();
}

let lastActiveTab = 0;

function clickTab(tab, tabIdx) {
  if (activeTab.value === tab) {
    lastActiveTab = tabs.value[tabIdx];
    editTab.value = tabIdx
  } else {
    activeTab.value = tab;
    editTab.value = -1
  }

  saveTabs();
}

function renameTab() {
  activeTab.value = tabs.value[editTab.value]
  allBlocks[activeTab.value] = allBlocks[lastActiveTab];
  delete allBlocks[lastActiveTab];

  //Move lines to new name, delete old
  allLines[activeTab.value] = allLines[lastActiveTab];
  delete allLines[lastActiveTab];

  editTab.value = -1
  lastActiveTab = -1

  saveTabs();
}

function removeTab(tabIdx) {
  if (tabs.value.length === 1) {
    return;
  }


  delete allBlocks[tabs.value[tabIdx]];

  // Remove lines
  delete allLines[tabs.value[tabIdx]];

  tabs.value.splice(tabIdx, 1);

  if (tabIdx === 0) {
    activeTab.value = tabs.value[0];
  } else {
    activeTab.value = tabs.value[tabIdx - 1];
  }

  blocks.value = allBlocks[activeTab.value] ?? {};
  lines.value = allLines[activeTab.value] ?? [];

  saveTabs();
}

watch(activeTab, () => {
  blocks.value = allBlocks[activeTab.value] ?? {}
  lines.value = allLines[activeTab.value] ?? []
})

function publishJson() {

  const json = {handlers: [], blocks: toRaw(allBlocks), lines: toRaw(allLines), tabs: toRaw(tabs.value) };
  console.log(json);
  _.forEach(allBlocks, (tabBlocks) => {
    _.forEach(tabBlocks, (block, idx) => {
      if (block.group != 'when') {
        return;
      }

      let event = {
        idx: idx,
        type: block.block,
        options: block.variables
      };

      let outputs = getOutputs(block, idx);
      _.forEach(outputs, (output, outputType) => {
        event[outputType] = output
      });

      json.handlers.push(event);
    });
  })

  let flowJson = JSON.stringify(json);

  axios.post('https://loopworms.io/DEV/LooperLands/Maps/saveLooperLand_Quest2.php?map=' + mapName.value, flowJson, {
    headers: {
      'X-API-KEY': apiToken.value
    }
  }).then((response) => {
    if (response.data.indexOf('Invalid API Key') !== -1) {
      notification.error({title: 'Failed to publish flow', content: 'Invalid API Key', duration: 5000})
    } else {
      notification.success({title: 'Successfully published to Looperlands', content: "Looperlands will fetch and reload the flow within a minute", duration: 5000});
    }
  })
}

function getOutputs(block, idx) {
  let outputs = {};

  _.forEach(allLines, (tabLines, tab) => {
    _.forEach(tabLines, (line) => {
      if (line[0] === idx) {
        let outputType = line[2];
        if (outputType === '') {
          outputType = 'then';
        }

        // console.log(line);

        if (!outputs[outputType]) {
          outputs[outputType] = [];
        }

        let outputBlock = allBlocks[tab][line[1]];
        let outputJson = {
          idx: line[1],
          type: outputBlock.block,
          options: outputBlock.variables
        };
        let blockOutputs = getOutputs(outputBlock, line[1]);
        _.forEach(blockOutputs, (output, outputType) => {
          outputJson[outputType] = output
        });

        outputs[outputType].push(outputJson)
      }
    })
  })
  return outputs;
}

function showSetup() {
  showSetupModal.value = true;
}

function sync() {
  isSyncing.value = true;
  processGameTypes();
}

function processGameTypes() {
  axios.get('https://raw.githubusercontent.com/looperlands/looperlands/map-flow-poc/shared/js/gametypes.js')
      .then((response) => {
        let gameTypes = response.data;
        let Types;
        eval(gameTypes);
        // loop over Types.Entities
        npcs.value = {};
        for (let i in Types.Entities) {
          let entity = Types.Entities[i];
          if (Types.isNpc(entity)) {
            npcs.value[entity] = i;
          }
          if (Types.isMob(entity)) {
            mobs.value[entity] = i;
          }
          if (Types.isObject(entity)) {
            items.value[entity] = i;
          }
        }

        isSyncing.value = false;
      })
}

function loadMaps() {
  axios.get('https://raw.githubusercontent.com/looperlands/looperlands/main/server/config.json').then((response) => {
    maps.value = response.data.maps;
  });
}

const mapOptions = computed(() => {
  let options = [];
  for (let i in maps.value) {
    options.push({label: maps.value[i], value: maps.value[i]})
  }
  options.push({label: 'Temp', value: 'degroottemp'})
  return options;
})

function saveConfig() {
  localStorage.setItem('apiToken', apiToken.value);
  showSetupModal.value = false;
  setupComplete.value = true;

  loadMapDetails();
}

function loadMapDetails() {
  axios.get('https://loopworms.io/DEV/LooperLands/Maps/selectLooperLands_Quest.php?NFTID=' + selectedMap.value)
      .then((response) => {

        let data = JSON.parse(response.data);
        Object.assign(allBlocks, data.blocks);
        Object.assign(allLines, data.lines);

        console.log(data.tabs);
        tabs.value = data.tabs;
        activeTab.value = tabs.value[0];

        blocks.value = allBlocks[activeTab.value] ?? {};
        lines.value = allLines[activeTab.value] ?? [];

        axios.get('https://raw.githubusercontent.com/looperlands/looperlands/map-flow-poc/server/maps/world_server_' + mapName.value + '.json').then((response) => {
          let mapDetails = response.data;
          delete mapDetails.collisions

          let mapTriggers = mapDetails.triggers;
          triggers.value = [];
          // Loop over mapTriggers array and add to triggers.value
          for (let i in mapTriggers) {
            let trigger = mapTriggers[i];
            if (trigger.trigger) {
              triggers.value.push(trigger.trigger)
            }

            areas.value[String(trigger.id)] = trigger.name ? trigger.name : (trigger.x + ',' + trigger.y + " - " + (trigger.x + trigger.w) + "," + (trigger.y + trigger.h));
          }

          // Loop over doors and add door.ttid
          let mapDoors = mapDetails.doors;
          for (let i in mapDoors) {
            let door = mapDoors[i];
            if (door.ttid) {
              triggers.value.push(door.ttid)
            }
          }

          layers.value = [];
          for (let i in mapDetails.hiddenLayers) {
            layers.value.push(i);
          }
        })

        axios.get('https://raw.githubusercontent.com/looperlands/looperlands/main/server/js/quests/' + mapName.value + '.js').then((response) => {
          //let mapQuests = JSON.parse(response.data;
          var result = '[' + response.data.match(/(?<=\[\s+).*?(?=\s+\])/gs) + ']';
          const Types = {Entities: {}, Medals: {}};
          result = result.replace(/^medal:.*\W?/gm, '');
          let mapQuests = eval(result);

          quests.value = {};
          for (let i in mapQuests) {
            quests.value[mapQuests[i].id] = mapQuests[i].name
          }
        })

        axios.get('https://raw.githubusercontent.com/looperlands/looperlands/main/client/js/audio.js').then((response) => {
          let audio = response.data;
          let musicNames = audio.match(/musicNames.*?\[.*?\].*?/gs);
          eval(musicNames[0]);
          music.value = musicNames;

          let soundNames = audio.match(/soundNames.*?\[.*?\].*?/gs);
          eval(soundNames[0]);
          sounds.value = soundNames;
        })

        mapFlowLoaded.value = true;
      })
}

function selectMap(mapToken) {
  selectedMap.value = mapToken;
}

watch(mapName, (value, oldValue) => {
  if (value) {
    sync();
  }
})

provide('isCreatingNewLine', isCreatingNewLine)
provide('snappedBlock', snappedBlock)
provide('newLine', newLine)
provide('selectedBlocks', selectedBlocks)
provide('blocks', blocks);
provide('testMode', testMode);
provide('testStartBlock', testStartBlock);
provide('activatedBlocks', activatedBlocks);
provide('testIsFinished', testIsFinished)
</script>