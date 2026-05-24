const RADAR_RANGE = 90;

export class HUD {
  constructor(elements) {
    Object.assign(this, elements);
    this.toastTimer = 0;
  }

  update(state) {
    const objective = state.missionState === 'combat'
      ? `Clear the area in ${state.activeMission.chapter}.`
      : state.activeMission.objective;

    this.chapterTitle.textContent = `${state.activeMission.chapter}`;
    this.objectiveText.textContent = objective;
    this.healthValue.textContent = `${Math.round(state.player.hp)} / ${state.player.maxHp}`;
    this.healthFill.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
    this.enemyValue.textContent = `${state.enemies.filter(enemy => enemy.alive).length}`;
    this.modeValue.textContent = state.player.inVehicle ? 'Royal Chariot' : 'On Foot';
    this.weaponValue.textContent = state.player.inVehicle ? 'Driving' : (state.isAiming ? 'Bow' : 'Blade');
    this.speedValue.textContent = `${Math.round(state.player.inVehicle ? Math.abs(state.vehicle.speed) * 8 : Math.hypot(state.player.velocity.x, state.player.velocity.z))}`;
  }

  updateRadar(player, vehicle, enemies, activeMission) {
    const ctx = this.radarCtx;
    const { width, height } = this.radarCanvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;
    const worldPos = player.inVehicle ? vehicle.group.position : player.group.position;
    const heading = player.inVehicle ? vehicle.group.rotation.y : player.group.rotation.y;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(5, 10, 18, 0.92)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(229, 185, 83, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 2; ring++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 3) * ring, 0, Math.PI * 2);
      ctx.stroke();
    }

    const drawPoint = (target, color, size, clampToEdge) => {
      const dx = target.x - worldPos.x;
      const dz = target.z - worldPos.z;
      const localX = dx * Math.cos(-heading) - dz * Math.sin(-heading);
      const localZ = dx * Math.sin(-heading) + dz * Math.cos(-heading);
      const distance = Math.hypot(localX, localZ);
      let scale = radius / RADAR_RANGE;
      let drawX = localX;
      let drawZ = localZ;
      if (distance > RADAR_RANGE && clampToEdge) {
        const factor = (RADAR_RANGE * 0.92) / distance;
        drawX *= factor;
        drawZ *= factor;
      }
      const px = centerX + drawX * scale;
      const py = centerY + drawZ * scale;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPoint(activeMission.marker, '#f0c56a', 4.8, true);
    enemies.forEach(enemy => {
      if (enemy.alive) drawPoint(enemy.group.position, '#ff6a5b', 3.8, true);
    });
    drawPoint(vehicle.group.position, '#9dc8ff', 4.2, true);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = '#ffffff';
    ctx.rotate(-heading);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  updateInteractionPrompt(player, vehicle, uiMode) {
    if (uiMode !== 'playing') {
      this.prompt.classList.add('hidden');
      return;
    }

    if (player.inVehicle) {
      this.prompt.textContent = 'Press F to leave the royal chariot';
      this.prompt.classList.remove('hidden');
      return;
    }

    const nearVehicle = player.group.position.distanceTo(vehicle.group.position) <= 5.2;
    if (nearVehicle) {
      this.prompt.textContent = 'Press F to enter the royal chariot';
      this.prompt.classList.remove('hidden');
    } else {
      this.prompt.classList.add('hidden');
    }
  }

  toast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.remove('hidden');
    this.toastTimer = 2.4;
  }

  setMarker(marker, position, visible) {
    marker.position.copy(position);
    marker.position.y = 0.35;
    marker.visible = visible;
  }

  tick(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl.classList.add('hidden');
    }
  }
}
