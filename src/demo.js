import THREE from 'three';
import ThreeGeo from 'three-geo';

THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

const canvas = document.getElementById('canvas');
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.set(0, 0, 1.5);

const renderer = new THREE.WebGLRenderer({ canvas });
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();
const walls = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1, 1, 1)),
  new THREE.LineBasicMaterial({ color: 0xcccccc }),
);
walls.position.set(0, 0, 0);
scene.add(walls);
scene.add(new THREE.AxesHelper(1));

const render = () => {
  renderer.render(scene, camera);
};

controls.addEventListener('change', render);
render(); // first time

(async () => { // main
  const tgeo = new ThreeGeo({
    tokenMapbox:
      'pk.eyJ1IjoiaXRzenloIiwiYSI6ImNrbTBndTlkMDNtbmgyb253N2c1cDc4engifQ.To9tjnA-GG7RHh1Y5ouBhQ',
  });

  if (tgeo.tokenMapbox === '********') {
    const warning = 'Please set your Mapbox API token in ThreeGeo constructor.';
    alert(warning);
    throw warning;
  }

  const terrain = await tgeo.getTerrainRgb(
    [46.5763, 7.9904], // [lat, lng]
    5.0, // radius of bounding circle (km)
    12,
  ); // zoom resolution

  scene.add(terrain);
  render();
})();
