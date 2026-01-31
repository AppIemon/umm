
import type { Obstacle } from './game-engine';

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, x: number, y: number, time: number, isEditor: boolean = false, overrideAngle?: number) {
  // x, y are Top-Left coordinates
  const cx = x + obs.width / 2;
  const cy = y + obs.height / 2;

  const angleToUse = overrideAngle ?? obs.angle;
  const hasAngle = angleToUse && angleToUse !== 0;

  if (hasAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleToUse! * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }

  if (obs.type === 'invisible_wall') {
    if (isEditor) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, obs.width, obs.height);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillText("INVISIBLE", x, y + 15);
    }
    if (hasAngle) ctx.restore();
    return;
  } else if (obs.type === 'fake_block') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, obs.width, obs.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, obs.width, obs.height);
    if (isEditor) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText("FAKE", x + 5, y + 15);
    }
    if (hasAngle) ctx.restore();
    return; // Basic fake block logic
  }

  if (obs.type === 'spike' || obs.type === 'mini_spike') {
    const isMini = obs.type === 'mini_spike';
    ctx.fillStyle = isMini ? '#ff6666' : '#ff4444';
    ctx.shadowBlur = isMini ? 8 : 12;
    ctx.shadowColor = '#ff4444';

    ctx.beginPath();
    // Assumption: Spikes orientation is based on Y position (Floor vs Ceiling)
    // This might be tricky for children orbiting balls.
    // Heuristic: If it's a child (parentId is set), assume "Up" (Standard) or Radial?
    // Standard spike usually points Up if on floor.
    // For now, keep the heuristic but maybe defaulting to Up if not near boundaries?
    // Or just check y > 300 (Middle of standard screen 720/2 is 360).

    if (y > 300) {
      // Floor Spike (Points Up)
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width / 2, y);
      ctx.lineTo(x + obs.width, y + obs.height);
    } else {
      // Ceiling Spike (Points Down)
      ctx.moveTo(x, y);
      ctx.lineTo(x + obs.width / 2, y + obs.height);
      ctx.lineTo(x + obs.width, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (obs.type === 'block') {
    ctx.fillStyle = '#444';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#666';
    ctx.fillRect(x, y, obs.width, obs.height);

    ctx.fillStyle = '#555';
    ctx.fillRect(x + 2, y + 2, obs.width - 4, obs.height - 4);

  } else if (obs.type === 'triangle' || obs.type === 'steep_triangle') {
    const isSteep = obs.type === 'steep_triangle';

    ctx.fillStyle = isSteep ? '#222' : '#333';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#555';

    ctx.beginPath();
    ctx.moveTo(x, y + obs.height);
    ctx.lineTo(x + obs.width, y + obs.height);
    ctx.lineTo(x + obs.width, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isSteep ? '#444' : '#555';
    const pad = 4;
    ctx.beginPath();
    ctx.moveTo(x + pad * 2, y + obs.height - pad);
    ctx.lineTo(x + obs.width - pad, y + obs.height - pad);
    ctx.lineTo(x + obs.width - pad, y + pad * 2);
    ctx.fill();

  } else if (obs.type === 'saw') {
    const rx = obs.width / 2;
    const ry = obs.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffaa00';

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff6600';
    const teeth = 10;
    const rot = time * 8;
    for (let i = 0; i < teeth; i++) {
      const angle = (Math.PI * 2 * i / teeth) + rot;
      const tx = Math.cos(angle) * rx * 0.75;
      const ty = Math.sin(angle) * ry * 0.75;
      ctx.beginPath();
      ctx.ellipse(tx, ty, rx * 0.15, ry * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#cc8800';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.25, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (obs.type === 'spike_ball') {
    const rx = obs.width / 2;
    const ry = obs.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = '#666';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#444';

    // Spikes
    const spikes = 8;
    const rotation = time * 3;
    ctx.fillStyle = '#444';
    for (let i = 0; i < spikes; i++) {
      const angle = (Math.PI * 2 * i / spikes) + rotation;
      ctx.beginPath();
      const tx = Math.cos(angle) * rx * 1.2;
      const ty = Math.sin(angle) * ry * 1.2;
      ctx.moveTo(Math.cos(angle - 0.2) * rx * 0.8, Math.sin(angle - 0.2) * ry * 0.8);
      ctx.lineTo(tx, ty);
      ctx.lineTo(Math.cos(angle + 0.2) * rx * 0.8, Math.sin(angle + 0.2) * ry * 0.8);
      ctx.fill();
    }

    // Main ball
    const grad = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, rx * 0.1, 0, 0, rx);
    grad.addColorStop(0, '#888');
    grad.addColorStop(1, '#222');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (obs.type === 'laser') {
    const centerY = y + obs.height / 2;
    const glow = Math.sin(time * 15) * 5 + 10;

    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.shadowBlur = Math.max(0, glow);
    ctx.shadowColor = '#ff0000';

    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + obs.width, centerY);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + obs.width, centerY);
    ctx.stroke();

    ctx.fillStyle = '#777';
    ctx.fillRect(x, y, 8, obs.height);
    ctx.fillRect(x + obs.width - 8, y, 8, obs.height);

  } else if (obs.type === 'v_laser') {
    const centerX = x + obs.width / 2;
    const glow = Math.sin(time * 15) * 5 + 10;

    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.shadowBlur = Math.max(0, glow);
    ctx.shadowColor = '#ff0000';

    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + obs.height);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + obs.height);
    ctx.stroke();

    ctx.fillStyle = '#777';
    ctx.fillRect(x, y, obs.width, 8);
    ctx.fillRect(x, y + obs.height - 8, obs.width, 8);

  } else if (obs.type === 'slope') {
    ctx.fillStyle = '#222';

    ctx.beginPath();
    if ((obs.angle || 0) > 0) {
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width, y);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x + obs.width, y + obs.height);
      ctx.lineTo(x, y);
      ctx.lineTo(x + obs.width, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,200,255,0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

  } else if (obs.type === 'mine') {
    const radius = obs.width / 2;

    const pulse = Math.sin(time * 10) * 0.1 + 0.9;

    ctx.fillStyle = '#ff3333';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';

    ctx.beginPath();
    // Hexagon shape for mine
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + time * 2;
      const px = cx + Math.cos(angle) * radius * pulse;
      const py = cy + Math.sin(angle) * radius * pulse;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#550000';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

  } else if (obs.type === 'orb') {
    const rx = obs.width / 2;
    const ry = obs.height / 2;

    const pulse = Math.sin(time * 5) * 0.1 + 1.0;

    const grad = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx * pulse);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#aa44ff'); // Purple
    grad.addColorStop(0.8, '#4400cc');
    grad.addColorStop(1, 'rgba(68, 0, 204, 0)');

    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * pulse, ry * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

  } else if (obs.type === 'hammer') {
    ctx.save();
    ctx.translate(cx, cy);
    const swing = Math.sin(time * 3) * 0.5;
    ctx.rotate(swing);
    ctx.fillStyle = '#666';
    ctx.fillRect(-5, -obs.height / 2, 10, obs.height * 0.7);
    ctx.fillStyle = '#888';
    ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
    ctx.fillRect(-obs.width / 2, obs.height * 0.2 - obs.height / 2, obs.width, obs.height * 0.3);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-obs.width / 2, obs.height * 0.2 - obs.height / 2, obs.width, obs.height * 0.3);
    ctx.restore();

  } else if (['rotor', 'spark_mine'].includes(obs.type)) {
    ctx.save();
    ctx.translate(cx, cy);
    const spinSpeed = obs.type === 'spark_mine' ? 2 : 8;
    const timeRot = time * spinSpeed;
    ctx.rotate(timeRot);

    const radius = obs.width / 2;

    if (obs.type === 'rotor') {
      ctx.fillStyle = '#ff3333';
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff0000';
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, -obs.height / 2);
        ctx.lineTo(5, -obs.height / 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();

    } else if (obs.type === 'spark_mine') {
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      const spikes = 12;
      for (let k = 0; k < spikes * 2; k++) {
        const r = (k % 2 === 0 ? radius : radius * 0.4);
        const theta = (Math.PI * k) / spikes;
        ctx.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
      }
      ctx.fill();
    }
    ctx.restore();

  } else if (obs.type === 'laser_beam') {
    const cyBeam = y + obs.height / 2;
    const pulse = Math.sin(time * 20) * 2 + 3;

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = obs.height + pulse;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(x, cyBeam);
    ctx.lineTo(x + obs.width, cyBeam);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = obs.height * 0.3;
    ctx.stroke();

  } else if (obs.type === 'piston_v') {
    ctx.fillStyle = '#555';
    ctx.fillRect(x, y, obs.width, obs.height);
    ctx.fillStyle = '#888';
    ctx.fillRect(x + obs.width * 0.3, y, obs.width * 0.4, obs.height);
    ctx.fillStyle = '#333';
    if (y < 360) ctx.fillRect(x, y + obs.height - 20, obs.width, 20);
    else ctx.fillRect(x, y, obs.width, 20);

  } else if (obs.type === 'cannon') {
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(x + obs.width / 2, y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + obs.width / 2, y + obs.height / 2, obs.width / 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (['falling_spike', 'growing_spike'].includes(obs.type)) {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    const cx = x + obs.width / 2;
    if (obs.type === 'falling_spike') {
      // Draw falling path indicator
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      // Line from spike tip (bottom center of spike) down to reasonably far
      const tipX = cx;
      const tipY = y + obs.height;
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX, tipY + 400); // Draw downward path
      ctx.stroke();
      ctx.restore();

      ctx.moveTo(x, y);
      ctx.lineTo(x + obs.width, y);
      ctx.lineTo(cx, y + obs.height);
    } else {
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width, y + obs.height);
      ctx.lineTo(cx, y);
    }
    ctx.fill();

  } else if (obs.type === 'crusher_jaw') {
    // Unique Crusher Jaw Design (Biting Trap)
    const cx = x + obs.width / 2;
    const cy = y + obs.height / 2;
    const padding = 5;

    ctx.fillStyle = '#ff4444';

    // Top Jaw
    ctx.beginPath();
    ctx.moveTo(x + padding, y);
    ctx.lineTo(x + obs.width - padding, y);
    ctx.lineTo(cx, cy - 5);
    ctx.fill();

    // Bottom Jaw
    ctx.beginPath();
    ctx.moveTo(x + padding, y + obs.height);
    ctx.lineTo(x + obs.width - padding, y + obs.height);
    ctx.lineTo(cx, cy + 5);
    ctx.fill();

    // Teeth details
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(x + obs.width * 0.3, y);
    ctx.lineTo(x + obs.width * 0.35, y + obs.height * 0.3);
    ctx.lineTo(x + obs.width * 0.4, y);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + obs.width * 0.6, y + obs.height);
    ctx.lineTo(x + obs.width * 0.65, y + obs.height * 0.7);
    ctx.lineTo(x + obs.width * 0.7, y + obs.height);
    ctx.fill();

  } else if (obs.type === 'swing_blade') {
    const cx = x + obs.width / 2;
    const cy = y;

    ctx.save();
    ctx.translate(cx, cy);
    const swing = Math.sin(time * 2) * 0.8;
    ctx.rotate(swing);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, obs.height);
    ctx.stroke();

    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.ellipse(0, obs.height, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (obs.type === 'planet' || obs.type === 'star') {
    const isStar = obs.type === 'star';
    const radius = obs.width / 2;

    if (isStar) {
      const pulse = 1 + Math.sin(time * 5) * 0.05;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * pulse);
      grad.addColorStop(0, '#ffff88');
      grad.addColorStop(0.5, '#ffaa00');
      grad.addColorStop(1, 'rgba(255, 68, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(cx, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#4488ff');
      grad.addColorStop(1, '#002266');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Attached Children
    if (obs.children && obs.children.length > 0) {
      const speed = obs.customData?.orbitSpeed ?? 1.0;
      for (let i = 0; i < obs.children.length; i++) {
        const child = obs.children[i];
        if (!child) continue;

        const theta = time * speed + (i * ((Math.PI * 2) / obs.children.length));
        const dist = obs.customData?.orbitDistance ?? (obs.width * 0.85);

        const px = cx + Math.cos(theta) * dist;
        const py = cy + Math.sin(theta) * dist;

        // Draw Child Recursively
        // Child position is top-left, so calculate it from center `px, py`
        const childX = px - child.width / 2;
        const childY = py - child.height / 2;

        drawObstacle(ctx, child, childX, childY, time, isEditor);
      }
    }
  }

  if (hasAngle) ctx.restore();
}
