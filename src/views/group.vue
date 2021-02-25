<template>
  <div id="three">
    <!-- <div id="container">
    </div> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Threescene from '../service/group';

let temp: Threescene;
export default defineComponent({
  name: 'quick-start',
  components: {},
  mounted() {
    const S: Threescene = new Threescene('three');
    temp = S;
  },
  beforeUnmount() {
    temp.destory();
  },
});
</script>
