const GPP_MON = [
  { eid: 'goblet-squat', name: 'Goblet Squat', targetSets: 4, targetReps: '8', targetWeight: 'Technique focus' },
  { eid: 'rdl', name: 'Romanian Deadlift', targetSets: 3, targetReps: '8', targetWeight: 'Moderate' },
  { eid: 'sl-press', name: 'Single-Leg Press', targetSets: 3, targetReps: '10', targetWeight: 'Light–Moderate' },
  { eid: 'eccentric-calf', name: 'Eccentric Calf Raise', targetSets: 3, targetReps: '15', targetWeight: 'Bodyweight' },
  { eid: 'nordic', name: 'Nordic Hamstring Curl', targetSets: 3, targetReps: '5', targetWeight: 'Bodyweight' },
  { eid: 'hip-thrust', name: 'Hip Thrust', targetSets: 3, targetReps: '10', targetWeight: 'Light–Moderate' },
]

const GPP_WED = [
  { eid: 'db-bench', name: 'DB Bench Press', targetSets: 4, targetReps: '8', targetWeight: 'Moderate' },
  { eid: 'barbell-row', name: 'Barbell Row', targetSets: 4, targetReps: '8', targetWeight: 'Moderate' },
  { eid: 'pullups', name: 'Pull-Ups', targetSets: 3, targetReps: '8', targetWeight: 'Bodyweight' },
  { eid: 'face-pull', name: 'Face Pull', targetSets: 3, targetReps: '12', targetWeight: 'Light' },
  { eid: 'dead-bug', name: 'Dead Bug', targetSets: 3, targetReps: '8 ea', targetWeight: 'Bodyweight' },
  { eid: 'pallof', name: 'Pallof Press', targetSets: 3, targetReps: '10 ea', targetWeight: 'Light' },
  { eid: 'ab-wheel', name: 'Ab Wheel Rollout', targetSets: 3, targetReps: '6', targetWeight: 'Bodyweight' },
  { eid: 'copenhagen', name: 'Copenhagen Plank', targetSets: 3, targetReps: '20 sec', targetWeight: 'Bodyweight' },
]

const GPP_FRI = [
  { eid: 'hang-clean', name: 'Hang Power Clean', targetSets: 5, targetReps: '3', targetWeight: '50–60% 1RM' },
  { eid: 'snatch-pull', name: 'Snatch Pull', targetSets: 4, targetReps: '3', targetWeight: 'Light' },
  { eid: 'clean-pull', name: 'Clean Pull', targetSets: 3, targetReps: '4', targetWeight: 'Light' },
  { eid: 'box-jump', name: 'Box Jump (Bilateral)', targetSets: 4, targetReps: '4', targetWeight: 'Bodyweight' },
  { eid: 'broad-jump', name: 'Broad Jump', targetSets: 3, targetReps: '3', targetWeight: 'Bodyweight' },
]

const GPP_SAT = [
  { eid: 'mb-slam', name: 'Med Ball Overhead Slam', targetSets: 4, targetReps: '6', targetWeight: '6–8 kg' },
  { eid: 'mb-rotation', name: 'Med Ball Rotational Throw', targetSets: 3, targetReps: '6 ea', targetWeight: '4–6 kg' },
  { eid: 'sled-push', name: 'Sled Push', targetSets: 4, targetReps: '20 m', targetWeight: 'Light' },
  { eid: 'suitcase-carry', name: 'Suitcase Carry', targetSets: 3, targetReps: '20 m ea', targetWeight: 'Moderate' },
  { eid: 'landmine-rot', name: 'Landmine Rotation', targetSets: 3, targetReps: '10 ea', targetWeight: 'Light' },
]

const SPP_MON = [
  { eid: 'back-squat', name: 'Back Squat', targetSets: 5, targetReps: '4', targetWeight: '80–87% 1RM' },
  { eid: 'rdl-spp', name: 'Romanian Deadlift', targetSets: 4, targetReps: '5', targetWeight: 'Heavy' },
  { eid: 'bss', name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '5 ea', targetWeight: 'Moderate–Heavy' },
  { eid: 'eccentric-calf-uni', name: 'Eccentric Calf Raise (Single)', targetSets: 3, targetReps: '12 ea', targetWeight: 'Bodyweight' },
  { eid: 'nordic-spp', name: 'Nordic Hamstring Curl', targetSets: 4, targetReps: '5', targetWeight: 'Bodyweight' },
  { eid: 'hip-thrust-spp', name: 'Hip Thrust', targetSets: 4, targetReps: '5', targetWeight: 'Heavy' },
]

const SPP_WED = [
  { eid: 'bench-spp', name: 'Bench Press', targetSets: 4, targetReps: '5', targetWeight: 'Heavy' },
  { eid: 'w-pullups', name: 'Weighted Pull-Ups', targetSets: 4, targetReps: '5', targetWeight: 'Added weight' },
  { eid: 'barbell-row-spp', name: 'Barbell Row', targetSets: 4, targetReps: '5', targetWeight: 'Heavy' },
  { eid: 'ab-wheel-spp', name: 'Ab Wheel Rollout', targetSets: 4, targetReps: '10', targetWeight: 'Bodyweight' },
  { eid: 'leg-raise', name: 'Hanging Leg Raise', targetSets: 3, targetReps: '10', targetWeight: 'Bodyweight' },
  { eid: 'copenhagen-spp', name: 'Copenhagen Plank', targetSets: 3, targetReps: '30 sec', targetWeight: 'Bodyweight' },
  { eid: 'oh-carry', name: 'Overhead Carry', targetSets: 3, targetReps: '20 m ea', targetWeight: 'Moderate' },
]

const SPP_FRI = [
  { eid: 'hang-clean-spp', name: 'Hang Power Clean', targetSets: 5, targetReps: '3', targetWeight: '75–85% 1RM' },
  { eid: 'power-snatch', name: 'Power Snatch', targetSets: 4, targetReps: '3', targetWeight: '70–80% 1RM' },
  { eid: 'contrast', name: 'Contrast: Squat → Box Jump', targetSets: 3, targetReps: '2 + 3', targetWeight: '85% 1RM' },
  { eid: 'hurdle-hops', name: 'Hurdle Hops', targetSets: 4, targetReps: '6', targetWeight: 'Bodyweight' },
  { eid: 'sl-bound', name: 'Single-Leg Bound', targetSets: 3, targetReps: '15 m ea', targetWeight: 'Bodyweight' },
  { eid: 'trap-jump', name: 'Trap Bar Jump Squat', targetSets: 4, targetReps: '4', targetWeight: '30–35% 1RM' },
]

const SPP_SAT = [
  { eid: 'mb-scoop', name: 'Med Ball Scoop Toss', targetSets: 4, targetReps: '6', targetWeight: '6–8 kg' },
  { eid: 'mb-rot-spp', name: 'Med Ball Rotational Throw', targetSets: 4, targetReps: '6 ea', targetWeight: '4–6 kg' },
  { eid: 'depth-jump', name: 'Depth Jump (40 cm)', targetSets: 3, targetReps: '4', targetWeight: 'Bodyweight' },
  { eid: 'sled-heavy', name: 'Heavy Sled Push', targetSets: 5, targetReps: '20 m', targetWeight: 'Heavy' },
  { eid: 'landmine-spp', name: 'Landmine Rotation', targetSets: 3, targetReps: '10 ea', targetWeight: 'Moderate' },
]

const PC_MON = [
  { eid: 'squat-pc', name: 'Back Squat', targetSets: 3, targetReps: '3', targetWeight: '88–92% 1RM' },
  { eid: 'ht-pc', name: 'Hip Thrust', targetSets: 3, targetReps: '3', targetWeight: 'Max' },
  { eid: 'nordic-pc', name: 'Nordic Hamstring Curl', targetSets: 3, targetReps: '4', targetWeight: 'Bodyweight' },
  { eid: 'calf-pc', name: 'Single-Leg Calf Raise', targetSets: 3, targetReps: '8 ea', targetWeight: 'Loaded' },
]

const PC_WED = [
  { eid: 'bench-pc', name: 'Bench Press', targetSets: 3, targetReps: '3', targetWeight: 'Heavy' },
  { eid: 'pullup-pc', name: 'Weighted Pull-Ups', targetSets: 3, targetReps: '3', targetWeight: 'Heavy' },
  { eid: 'core-pc', name: 'Core Circuit', targetSets: 2, targetReps: '10 ea', targetWeight: 'Light' },
]

const PC_FRI = [
  { eid: 'clean-pc', name: 'Hang Power Clean', targetSets: 4, targetReps: '2', targetWeight: '88–92% 1RM' },
  { eid: 'hurdle-pc', name: 'Reactive Hurdle Hops', targetSets: 3, targetReps: '5', targetWeight: 'Bodyweight' },
  { eid: 'depth-pc', name: 'Depth Jump (50 cm)', targetSets: 3, targetReps: '3', targetWeight: 'Bodyweight' },
  { eid: 'sled-pc', name: 'Sled Sprint', targetSets: 3, targetReps: '20 m', targetWeight: 'Light' },
]

const COMP_MON = [
  { eid: 'squat-comp', name: 'Back Squat', targetSets: 3, targetReps: '3', targetWeight: '85% 1RM' },
  { eid: 'ht-comp', name: 'Hip Thrust', targetSets: 3, targetReps: '3', targetWeight: 'Heavy' },
  { eid: 'clean-comp', name: 'Hang Power Clean', targetSets: 3, targetReps: '2', targetWeight: '85% 1RM' },
  { eid: 'core-comp', name: 'Core Circuit', targetSets: 2, targetReps: '10 ea', targetWeight: 'Light' },
]

const COMP_WED = [
  { eid: 'bench-comp', name: 'Bench Press', targetSets: 3, targetReps: '3', targetWeight: 'Heavy' },
  { eid: 'pullup-comp', name: 'Weighted Pull-Ups', targetSets: 3, targetReps: '4', targetWeight: 'Heavy' },
  { eid: 'nordic-comp', name: 'Nordic Hamstring Curl', targetSets: 3, targetReps: '4', targetWeight: 'Bodyweight' },
  { eid: 'carry-comp', name: 'Carries + Landmine', targetSets: 2, targetReps: '20 m / 10 ea', targetWeight: 'Moderate' },
]

export const DEFAULT_PROGRAMME = {
  id: 'sprint-100-200',
  name: 'Sprint 100m / 200m',
  phases: [
    {
      id: 'gpp',
      name: 'GPP',
      fullName: 'General Physical Preparation',
      weekStart: 1,
      weekEnd: 8,
      days: [
        { id: 'mon', name: 'Monday', title: 'Lower Strength', exercises: GPP_MON },
        { id: 'wed', name: 'Wednesday', title: 'Upper Body + Core', exercises: GPP_WED },
        { id: 'fri', name: 'Friday', title: 'Olympic Lifting', exercises: GPP_FRI },
        { id: 'sat', name: 'Saturday', title: 'Conditioning', exercises: GPP_SAT },
      ],
    },
    {
      id: 'spp',
      name: 'SPP',
      fullName: 'Specific Physical Preparation',
      weekStart: 9,
      weekEnd: 16,
      days: [
        { id: 'mon', name: 'Monday', title: 'Lower Strength — Peak', exercises: SPP_MON },
        { id: 'wed', name: 'Wednesday', title: 'Upper + Core', exercises: SPP_WED },
        { id: 'fri', name: 'Friday', title: 'Olympic Lifting + Contrast', exercises: SPP_FRI },
        { id: 'sat', name: 'Saturday', title: 'Conditioning + Power', exercises: SPP_SAT },
      ],
    },
    {
      id: 'precomp',
      name: 'Pre-Comp',
      fullName: 'Pre-Competition',
      weekStart: 17,
      weekEnd: 20,
      days: [
        { id: 'mon', name: 'Monday', title: 'Lower — Peak', exercises: PC_MON },
        { id: 'wed', name: 'Wednesday', title: 'Upper + Core', exercises: PC_WED },
        { id: 'fri', name: 'Friday', title: 'Olympic Lifting — Peak', exercises: PC_FRI },
        { id: 'sat', name: 'Saturday', title: 'Tempo + Mobility', exercises: [] },
      ],
    },
    {
      id: 'comp',
      name: 'Competition',
      fullName: 'Competition Phase',
      weekStart: 21,
      weekEnd: 28,
      days: [
        { id: 'mon', name: 'Monday', title: 'Full Body Maintenance', exercises: COMP_MON },
        { id: 'wed', name: 'Wednesday', title: 'Upper + Core', exercises: COMP_WED },
        { id: 'fri', name: 'Friday', title: 'Speed Endurance', exercises: [] },
        { id: 'sat', name: 'Saturday', title: 'Race Day', exercises: [] },
      ],
    },
  ],
}
