<template>
  <div class="absolute pointer-events-none">
    <svg :class="classes" width="5000" height="5000" xmlns="http://www.w3.org/2000/svg">
      <path class="clickArea" :d=path stroke="transparent" fill="transparent" stroke-width="20" @click="lineClicked"/>
      <path class="background" :d=path stroke="#CCC" fill="transparent" stroke-width="2" @click="lineClicked"/>
      <path v-if="toIdx !== 'new' && fromIdx !== 'new'" class="path" ref="line" :d=path :stroke=color fill="transparent"
            stroke-width="2" :stroke-dasharray="200" pathLength="100" @click="lineClicked"/>
    </svg>
  </div>
  <div v-if="selected" ref="closeButton"
       class="text-white cursor-pointer w-4 h-4 flex items-center justify-center rounded-full absolute brightness-95 hover:filter-none"
       :style="iconStyles"
       @click="removeLine"
  >
    <Icon size="14">
      <Close/>
    </Icon>
  </div>
</template>
<script setup>

import {computed, inject, onMounted, ref, watch} from "vue";
import {Close} from '@vicons/ionicons5';
import {onClickOutside, useMouse} from '@vueuse/core'

const {x, y} = useMouse()

const testMode = inject('testMode')
const activatedBlocks = inject('activatedBlocks')
const props = defineProps({
  idx: Number,
  from: Object,
  fromIdx: String,
  to: Object,
  toIdx: String,
  connector: String,
  enter: Boolean,
  blocked: Boolean,
  disconnected: Boolean
})

const emit = defineEmits(['removed'])

const line = ref(null);
const closeButton = ref(null);
const snappedBlock = inject('snappedBlock')
const blocks = inject('blocks')
onClickOutside(closeButton, () => selected.value = false)
let prevClasses = [];
const classes = computed(() => {

  let classList = ['pathsvg'];

  if (props.enter) {
    classList.push('enter')
  }

  if (props.blocked) {
    classList.push('blocked')
  }

  if(props.disconnected) {
    classList.push('opacity-20');
  }

  if(testMode.value === true) {
    let connector = props.connector ?? 'out';
    if(connector === '') {
      connector = 'out';
    }
    if (activatedBlocks.value[connector].includes(props.fromIdx) && activatedBlocks.value.all.includes(props.toIdx) ) {
      if(blocks.value[props.toIdx].block === 'any' && blocks.value[props.toIdx]?.flow?.block?.blockedNextLine === true && !wasActiveBefore.value) {
        classList.push('blocked');
      } else {
        classList.push('active');
        wasActiveBefore.value = true;
        blocks.value[props.toIdx].flow.block.blockedNextLine = true
      }
    } else {
      classList.push('inactive');
    }
  }

  prevClasses = classList;

  return classList;
})

let el = document.getElementById('block_' + props.fromIdx);
const elWidth = ref(0);
const elHeight = ref(0);

let toEl = document.getElementById('block_' + props.toIdx);
const toElWidth = ref(0);
const toElHeight = ref(0);

const selected = ref(false);

onMounted(() => {

  el = document.getElementById('block_' + props.fromIdx);
  if (el) {
    elWidth.value = el.offsetWidth
    elHeight.value = el.offsetHeight
  }

  toEl = document.getElementById('block_' + props.toIdx);
  if (toEl) {
    toElWidth.value = toEl.offsetWidth
    toElHeight.value = toEl.offsetHeight
  }
})

function lineClicked() {
  moveCloseIcon()
  selected.value = true
}

function moveCloseIcon(event) {
  let pathLength = line.value.getTotalLength();
  let prcnt = (50 * pathLength) / 100;
  let middle = line.value.getPointAtLength(prcnt)

  iconStyles.value = {
    top: (middle.y - 8) + 'px',
    left: (middle.x - 8) + 'px',
    backgroundColor: color.value,
    zIndex: 99
  }
}

function removeLine() {
  selected.value = false;
  emit('removed', props.idx)
}

const color = computed(() => {

  if(props.disconnected) {
    return 'gray';
  }

  if (props.connector === "false") {
    return 'orange';
  }

  if (props.connector === 'error') {
    return 'red';
  }

  return '#0F99E7'
})

const wasActiveBefore = ref(false);
watch(testMode, () => wasActiveBefore.value = false);


const path = computed(() => {

  let endBlockHeight = toElHeight.value;

  if (props.toIdx === 'new') {
    if (x.value === 0 && y.value === 0) {
      return;
    }

    if (!snappedBlock.value) {
      props.to.left = x.value - 24;
      props.to.top = y.value;
    } else {
      props.to.left = snappedBlock.value.left;
      props.to.top = snappedBlock.value.top;
      toEl = document.getElementById('block_' + snappedBlock.value.idx);
      endBlockHeight = toEl.offsetHeight
    }
  }

  let startX = props.from.left + elWidth.value - 24;
  let startY = props.from.top + (elHeight.value / 2);
  let endX = props.to.left + 8;
  let endY = props.to.top + (endBlockHeight / 2)

  if (props.connector === "true") {
    startY -= 8;
  }
  if (props.connector === "false") {
    startY += 8;
  }
  if (props.connector === "error") {
    startY = props.from.top + elHeight.value + 4
    startX = props.from.left + (elWidth.value / 2) + 5
  }

  let dX = endX - startX;
  let dY = endY - startY;

  let dim = 0.8;

  let curveXOffset = dX * dim;
  let curveYOffset = 0;

  if (startX > endX) {
    if (props.connector !== 'error') {
      curveXOffset *= -2;
      curveYOffset = dY * 0.8;
    }
  }

  let startXOffset = curveXOffset;
  let startYOffset = curveYOffset;

  if (props.connector === 'error') {
    startYOffset = dY * dim;
    if (startY > endY) {
      startYOffset *= -1.5;
      startXOffset = 0
    } else {
      startXOffset = 0;
    }

    if (startX > endX) {
      startXOffset *= -1;
    }
    if (curveXOffset < 50) {
      curveXOffset = 50;
    }

    endX += 15
  }

  return 'M ' + startX + ' ' + startY +
      ' C ' + (startX + startXOffset) + ' ' + (startY + startYOffset) + ', ' +
      (endX - curveXOffset) + ' ' + (endY - curveYOffset) + ', ' +
      endX + ' ' + endY

})

const iconStyles = ref({top: 0, left: 0})

</script>

<style scoped lang="scss">

.pathsvg {
  pointer-events: none;

  .path {
    cursor: pointer;
    pointer-events: all;
  }

  .clickArea {
    cursor: pointer;
    pointer-events: all;
  }
}

.path {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
}

.inactive .path {
  stroke-dashoffset: 100;
}

.active .path {
  animation: enter 1s;
}

.blocked .path {
  stroke-dashoffset: 25;
  animation: blocked 0.8s;
}

@keyframes enter {
  from {
    stroke-dashoffset: 100
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes blocked {
  from {
    stroke-dashoffset: 100
  }
  to {
    stroke-dashoffset: 25
  }
}
</style>
