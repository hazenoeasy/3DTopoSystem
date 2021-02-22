import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Threescene {
  scene: THREE.Scene;

  camera: THREE.OrthographicCamera;

  renderer: THREE.WebGLRenderer;

  geometry: THREE.BoxGeometry;

  material: THREE.MeshLambertMaterial;

  point: THREE.PointLight;

  ambient: THREE.AmbientLight;

  rafId: number;

  mesh: THREE.Mesh;

  controls: OrbitControls;

  axesHelper: THREE.AxesHelper;

  constructor(readonly node: string) {
    this.scene = new THREE.Scene();
    this.geometry = new THREE.BoxGeometry(100, 100, 100);
    this.material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.renderer = new THREE.WebGLRenderer();
    this.point = new THREE.PointLight(0xffffff);
    this.ambient = new THREE.AmbientLight(0x444444);
    this.axesHelper = new THREE.AxesHelper(250);
    this.init();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    // this.controls.addEventListener('change', this.animate);
  }

  private init() {
    this.setCamera();
    this.point.position.set(400, 200, 300);
    this.camera.position.set(200, 300, 200);
    this.camera.lookAt(this.scene.position);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(this.node).appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xb9d3ff, 1);
    this.scene.add(new THREE.AxesHelper(10));
    this.scene.add(this.mesh);
    this.scene.add(this.point);
    this.scene.add(this.ambient);
    this.scene.add(this.axesHelper);
    this.animate();
  }

  private onWindowResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.setCamera();
  };

  private setCamera() {
    const width = window.innerWidth; // 窗口宽度
    const height = window.innerHeight; // 窗口高度
    const k = width / height; // 窗口宽高比
    const s = 200; // 三维场景显示范围控制系数，系数越大，显示的范围越大
    this.camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
    this.camera.position.set(200, 300, 200);
    this.camera.lookAt(this.scene.position);
  }

  private render = (timestep: number) => {
    if (this.renderTime === undefined) {
      this.renderTime = timestep;
    }
    const elapsed = timestep - this.renderTime;
    this.renderTime = timestep;
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    this.mesh.rotateY(0.001 * elapsed);
  };

  private renderTime: number;

  private animate = () => {
    requestAnimationFrame(this.render);
  };

  private empty = (elem: HTMLElement) => {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
  };

  public destory = () => {
    cancelAnimationFrame(this.rafId);
    this.renderer.domElement.addEventListener('dblclick', null, false);
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.empty(document.getElementById(this.node));
  };
}
