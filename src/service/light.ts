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

  directionLight: THREE.DirectionalLight;

  spotLight: THREE.SpotLight;

  planeGeometry: THREE.PlaneGeometry;

  planeMaterial: THREE.MeshLambertMaterial;

  planeMesh: THREE.Mesh;

  constructor(readonly node: string) {
    this.scene = new THREE.Scene();
    this.geometry = new THREE.BoxGeometry(100, 100, 100);
    this.material = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
      // opacity: 0.7,
      // transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.planeGeometry = new THREE.PlaneGeometry(300, 300);
    this.planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x999999,
      side: THREE.DoubleSide,
    });
    this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.renderer = new THREE.WebGLRenderer();
    this.point = new THREE.PointLight(0xffffff);
    this.ambient = new THREE.AmbientLight(0x000000);
    this.directionLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionLight.shadow.camera.near = 0.5;
    this.directionLight.shadow.camera.far = 300;
    this.directionLight.shadow.camera.left = -50;
    this.directionLight.shadow.camera.right = 50;
    this.directionLight.shadow.camera.top = 200;
    this.directionLight.shadow.camera.bottom = -100;
    this.spotLight = new THREE.SpotLight(0x000000);
    this.axesHelper = new THREE.AxesHelper(250);

    this.init();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    // this.controls.addEventListener('change', this.animate);
  }

  private init() {
    this.setCamera();
    this.mesh.castShadow = true;
    this.point.position.set(400, 200, 300);
    this.camera.position.set(200, 300, 200);
    this.camera.lookAt(this.scene.position);

    this.directionLight.position.set(80, 100, 50);
    this.directionLight.target = this.mesh;
    this.directionLight.castShadow = true;
    this.directionLight.shadow.mapSize.set(1024, 1024);
    this.spotLight.position.set(200, 200, 200);
    this.spotLight.target = this.mesh;
    this.spotLight.angle = Math.PI / 6;

    this.planeMesh.rotateX(-Math.PI / 2);
    this.planeMesh.position.y = -50;
    this.planeMesh.receiveShadow = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const helper = new THREE.DirectionalLightHelper(this.directionLight);
    document.getElementById(this.node).appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xb9d3ff, 1);
    this.scene.add(new THREE.AxesHelper(10));
    this.scene.add(this.mesh);
    this.scene.add(this.planeMesh);
    this.scene.add(this.point);
    this.scene.add(this.ambient);
    this.scene.add(this.directionLight);
    this.scene.add(this.spotLight);
    this.scene.add(this.axesHelper);
    this.scene.add(helper);
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
    this.rafId = requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    this.mesh.rotateY(0.001 * elapsed);
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
