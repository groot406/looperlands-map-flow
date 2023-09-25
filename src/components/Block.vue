<template>
  <v-contextmenu ref="contextmenu">
    <div class="w-60 flex flex-col">
      <v-contextmenu-item @click="start">
        <div class="hover:bg-slate-100 text-slate-600 p-3 flex flex-grow cursor-pointer">
          <div class="flex-grow">Test from here</div>
          <Icon>
            <PlayCircle/>
          </Icon>
        </div>
      </v-contextmenu-item>
      <div class="border-b mx-2"></div>
      <v-contextmenu-item @click="removeBlock">
        <div class="hover:bg-red-50 text-red-500 p-3 flex flex-row cursor-pointer">
          <div class="flex-grow">Delete</div>
          <Icon>
            <Trash/>
          </Icon>
        </div>
      </v-contextmenu-item>
      <div class="border-b mx-2"></div>
      <v-contextmenu-item @click="removeSelectedBlocks" v-if="selectedBlocks.length > 0">
        <div class="hover:bg-red-50 text-red-500 p-3 flex flex-row cursor-pointer">
          <div class="flex-grow">Delete <b>{{ selectedBlocks.length }}</b> selected blocks</div>
          <Icon>
            <Trash/>
          </Icon>
        </div>
      </v-contextmenu-item>
    </div>
  </v-contextmenu>
  <div :id="'block_' + idx" v-drag
       class="block flex items-center group transition-opacity duration-500"
       :class="[type, state, disconnected ? 'grayscale opacity-50 pointer-events-none' : '', hasError ? 'error' : '']"
       ref="blockEl"
       @mouseover="handleMouseOver"
       @mouseout="handleMouseOut"
       v-contextmenu:contextmenu
       @v-drag-moving="updatePosition" :style="styles"
       @v-drag-end="dragged">
    <div class="leftConnectors z-10 flex flex-col gap-y-2"
         v-if="type === 'and' || type === 'then' || type === 'any' || type === 'all' || type === 'delay'">
      <Connector position="left" :connected="hasInConnection()"/>
    </div>
    <div
        class="flex relative content flex-row min-w-[10px] transition-all duration-200 items-center text-slate-600 p-1 bg-white cursor-pointer hover:bg-slate-50 hover:border-slate-50"
        :class="classes" @mousedown="state = 'dragging'" @mouseup="state = 'idle'">
      <div>
        <div v-if="icon" class="icon w-8 h-8 rounded-full text-white flex items-center justify-center opacity-100"
             :class="iconBackground">
          <Icon size="24">
            <component v-if="type !== 'start'" :is="iconComponent"/>
            <Icon v-if="type === 'start' && !testIsFinished" size="30"
                  class="running absolute top-[5px] left-[5px] pointer-events-none">
              <LoadingOutlined v-if="testStartBlock === idx"></LoadingOutlined>
            </Icon>
            <component v-if="type === 'start' && testStartBlock !== idx" :is="iconComponent" @click="handleStart"/>
            <StopRound @click="stop" v-if="type === 'start' && testStartBlock === idx && !testIsFinished"></StopRound>
            <CheckRound @click="stop" v-if="testStartBlock === idx && testIsFinished && testIsFinished"></CheckRound>
          </Icon>
        </div>
        <div v-if="block.group === 'when'"
             class="play w-8 h-8 absolute left-2 top-2 rounded-full text-white flex items-center justify-center border border-blue-500 bg-gradient-to-r from-blue-400 to-blue-600"
             :class="{
              'opacity-0': testStartBlock !== idx,
            }
         ">
          <Icon size="30" class="running absolute top-0 left-0 pointer-events-none">
            <LoadingOutlined v-if="testStartBlock === idx && !testIsFinished"></LoadingOutlined>
          </Icon>
          <Icon size="24" class="">
            <PlayArrowRound @click="start" v-if="testStartBlock !== idx"></PlayArrowRound>
            <StopRound @click="stop" v-if="testStartBlock === idx && !testIsFinished"></StopRound>
            <CheckRound @click="stop" v-if="testStartBlock === idx && testIsFinished"></CheckRound>
          </Icon>
        </div>
      </div>
      <div v-if="type !== 'start'" class="p-0.5 pl-2 select-none">
        <div class="text-[8px] uppercase text-slate-400 -mb-1 flex flex-row">
          {{ category }}
          <div v-if="tags" class="ml-2 hover:text-slate-700 -mb-2">
            <n-popover trigger="click" placement="bottom" raw>
              <template #trigger>
                <Icon size="12">
                  <IosPricetag/>
                </Icon>
              </template>
              <div class="flex flex-col w-60 bg-white">
                <div v-for="tag in tags" class="flex flex-row items-center p-1 hover:bg-slate-100">
                  <div class="font-mono text-xs w-12 text-slate-400">{{ tag.type }}</div>
                  <div class="text-slate-600">{{ tag.tag }}</div>
                </div>
              </div>
            </n-popover>
          </div>
        </div>
        <div class="text-md" :class="{ 'w-8 h-8': (type === 'any' || type === 'all') }">
          <template v-if="type === 'any' && testMode">
            <div class="uppercase -left-0.5 text-[8px] text-slate-400 font-light relative top-0.5">any</div>
            <div class="flex items-center mb-1 text-slate-400 font-normal text-sm font-mono">
              {{ block?.flow?.block?.handled ?? '0' }}/{{ getInConnections() }}
            </div>
          </template>
          <template v-if="type === 'all' && testMode">
            <div class="uppercase -left-0.5 text-[8px] text-slate-400 font-light relative top-0.5">all</div>
            <div class="flex items-center mb-1 text-slate-400 font-normal text-sm font-mono">
              {{ block?.flow?.block?.handled ?? '0' }}/{{ getInConnections() }}
            </div>
          </template>
          <slot v-if="!testMode || (type !== 'any' && type !== 'all')"></slot>
        </div>
      </div>

      <n-popover trigger="hover" v-if="type !== 'start' && testMode && activated && !hasError" placement="bottom">
        <template #trigger>
          <div class="loadingIndicator" :style="getBlockLoaderStyle(block)"></div>
        </template>
        <div class="text-xs">
          <div>Finished card in <b>{{ Math.round(block?.flow?.result?.took / 100) / 10 }}s</b></div>
          <div v-if="generatedTags.length > 0">
            <div class="mt-2">Generated tags:</div>
            <div class="text-xs" v-for="tag in generatedTags"><span class="font-bold text-xs">{{ tag.tag }}</span>:
              {{ tag.value }}
            </div>
          </div>
        </div>
      </n-popover>
      <n-popover trigger="hover" v-if="type !== 'when' && type !== 'start' &&testMode && activated && hasError"
                 placement="bottom">
        <template #trigger>
          <div class="errorIndicator"></div>
        </template>
        <div class="text-xs">
          <div><b>Error:</b> {{ block?.flow?.result?.error }}</div>
        </div>
      </n-popover>
    </div>
    <div class="rightConnectors flex flex-col gap-y-2">
      <template v-if="type === 'and'">
        <Connector type="true" :connected="hasTrueConnection()" @mousedown.prevent.stop="startNewLine(idx, 'true')"/>
        <Connector type="false" :connected="hasFalseConnection()" @mousedown.prevent.stop="startNewLine(idx, 'false')"/>
      </template>
      <Connector v-else :connected="hasOutConnection()" @mousedown.prevent.stop="startNewLine(idx, '')"/>
    </div>
    <div class="errorConnector block flex w-full h-full items-end pointer-events-none" v-if="throwsError">
      <Connector class="top-1 pointer-events-auto" type="error" :connected="hasErrorConnection()"
                 @mousedown.prevent.stop="startNewLine(idx, 'error')"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, inject, ref, shallowRef, watch} from "vue"
import {IosPricetag} from "@vicons/ionicons4"
import {PlayCircle} from "@vicons/ionicons5"
import {LoadingOutlined} from "@vicons/antd"
import {CheckRound, PlayArrowRound, StopRound} from "@vicons/material"
import {Trash} from '@vicons/tabler';
import Connector from "./Connector.vue";
import {NPopover} from 'naive-ui';

const props = defineProps({
  idx: String,
  type: String,
  category: String,
  throwsError: Boolean,
  icon: String,
  tags: Object,
  leftConnector: Number,
  rightConnector: Number,
  block: Object,
  lines: Array,
  disconnected: Boolean
})

const emit = defineEmits(['moved', 'newLine', 'remove', 'start', 'stop'])

const blockEl = ref(null)
const pos = ref(props.block.position)
const state = ref('idle')
const dragging = ref(false)
const hasBeenDragged = ref(false)

const isCreatingNewLine = inject('isCreatingNewLine')
const newLine = inject('newLine')
const snappedBlock = inject('snappedBlock');
const selectedBlocks = inject('selectedBlocks')
const blocks = inject('blocks')
const activatedBlocks = inject('activatedBlocks')
const testIsFinished = inject('testIsFinished')

const activated = computed(() => activatedBlocks.value.all.includes(props.idx))

const styles = {
  top: props.block.position.top + 'px',
  left: props.block.position.left + 'px'
};

const testMode = inject('testMode')
const testStartBlock = inject('testStartBlock')

watch(props.block.position, () => {
  if (dragging.value === false) {
    blockEl.value.style.top = props.block.position.top + 'px';
    blockEl.value.style.left = props.block.position.left + 'px'
  }
})

const iconComponent = shallowRef(null)
if (props.icon) {
  import('@vicons/material').then((icons) => {
    iconComponent.value = icons[props.icon];
  });
}

const classes = computed(() => {
  let classList = [props.type];

  if (props.block.selected) {
    classList.push('selected')
  }

  if (props.type === 'when') {
    classList.push('rounded-l-[100px]', 'rounded-r-[15px]')
  } else {
    if (props.type === 'start') {
      classList.push('rounded-full')
    } else {
      if (props.type === 'any' || props.type === 'all') {
        classList.push('rounded')
      } else {
        classList.push('rounded')
      }
    }
  }

  if (props.type === 'any' || props.type === 'all') {
    classList.push('anyall')
  }

  if (state.value === 'highlighted' || props.block.selected) {
    classList.push('border-2', 'border-blue-400', 'bg-blue-50')
  } else {
    classList.push('border-white', 'border-2')
  }

  if (state.value === 'dragging') {
    classList.push('shadow-xl')
  } else {
    classList.push('shadow-md', 'hover:shadow-lg')
  }

  if (props.type !== 'start') {
    classList.push('px-2');
  }

  if (activated.value && testMode.value) {
    classList.push('activated')
  }

  return classList
})

const iconBackground = computed(() => {
  if (props.type === 'when') {
    return 'bg-green-400'
  }

  if (props.type === 'and') {
    return 'bg-orange-400'
  }

  if (props.type === 'start') {
    return 'bg-gradient-to-r from-blue-400 to-blue-600 border border-blue-500'
  }

  return 'bg-blue-400'
})

const generatedTags = computed(() => {
  if (!props.block?.flow?.result?.tags) {
    return []
  }

  let tags = [];
  for (let i in props.block.flow.result.tags) {
    if (props.block.flow.result.tags[i].generatedBy === props.idx) {
      tags.push(props.block.flow.result.tags[i])
    }
  }

  return tags;
})

function updatePosition(event: Event) {
  hasBeenDragged.value = true;
  dragging.value = true;
  if (!pos.value) {
    pos.value = {};
  }

  let cssText = event.target.style.cssText;

  let left = cssText.split('matrix')[1].split(',')[4].trim();
  let top = cssText.split('matrix')[1].split(',')[5].split(')')[0].trim();

  if (props.block.selected) {
    let oldPosTop = pos.value.top;
    let oldPosLeft = pos.value.left;
    let dX = left - oldPosLeft;
    let dY = top - oldPosTop;

    for (let i in selectedBlocks.value) {
      blocks.value[selectedBlocks.value[i]].position.left += dX;
      blocks.value[selectedBlocks.value[i]].position.top += dY;
    }
  } else {
    pos.value.top = parseInt(top);
    pos.value.left = parseInt(left);
  }
}

function dragged(event: Event) {
  if (dragging.value) {

    emit('moved', props.idx, pos.value)
    dragging.value = false;
  }
}

const hasError = ref(false);
watch(props.block, () => {
  if (!props.block.flow) {
    hasError.value = false;
    return;
  }

  hasError.value = (props.block.flow.state === 'error')
});

function hasInConnection() {
  for (let i in props.lines) {
    if (props.lines[i][1] === props.idx) {
      return true;
    }
  }
  return false
}

function getInConnections() {
  let count = 0;
  for (let i in props.lines) {
    if (props.lines[i][1] === props.idx) {
      count++;
    }
  }
  return count;
}

function getOutgoingConnections(idx) {
  let connections = [];
  for (let i in props.lines) {
    if (props.lines[i][0] === idx) {
      connections.push(props.lines[i][1])
      connections.push(...getOutgoingConnections(props.lines[i][1]))
    }
  }
  return connections;
}

function hasOutConnection() {
  for (let i in props.lines) {
    if (props.lines[i][0] === props.idx && props.lines[i][2] !== 'error') {
      return true;
    }
  }
  return false
}

function hasTrueConnection() {
  for (let i in props.lines) {
    if (props.lines[i][0] === props.idx && props.lines[i][2] === 'true') {
      return true;
    }
  }
  return false
}

function hasFalseConnection() {
  for (let i in props.lines) {
    if (props.lines[i][0] === props.idx && props.lines[i][2] === 'false') {
      return true;
    }
  }
  return false
}

function hasErrorConnection() {
  for (let i in props.lines) {
    if (props.lines[i][0] === props.idx && props.lines[i][2] === 'error') {
      return true;
    }
  }
  return false
}

function startNewLine(blockIdx, lineType) {
  emit('newLine', blockIdx, lineType)
}

function getBlockLoaderStyle(block) {
  if (block.block === 'delay') {
    return { animation: 'fill ' + block.variables.delay + 'ms ease-out'}
  }

  return {'animation': 'fill 1s ease-in-out'}
}

function handleMouseOver() {
  if (isCreatingNewLine.value &&
      newLine.value[0] !== props.idx &&
      props.type !== 'start' &&
      props.type !== 'when' &&
      !getOutgoingConnections(props.idx).includes(newLine.value[0])
  ) {
    state.value = 'highlighted'
    snappedBlock.value = props.block.position
    snappedBlock.value.idx = props.idx
  }
}

function handleMouseOut() {
  state.value = 'idle'
  snappedBlock.value = null
}

function removeBlock() {
  emit('remove', props.idx)
}

function removeSelectedBlocks() {
  for (let i in selectedBlocks.value) {
    emit('remove', selectedBlocks.value[i])
  }
}

function start() {
  emit('start', props.idx)
}

function stop() {
  emit('stop', props.idx)
}

function handleStart() {
  if (hasBeenDragged.value === false) {
    start();
  }
  hasBeenDragged.value = false;
}

</script>

<style lang="scss">
.block {
  position: absolute !important;

  .play, .icon {
    transition: 0.4s ease all;
  }

  .connector.unconnected {
    opacity: 0;
    transition: 200ms ease-in all;
  }

  &.highlighted {
    .leftConnectors {
      .connector {
        opacity: 100;
      }
    }

    .content {
      @apply bg-blue-50 border-blue-400;
    }
  }

  &:hover {

    &.when {
      .icon {
        transition: 0.4s ease all;
        opacity: 0;
      }
    }

    .selected {
      @apply bg-slate-50 border-blue-400;
    }


    .rightConnectors, .errorConnector {
      .connector {
        opacity: 100;
      }
    }

    .play {
      transition: 0.4s ease all;
      opacity: 100;
    }
  }
}

.v-contextmenu {
  filter: drop-shadow(rgba(0, 0, 0, 0.1) 0 2px 10px);
}

.v-contextmenu-inner {
  padding: 0 !important;
}

.anyall .font-mono {
  position: relative;
  top: 3px;
  left: -2px;
}

.v-contextmenu-item {
  padding: 0 !important;
}

.loadingIndicator {
  @apply bg-gradient-to-r from-teal-300 to-blue-400;
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 3px;
  width: calc(100% + 4px);
  margin-left: -2px;
  border-radius: 0 0 100px 100px;
}

.errorIndicator {
  @apply bg-red-600;
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 3px;
  width: 100%;
  width: calc(100% + 4px);
  margin-left: -2px;
  border-radius: 0 0 100px 100px;
}


.when {
  .loadingIndicator {
    left: 15px;
    animation: fill-when 1s ease-in-out;
    width: calc(100% - 11px);
  }

  .errorIndicator {
    left: 15px;
    width: calc(100% - 11px);
  }
}

.running {
  transform: rotate(360deg);
  transition-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  animation: rotation 1s infinite ease-in-out;
}

.error {
  animation: horizontal-shaking 0.25s linear;
  animation-iteration-count: 3;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(359deg);
  }
}

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0)
  }
  25% {
    transform: translateX(5px)
  }
  50% {
    transform: translateX(-5px)
  }
  75% {
    transform: translateX(5px)
  }
  100% {
    transform: translateX(0)
  }
}

@keyframes fill {
  0% {
    width: 0%;
  }
  50% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes fill-when {
  0% {
    width: 0%;
  }
  50% {
    width: 0%;
  }
  100% {
    width: calc(100% - 11px)
  }
}
</style>
