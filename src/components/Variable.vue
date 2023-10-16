<template>
  <div class="px-1 mr-0.5 border rounded-lg py-0.5 rounded text-xs"
       :class="{
          'text-white bg-blue-50 text-blue-800 font-normal': (showInput && !isTag),
          'border-slate-300': ((hovered || (!input && !showInput)) && !isTag),
          'text-slate-500': (hovered && !input && !showInput && !isTag),
          'bg-slate-400 border-green-600 text-green-600': (!hovered && isTag && !input),
          'border-transparent': ((!hovered && input) || isTag),
          'text-slate-900': (!showInput && input && !isTag),
          'text-slate-400': !input,
          'text-white px-1.5 rounded-full': isTag,
          'bg-green-500': (isTag && !hovered && input && !isErrorTag),
          'bg-red-500': (isTag && !hovered && input && isErrorTag),
          'bg-green-600': (hovered && isTag && !isErrorTag),
          'bg-red-600': (hovered && isTag && isErrorTag),
        }"
       @mousedown.stop.prevent="" @click.stop.prevent="toggleVariableInput"
       @mouseover="hover" @mouseout="unhover"
  >
    <template v-if="settings.type === 'tag'">
    {{ ((modelValue && modelValue.length) ? tagValue : name).replace(' ', '&nbsp;') }}
    </template>
    <div class="flex flex-row gap-x-1" v-else>
      <template v-for="part in template">
        <div v-if="part.type === 'text'">{{part.text}}</div>
        <div v-if="part.type === 'tag'" class="text-white px-1.5 rounded-full" :class="{
          'bg-slate-400 hover:bg-slate-500' : !tags[part.tag],
          'bg-green-500 hover:bg-green-500' : (tags[part.tag] && !tags[part.tag].error),
          'bg-red-500 hover:bg-red-500' : (tags[part.tag] && tags[part.tag].error)
        }">{{ tags[part.tag] ? tags[part.tag].tag : part.tag }}</div>
      </template>
    </div>
  </div>
  <template v-if="showInput">
    <teleport to="body">
      <div class="absolute popcontainer z-50" :style="popPosition">
        <div ref='popover' class="relative shadow-md popover bg-slate-50 p-4 rounded-md w-60">
          <input v-if="!settings.tagType && settings.type !== 'coordinate'" v-model="input" @input="handelInput"
                 :placeholder="name"
                 class="font-normal ring-1 outline-0 ring-blue-300 focus:ring-blue-600 bg-white text-xs text-slate-800 border-1 w-full border-slate-600 rounded p-1 px-2">
          <div class="flex flex-row" v-if="settings.type === 'coordinate'"><input v-model="input" @input="handelInput"  placeholder="x,y"/></div>
          <n-popover v-if="settings.type !== 'tag'" trigger="click" placement="bottom">
            <template #trigger>
              <Icon size="16" class="absolute right-5 top-5 cursor-pointer">
                <IosPricetag class="text-slate-500 hover:text-slate-700"></IosPricetag>
              </Icon>
            </template>
            <div>
              <template v-for="(tag,idx) in tags">
                <div class="cursor-pointer hover:bg-slate-50" @click="selectTag(idx)">{{ tag.tag }}</div>
              </template>
            </div>
          </n-popover>
          <select v-if="settings.tagType" v-model="input" @change="handleSelect"
                  class="w-full border font-light text-xs p-1">
            <option disabled value="">- select a tag -</option>
            <template v-for="tag in tags">
              <option v-if="(tag.type === settings.tagType) || (settings.tagType === 'mixed')" :value="'tag:' + tag.tag">
                Tag: {{ tag.tag }}
              </option>
            </template>
            <option v-for="tagTypeOption in getTagTypeOptions(settings.tagType)" :value="tagTypeOption">{{tagTypeOption}}</option>
          </select>
          <div class="absolute triangle -top-2 bg-slate-50 w-4 h-4 rotate-45"></div>
        </div>
      </div>
    </teleport>
  </template>
</template>
<script setup>
import {computed, nextTick, ref, inject} from 'vue'
import {onClickOutside} from '@vueuse/core'
import {IosPricetag} from "@vicons/ionicons4"
import {NPopover} from 'naive-ui'


const props = defineProps(['name', 'modelValue', 'settings', 'tags'])
const emit = defineEmits(['update:modelValue', 'updated'])
const showInput = ref(false)
const input = ref(props.modelValue);
const popover = ref(null);
const originalInput = ref(props.modelValue ?? props.name);
const hovered = ref(false);

onClickOutside(popover, close)

function close() {
  showInput.value = false
  if (originalInput.value !== input.value) {
    nextTick(() => emit('updated'))
  }
}

function hover() {
  hovered.value = true;
}

function unhover() {
  hovered.value = false;
}

const tagValue = computed(() => {
  if(!input.value) {
    return '';
  }
  if (input.value.substring(0, 4) === 'tag:') {
    return input.value.substring(4)
  }

  return input.value
})

const isTag = computed(() => props.settings.type === 'tag');

function toggleVariableInput(event) {
  showInput.value = true;
  originalInput.value = input.value;

  popPosition.value = {top: event.y + 'px', left: event.x + 'px'};
}

function handelInput() {
  emit('update:modelValue', input.value);
}

function handleSelect(event) {
  emit('update:modelValue', input.value);
  nextTick(close);
}

function selectTag(tag) {
  if(!input.value) {
    input.value = '';
  }

  if(input.value.split(' ').length === 1 && input.value.substring(0, 4) === 'tag:') {
    input.value = 'tag:' + tag
    emit('update:modelValue', input.value);
    close();
    return;
  }

  if(input.value.length) {
    input.value += ' ';
  }

  input.value += 'tag:' + tag
  emit('update:modelValue', input.value);
  close();
}

const isErrorTag = computed(() => {
  if(isTag.value && props.tags[tagValue.value]) {
    return props.tags[tagValue.value].error ?? false
  }

  return false;
})

const template = computed(() => {
  if (!input.value) {
    return [{type: 'text', text: props.name}]
  }
  let parts = input.value.split(' ');
  let templateParts = [];

  for(let i in parts) {
    let part = parts[i];
    if (part.substring(0, 4) === 'tag:') {
      templateParts.push({type: 'tag', tag:part.substring(4)})
    } else {
      templateParts.push({type: 'text', text: part})
    }
  }

  return templateParts;
})

const popPosition = ref({})

const mobs = inject('mobs');
const npcs = inject('npcs');
const items = inject('items');
const quests = inject('quests');
const areas = inject('areas');
const triggers = inject('triggers');
const music = inject('music');
const sounds = inject('sounds');
const layers = inject('layers');
const doors = inject('doors');
const animations = inject('animations');

function getTagTypeOptions(tagType) {
  console.log(mobs)
  switch (tagType) {
    case 'mob':
      return mobs
    case 'npc':
      return npcs
    case 'item':
      return items
    case 'quest':
      return quests
    case 'area':
      return areas
    case 'trigger':
      return triggers
    case 'music':
      return music
    case 'sound':
      return sounds
    case 'layer':
      return layers
    case 'door':
      return doors
    case 'animation':
      return animations
  }
}
</script>
<style lang="scss">

.popcontainer {
  filter: drop-shadow(rgba(0, 0, 0, 0.2) 0 0 10px);
}

.popover {
  left: -50%;
  top: 15px;

  .triangle {
    left: calc(50% - 10px)
  }
}
</style>