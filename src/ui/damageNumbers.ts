import * as THREE from "three";

interface DamageNumber {
  element: HTMLDivElement;
  worldPosition: THREE.Vector3;
  age: number;
}

export class DamageNumbers {
  private readonly numbers: DamageNumber[] = [];
  private readonly projector = new THREE.Vector3();

  constructor(private readonly root: HTMLElement) {}

  spawn(value: number, worldPosition: THREE.Vector3) {
    const element = document.createElement("div");
    element.className = "damage-number";
    element.textContent = String(value);
    this.root.append(element);

    this.numbers.push({
      element,
      worldPosition: worldPosition.clone(),
      age: 0,
    });
  }

  update(deltaSeconds: number, camera: THREE.Camera) {
    const width = this.root.clientWidth;
    const height = this.root.clientHeight;

    for (const number of this.numbers) {
      number.age += deltaSeconds;
      number.worldPosition.y += deltaSeconds * 1.05;
      this.projector.copy(number.worldPosition).project(camera);

      const x = (this.projector.x * 0.5 + 0.5) * width;
      const y = (-this.projector.y * 0.5 + 0.5) * height;
      const opacity = Math.max(0, 1 - number.age);
      number.element.style.transform = `translate(${x}px, ${y}px)`;
      number.element.style.opacity = opacity.toFixed(3);
    }

    for (let index = this.numbers.length - 1; index >= 0; index -= 1) {
      const number = this.numbers[index];

      if (number && number.age >= 1) {
        number.element.remove();
        this.numbers.splice(index, 1);
      }
    }
  }
}
