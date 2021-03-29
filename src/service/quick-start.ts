import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';

export default class Threescene {
  scene: THREE.Scene;

  camera: THREE.OrthographicCamera;

  renderer: THREE.WebGLRenderer;

  geometry: THREE.BoxGeometry;

  material: THREE.MeshLambertMaterial;

  point: THREE.PointLight;

  ambient: THREE.AmbientLight;

  rafId: number;

  model: THREE.Group;

  controls: OrbitControls;

  axesHelper: THREE.AxesHelper;

  constructor(readonly node: string) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.point = new THREE.PointLight(0xffffff);
    this.ambient = new THREE.AmbientLight(0x444444);
    this.axesHelper = new THREE.AxesHelper(250);
    this.init();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    this.loader();

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
    this.scene.add(this.point);
    this.scene.add(this.ambient);
    this.scene.add(this.axesHelper);
  }

  private onWindowResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.setCamera();
  };

  private loader() {
    let result;
    const objLoader = new OBJLoader();
    const manager = new THREE.LoadingManager();
    manager.addHandler(/\.tga$/i, new TGALoader());
    const mtlLoader = new MTLLoader(manager);
    mtlLoader.load('/static/honghu/demo.mtl', (materials) => {
      debugger;
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load('/static/honghu/demo.obj', (obj) => {
        debugger;
        obj.position.set(0, 0, 0);
        obj.scale.set(0.01, 0.01, 0.01);
        this.model = obj;
        this.scene.add(this.model);
        this.animate();
      });
    });
  }

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
    // 注释掉的功能用于自动旋转
    // if (this.renderTime === undefined) {
    // this.renderTime = timestep;
    // }
    // const elapsed = timestep - this.renderTime;
    // this.renderTime = timestep;
    this.rafId = requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    // this.model.rotateY(0.001 * elapsed);
  };

  private renderTime: number;

  private animate = () => {
    this.rafId = requestAnimationFrame(this.render);
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
