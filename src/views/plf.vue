<template>
  <div id="three">
    <!-- <div id="container">
    </div> -->
    <button @click="big">放大</button>
    <button @click="small">缩小</button>
    <button @click="left">左</button>
    <button @click="rotate">旋转</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Threescene from '../service/plf';

let temp: Threescene;
export default defineComponent({
  name: 'plf',
  components: {},
  mounted() {
    const S: Threescene = new Threescene('three');
    temp = S;
  },
  beforeUnmount() {
    temp.destory();
  },
  methods: {
    big() {
      temp.mesh.scale.set(2, 2, 2);
    },
    small() {
      temp.mesh.scale.set(0.5, 0.5, 0.5);
    },
    left() {
      // temp.mesh.position.x = 10;
      temp.mesh.translateX(10);
    },
    rotate() {
      temp.mesh.rotateZ(Math.PI / 8);
    },
  },
});
</script>
