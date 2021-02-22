import * as THREE from 'three';

export default class Threescene {
  scene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  renderer: THREE.WebGLRenderer;

  rafId: number;

  private node: Document;

  constructor(node: Document) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.renderer = new THREE.WebGLRenderer();
    this.node = node;
    this.init();
    window.addEventListener('resize', this.onWindowResize, false);
  }

  private init() {
    this.camera.position.set(-40, 40, 40);
    this.camera.lookAt(this.scene.position);
    this.renderer.setClearColor(0x222222);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(this.renderer.domElement);
    // debugger;
    this.node.appendChild(this.renderer.domElement);
    // debugger;

    this.scene.add(new THREE.AxesHelper(10));
    this.animate();
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    this.render();
  };

  // private empty = (elem) => {
  //   while (elem.lastChild) elem.removeChild(elem.lastChild);
  // };

  public desotry = () => {
    cancelAnimationFrame(this.rafId);
    this.renderer.domElement.addEventListener('dblclick', null, false);
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  };
}
