import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface Car {
  mesh: THREE.Line;
  side: boolean;
}

class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private controls: OrbitControls;
  private composer: EffectComposer;

  private buildings: THREE.Mesh[] = [];

  private cars: Car[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.bind();
  }

  bind() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init() {
    this.camera.position.set(-4, 5, -4);
    this.camera.lookAt(0, 0, 0);

    this.controls.autoRotate = true;

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const luminosityShader = new ShaderPass(LuminosityShader);
    this.composer.addPass(luminosityShader);

    const effetSobel = new ShaderPass(SobelOperatorShader);
    // @ts-ignore
    effetSobel.uniforms['resolution'].value.x = window.innerWidth * window.devicePixelRatio;
    // @ts-ignore
    effetSobel.uniforms['resolution'].value.y = window.innerHeight * window.devicePixelRatio;
    this.composer.addPass(effetSobel);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 2.2;
    bloomPass.radius = 0.66;
    this.composer.addPass(bloomPass);

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.25);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);

    const size = 12;
    const buildingWidth = 0.3;

    const buildingGroup = new THREE.Group();

    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        const buildingHeight = Math.random() * 2 + 0.3;
        const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth);
        const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.translateY(buildingHeight / 2);
        building.position.x = (buildingWidth + 0.05) * i + parseInt((i / 2).toString(), 10) * 0.4;
        building.position.z = (buildingWidth + 0.05) * j + parseInt((j / 2).toString(), 10) * 0.4;
        building.translateX(buildingWidth / 2);
        building.translateZ(buildingWidth / 2);

        this.buildings.push(building);
        buildingGroup.add(building);
      }
    }
    const box = new THREE.Box3().setFromObject(buildingGroup);

    buildingGroup.position.x = -(box.max.x - box.min.x) / 2;
    buildingGroup.position.z = -(box.max.z - box.min.z) / 2;

    this.scene.add(buildingGroup);

    for (let i = 0; i < 200; i += 1) {
      const carGeometryLine = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-3, 0, 0));
      const carGeometry = new THREE.TubeBufferGeometry(carGeometryLine, 25, 0.001, 8, false);
      const carMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });

      const direction = Math.random() < 0.5;
      const side = Math.random() < 0.5;
      const offsetA = Math.floor((Math.random() * size) / 2);
      const offsetB = Math.floor((Math.random() * size) / 2);

      const car = new THREE.Line(carGeometry, carMaterial);
      car.position.set(
        (buildingWidth * 2 + 0.05) * offsetA + parseInt((offsetA / 2).toString(), 10) * 0.4,
        0,
        (buildingWidth * 2 + 0.05) * offsetB + parseInt((offsetB / 2).toString(), 10) * 0.4,
      );
      car.translateX(-(box.max.x - box.min.x) / 2);
      car.translateZ(-(box.max.z - box.min.z) / 2);

      if (side) {
        car.translateZ(100 * Math.random() - 50);
      } else {
        car.translateX(100 * Math.random() - 50);
      }

      //console.log(buildingWidth * 2 * offsetA + 0.05, 0, buildingWidth * 2 * offsetB + 0.05);

      if (side) {
        car.rotateY(Math.PI / 2);
        // car.translateZ(box.max.z - box.min.z);
      }

      if (direction) {
        // car.translateX(box.max.z - box.min.z);
      }

      this.cars.push({
        mesh: car,
        side,
      });

      this.scene.add(car);
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();

    this.controls.update();

    const limit = 50;

    this.cars.forEach(car => {
      if (car.side) {
        if (car.mesh.position.z > limit) {
          car.mesh.position.z = -limit;
        }

        car.mesh.position.z += 2;
      } else {
        if (car.mesh.position.x > limit) {
          car.mesh.position.x = -limit;
        }

        car.mesh.position.x += 2;
      }
    });
  }
}

export default new Scene();
