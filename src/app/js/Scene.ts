import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Vector2 } from 'three';

class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private controls: OrbitControls;

  private buildings: THREE.Mesh[] = []

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
    const buildingWidth = 0.3;

    this.camera.position.set(-1.5, 3, -1.5);
    
    for(let i = 0; i < 12; i += 1){
      for(let j = 0; j < 12; j += 1){
        const buildingHeight = Math.random() * 2 + 0.3;
        const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth)
        const buildingMaterial = new THREE.MeshNormalMaterial()
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
        building.translateY(buildingHeight / 2);
        building.position.x = (buildingWidth + 0.05) * i + parseInt((i / 2).toString()) * 0.4
        building.position.z = (buildingWidth + 0.05) * j + parseInt((j / 2).toString()) * 0.4

        this.buildings.push(building)
        this.scene.add(building)
      }
    }

    const carGeometryLine = new THREE.LineCurve3(new THREE.Vector3(-0.4, 0, 0), new THREE.Vector3(-0.3, 0, 0));
    const carGeometry = new THREE.TubeBufferGeometry(carGeometryLine, 25, 0.01, 8, false);
    const carMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
    const car = new THREE.Line(carGeometry, carMaterial);
    this.scene.add(car)
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);

    this.controls.update();
  }
}

export default new Scene();
