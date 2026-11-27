import * as T from './vendor/three-r170.mjs';
import { mat } from './model-kit.mjs';

export const crawlPeriod = 6.4;
const turn = Math.PI * 2;
const segments = 12;

// Each row gives a larva its own patch of bedding and starting position.
// The closed paths keep both live playback and the recorded fallback seamless.
const patches = [
  [-.79, .48, .32, .14, .10],
  [ .06, .53, .35, .16, .65],
  [ .96, .48, .29, .15, .34],
  [-.72, 1.03, .36, .16, .48],
  [ .11, 1.01, .30, .16, .18],
  [ .96, 1.04, .33, .14, .74]
];

export function addLarvae(parent) {
  const bodies = new T.InstancedMesh(
    new T.SphereGeometry(1, 12, 8), mat('ivory'), segments * patches.length
  );
  bodies.castShadow = true;
  bodies.receiveShadow = true;
  parent.add(bodies);

  const trails = patches.map(([x, z, rx, rz, start], n) => {
    const points = Array.from({ length: 8 }, (_, j) => {
      const a = j * turn / 8;
      return new T.Vector3(x + rx * Math.cos(a), 0,
        z + rz * Math.sin(a) + .025 * Math.sin(2 * a + n));
    });
    const path = new T.CatmullRomCurve3(points, true);
    const direction = n % 2 === 0 ? 1 : -1;
    const length = .40 + .025 * (n % 3);
    for (let j = 0; j < segments; j++) {
      const tint = j === 0 ? '#a87d50' : j === segments - 1 ? '#c8aa74'
        : j % 3 === 0 ? '#ddc18c' : '#f1ddaf';
      bodies.setColorAt(n * segments + j, new T.Color(tint));
    }
    return { path, perimeter: path.getLength(), direction, start, length };
  });

  const segment = new T.Object3D(), point = new T.Vector3(), tangent = new T.Vector3();
  return function crawl(time) {
    const lap = time / crawlPeriod;
    trails.forEach(({ path, perimeter, direction, start, length }, n) => {
      const rhythm = lap * turn * 5 + n * 1.6;
      const head = start + direction * (lap + .009 * Math.sin(rhythm));
      for (let j = 0; j < segments; j++) {
        const u = j / (segments - 1);
        const wave = Math.sin(rhythm - u * turn);
        const distance = head - direction * u * (length + .032 * wave) / perimeter;
        const along = distance - Math.floor(distance);
        path.getPointAt(along, point);
        path.getTangentAt(along, tangent);
        const bend = .024 * wave * Math.sin(Math.PI * u);
        const radius = (.026 + .030 * Math.sin(Math.PI * u) ** .65) * (1 - .10 * wave);
        segment.position.set(point.x - tangent.z * bend, .853 + radius * .72, point.z + tangent.x * bend);
        segment.rotation.y = -Math.atan2(tangent.z, tangent.x);
        segment.scale.set(.038, radius * .73, radius);
        segment.updateMatrix();
        bodies.setMatrixAt(n * segments + j, segment.matrix);
      }
    });
    bodies.instanceMatrix.needsUpdate = true;
  };
}
