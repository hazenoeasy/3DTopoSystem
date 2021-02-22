<template>
  <div ref="three">
    <!-- <div id="container">
    </div> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Threescene from '../service/scene';

let temp: Threescene;
export default defineComponent({
  name: 'Home',
  components: {},
  mounted() {
    console.log(this.$refs.three);
    const S: Threescene = new Threescene(this.$refs.three as Document);
    temp = S;
  },
  beforeUnmount() {
    temp.desotry();
  },
});
</script>
