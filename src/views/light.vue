<template>
  <div id="three">
    <!-- <div id="container">
    </div> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Threescene from '../service/light';

let temp: Threescene;
export default defineComponent({
  name: 'light',
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
