<template>
  <div class="connector cursor-pointer rounded-full w-3 h-3 border-[3px] border-white group-hover:border-slate-50 relative shadow-md'"
       :class="classes"
  />
</template>
<script setup>

import {computed} from 'vue';

const props = defineProps(['type', 'position', 'connected']);

const classes = computed(() => {
  let classList = [];

  if (props.type === 'true') {
    classList.push('bg-blue-600');
  } else if (props.type === 'false') {
    classList.push('bg-orange-400');
  } else if (props.type === 'error') {
    classList.push('bg-red-600')
  } else if(props.position === 'left') {
    classList.push('bg-slate-500')
  } else {
    classList.push('bg-blue-600')
  }

  if (props.type === 'error') {
    classList.push('left-[50%]')
  } else {
    if (props.position === 'left') {
      classList.push('left-2')
    } else {
      classList.push('-left-2')
    }
  }

  if(!props.connected) {
    classList.push('unconnected')
  }

  return classList;
})

</script>
