<template>
  <div id="four">
    <!-- <div id="container">
    </div> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Threescene from '../service/sky';

let temp: Threescene;
export default defineComponent({
  name: 'geometry',
  components: {},
  mounted() {
    const S: Threescene = new Threescene('four');
    temp = S;
  },
  beforeUnmount() {
    temp.destory();
  },
});
</script>
