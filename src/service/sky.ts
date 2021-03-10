import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';
import { Sky } from 'three/examples/jsm/objects/Sky';
import ThreeGeo from 'three-geo';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { Octree } from 'three/examples/jsm/math/Octree';
import { CompressedPixelFormat } from 'three';

const SCALE = 2;
export default class Threescene {
  scene: THREE.Scene;

  // camera: THREE.OrthographicCamera;
  camera: THREE.PerspectiveCamera;

  renderer: THREE.WebGLRenderer;

  geometry: THREE.BoxGeometry;

  material: THREE.MeshLambertMaterial;

  point: THREE.PointLight;

  ambient: THREE.AmbientLight;

  rafId: number;

  mesh: THREE.Mesh;

  // controls: OrbitControls;

  sky: Sky;

  directionalLight: THREE.DirectionalLight;

  Octree: Octree;

  Capsule: Capsule;

  private Clock: THREE.Clock;

  GRAVITY = 20;

  playerVelocity = new THREE.Vector3();

  playerDirection = new THREE.Vector3();

  playerOnFloor = false;

  keyStates: { [key: string]: boolean } = {};

  constructor(readonly node: string) {
    this.Clock = new THREE.Clock();
    this.initScene();
    this.initGeo();
    this.initLight();
    this.initCamera();
    this.initHelper();
    this.initRender();
    this.loader();
    this.initSky();
    this.initHuman();
    this.animate();
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  private initGeo = () => {
    this.geometry = new THREE.BoxGeometry(100, 100, 100);
    this.material = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
      opacity: 0.7,
      transparent: true,
    });
  };

  private initLight = () => {
    this.ambient = new THREE.AmbientLight(0x444444);
    this.point = new THREE.PointLight(0xffffff);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);

    this.point.position.set(400, 200, 300);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
  };

  private initCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000000,
    );
    this.camera.position.set(0, 100, 150);
    this.camera.lookAt(this.scene.position);
  };

  private initScene = () => {
    this.scene = new THREE.Scene();
  };

  private initHelper = () => {
    const helper = new THREE.GridHelper(10000, 2, 0xffffff, 0xffffff);
    const axesHelper = new THREE.AxesHelper(250);
    this.scene.add(helper);
    this.scene.add(axesHelper);
  };

  private initRender = () => {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
    document.getElementById(this.node).appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xb9d3ff, 1);
  };

  private loader = () => {
    const loader = new GLTFLoader();
    loader.load('/static/3D-Map.glb', (gltf) => {
      const model = gltf.scene;
      // debugger;
      model.children.forEach((child) => {
        child.scale.set(child.scale.x * SCALE, child.scale.y * SCALE, child.scale.z * SCALE);
      });
      // model.scale.set(SCALE * model.scale.x, SCALE * model.scale.y, SCALE * model.scale.z);
      this.scene.add(model);
      const result = this.Octree.fromGraphNode(model.children[2]);
      console.log(this.Octree);
      console.log(this.scene);
    });
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private async GEO() {
    const tgeo = new ThreeGeo({
      tokenMapbox:
        'pk.eyJ1IjoiaXRzenloIiwiYSI6ImNrbTBndTlkMDNtbmgyb253N2c1cDc4engifQ.To9tjnA-GG7RHh1Y5ouBhQ',
    });
    console.log(tgeo);
    // debugger;
    this.mesh = await tgeo.getTerrainRgb(
      [46.5763, 7.9904], // [lat, lng]
      5.0, // radius of bounding circle (km)
      12,
    );
    console.log(this.mesh);
    console.log('xxx');
    this.scene.add(this.mesh);
    console.log(this.scene);
    // const loader = new GLTFLoader();
    // loader.load('/static/3D-Map.glb', (gltf) => {
    //   this.scene.add(gltf.scene);
    //   console.log(this.scene);
    // });
    this.animate();
  }

  private render = (timestep: number) => {
    if (this.renderTime === undefined) {
      this.renderTime = timestep;
    }
    const elapsed = timestep - this.renderTime;
    this.renderTime = timestep;
    this.rafId = requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    // this.mesh.rotateY(0.001 * elapsed);
  };

  private renderTime: number;

  private initSky = () => {
    this.sky = new Sky();
    this.sky.scale.setScalar(45000);
    this.scene.add(this.sky);
    const sun = new THREE.Vector3();
    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.25, // Facing front,
      exposure: this.renderer.toneMappingExposure,
    };
    const guiChanged = () => {
      const { uniforms } = this.sky.material;
      uniforms.turbidity.value = effectController.turbidity;
      uniforms.rayleigh.value = effectController.rayleigh;
      uniforms.mieCoefficient.value = effectController.mieCoefficient;
      uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

      const theta = Math.PI * (effectController.inclination - 0.5);
      const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

      sun.x = Math.cos(phi);
      sun.y = Math.sin(phi) * Math.sin(theta);
      sun.z = Math.sin(phi) * Math.cos(theta);

      uniforms.sunPosition.value.copy(sun);
      this.directionalLight.position.set(sun.x, sun.y, sun.z);
      this.renderer.toneMappingExposure = effectController.exposure;
      this.renderer.render(this.scene, this.camera);
    };
    const gui = new GUI();

    gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
    gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
    gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
    gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
    gui.add(effectController, 'inclination', 0, 1, 0.0001).onChange(guiChanged);
    gui.add(effectController, 'azimuth', 0, 1, 0.0001).onChange(guiChanged);
    gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

    guiChanged();
  };

  private initHuman = () => {
    this.camera.rotation.order = 'YXZ';
    this.Octree = new Octree();
    this.Capsule = new Capsule(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, 11, 0), 0.35);

    document.addEventListener('keydown', (event) => {
      this.keyStates[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keyStates[event.code] = false;
    });

    document.addEventListener('mousedown', () => {
      document.body.requestPointerLock();
    });

    document.body.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX / 500;
        this.camera.rotation.x -= event.movementY / 500;
      }
    });
    this.animate();
  };

  private playerCollitions = () => {
    const result = this.Octree.capsuleIntersect(this.Capsule);
    this.playerOnFloor = false;
    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
      }
      this.Capsule.translate(result.normal.multiplyScalar(result.depth));
    }
    if (this.Capsule.end.y < -50 * SCALE) {
      this.Capsule.set(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, 11, 0), 0.35);
      this.playerVelocity.y = 0;
    }
  };

  private updatePlayer = (deltaTime: number) => {
    if (this.playerOnFloor) {
      const damping = Math.exp(-3 * deltaTime) - 1;
      this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    } else {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;
    }

    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.Capsule.translate(deltaPosition);

    this.playerCollitions();

    this.camera.position.copy(this.Capsule.end);
  };

  private getForwardVector = () => {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();

    return this.playerDirection;
  };

  private getSideVector = () => {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);

    return this.playerDirection;
  };

  private controls = (deltaTime: number) => {
    const speed = 25;
    if (this.playerOnFloor) {
      if (this.keyStates.KeyW) {
        this.playerVelocity.add(this.getForwardVector().multiplyScalar(speed * deltaTime));
      }

      if (this.keyStates.KeyS) {
        this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speed * deltaTime));
      }

      if (this.keyStates.KeyA) {
        this.playerVelocity.add(this.getSideVector().multiplyScalar(-speed * deltaTime));
      }

      if (this.keyStates.KeyD) {
        this.playerVelocity.add(this.getSideVector().multiplyScalar(speed * deltaTime));
      }

      if (this.keyStates.Space) {
        this.playerVelocity.y = 15;
      }
    }
  };

  private animate = () => {
    const deltaTime = Math.min(0.1, this.Clock.getDelta());
    // console.log(deltaTime);
    this.controls(deltaTime);
    this.updatePlayer(deltaTime);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.animate);
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
    // document.body.removeChild(document.body.lastChild);
  };
}
