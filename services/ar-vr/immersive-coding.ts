import * as THREE from 'three';

export class ImmersiveCoding {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private codeBlocks: Map<string, THREE.Mesh> = new Map();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);
    
    this.camera.position.z = 5;
    this.animate();
  }

  addCodeBlock(id: string, code: string, position: THREE.Vector3) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 256;
    
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#d4d4d4';
    ctx.font = '16px monospace';
    
    const lines = code.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 10, 20 + i * 20);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    this.scene.add(mesh);
    this.codeBlocks.set(id, mesh);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.codeBlocks.forEach(block => {
      block.rotation.y += 0.001;
    });
    this.renderer.render(this.scene, this.camera);
  };

  updateCodeBlock(id: string, code: string) {
    const block = this.codeBlocks.get(id);
    if (block) {
      this.scene.remove(block);
      this.codeBlocks.delete(id);
      this.addCodeBlock(id, code, block.position);
    }
  }
}
