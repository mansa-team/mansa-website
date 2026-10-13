// Configurations of one shared ribbon: no financial data or product simulation.
export const sculptureForms = [
  { id: 'horizon', name: 'Horizonte', description: 'As camadas compartilham uma direção.' },
  { id: 'cadence', name: 'Cadência', description: 'Intervalos regulares criam continuidade.' },
  { id: 'opening', name: 'Abertura', description: 'A distância revela a relação entre as partes.' },
] as const;
export type SculptureForm = (typeof sculptureForms)[number]['id'];

const poses = [
  { spread: 1, rise: 0.36, depth: 1.82, twist: 0, roll: 0, x: 0.27, y: 0.65, z: -0.38 },
  { spread: 1.18, rise: 0.12, depth: 1.9, twist: 0, roll: 0, x: 0.23, y: 0.95, z: -0.12 },
  { spread: 1.75, rise: 0.46, depth: 1.65, twist: 0.22, roll: 0.03, x: 0.45, y: 1.3, z: -0.26 },
];

export function sculpturePose(progress: number) {
  const value = Math.max(0, Math.min(1, progress)) * 2;
  const index = Math.min(1, Math.floor(value));
  const t = value - index;
  const from = poses[index];
  const to = poses[index + 1];
  return {
    spread: from.spread + (to.spread - from.spread) * t,
    rise: from.rise + (to.rise - from.rise) * t,
    depth: from.depth + (to.depth - from.depth) * t,
    twist: from.twist + (to.twist - from.twist) * t,
    roll: from.roll + (to.roll - from.roll) * t,
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    z: from.z + (to.z - from.z) * t,
  };
}
