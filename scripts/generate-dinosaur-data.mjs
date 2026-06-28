import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPORT_ROOT = process.env.THE_ISLE_EXPORT_ROOT
  || 'C:/Users/danie/Downloads/Output/Exports/TheIsle/Content/TheIsle';
const CHARACTER_DINO_ROOT = path.join(EXPORT_ROOT, 'Characters', 'Dinosaurs');
const CORE_DINO_ROOT = path.join(EXPORT_ROOT, 'Core', 'Characters', 'Dinosaurs');
const DATA_DATE = process.env.THE_ISLE_DATA_DATE || '2026-06-28';

const CALL_ORDER = [
  { name: 'Broadcast', key: '1' },
  { name: 'Attract', key: '2' },
  { name: 'Threaten', key: '3' },
  { name: 'Danger', key: '4' },
  { name: 'Generic', key: 'F' }
];

const MOVEMENT_CURVES = [
  ['CrouchSpeed', 'Crouch Speed'],
  ['WalkSpeed', 'Walk Speed'],
  ['TrotSpeed', 'Trot Speed'],
  ['SprintSpeed', 'Sprint Speed'],
  ['SlowSwimSpeed', 'Slow Swim Speed'],
  ['FastSwimSpeed', 'Fast Swim Speed']
];

const ROSTER = [
  {
    slug: 'allosaurus',
    title: 'Allosaurus',
    rawDir: 'Allosaurus',
    diet: 'Carnivore',
    size: 'Large',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Large allosaurid predator', 'Balanced power and mobility', 'Suited to measured ambush pressure']
  },
  {
    slug: 'austroraptor',
    title: 'Austroraptor',
    rawDir: 'Austroraptor',
    diet: 'Carnivore',
    size: 'Medium',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Agile raptor predator', 'Good chase pressure', 'Works best with careful stamina control']
  },
  {
    slug: 'baryonyx',
    title: 'Baryonyx',
    rawDir: 'Baryonyx',
    diet: 'Carnivore',
    size: 'Large',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'semiaquatic',
    characteristics: ['Large fish-eating theropod', 'Comfortable around waterways', 'Threatens smaller animals near shorelines']
  },
  {
    slug: 'beipiaosaurus',
    title: 'Beipiaosaurus',
    rawDir: 'Beipiaosaurus',
    diet: 'Omnivore',
    size: 'Small',
    speed: 'Moderate',
    difficulty: 'Easy',
    role: 'semiaquatic',
    characteristics: ['Small semi-aquatic omnivore', 'Can escape into water', 'Relies on awareness more than raw damage']
  },
  {
    slug: 'carnotaurus',
    title: 'Carnotaurus',
    rawDir: 'Carnotaurus',
    diet: 'Carnivore',
    size: 'Medium',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Medium-sized theropod dinosaur', 'Distinctive horns above the eyes', 'Very strong burst speed', 'Well-suited for ambush hunting']
  },
  {
    slug: 'ceratosaurus',
    title: 'Ceratosaurus',
    rawDir: 'Ceratosaurus',
    diet: 'Carnivore',
    size: 'Medium',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Durable medium carnivore', 'Strong scavenger pressure', 'Threatens wounded targets well']
  },
  {
    slug: 'deinosuchus',
    title: 'Deinosuchus',
    rawDir: 'Deinosuchus',
    diet: 'Carnivore',
    size: 'Apex',
    speed: 'Slow on land',
    difficulty: 'Hard',
    role: 'semiaquatic',
    characteristics: ['Massive crocodilian ambush predator', 'Dominates water crossings', 'Vulnerable when committed far from water']
  },
  {
    slug: 'diabloceratops',
    title: 'Diabloceratops',
    rawDir: 'Diabloceratops',
    diet: 'Herbivore',
    size: 'Medium',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Horned defensive herbivore', 'Strong frontal threat', 'Best when protecting space and punishing overcommitment']
  },
  {
    slug: 'dilophosaurus',
    title: 'Dilophosaurus',
    rawDir: 'Dilophosaurus',
    diet: 'Carnivore',
    size: 'Medium',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Nocturnal ambush carnivore', 'Relies on pressure and disruption', 'Strongest when choosing fights carefully']
  },
  {
    slug: 'dryosaurus',
    title: 'Dryosaurus',
    rawDir: 'Dryosaurus',
    diet: 'Herbivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Easy',
    role: 'herbivore',
    characteristics: ['Small fast herbivore', 'Escapes through agility', 'Survives by avoiding direct fights']
  },
  {
    slug: 'gallimimus',
    title: 'Gallimimus',
    rawDir: 'Gallimimus',
    diet: 'Herbivore',
    size: 'Medium',
    speed: 'Very fast',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Fast cursorial herbivore', 'Excellent scouting and escape potential', 'Punishes small threats with kicks']
  },
  {
    slug: 'herrerasaurus',
    title: 'Herrerasaurus',
    rawDir: 'Herrerasaurus',
    diet: 'Carnivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Small ambush carnivore', 'Uses terrain and verticality well', 'Needs clean openings against larger targets']
  },
  {
    slug: 'hypsilophodon',
    title: 'Hypsilophodon',
    rawDir: 'Hypsilophodon',
    diet: 'Herbivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Easy',
    role: 'herbivore',
    characteristics: ['Tiny evasive herbivore', 'Hard to pin down in cover', 'Relies on awareness and harassment']
  },
  {
    slug: 'kentrosaurus',
    title: 'Kentrosaurus',
    rawDir: 'Kentrosaurus',
    diet: 'Herbivore',
    size: 'Medium',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Spiked defensive herbivore', 'Dangerous tail pressure', 'Strong against careless close-range attacks']
  },
  {
    slug: 'maiasaurus',
    title: 'Maiasaura',
    rawDir: 'Maiasaura',
    diet: 'Herbivore',
    size: 'Large',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Large herd herbivore', 'Built around group safety', 'Can pressure smaller predators through numbers']
  },
  {
    slug: 'omniraptor',
    title: 'Omniraptor',
    rawDir: 'Omniraptor',
    diet: 'Carnivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'carnivore',
    characteristics: ['Small pack-hunting raptor', 'Strong pounce pressure', 'Needs coordination and stamina discipline']
  },
  {
    slug: 'oviraptor',
    title: 'Oviraptor',
    rawDir: 'Oviraptor',
    diet: 'Omnivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'omnivore',
    characteristics: ['Small omnivorous dinosaur', 'Built for opportunistic play', 'Uses speed and awareness to avoid larger threats']
  },
  {
    slug: 'pachycephalosaurus',
    title: 'Pachycephalosaurus',
    rawDir: 'Pachycephalosaurus',
    diet: 'Herbivore',
    size: 'Medium',
    speed: 'Fast',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Headbutting herbivore', 'Strong burst impact', 'Can punish predators that tunnel too hard']
  },
  {
    slug: 'pteranodon',
    title: 'Pteranodon',
    rawDir: 'Pteranodon',
    imageDir: 'pteranadon',
    diet: 'Piscivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Hard',
    role: 'flyer',
    characteristics: ['Flying piscivore', 'Excellent map mobility', 'Fragile if forced onto the ground']
  },
  {
    slug: 'stegosaurus',
    title: 'Stegosaurus',
    rawDir: 'Stegosaurus',
    diet: 'Herbivore',
    size: 'Large',
    speed: 'Slow',
    difficulty: 'Hard',
    role: 'herbivore',
    characteristics: ['Large defensive herbivore', 'Powerful tail threat', 'Controls close-range space extremely well']
  },
  {
    slug: 'tenontosaurus',
    title: 'Tenontosaurus',
    rawDir: 'Tenontosaurus',
    diet: 'Herbivore',
    size: 'Medium',
    speed: 'Moderate',
    difficulty: 'Moderate',
    role: 'herbivore',
    characteristics: ['Versatile mid-sized herbivore', 'Can fight back with kicks and tail pressure', 'Rewards timing and spacing']
  },
  {
    slug: 'triceratops',
    title: 'Triceratops',
    rawDir: 'Triceratops',
    diet: 'Herbivore',
    size: 'Apex',
    speed: 'Moderate',
    difficulty: 'Hard',
    role: 'herbivore',
    characteristics: ['Massive horned herbivore', 'Extremely dangerous from the front', 'Best when holding ground with herd support']
  },
  {
    slug: 'troodon',
    title: 'Troodon',
    rawDir: 'Troodon',
    diet: 'Carnivore',
    size: 'Small',
    speed: 'Fast',
    difficulty: 'Hard',
    role: 'carnivore',
    characteristics: ['Small venom-focused carnivore', 'Thrives in coordinated packs', 'Needs patience and clean escape paths']
  },
  {
    slug: 'tyrannosaurus',
    title: 'Tyrannosaurus',
    rawDir: 'Tyrannosaurus',
    diet: 'Carnivore',
    size: 'Apex',
    speed: 'Moderate',
    difficulty: 'Hard',
    role: 'carnivore',
    characteristics: ['Apex theropod predator', 'High threat at close range', 'Relies on commitment and positional advantage']
  }
];

const ATTACKS = {
  carnivore: [
    { name: 'Bite', key: 'LMB', description: 'Primary close-range attack.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite for angle control.' }
  ],
  herbivore: [
    { name: 'Primary Attack', key: 'LMB', description: 'Primary defensive attack.' },
    { name: 'Alternate Attack', key: 'ALT + LMB', description: 'Aimed alternate attack for close-range defense.' }
  ],
  semiaquatic: [
    { name: 'Bite', key: 'LMB', description: 'Primary bite attack.' },
    { name: 'Lunge or Alt Bite', key: 'ALT + LMB', description: 'Alternate attack used to pressure targets near water.' }
  ],
  flyer: [
    { name: 'Peck', key: 'LMB', description: 'Primary close-range attack while grounded or near a target.' },
    { name: 'Takeoff and Flight', key: 'SPACE', description: 'Use flight to reposition, scout, and escape.' }
  ],
  omnivore: [
    { name: 'Bite', key: 'LMB', description: 'Primary close-range attack.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite for angle control.' }
  ]
};

const ATTACK_OVERRIDES = {
  carnotaurus: [
    { name: 'Bite', key: 'LMB', description: 'Basic bite attack.' },
    { name: 'Charge', key: 'SHIFT + RMB', description: 'Burst forward while running to pressure or knock targets.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite for close-range tracking.' }
  ],
  deinosuchus: [
    { name: 'Bite', key: 'LMB', description: 'Heavy close-range bite.' },
    { name: 'Lunge', key: 'RMB', description: 'Ambush attack from water against targets near the edge.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite.' }
  ],
  omniraptor: [
    { name: 'Bite', key: 'LMB', description: 'Fast primary bite.' },
    { name: 'Pounce', key: 'RMB', description: 'Latch onto a target when an opening is available.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite.' }
  ],
  pachycephalosaurus: [
    { name: 'Headbutt', key: 'LMB', description: 'Primary impact attack.' },
    { name: 'Charge', key: 'RMB', description: 'Commit to a stronger forward hit when spacing is favorable.' }
  ],
  stegosaurus: [
    { name: 'Bite', key: 'LMB', description: 'Short-range bite.' },
    { name: 'Tail Swing', key: 'RMB', description: 'Powerful tail attack for defensive spacing.' },
    { name: 'Alt Tail Swing', key: 'ALT + RMB', description: 'Aimed tail pressure against nearby threats.' }
  ],
  tenontosaurus: [
    { name: 'Bite', key: 'LMB', description: 'Short-range bite.' },
    { name: 'Kick', key: 'RMB', description: 'Defensive kick to punish close predators.' },
    { name: 'Tail Slam', key: 'ALT + RMB', description: 'Aimed tail attack for close-range control.' }
  ],
  troodon: [
    { name: 'Bite', key: 'LMB', description: 'Quick bite attack.' },
    { name: 'Pounce', key: 'RMB', description: 'Pack-focused attack used to apply pressure over time.' },
    { name: 'Alt Bite', key: 'ALT + LMB', description: 'Aimed alternate bite.' }
  ]
};

const MUTATIONS = {
  carnivore: [
    { name: 'Epidermal Fibrosis', description: 'Improves bleed resistance for extended fights.' },
    { name: 'Gastronomic Regeneration', description: 'Eating restores a small amount of health.' },
    { name: 'Enhanced Digestion', description: 'Helps stretch food value between hunts.' }
  ],
  herbivore: [
    { name: 'Epidermal Fibrosis', description: 'Improves bleed resistance when predators commit.' },
    { name: 'Hydrodynamic', description: 'Helps with water crossings and escape routes.' },
    { name: 'Photosynthetic Tissue', description: 'Supports recovery and sustain during calmer periods.' }
  ],
  semiaquatic: [
    { name: 'Hydrodynamic', description: 'Improves movement around water-heavy routes.' },
    { name: 'Reabsorption', description: 'Improves water sustain during wet weather.' },
    { name: 'Epidermal Fibrosis', description: 'Improves bleed resistance during close fights.' }
  ],
  flyer: [
    { name: 'Hydrodynamic', description: 'Helps around coastlines and fishing routes.' },
    { name: 'Enhanced Digestion', description: 'Helps stretch food value between catches.' },
    { name: 'Reabsorption', description: 'Improves water sustain during wet weather.' }
  ],
  omnivore: [
    { name: 'Enhanced Digestion', description: 'Supports opportunistic feeding.' },
    { name: 'Reabsorption', description: 'Improves water sustain during wet weather.' },
    { name: 'Epidermal Fibrosis', description: 'Improves bleed resistance if caught.' }
  ]
};

const CARNO_DIET = {
  alpha: [
    { name: 'Pachycephalosaurus', location: 'Coastal' },
    { name: 'Tenontosaurus', location: 'Riverdelta, Grasslands, Jungles, Island' },
    { name: 'Herrerasaurus', location: 'Jungles, Riverdelta' },
    { name: 'Boar', location: 'All land biomes' }
  ],
  beta: [
    { name: 'Omniraptor', location: 'Grasslands, Jungles' },
    { name: 'Diabloceratops', location: 'Highlands, Grasslands' },
    { name: 'Troodon', location: 'Coastal, Grasslands, Highlands' },
    { name: 'Deer', location: 'All land biomes' }
  ],
  gamma: [
    { name: 'Dryosaurus', location: 'Grasslands, Riverdelta, Swamp' },
    { name: 'Gallimimus', location: 'Highlands, Grasslands' },
    { name: 'Maiasaura', location: 'Highland, Grassland, Riverdelta' }
  ]
};

async function main() {
  const summaries = [];

  for (const dino of ROSTER) {
    const imageData = await collectImages(dino);
    const calls = await collectCalls(dino);
    const balanceData = await collectBalanceData(dino);
    const hasNestAnimations = await hasRawAnimation(dino, /nest/i);

    await writeDinosaurFiles(dino, imageData, calls, balanceData, hasNestAnimations);
    summaries.push({
      slug: dino.slug,
      title: dino.title,
      hasBalance: Boolean(balanceData.rawStats),
      images: imageData.skins.length,
      calls: calls.length
    });
  }

  await writeRoster(summaries);
  await updateNavbar();

  const balanceCount = summaries.filter(item => item.hasBalance).length;
  console.log(`Generated ${summaries.length} dinosaur pages.`);
  console.log(`Balance exports found for ${balanceCount} dinosaur(s).`);
}

async function writeDinosaurFiles(dino, imageData, calls, balanceData, hasNestAnimations) {
  const dinoDataDir = path.join(ROOT, 'data', 'dinosaurs', dino.slug);
  await fs.mkdir(dinoDataDir, { recursive: true });

  const manifest = [];
  await writeJson(path.join(dinoDataDir, 'classification.json'), {
    classification: {
      basicStats: {
        diet: dino.diet,
        size: dino.size,
        speed: dino.speed,
        difficulty: dino.difficulty
      },
      characteristics: dino.characteristics
    }
  });
  manifest.push('classification.json');

  await writeJson(path.join(dinoDataDir, 'attacks.json'), {
    attacks: ATTACK_OVERRIDES[dino.slug] || ATTACKS[dino.role] || ATTACKS.carnivore
  });
  manifest.push('attacks.json');

  await writeJson(path.join(dinoDataDir, 'biome.json'), {
    biomeInfo: biomeInfoFor(dino)
  });
  manifest.push('biome.json');

  await writeJson(path.join(dinoDataDir, 'mutations.json'), {
    recommendedMutations: MUTATIONS[dino.role] || MUTATIONS.carnivore
  });
  manifest.push('mutations.json');

  if (dino.slug === 'carnotaurus') {
    await writeJson(path.join(dinoDataDir, 'diet.json'), { diet: CARNO_DIET });
    manifest.push('diet.json');
  }

  await writeJson(path.join(dinoDataDir, 'nesting.json'), {
    nesting: nestingFor(dino, hasNestAnimations)
  });
  manifest.push('nesting.json');

  if (imageData.skins.length) {
    await writeJson(path.join(dinoDataDir, 'appearance.json'), {
      skins: imageData.skins
    });
    manifest.push('appearance.json');
  }

  if (balanceData.rawStats) {
    const balanceDir = path.join(dinoDataDir, 'balance');
    await fs.mkdir(balanceDir, { recursive: true });
    await writeJson(path.join(balanceDir, `${dino.slug}.values.json`), balanceData.rawStats);
    await fs.writeFile(path.join(balanceDir, `${dino.slug}.txt`), buildBalanceManifest(dino, balanceData.rawStats), 'utf8');
  }

  await fs.writeFile(path.join(dinoDataDir, 'manifest.txt'), `${manifest.join('\n')}\n`, 'utf8');

  const pageData = {
    date: DATA_DATE,
    title: dino.title,
    category: 'dinosaurs',
    slug: dino.slug,
    lastUpdated: {
      date: DATA_DATE,
      gameVersion: 'Local export'
    },
    heroImage: imageData.hero,
    description: overviewFor(dino, balanceData),
    survivalTips: survivalTipsFor(dino),
    adultStats: balanceData.adultStats || {},
    growthTable: balanceData.growthTable || [],
    calls,
    combatMatchups: {
      dataDate: 'No local matchup dataset',
      strongAgainst: [],
      weakAgainst: []
    }
  };

  const markdown = buildMarkdownPage(dino, pageData, balanceData);
  await fs.mkdir(path.join(ROOT, 'content', 'dinosaurs'), { recursive: true });
  await fs.writeFile(path.join(ROOT, 'content', 'dinosaurs', `${dino.slug}.md`), markdown, 'utf8');
}

async function collectImages(dino) {
  const imageDir = path.join(ROOT, 'assets', 'images', dino.imageDir || dino.slug);
  const files = await listFiles(imageDir);
  const imageFiles = files
    .filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file))
    .sort((left, right) => imageSortScore(left) - imageSortScore(right) || left.localeCompare(right));

  const heroFile = chooseHeroImage(imageFiles, dino);
  const fallbackHero = 'assets/images/placeholder/I_Default_Image_Preview.png';

  const skins = imageFiles
    .filter(file => !/icon_/i.test(path.basename(file)) && !/nest/i.test(path.basename(file)))
    .map(file => ({
      src: toSitePath(file),
      label: labelFromImage(file, dino)
    }));

  return {
    hero: {
      src: heroFile ? toSitePath(heroFile) : fallbackHero,
      alt: dino.title
    },
    skins
  };
}

function chooseHeroImage(files, dino) {
  const titlePattern = dino.title.replace(/\s+/g, '');
  const preferences = [
    new RegExp(`Icon_${titlePattern}`, 'i'),
    new RegExp(`I_${titlePattern}_Adult`, 'i'),
    new RegExp(`${titlePattern}_Adult`, 'i'),
    /Adult/i,
    /Preview/i
  ];

  for (const preference of preferences) {
    const match = files.find(file => preference.test(path.basename(file)));
    if (match) return match;
  }

  return files[0] || null;
}

function imageSortScore(file) {
  const name = path.basename(file).toLowerCase();
  if (name.includes('adult')) return 0;
  if (name.includes('sub')) return 1;
  if (name.includes('juv')) return 2;
  if (name.includes('hatch')) return 3;
  if (name.includes('skin')) return 4;
  return 5;
}

function labelFromImage(file, dino) {
  const relativeParts = path.relative(path.join(ROOT, 'assets', 'images', dino.imageDir || dino.slug), file).split(path.sep);
  const base = path.basename(file, path.extname(file));
  const cleaned = base
    .replace(/^I_/, '')
    .replace(/^Icon_/, '')
    .replace(/^Skin_/, '')
    .replace(/^Skins_/, '')
    .replace(new RegExp(`^${dino.title}_?`, 'i'), '')
    .replace(/_/g, ' ')
    .replace(/\bJuvie\b/i, 'Juvenile')
    .replace(/\bSub\b/i, 'Subadult')
    .trim();

  if (relativeParts.length > 1 && /skins/i.test(relativeParts[0])) {
    return `Skin - ${cleaned || dino.title}`;
  }

  return cleaned || dino.title;
}

async function collectCalls(dino) {
  const animationTypes = await collectAnimationCallTypes(dino);
  const audioMap = await collectAudioCalls(dino);
  const vocalRanges = await collectVocalRanges(dino);
  const typeSet = new Set([...animationTypes, ...Object.keys(audioMap), ...Object.keys(vocalRanges)]);

  return CALL_ORDER
    .filter(call => typeSet.has(call.name))
    .map(call => ({
      name: call.name,
      key: call.key,
      cooldown: 'N/A',
      range: vocalRanges[call.name] || 'N/A',
      ...(audioMap[call.name] ? { audioSrc: audioMap[call.name] } : {})
    }));
}

async function collectAnimationCallTypes(dino) {
  const rawDir = path.join(CHARACTER_DINO_ROOT, dino.rawDir);
  const files = await listFiles(rawDir);
  const types = new Set();

  for (const file of files) {
    const name = path.basename(file);
    for (const call of CALL_ORDER) {
      if (new RegExp(`Vocal[_-]${call.name}`, 'i').test(name)) {
        types.add(call.name);
      }
    }
  }

  return types;
}

async function collectAudioCalls(dino) {
  const audioDir = path.join(ROOT, 'assets', 'audio', 'dinosaurs', dino.slug);
  const files = await listFiles(audioDir);
  const map = {};

  for (const file of files.filter(file => /\.(mp3|ogg|wav)$/i.test(file))) {
    const name = path.basename(file).toLowerCase();
    for (const call of CALL_ORDER) {
      if (name.includes(call.name.toLowerCase())) {
        map[call.name] = toSitePath(file);
      }
    }
  }

  return map;
}

async function collectVocalRanges(dino) {
  const vocalDir = path.join(CORE_DINO_ROOT, dino.rawDir, 'Vocals');
  const vocalTablePath = path.join(vocalDir, `DT_${dino.title}Vocals.json`);
  const table = await readJson(vocalTablePath);
  const ranges = {};
  if (!Array.isArray(table) || !table[0]?.Rows) return ranges;

  for (const call of CALL_ORDER) {
    const row = table[0].Rows[call.name];
    const curveObject = row?.VocalCurve?.ObjectName || '';
    const curveName = curveObject.match(/'([^']+)'/)?.[1] || curveObject.replace(/^CurveFloat/, '');
    if (!curveName) continue;

    const curveData = await readJson(path.join(vocalDir, `${curveName}.json`));
    const points = curveData?.[0]?.Properties?.FloatCurve?.Keys || [];
    const maxValue = Math.max(...points.map(point => Number(point.Value)).filter(Number.isFinite));
    if (Number.isFinite(maxValue)) {
      ranges[call.name] = `${formatInteger(maxValue)} uu max`;
    }
  }

  return ranges;
}

async function collectBalanceData(dino) {
  const coreDir = path.join(CORE_DINO_ROOT, dino.rawDir);
  const balancePath = path.join(coreDir, `DT_${dino.title}BalanceAttributes.json`);
  const balanceRaw = await readJson(balancePath);
  if (!Array.isArray(balanceRaw)) {
    return {};
  }

  const staminaDurations = convertStaminaDurations(balanceRaw);
  const movementCurves = [];
  const rawCurveByName = {};

  for (const [suffix, label] of MOVEMENT_CURVES) {
    const curvePath = path.join(coreDir, 'Attributes', `ATT_${dino.title}_${suffix}.json`);
    const points = await readCurvePoints(curvePath, { speed: true });
    if (points.length) {
      movementCurves.push({
        name: `ATT_${dino.title}_${suffix}`,
        label,
        unit: 'km/h',
        points
      });
      rawCurveByName[suffix] = points;
    }
  }

  const growthCurves = {
    Weight: await readCurvePoints(path.join(coreDir, 'Attributes', `ATT_${dino.title}_Weight.json`), { speed: false }),
    AttackPower: await readCurvePoints(path.join(coreDir, 'Attributes', `ATT_${dino.title}_AttackPower.json`), { speed: false }),
    SprintSpeed: rawCurveByName.SprintSpeed || await readCurvePoints(path.join(coreDir, 'Attributes', `ATT_${dino.title}_SprintSpeed.json`), { speed: true }),
    MaxStamina: await readCurvePoints(path.join(coreDir, 'Attributes', `ATT_${dino.title}_MaxStamina.json`), { speed: false })
  };

  const growthTable = buildGrowthTable(growthCurves);
  const adult = growthTable.find(row => row.stage === 'Adult') || {};
  const rawStats = {
    name: `DT_${dino.title}BalanceAttributes`,
    source: path.basename(balancePath),
    package: balanceRaw[0]?.Package || '',
    staminaDurations,
    movementCurves
  };

  return {
    rawStats,
    growthTable,
    adultStats: {
      weight: numberFromDisplay(adult.weight),
      biteDamage: adult.bite || undefined,
      sprintSpeed: numberFromDisplay(adult.sprint),
      stamina: adult.stamina || undefined
    }
  };
}

function convertStaminaDurations(balanceRaw) {
  const rows = balanceRaw[0]?.Rows || {};
  const staminaDurations = { regen: {}, spending: {} };

  for (const [key, row] of Object.entries(rows)) {
    if (!key.startsWith('Stamina.')) continue;
    const parts = key.split('.');
    if (parts.length < 3) continue;

    const value = Number(row.AttributePercentageValues);
    if (!Number.isFinite(value) || value === 0) continue;

    const category = parts[1].toLowerCase() === 'regen' ? 'regen' : 'spending';
    const label = parts.slice(2).join(' ');
    staminaDurations[category][label] = formatDuration((100 / Math.abs(value)) * 1.01);
  }

  return staminaDurations;
}

async function readCurvePoints(curvePath, options) {
  const data = await readJson(curvePath);
  const table = Array.isArray(data) ? data[0] : null;
  if (!table) return [];

  const tracks = Array.isArray(table.FloatCurves)
    ? table.FloatCurves
    : Array.isArray(table.Properties?.FloatCurves)
      ? table.Properties.FloatCurves
      : [table.Properties?.FloatCurves].filter(Boolean);

  const firstTrack = tracks.find(track => Array.isArray(track?.Keys) && track.Keys.length);
  if (!firstTrack) return [];

  return firstTrack.Keys
    .filter(point => Number.isFinite(Number(point.Time)) && Number.isFinite(Number(point.Value)))
    .map(point => ({
      time: round(Number(point.Time), 6),
      speed_kmh: options.speed ? round(Number(point.Value) * 0.036, 3) : round(Number(point.Value), 3),
      interp_mode: point.InterpMode || 'RCIM_Linear'
    }));
}

function buildGrowthTable(curves) {
  const stages = [
    ['Hatchling', 0],
    ['Juvenile', 0.25],
    ['Subadult', 0.5],
    ['Adult', 1]
  ];

  return stages.map(([stage, time]) => {
    const weight = valueAt(curves.Weight, time);
    const attack = valueAt(curves.AttackPower, time);
    const sprint = valueAt(curves.SprintSpeed, time);
    const stamina = valueAt(curves.MaxStamina, time);
    return {
      stage,
      weight: Number.isFinite(weight) ? `${formatNumber(weight, 1)} kg` : 'N/A',
      bite: Number.isFinite(attack) ? `${formatNumber(attack, 2)}x` : 'N/A',
      sprint: Number.isFinite(sprint) ? `${formatNumber(sprint, 1)} km/h` : 'N/A',
      stamina: Number.isFinite(stamina) ? formatNumber(stamina, 1) : 'N/A'
    };
  });
}

function valueAt(points, time) {
  if (!Array.isArray(points) || !points.length) return NaN;
  const sorted = [...points].sort((left, right) => left.time - right.time);
  const exact = sorted.find(point => Math.abs(point.time - time) < 0.000001);
  if (exact) return Number(exact.speed_kmh);
  if (time <= sorted[0].time) return Number(sorted[0].speed_kmh);
  if (time >= sorted[sorted.length - 1].time) return Number(sorted[sorted.length - 1].speed_kmh);

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const next = sorted[index];
    if (time >= previous.time && time <= next.time) {
      const span = next.time - previous.time || 1;
      const amount = (time - previous.time) / span;
      return previous.speed_kmh + ((next.speed_kmh - previous.speed_kmh) * amount);
    }
  }

  return NaN;
}

function buildBalanceManifest(dino, rawStats) {
  const regenKeys = Object.keys(rawStats.staminaDurations.regen || {});
  const spendingKeys = Object.keys(rawStats.staminaDurations.spending || {});
  const lines = [
    `name: ${rawStats.name}`,
    `source: ${rawStats.source}`,
    `package: ${rawStats.package}`,
    'notes: Generated from the local Evrima export.',
    '',
    '[stamina.regen]',
    ...regenKeys,
    '',
    '[stamina.spending]',
    ...spendingKeys,
    '',
    '[curves]',
    ...rawStats.movementCurves.map(curve => `${curve.name} | ${curve.label}`)
  ];
  return `${lines.join('\n')}\n`;
}

function buildMarkdownPage(dino, pageData, balanceData) {
  const sourceCoverage = balanceData.rawStats
    ? 'Local character assets, call assets, and Core balance exports.'
    : 'Local character assets and call or animation exports. No Core balance export was found for this species in the current dump.';
  const survivalTips = survivalTipsFor(dino);
  const json = JSON.stringify(pageData, null, 2);

  return `---json
${json}
---

# ${dino.title}

## Game Description

${overviewFor(dino, balanceData)}

**Source:** ${sourceCoverage}

---

## Overview

${dino.title} is listed in the local Evrima export as ${articleFor(dino.size)} ${dino.size.toLowerCase()} ${dino.diet.toLowerCase()} with ${dino.speed.toLowerCase()} speed and ${dino.difficulty.toLowerCase()} difficulty.

---

## Survival Tips

${survivalTips.map(tip => `- ${tip}`).join('\n')}
`;
}

function overviewFor(dino, balanceData) {
  const descriptor = `${articleFor(dino.size)} ${dino.size.toLowerCase()} ${dino.diet.toLowerCase()}`;
  const characteristic = sentence(dino.characteristics[0] || 'It fills a distinct roster role');
  const rawNote = balanceData.rawStats
    ? ' Its local balance export is available, so growth and raw movement values are calculated from the exported curves.'
    : ' The current local dump does not include a Core balance export for this species, so stat tables are limited to visual, call, and animation-derived data.';
  return `${dino.title} is ${descriptor} in The Isle: Evrima. ${characteristic}${rawNote}`;
}

function survivalTipsFor(dino) {
  if (dino.role === 'flyer') {
    return [
      'Keep enough stamina to leave the ground safely.',
      'Scout before landing near water or carcasses.',
      'Avoid grounded fights unless the target is already vulnerable.'
    ];
  }
  if (dino.role === 'semiaquatic') {
    return [
      'Treat water access as your main safety tool.',
      'Do not overcommit far from a shoreline or river route.',
      'Use ambush angles instead of long open chases.'
    ];
  }
  if (dino.role === 'herbivore') {
    return [
      'Keep escape routes in mind before feeding or resting.',
      'Group with compatible herd members when possible.',
      'Use spacing and terrain before committing to a fight.'
    ];
  }
  return [
    'Pick fights where your movement and size class are favored.',
    'Avoid burning all stamina before the target is committed.',
    'Disengage early when larger animals or third parties arrive.'
  ];
}

function biomeInfoFor(dino) {
  if (dino.role === 'flyer') {
    return { preferred: ['Coastal', 'Cliffs', 'Rivers'], avoid: ['Dense Forest'] };
  }
  if (dino.role === 'semiaquatic') {
    return { preferred: ['Rivers', 'Swamp', 'Coastal'], avoid: ['Open Highlands'] };
  }
  if (dino.role === 'herbivore') {
    return { preferred: ['Grasslands', 'Highlands', 'Forest Edge'], avoid: ['Deep Water'] };
  }
  return { preferred: ['Grasslands', 'Jungle Edge', 'Riverdelta'], avoid: ['Open Water'] };
}

function nestingFor(dino, hasNestAnimations) {
  if (dino.slug === 'carnotaurus') {
    return {
      eggs: '3-5',
      incubationTime: '30 minutes',
      nestType: 'Sticks'
    };
  }

  return {
    eggs: 'Not in local export',
    incubationTime: 'Not in local export',
    nestType: hasNestAnimations ? 'Nesting animations present' : 'No nesting animation found'
  };
}

async function writeRoster(summaries) {
  const roster = ROSTER.map(dino => {
    const summary = summaries.find(item => item.slug === dino.slug) || {};
    return {
      slug: dino.slug,
      title: dino.title,
      diet: dino.diet,
      size: dino.size,
      hasBalance: Boolean(summary.hasBalance),
      href: `dinosaur.html?dino=${dino.slug}`
    };
  });
  await writeJson(path.join(ROOT, 'data', 'dinosaurs', 'roster.json'), roster);
}

async function updateNavbar() {
  const navPath = path.join(ROOT, 'data', 'navbar.json');
  const navbar = await readJson(navPath);
  if (!navbar?.links) return;

  const dinoLink = navbar.links.find(link => link.title === 'Dinosaurs');
  if (!dinoLink) return;

  dinoLink.href = 'dinosaur.html?dino=carnotaurus';
  dinoLink.submenu = ROSTER.map(dino => ({
    title: dino.title,
    href: `dinosaur.html?dino=${dino.slug}`
  }));

  await writeJson(navPath, navbar);
}

async function hasRawAnimation(dino, pattern) {
  const rawDir = path.join(CHARACTER_DINO_ROOT, dino.rawDir);
  const files = await listFiles(rawDir);
  return files.some(file => pattern.test(path.basename(file)));
}

async function listFiles(rootDir) {
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async entry => {
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) return listFiles(fullPath);
      if (entry.isFile()) return [fullPath];
      return [];
    }));
    return nested.flat();
  } catch (error) {
    return [];
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    return null;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function toSitePath(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatInteger(value) {
  return Math.round(value).toLocaleString('en-US');
}

function formatNumber(value, digits) {
  if (!Number.isFinite(value)) return 'N/A';
  return round(value, digits).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function numberFromDisplay(value) {
  const match = String(value || '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function articleFor(word) {
  return /^[aeiou]/i.test(String(word || '')) ? 'an' : 'a';
}

function sentence(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
