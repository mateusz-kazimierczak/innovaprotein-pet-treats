import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../process/vendor/three-r170.mjs';
import { addLarvae, crawlPeriod } from '../process/larvae.mjs';

test('each larva crawls across the bedding and returns seamlessly to its starting pose', () => {
  const tray = new Group();
  const animate = addLarvae(tray);
  const bodies = tray.children[0];
  const segments = 12;
  const paths = Array.from({ length: bodies.count / segments }, () => []);
  animate(0);
  const initial = bodies.instanceMatrix.array.slice();

  for (let frame = 0; frame <= 64; frame++) {
    animate(crawlPeriod * frame / 64);
    const matrices = bodies.instanceMatrix.array;
    for (const [n, path] of paths.entries()) {
      let x = 0, z = 0;
      for (let j = 0; j < segments; j++) {
        const offset = (n * segments + j) * 16;
        const px = matrices[offset + 12], pz = matrices[offset + 14];
        assert.ok(px > -1.2 && px < 1.36 && pz > .23 && pz < 1.29, 'segment stays on the bedding');
        x += px;
        z += pz;
      }
      path.push([x / segments, z / segments]);
    }
  }
  assert.ok(paths.length > 1);
  for (const path of paths) {
    const traveled = path.slice(1).reduce((sum, [x, z], i) =>
      sum + Math.hypot(x - path[i][0], z - path[i][1]), 0);
    assert.ok(traveled > 1, 'the body travels over one world unit per cycle');
  }
  for (const [i, value] of bodies.instanceMatrix.array.entries()) {
    assert.ok(Math.abs(value - initial[i]) < 1e-5, 'the loop closes without a jump');
  }
  animate(2);
  const paused = bodies.instanceMatrix.array.slice();
  animate(2);
  assert.deepEqual(bodies.instanceMatrix.array, paused);
});
