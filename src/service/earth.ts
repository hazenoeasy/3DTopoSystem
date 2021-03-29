import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';
import { CompressedPixelFormat } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { AdaptiveToneMappingPass } from 'three/examples/jsm/postprocessing/AdaptiveToneMappingPass';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';

const params = {
  bloomAmount: 1.0,
  sunLight: 4.0,
  enabled: true,
  avgLuminance: 0.7,
  middleGrey: 0.04,
  maxLuminance: 16,
  adaptionRate: 2.0,
};
export default class Threescene {
  scene: THREE.Scene;

  sceneCube: THREE.Scene;

  debugScene: THREE.Scene;

  // camera: THREE.OrthographicCamera;
  camera: THREE.PerspectiveCamera;

  cameraCube: THREE.PerspectiveCamera;

  cameraBG: THREE.OrthographicCamera;

  renderer: THREE.WebGLRenderer;

  geometry: THREE.BoxGeometry;

  material: THREE.MeshLambertMaterial;

  point: THREE.PointLight;

  ambient: THREE.AmbientLight;

  rafId: number;

  mesh: THREE.Mesh;

  directionalLight: THREE.DirectionalLight;

  orbitControls: OrbitControls;

  adaptiveLuminanceMat: THREE.ShaderMaterial;

  currentLuminanceMat: THREE.ShaderMaterial;

  
  ldrEffectComposer: EffectComposer;

  dynamicHdrEffectComposer: AdaptiveToneMappingPass;

  hdrEffectComposer: AdaptiveToneMappingPass;

  bloomsPass;

  adaptToneMappingPass;


  constructor(readonly node: string) {

    this.initScene();
    this.initCamera();
    this.initLight();

    this.initGeo();
    this.initBox();
    this.initHelper();
    this.initRender();
    this.initEffect();
    this.initGUI();
    this.loader();
    this.animate();
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  private initGeo = () => {
    const atmoShader = {
      side: THREE.BackSide,
      // blending: THREE.AdditiveBlending,
      transparent: true,
      lights: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.lights]),
      vertexShader: [
        'varying vec3 vViewPosition;',
        'varying vec3 vNormal;',
        'void main() {',
        THREE.ShaderChunk.beginnormal_vertex,
        THREE.ShaderChunk.defaultnormal_vertex,

        'vNormal = normalize( transformedNormal );',
        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        'vViewPosition = -mvPosition.xyz;',
        'gl_Position = projectionMatrix * mvPosition;',
        '}',
      ].join('\n'),
    };
    const earthAtmoMat = new THREE.ShaderMaterial(atmoShader); 
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 200,
    });
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load('../assets/textures/planets/earth_atmos_4096.jpg', (tex) => {
      earthMat.map = tex;
      earthMat.map.encoding = THREE.sRGBEncoding;
      earthMat.needsUpdate = true;
    });
    textureLoader.load('../assets/textures/planets/earth_specular_2048.jpg', (tex) => {
      earthMat.specularMap = tex;
      earthMat.specularMap.encoding = THREE.sRGBEncoding;
      earthMat.needsUpdate = true;
    });

    //
    const earthLights = textureLoader.load('../assets/textures/planets/earth_lights_2048.png');
    earthLights.encoding = THREE.sRGBEncoding;

    const earthLightsMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      map: earthLights,
    });

    const clouds = textureLoader.load('textures/planets/earth_clouds_2048.png');
    clouds.encoding = THREE.sRGBEncoding;

    /* cloud没有高光 */
    const earthCloudsMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      blending: THREE.NormalBlending,
      transparent: true,
      depthTest: false,
      map: clouds,
    });
    const earthGeo = new THREE.SphereGeometry(600, 24, 24);
    const sphereMesh = new THREE.Mesh(earthGeo, earthMat);
    this.scene.add(sphereMesh);

    const sphereLightsMesh = new THREE.Mesh(earthGeo, earthLightsMat);
    this.scene.add(sphereLightsMesh);

    const sphereCloudsMesh = new THREE.Mesh(earthGeo, earthCloudsMat);
    this.scene.add(sphereCloudsMesh);

    const sphereAtmoMesh = new THREE.Mesh(earthGeo, earthAtmoMat);
    sphereAtmoMesh.scale.set(1.05, 1.05, 1.05);
    this.scene.add(sphereAtmoMesh);
  };

  private initLight = () => {
    this.ambient = new THREE.AmbientLight(0x050505);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, params.sunLight);
    this.directionalLight.position.set( 2, 0, 10 ).normalize();
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambient);
  };

  private initCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100000,
    );
    this.camera.position.set(700, 400, 800);
    this.cameraCube = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      100000,
    );
    this.cameraBG = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      1,
      100000,
    );
    this.cameraBG.position.z = 100;
    this.camera.lookAt(this.scene.position);
  };

  private initScene = () => {
    this.scene = new THREE.Scene();
    this.sceneCube = new THREE.Scene();
  };

  private initHelper = () => {
    this.orbitControls = new OrbitControls(this.cameraBG, document.getElementById(this.node));
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = 1;
  };

  private initRender = () => {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.autoClear = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 0.5;
    document.getElementById(this.node).appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xb9d3ff, 1);
  };

  private initBox = () => {
    const vBGShader = [
      // "attribute vec2 uv;",
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}',
    ].join('\n');

    const pBGShader = [
      'uniform sampler2D map;',
      'varying vec2 vUv;',

      'void main() {',

      'vec2 sampleUV = vUv;',
      'vec4 color = texture2D( map, sampleUV, 0.0 );',

      'gl_FragColor = vec4( color.xyz, 1.0 );',

      '}',
    ].join('\n');
    this.adaptiveLuminanceMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null },
      },
      vertexShader: vBGShader,
      fragmentShader: pBGShader,
      depthTest: false,
      // color: 0xffffff
      blending: THREE.NoBlending,
    });
    this.currentLuminanceMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: null },
      },
      vertexShader: vBGShader,
      fragmentShader: pBGShader,
      depthTest: false,
      // color: 0xffffff
      // blending: THREE.NoBlending
    });
    let quadBG = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), this.currentLuminanceMat);
    quadBG.position.z = -500;
    quadBG.position.x = -window.innerWidth * 0.5 + window.innerWidth * 0.05;
    quadBG.scale.set(window.innerWidth, window.innerHeight, 1);
    this.debugScene.add(quadBG);

    quadBG = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), this.adaptiveLuminanceMat);
    quadBG.position.z = -500;
    quadBG.position.x = -window.innerWidth * 0.5 + window.innerWidth * 0.15;
    quadBG.scale.set(window.innerWidth, window.innerHeight, 1);
    this.debugScene.add(quadBG);
    const r = '../assets/textures/cube/MilkyWay/';
    const urls = [
      `${r}dark-s_px.jpg`,
      `${r}dark-s_nx.jpg`,
      `${r}dark-s_py.jpg`,
      `${r}dark-s_ny.jpg`,
      `${r}dark-s_pz.jpg`,
      `${r}dark-s_nz.jpg`,
    ];

    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.encoding = THREE.sRGBEncoding;

    this.sceneCube.background = textureCube;
  };

  private initEffect = () => {
    const height = window.innerHeight || 1;
    const width = window.innerWidth || 1;
    const parameters: any = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    };
    const regularRenderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
    this.ldrEffectComposer = new EffectComposer(this.renderer, regularRenderTarget);
    parameters.type = THREE.FloatType;

    if (
      this.renderer.capabilities.isWebGL2 === false &&
      this.renderer.extensions.has('OES_texture_half_float_linear') === false
    ) {
      parameters.type = undefined; // avoid usage of floating point textures
    }
    const hdrRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, height, parameters );
				dynamicHdrEffectComposer = new EffectComposer( this.renderer, hdrRenderTarget );
				dynamicHdrEffectComposer.setSize( window.innerWidth, window.innerHeight );
				hdrEffectComposer = new EffectComposer( this.renderer, hdrRenderTarget );

				const debugPass = new RenderPass( this.debugScene, this.cameraBG );
				debugPass.clear = false;
				const scenePass = new RenderPass( this.scene, this.camera, undefined, undefined, undefined );
				const skyboxPass = new RenderPass( this.sceneCube, this.cameraCube );
				scenePass.clear = false;

				adaptToneMappingPass = new AdaptiveToneMappingPass( true, 256 );
				adaptToneMappingPass.needsSwap = true;
				ldrToneMappingPass = new AdaptiveToneMappingPass( false, 256 );
				hdrToneMappingPass = new AdaptiveToneMappingPass( false, 256 );
				bloomPass = new BloomPass();
				const gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );

				dynamicHdrEffectComposer.addPass( skyboxPass );
				dynamicHdrEffectComposer.addPass( scenePass );
				dynamicHdrEffectComposer.addPass( adaptToneMappingPass );
				dynamicHdrEffectComposer.addPass( bloomPass );
				dynamicHdrEffectComposer.addPass( gammaCorrectionPass );

				hdrEffectComposer.addPass( skyboxPass );
				hdrEffectComposer.addPass( scenePass );
				hdrEffectComposer.addPass( hdrToneMappingPass );
				hdrEffectComposer.addPass( bloomPass );
				hdrEffectComposer.addPass( gammaCorrectionPass );

				ldrEffectComposer.addPass( skyboxPass );
				ldrEffectComposer.addPass( scenePass );
				ldrEffectComposer.addPass( ldrToneMappingPass );
				ldrEffectComposer.addPass( bloomPass );
				ldrEffectComposer.addPass( gammaCorrectionPass );
  };

  private initGui = () => {
    const gui = new GUI();
    const sceneGui = gui.addFolder('Scenes');
    const toneMappingGui = gui.addFolder('ToneMapping');
    const staticToneMappingGui = gui.addFolder('StaticOnly');
    const adaptiveToneMappingGui = gui.addFolder('AdaptiveOnly');

    sceneGui.add(params, 'bloomAmount', 0.0, 10.0);
    sceneGui.add(params, 'sunLight', 0.1, 12.0);

    toneMappingGui.add(params, 'enabled');
    toneMappingGui.add(params, 'middleGrey', 0, 12);
    toneMappingGui.add(params, 'maxLuminance', 1, 30);

    staticToneMappingGui.add(params, 'avgLuminance', 0.001, 2.0);
    adaptiveToneMappingGui.add(params, 'adaptionRate', 0.0, 10.0);

    gui.open();
    window.addEventListener('resize', this.onWindowResize);
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.cameraCube.aspect = window.innerWidth / window.innerHeight;
    this.cameraCube.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private render = (timestep: number) => {
    // this.camera.lookAt( this.scene.position );
    this.cameraCube.rotation.copy( this.camera.rotation );

    // this.renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
    // this.ldrEffectComposer.render( 0.017 );

    // renderer.setViewport( windowThirdX, 0, windowThirdX, window.innerHeight );
    // hdrEffectComposer.render( 0.017 );

    this.renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
    this.dynamicHdrEffectComposer.render( 0.017 );
    // this.mesh.rotateY(0.001 * elapsed);
  };

  private animate: (animate:any) => {
    requestAnimationFrame( animate );
				if ( bloomPass ) {

					bloomPass.copyUniforms[ "opacity" ].value = params.bloomAmount;

				}

				if ( adaptToneMappingPass ) {

					adaptToneMappingPass.setAdaptionRate( params.adaptionRate );
					adaptiveLuminanceMat.uniforms[ "map" ].value = adaptToneMappingPass.luminanceRT;
					currentLuminanceMat.uniforms[ "map" ].value = adaptToneMappingPass.currentLuminanceRT;

					adaptToneMappingPass.enabled = params.enabled;
					adaptToneMappingPass.setMaxLuminance( params.maxLuminance );
					adaptToneMappingPass.setMiddleGrey( params.middleGrey );

					hdrToneMappingPass.enabled = params.enabled;
					hdrToneMappingPass.setMaxLuminance( params.maxLuminance );
					hdrToneMappingPass.setMiddleGrey( params.middleGrey );
					if ( hdrToneMappingPass.setAverageLuminance ) {

						hdrToneMappingPass.setAverageLuminance( params.avgLuminance );

					}

					ldrToneMappingPass.enabled = params.enabled;
					ldrToneMappingPass.setMaxLuminance( params.maxLuminance );
					ldrToneMappingPass.setMiddleGrey( params.middleGrey );
					if ( ldrToneMappingPass.setAverageLuminance ) {

						ldrToneMappingPass.setAverageLuminance( params.avgLuminance );

					}

				}

				this.directionalLight.intensity = params.sunLight;

				this.orbitControls.update();

				render();

  };
}
