import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Agent, Task } from '../types';
import { 
  Building2, 
  Coffee, 
  Users, 
  Laptop, 
  Sparkles, 
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Send,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Footprints,
  Gem,
  Printer,
  Gamepad2,
  Droplets
} from 'lucide-react';
import { WorkstationInspector } from './WorkstationInspector';
import { 
  getParquetFloorTexture, 
  getWorkstationScreenTexture, 
  getAcousticSlatsTexture 
} from '../lib/office3DTextures';

interface Office3DSceneProps {
  agents: Agent[];
  activeTask?: Task | null;
  onSelectAgent: (agent: Agent) => void;
  onDispatchTask: (agent?: Agent) => void;
  onDirectCommand?: (agent: Agent) => void;
}

// ============================================================================
// ROOM & WORKSTATION COORDINATES (Lantai 1 Luas + Lantai 2 Mezzanine + Outdoor)
// ============================================================================
const WAYPOINTS = {
  // === LANTAI 2 (Tepat 2 Ruangan Aja, Y = 7.4) ===
  alexDesk: new THREE.Vector3(-15, 7.4, -4),         // Ruang 1: Executive Suite CEO (Alex)
  alexLounge: new THREE.Vector3(-12, 7.4, 0),       // CEO Meeting Corner
  mayaDesk: new THREE.Vector3(15, 7.4, -4),          // Ruang 2: AI Quantum Lab (Dr. Maya)
  quantumOrb: new THREE.Vector3(20, 7.4, -4),        // Dr. Maya Holographic Quantum Core
  mezzanineBalcony: new THREE.Vector3(0, 7.4, 0),    // Balcony Atrium overlooking Floor 1

  // === LANTAI 1 (Sangat Luas - Fasilitas Lengkap, Y = 0) ===
  // Central Hub
  receptionDesk: new THREE.Vector3(0, 0, 18),        // Grand Lobby Receptionist
  waitingSofa: new THREE.Vector3(8, 0, 18),          // Lobby Guest Lounge
  meetingTable: new THREE.Vector3(0, 0, 0),          // Central Boardroom Conference Table
  meetingScreen: new THREE.Vector3(0, 0, -4.5),      // Boardroom Presentation Wall

  // Workstations
  davidDesk: new THREE.Vector3(-30, 0, 10),          // Ruang 3: Tech Hub (David Kim)
  kenjiDesk: new THREE.Vector3(-30, 0, -8),          // Ruang 4: QA & Audit (Kenji Sato)
  liamDesk: new THREE.Vector3(-15, 0, -8),           // Ruang 5: Cloud DevOps (Liam O'Connor)
  sarahDesk: new THREE.Vector3(-15, 0, 10),          // Ruang 6: Growth & Marketing (Sarah Jenkins)
  elenaDesk: new THREE.Vector3(15, 0, 10),           // Ruang 7: Creative Media Studio (Elena Rostova)
  nadiaDesk: new THREE.Vector3(30, 0, 10),           // Ruang 8: Product Strategy Pod (Nadia Thorne)
  marcusDesk: new THREE.Vector3(15, 0, -8),          // Ruang 9: Finance Wing (Marcus Vance)
  priyaDesk: new THREE.Vector3(30, 0, -8),           // Ruang 10: Legal Chambers (Priya Sharma)

  // Breakroom & Cafe
  cafeCoffeeMachine: new THREE.Vector3(-2, 0, -18),  // Espresso Bar Machine
  cafeFridge: new THREE.Vector3(-5, 0, -18),         // Refrigerator with Magnets
  cafeWaterDispenser: new THREE.Vector3(4, 0, -18),  // Water Gallon Dispenser
  cafeBarStool: new THREE.Vector3(1, 0, -16.5),      // Pantry Island Bar Counter

  // Restroom / Toilet & Powder Room
  restroomToilet: new THREE.Vector3(-40, 0, -17),    // Toilet Cubicle
  restroomSink: new THREE.Vector3(-37, 0, -15),      // Washbasin Vanity & Mirror

  // Copy, Print & Archive Center
  printStation: new THREE.Vector3(-40, 0, 10),       // Office Copier & Laser Printer

  // Game, Entertainment & Chill Lounge
  gameFoosball: new THREE.Vector3(38, 0, 10),        // Foosball Soccer Table
  gameVending: new THREE.Vector3(43, 0, 8),          // Cold Drinks Vending Machine
  gameBeanbag: new THREE.Vector3(41, 0, 12),         // Relaxing Beanbag

  // Outdoor Garden & Halaman
  gardenFountain: new THREE.Vector3(-26, 0, 36),     // Water Fountain Center
  gardenBench: new THREE.Vector3(-18, 0, 40),        // Shaded Park Bench
  gardenFlowers: new THREE.Vector3(-34, 0, 36),      // Flower Bed Border
  gardenSprinkler: new THREE.Vector3(-34, 0, 32),    // Garden Lawn Sprinkler
  gardenBBQ: new THREE.Vector3(-12, 0, 36),          // Homestyle Outdoor Garden BBQ Grill & Patio
  garageCar1: new THREE.Vector3(20, 0, 34),          // Luxury Executive Sedan
  garageCar2: new THREE.Vector3(32, 0, 34),          // Electric SUV
  garageEVCharger: new THREE.Vector3(42, 0, 28),     // Rapid EV Charging Terminal

  // Cozy "Kantor Serasa Rumah" Amenities
  loungeNapPod: new THREE.Vector3(42, 0, 14),        // Cozy Sleep/Nap Pod & Reclining Daybed
  loungeVinylMusic: new THREE.Vector3(36, 0, 14),    // Vinyl Record Player & Acoustic Guitar
  cafeDiningTable: new THREE.Vector3(0, 0, -21),     // Family Dining Table & Fruit Basket
  cafeLaundry: new THREE.Vector3(-6, 0, -21),        // Front-load Washer & Dryer Laundry
  lobbyPetCatStation: new THREE.Vector3(12, 0, 18),  // Office Pet Cat Tree & Cozy Bed

  // Stairways (Connects Floor 1 <-> Floor 2 Mezzanine)
  stairsBottom: new THREE.Vector3(-38, 0, 4),
  stairsMid: new THREE.Vector3(-38, 3.7, -2),
  stairsTop: new THREE.Vector3(-38, 7.4, -6)
};

// ============================================================================
// COLLISION-FREE CORRIDOR & DOORWAY NAVIGATION GRAPH (No Walking Through Walls)
// ============================================================================
interface NavNode {
  id: string;
  pos: THREE.Vector3;
  neighbors: string[];
}

const NAV_NODES: Record<string, NavNode> = {
  // --- South Hallway (Z = 6.5) ---
  's_w3': { id: 's_w3', pos: new THREE.Vector3(-40, 0, 6.5), neighbors: ['s_w2', 'print_station', 'stairs_base'] },
  's_w2': { id: 's_w2', pos: new THREE.Vector3(-30, 0, 6.5), neighbors: ['s_w3', 's_w1', 'tech_door'] },
  's_w1': { id: 's_w1', pos: new THREE.Vector3(-15, 0, 6.5), neighbors: ['s_w2', 's_center', 'mkt_door', 'bypass_w_s'] },
  's_center': { id: 's_center', pos: new THREE.Vector3(0, 0, 6.5), neighbors: ['s_w1', 's_e1', 'boardroom_s', 'lobby_entry'] },
  's_e1': { id: 's_e1', pos: new THREE.Vector3(15, 0, 6.5), neighbors: ['s_center', 's_e2', 'creative_door', 'bypass_e_s'] },
  's_e2': { id: 's_e2', pos: new THREE.Vector3(30, 0, 6.5), neighbors: ['s_e1', 's_e3', 'product_door'] },
  's_e3': { id: 's_e3', pos: new THREE.Vector3(40, 0, 6.5), neighbors: ['s_e2', 'game_lounge'] },

  // --- North Hallway (Z = -2.5) ---
  'n_w3': { id: 'n_w3', pos: new THREE.Vector3(-40, 0, -2.5), neighbors: ['n_w2', 'restroom_door'] },
  'n_w2': { id: 'n_w2', pos: new THREE.Vector3(-30, 0, -2.5), neighbors: ['n_w3', 'n_w1', 'qa_door'] },
  'n_w1': { id: 'n_w1', pos: new THREE.Vector3(-15, 0, -2.5), neighbors: ['n_w2', 'n_center', 'devops_door', 'bypass_w_n'] },
  'n_center': { id: 'n_center', pos: new THREE.Vector3(0, 0, -2.5), neighbors: ['n_w1', 'n_e1', 'boardroom_n', 'pantry_entry'] },
  'n_e1': { id: 'n_e1', pos: new THREE.Vector3(15, 0, -2.5), neighbors: ['n_center', 'n_e2', 'finance_door', 'bypass_e_n'] },
  'n_e2': { id: 'n_e2', pos: new THREE.Vector3(30, 0, -2.5), neighbors: ['n_e1', 'n_e3', 'legal_door'] },
  'n_e3': { id: 'n_e3', pos: new THREE.Vector3(40, 0, -2.5), neighbors: ['n_e2'] },

  // --- Boardroom Bypasses (West X = -12, East X = 12) ---
  'bypass_w_n': { id: 'bypass_w_n', pos: new THREE.Vector3(-12, 0, -2.5), neighbors: ['n_w1', 'bypass_w_s'] },
  'bypass_w_s': { id: 'bypass_w_s', pos: new THREE.Vector3(-12, 0, 6.5), neighbors: ['s_w1', 'bypass_w_n'] },
  'bypass_e_n': { id: 'bypass_e_n', pos: new THREE.Vector3(12, 0, -2.5), neighbors: ['n_e1', 'bypass_e_s'] },
  'bypass_e_s': { id: 'bypass_e_s', pos: new THREE.Vector3(12, 0, 6.5), neighbors: ['s_e1', 'bypass_e_n'] },

  // --- Boardroom ---
  'boardroom_s': { id: 'boardroom_s', pos: new THREE.Vector3(0, 0, 4.5), neighbors: ['s_center', 'boardroom_table'] },
  'boardroom_n': { id: 'boardroom_n', pos: new THREE.Vector3(0, 0, -4.5), neighbors: ['n_center', 'boardroom_table'] },
  'boardroom_table': { id: 'boardroom_table', pos: new THREE.Vector3(0, 0, 0), neighbors: ['boardroom_s', 'boardroom_n', 'boardroom_screen'] },
  'boardroom_screen': { id: 'boardroom_screen', pos: new THREE.Vector3(0, 0, -4.5), neighbors: ['boardroom_table'] },

  // --- Pantry & Cafe (Home-style kitchen & laundry) ---
  'pantry_entry': { id: 'pantry_entry', pos: new THREE.Vector3(0, 0, -12), neighbors: ['n_center', 'pantry_center'] },
  'pantry_center': { id: 'pantry_center', pos: new THREE.Vector3(0, 0, -16), neighbors: ['pantry_entry', 'cafe_coffee', 'cafe_fridge', 'cafe_dispenser', 'cafe_bar', 'cafe_dining', 'cafe_laundry'] },
  'cafe_coffee': { id: 'cafe_coffee', pos: new THREE.Vector3(-2, 0, -18), neighbors: ['pantry_center'] },
  'cafe_fridge': { id: 'cafe_fridge', pos: new THREE.Vector3(-5, 0, -18), neighbors: ['pantry_center'] },
  'cafe_dispenser': { id: 'cafe_dispenser', pos: new THREE.Vector3(4, 0, -18), neighbors: ['pantry_center'] },
  'cafe_bar': { id: 'cafe_bar', pos: new THREE.Vector3(1, 0, -16.5), neighbors: ['pantry_center'] },
  'cafe_dining': { id: 'cafe_dining', pos: new THREE.Vector3(0, 0, -21), neighbors: ['pantry_center'] },
  'cafe_laundry': { id: 'cafe_laundry', pos: new THREE.Vector3(-6, 0, -21), neighbors: ['pantry_center'] },

  // --- Restroom ---
  'restroom_door': { id: 'restroom_door', pos: new THREE.Vector3(-38, 0, -10), neighbors: ['n_w3', 'restroom_toilet', 'restroom_sink'] },
  'restroom_toilet': { id: 'restroom_toilet', pos: new THREE.Vector3(-40, 0, -17), neighbors: ['restroom_door'] },
  'restroom_sink': { id: 'restroom_sink', pos: new THREE.Vector3(-37, 0, -15), neighbors: ['restroom_door'] },

  // --- Print Station & Game Lounge (Home-style relaxation) ---
  'print_station': { id: 'print_station', pos: new THREE.Vector3(-40, 0, 10), neighbors: ['s_w3'] },
  'game_lounge': { id: 'game_lounge', pos: new THREE.Vector3(40, 0, 10), neighbors: ['s_e3', 'game_foosball', 'game_vending', 'game_beanbag', 'lounge_nap', 'lounge_vinyl'] },
  'game_foosball': { id: 'game_foosball', pos: new THREE.Vector3(38, 0, 10), neighbors: ['game_lounge'] },
  'game_vending': { id: 'game_vending', pos: new THREE.Vector3(43, 0, 8), neighbors: ['game_lounge'] },
  'game_beanbag': { id: 'game_beanbag', pos: new THREE.Vector3(41, 0, 12), neighbors: ['game_lounge'] },
  'lounge_nap': { id: 'lounge_nap', pos: new THREE.Vector3(42, 0, 14), neighbors: ['game_lounge'] },
  'lounge_vinyl': { id: 'lounge_vinyl', pos: new THREE.Vector3(36, 0, 14), neighbors: ['game_lounge'] },

  // --- Room Doors & Desks ---
  'tech_door': { id: 'tech_door', pos: new THREE.Vector3(-25, 0, 6.5), neighbors: ['s_w2', 'tech_desk'] },
  'tech_desk': { id: 'tech_desk', pos: new THREE.Vector3(-30, 0, 10), neighbors: ['tech_door'] },

  'qa_door': { id: 'qa_door', pos: new THREE.Vector3(-25, 0, -2.5), neighbors: ['n_w2', 'qa_desk'] },
  'qa_desk': { id: 'qa_desk', pos: new THREE.Vector3(-30, 0, -8), neighbors: ['qa_door'] },

  'devops_door': { id: 'devops_door', pos: new THREE.Vector3(-15, 0, -4), neighbors: ['n_w1', 'devops_desk'] },
  'devops_desk': { id: 'devops_desk', pos: new THREE.Vector3(-15, 0, -8), neighbors: ['devops_door'] },

  'mkt_door': { id: 'mkt_door', pos: new THREE.Vector3(-15, 0, 6.5), neighbors: ['s_w1', 'mkt_desk'] },
  'mkt_desk': { id: 'mkt_desk', pos: new THREE.Vector3(-15, 0, 10), neighbors: ['mkt_door'] },

  'creative_door': { id: 'creative_door', pos: new THREE.Vector3(15, 0, 6.5), neighbors: ['s_e1', 'creative_desk'] },
  'creative_desk': { id: 'creative_desk', pos: new THREE.Vector3(15, 0, 10), neighbors: ['creative_door'] },

  'product_door': { id: 'product_door', pos: new THREE.Vector3(25, 0, 6.5), neighbors: ['s_e2', 'product_desk'] },
  'product_desk': { id: 'product_desk', pos: new THREE.Vector3(30, 0, 10), neighbors: ['product_door'] },

  'finance_door': { id: 'finance_door', pos: new THREE.Vector3(15, 0, -4), neighbors: ['n_e1', 'finance_desk'] },
  'finance_desk': { id: 'finance_desk', pos: new THREE.Vector3(15, 0, -8), neighbors: ['finance_door'] },

  'legal_door': { id: 'legal_door', pos: new THREE.Vector3(25, 0, -2.5), neighbors: ['n_e2', 'legal_desk'] },
  'legal_desk': { id: 'legal_desk', pos: new THREE.Vector3(30, 0, -8), neighbors: ['legal_door'] },

  // --- Lobby & Outdoor ---
  'lobby_entry': { id: 'lobby_entry', pos: new THREE.Vector3(0, 0, 12), neighbors: ['s_center', 'lobby_center'] },
  'lobby_center': { id: 'lobby_center', pos: new THREE.Vector3(0, 0, 18), neighbors: ['lobby_entry', 'lobby_sofa', 'lobby_pet', 'campus_exit'] },
  'lobby_sofa': { id: 'lobby_sofa', pos: new THREE.Vector3(8, 0, 18), neighbors: ['lobby_center'] },
  'lobby_pet': { id: 'lobby_pet', pos: new THREE.Vector3(12, 0, 18), neighbors: ['lobby_center'] },
  'campus_exit': { id: 'campus_exit', pos: new THREE.Vector3(0, 0, 24), neighbors: ['lobby_center', 'path_garden_1', 'path_garage_1'] },

  // Outdoor Garden
  'path_garden_1': { id: 'path_garden_1', pos: new THREE.Vector3(-14, 0, 26), neighbors: ['campus_exit', 'path_garden_2', 'garden_bbq'] },
  'path_garden_2': { id: 'path_garden_2', pos: new THREE.Vector3(-26, 0, 32), neighbors: ['path_garden_1', 'garden_fountain', 'garden_bench', 'garden_sprinkler'] },
  'garden_fountain': { id: 'garden_fountain', pos: new THREE.Vector3(-26, 0, 36), neighbors: ['path_garden_2'] },
  'garden_bench': { id: 'garden_bench', pos: new THREE.Vector3(-18, 0, 40), neighbors: ['path_garden_2'] },
  'garden_sprinkler': { id: 'garden_sprinkler', pos: new THREE.Vector3(-34, 0, 32), neighbors: ['path_garden_2'] },
  'garden_bbq': { id: 'garden_bbq', pos: new THREE.Vector3(-12, 0, 36), neighbors: ['path_garden_1'] },

  // Outdoor Garage
  'path_garage_1': { id: 'path_garage_1', pos: new THREE.Vector3(14, 0, 26), neighbors: ['campus_exit', 'path_garage_2'] },
  'path_garage_2': { id: 'path_garage_2', pos: new THREE.Vector3(26, 0, 32), neighbors: ['path_garage_1', 'garage_car1', 'garage_car2', 'garage_ev'] },
  'garage_car1': { id: 'garage_car1', pos: new THREE.Vector3(20, 0, 34), neighbors: ['path_garage_2'] },
  'garage_car2': { id: 'garage_car2', pos: new THREE.Vector3(32, 0, 34), neighbors: ['path_garage_2'] },
  'garage_ev': { id: 'garage_ev', pos: new THREE.Vector3(42, 0, 28), neighbors: ['path_garage_2'] },

  // --- Stairs & Floor 2 ---
  'stairs_base': { id: 'stairs_base', pos: new THREE.Vector3(-38, 0, 4), neighbors: ['s_w3', 'stairs_mid'] },
  'stairs_mid': { id: 'stairs_mid', pos: new THREE.Vector3(-38, 3.7, -2), neighbors: ['stairs_base', 'stairs_top'] },
  'stairs_top': { id: 'stairs_top', pos: new THREE.Vector3(-38, 7.4, -6), neighbors: ['stairs_mid', 'mezz_w'] },

  'mezz_w': { id: 'mezz_w', pos: new THREE.Vector3(-20, 7.4, -2), neighbors: ['stairs_top', 'ceo_door', 'mezz_balcony'] },
  'ceo_door': { id: 'ceo_door', pos: new THREE.Vector3(-15, 7.4, -2), neighbors: ['mezz_w', 'ceo_desk', 'ceo_lounge'] },
  'ceo_desk': { id: 'ceo_desk', pos: new THREE.Vector3(-15, 7.4, -4), neighbors: ['ceo_door'] },
  'ceo_lounge': { id: 'ceo_lounge', pos: new THREE.Vector3(-12, 7.4, 0), neighbors: ['ceo_door'] },

  'mezz_balcony': { id: 'mezz_balcony', pos: new THREE.Vector3(0, 7.4, 0), neighbors: ['mezz_w', 'mezz_e'] },

  'mezz_e': { id: 'mezz_e', pos: new THREE.Vector3(15, 7.4, -2), neighbors: ['mezz_balcony', 'ailab_door'] },
  'ailab_door': { id: 'ailab_door', pos: new THREE.Vector3(15, 7.4, -2), neighbors: ['mezz_e', 'ailab_desk', 'ailab_quantum'] },
  'ailab_desk': { id: 'ailab_desk', pos: new THREE.Vector3(15, 7.4, -4), neighbors: ['ailab_door'] },
  'ailab_quantum': { id: 'ailab_quantum', pos: new THREE.Vector3(20, 7.4, -4), neighbors: ['ailab_door'] }
};

// Collision-Free Path Calculation using BFS on Open Corridor Network
function findCollisionFreeCorridorPath(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Vector3[] {
  let startNodeId = '';
  let minStartDist = Infinity;
  let endNodeId = '';
  let minEndDist = Infinity;

  for (const [id, node] of Object.entries(NAV_NODES)) {
    const startYMatch = (startPos.y < 3.5 && node.pos.y < 3.5) || (startPos.y >= 3.5 && node.pos.y >= 3.5);
    if (startYMatch) {
      const d = startPos.distanceTo(node.pos);
      if (d < minStartDist) {
        minStartDist = d;
        startNodeId = id;
      }
    }

    const endYMatch = (endPos.y < 3.5 && node.pos.y < 3.5) || (endPos.y >= 3.5 && node.pos.y >= 3.5);
    if (endYMatch) {
      const d = endPos.distanceTo(node.pos);
      if (d < minEndDist) {
        minEndDist = d;
        endNodeId = id;
      }
    }
  }

  if (!startNodeId || !endNodeId) {
    return [endPos.clone()];
  }

  if (startNodeId === endNodeId) {
    return [NAV_NODES[startNodeId].pos.clone(), endPos.clone()];
  }

  const queue: string[] = [startNodeId];
  const visited = new Set<string>([startNodeId]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === endNodeId) break;

    const neighbors = NAV_NODES[curr]?.neighbors || [];
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent.set(nb, curr);
        queue.push(nb);
      }
    }
  }

  const path: THREE.Vector3[] = [];
  let curr: string | undefined = endNodeId;
  const ids: string[] = [];
  while (curr) {
    ids.unshift(curr);
    curr = parent.get(curr);
  }

  for (const id of ids) {
    path.push(NAV_NODES[id].pos.clone());
  }
  path.push(endPos.clone());
  return path;
}

type CameraPresetKey = 
  | 'overview'
  | 'all' 
  | 'floor1' 
  | 'floor2' 
  | 'pantry'
  | 'dining'
  | 'lounge'
  | 'nappod'
  | 'vinyl'
  | 'pet'
  | 'restroom'
  | 'print'
  | 'garden'
  | 'bbq'
  | 'garage'
  | 'ceo'
  | 'ailab'
  | 'meeting';

interface PresetConfig {
  theta: number;
  phi: number;
  radius: number;
  lookAt: THREE.Vector3;
  name: string;
  icon: string;
  floor: 'Semua' | 'L1' | 'L2' | 'Outdoor';
}

const CAMERA_PRESETS: Record<CameraPresetKey, PresetConfig> = {
  overview: { theta: 0.52, phi: 0.70, radius: 98, lookAt: new THREE.Vector3(0, 3.5, 8), name: '🔭 Zoom Jauh', icon: '🔭', floor: 'Semua' },
  all: { theta: 0.54, phi: 0.74, radius: 82, lookAt: new THREE.Vector3(0, 3.5, 6), name: '🏢 Gedung Serasa Rumah', icon: '🏡', floor: 'Semua' },
  floor1: { theta: 0.42, phi: 0.92, radius: 52, lookAt: new THREE.Vector3(0, 1.2, 4), name: 'L1: Fasilitas Rumah Lengkap', icon: '🏛️', floor: 'L1' },
  floor2: { theta: 0.54, phi: 0.72, radius: 36, lookAt: new THREE.Vector3(0, 7.8, -3), name: 'L2: 2 Ruangan Aja', icon: '🌟', floor: 'L2' },
  pantry: { theta: 0.65, phi: 0.86, radius: 25, lookAt: new THREE.Vector3(0, 1.2, -18), name: '☕ Kafe & Dapur Masak', icon: '☕', floor: 'L1' },
  dining: { theta: 0.55, phi: 0.84, radius: 24, lookAt: new THREE.Vector3(0, 1.2, -21), name: '🍲 Meja Makan Keluarga', icon: '🍲', floor: 'L1' },
  lounge: { theta: 0.40, phi: 0.88, radius: 25, lookAt: new THREE.Vector3(38, 1.2, 10), name: '🎮 Lounge Game Foosball', icon: '🎮', floor: 'L1' },
  nappod: { theta: 0.45, phi: 0.82, radius: 22, lookAt: new THREE.Vector3(42, 1.2, 14), name: '🛏️ Ruang Tidur / Nap Pod', icon: '🛏️', floor: 'L1' },
  vinyl: { theta: 0.38, phi: 0.86, radius: 22, lookAt: new THREE.Vector3(36, 1.2, 14), name: '🎵 Musik Piringan Hitam & Gitar', icon: '🎵', floor: 'L1' },
  pet: { theta: 0.48, phi: 0.88, radius: 20, lookAt: new THREE.Vector3(12, 1.2, 18), name: '🐱 Sudut Kucing Kantor (Pet)', icon: '🐱', floor: 'L1' },
  restroom: { theta: 0.40, phi: 0.85, radius: 24, lookAt: new THREE.Vector3(-40, 1.2, -16), name: '🚻 Restroom & Toilet', icon: '🚻', floor: 'L1' },
  print: { theta: 0.45, phi: 0.88, radius: 24, lookAt: new THREE.Vector3(-40, 1.2, 10), name: '🖨️ Cetak & Fotokopi', icon: '🖨️', floor: 'L1' },
  garden: { theta: 0.38, phi: 0.86, radius: 36, lookAt: new THREE.Vector3(-28, 1.2, 34), name: '🌱 Kebun Air & Bunga', icon: '🌱', floor: 'Outdoor' },
  bbq: { theta: 0.45, phi: 0.84, radius: 26, lookAt: new THREE.Vector3(-12, 1.2, 36), name: '🍖 Patio BBQ Grill Taman', icon: '🍖', floor: 'Outdoor' },
  garage: { theta: 0.52, phi: 0.86, radius: 36, lookAt: new THREE.Vector3(28, 1.2, 34), name: '🚗 Garasi & Charger EV', icon: '🚗', floor: 'Outdoor' },
  ceo: { theta: 0.62, phi: 0.76, radius: 24, lookAt: new THREE.Vector3(-15, 8.0, -4), name: '👑 Suite CEO Alex', icon: '👑', floor: 'L2' },
  ailab: { theta: 0.45, phi: 0.76, radius: 24, lookAt: new THREE.Vector3(15, 8.0, -4), name: '🔬 Lab Quantum Dr. Maya', icon: '🔬', floor: 'L2' },
  meeting: { theta: 0.35, phi: 0.95, radius: 28, lookAt: new THREE.Vector3(0, 1.2, 0), name: '📊 Boardroom Rapat (L1)', icon: '📊', floor: 'L1' }
};

interface Agent3DInstance {
  id: string;
  group: THREE.Group;
  plumbob: THREE.Mesh;
  head: THREE.Mesh;
  body: THREE.Mesh;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
  handL?: THREE.Mesh;
  handR?: THREE.Mesh;
  hairGroup: THREE.Group;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  pathQueue: THREE.Vector3[];
  isWalking: boolean;
  isTyping: boolean;
  deskVector: THREE.Vector3;
  speechText: string;
  thoughtEmoji: string;
  tempSpeechTimer?: number;
  nextScheduleTime: number;
  currentActivity: 'working_desk' | 'roaming' | 'visiting_cafe' | 'visiting_garden' | 'meeting' | 'collaborating';
}

export const Office3DScene: React.FC<Office3DSceneProps> = ({
  agents,
  activeTask,
  onSelectAgent,
  onDispatchTask,
  onDirectCommand
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const agentsMapRef = useRef<Map<string, Agent3DInstance>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  // Animated elements
  const sprinklerDropletsRef = useRef<THREE.Mesh[]>([]);
  const fountainDropletsRef = useRef<THREE.Mesh[]>([]);
  const coffeeSteamParticlesRef = useRef<THREE.Mesh[]>([]);
  const quantumOrbRef = useRef<THREE.Mesh | null>(null);
  const quantumRingsRef = useRef<THREE.Mesh[]>([]);
  const printerScannerBarRef = useRef<THREE.Mesh | null>(null);

  // Orbit Camera State (Spherical)
  const cameraAngleRef = useRef({ theta: 0.54, phi: 0.74, radius: 82 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 3.5, 6));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 3.5, 6));

  const [activePreset, setActivePreset] = useState<CameraPresetKey>('all');
  const [bubbles, setBubbles] = useState<Record<string, { x: number; y: number; text: string; emoji: string; visible: boolean }>>({});
  
  // UI Controls
  const [bubbleMode, setBubbleMode] = useState<'focused' | 'all'>('focused');
  const [plumbobGlow, setPlumbobGlow] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [autoPatrolEnabled, setAutoPatrolEnabled] = useState(true);
  const [isExpandedHeight, setIsExpandedHeight] = useState(false);

  // Zoom Percentage & Workstation Inspector
  const [zoomLevelPercent, setZoomLevelPercent] = useState<number>(100);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [inspectorZoomLevel, setInspectorZoomLevel] = useState<'super' | 'desk' | 'room'>('super');

  const radiusToPercent = (radius: number): number => {
    // 4.5 -> ~280%, 18 -> 170%, 45 -> 100%, 82 -> 65%, 120 -> 30%
    if (radius <= 10) {
      return Math.round(200 + ((10 - radius) / 5.5) * 80);
    }
    return Math.round(((120 - radius) / 95) * 100 + 40);
  };

  const percentToRadius = (percent: number): number => {
    if (percent > 200) {
      return Math.max(4.2, 10 - ((percent - 200) / 80) * 5.5);
    }
    return Math.max(4.2, 120 - ((percent - 40) / 100) * 95);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#E0F2FE');
    scene.fog = new THREE.FogExp2('#E0F2FE', 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with high visual fidelity
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting & Environment
    setupLighting(scene);

    // 5. Build The Sims Style Fully Furnished Architecture
    buildTheSimsOfficeArchitecture(scene);

    // 6. Build The Sims Characters (No Eyes, No Mouth, Stylized Hair, Clothing & Plumbob)
    buildTheSimsCharacters(scene);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const now = Date.now();

      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
      if (cameraRef.current) {
        cameraRef.current.lookAt(currentLookAtRef.current);
      }

      // Rotate & Bob The Sims Plumbobs
      agentsMapRef.current.forEach((inst, id) => {
        if (inst.plumbob) {
          inst.plumbob.rotation.y += delta * 3.0;
          const isSelected = selectedAgentId === id || hoveredAgentId === id;
          const bobHeight = 2.45 + Math.sin(elapsed * 4.0 + (inst.id.length * 0.5)) * 0.14;
          inst.plumbob.position.y = bobHeight;
          const targetScale = isSelected ? 1.35 : 1.0;
          inst.plumbob.scale.set(targetScale, targetScale * 1.3, targetScale);
        }

        if (autoPatrolEnabled) {
          tickAutonomousScheduler(inst, now);
        }

        updateAgentMovement(inst, delta, elapsed);
      });

      // Animated Water Fountain Droplets
      fountainDropletsRef.current.forEach((drop, i) => {
        drop.position.y = 1.2 + Math.sin(elapsed * 6 + i) * 0.45;
        drop.position.x = -26 + Math.cos(elapsed * 3 + i) * (0.6 + (i % 3) * 0.3);
        drop.position.z = 36 + Math.sin(elapsed * 3 + i) * (0.6 + (i % 3) * 0.3);
      });

      // Animated Garden Sprinkler
      sprinklerDropletsRef.current.forEach((drop, i) => {
        const angle = elapsed * 4 + (i * Math.PI) / 6;
        drop.position.x = -34 + Math.cos(angle) * (1.8 + Math.sin(elapsed * 2) * 0.4);
        drop.position.z = 32 + Math.sin(angle) * (1.8 + Math.sin(elapsed * 2) * 0.4);
        drop.position.y = 0.5 + Math.abs(Math.sin(elapsed * 5 + i)) * 1.1;
      });

      // Animated Coffee Steam
      coffeeSteamParticlesRef.current.forEach((steam, idx) => {
        steam.position.y = 1.9 + ((elapsed * 0.7 + idx * 0.25) % 0.8);
        steam.position.x = -2 + Math.sin(elapsed * 2 + idx) * 0.08;
      });

      // Animated Office Printer Scanner Light Bar
      if (printerScannerBarRef.current) {
        printerScannerBarRef.current.position.z = 9.8 + Math.sin(elapsed * 3) * 0.4;
      }

      // Animated Quantum Core in AI Lab (Floor 2)
      if (quantumOrbRef.current) {
        quantumOrbRef.current.position.y = 9.0 + Math.sin(elapsed * 2) * 0.2;
        quantumOrbRef.current.rotation.y = elapsed * 0.8;
      }
      quantumRingsRef.current.forEach((ring, idx) => {
        ring.rotation.x = elapsed * (idx === 0 ? 1.2 : -0.9);
        ring.rotation.y = elapsed * (idx === 0 ? 0.9 : 1.4);
      });

      renderer.render(scene, camera);
      updateScreenBubbles();
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [isExpandedHeight, plumbobGlow]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(
      targetLookAtRef.current.x + x,
      targetLookAtRef.current.y + y,
      targetLookAtRef.current.z + z
    );
    cameraRef.current.lookAt(targetLookAtRef.current);
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Warm natural Scandinavian sky-and-wood hemisphere bounce
    const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#FEF3C7', 1.0);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight('#FFFFFF', 0.8);
    scene.add(ambientLight);

    // Primary warm architectural sunlight
    const sunLight = new THREE.DirectionalLight('#FFFDF0', 1.65);
    sunLight.position.set(65, 90, 65);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 380;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    // Opposite cool studio fill light (eliminates pitch-black harsh contrast)
    const fillLight = new THREE.DirectionalLight('#BAE6FD', 0.55);
    fillLight.position.set(-55, 40, -55);
    scene.add(fillLight);

    // Warm Interior Point Lights with calibrated soft decay
    const warmBoardroom = new THREE.PointLight('#93C5FD', 1.25, 35, 1.8);
    warmBoardroom.position.set(0, 5, 0);
    scene.add(warmBoardroom);

    const warmLobby = new THREE.PointLight('#FBBF24', 1.15, 30, 1.8);
    warmLobby.position.set(0, 4.5, 18);
    scene.add(warmLobby);

    const warmPantry = new THREE.PointLight('#F97316', 1.25, 30, 1.8);
    warmPantry.position.set(0, 4.5, -18);
    scene.add(warmPantry);

    const warmCEO = new THREE.PointLight('#F59E0B', 1.4, 25, 1.8);
    warmCEO.position.set(-15, 11, -4);
    scene.add(warmCEO);

    const warmAILab = new THREE.PointLight('#06B6D4', 1.5, 28, 1.8);
    warmAILab.position.set(15, 11, -4);
    scene.add(warmAILab);

    const outdoorLight = new THREE.DirectionalLight('#7DD3FC', 0.45);
    outdoorLight.position.set(-50, 35, 55);
    scene.add(outdoorLight);
  };

  // Helper: Create Partition Wall with Open Doorway Gap
  const createSimsPartitionWallWithDoor = (
    scene: THREE.Scene, 
    x: number, 
    y: number, 
    z: number, 
    totalWidth: number, 
    doorwayWidth: number,
    doorOffset: number,
    depth: number, 
    height: number, 
    label: string, 
    wallColor: string, 
    signBgColor: string = '#1E293B'
  ) => {
    const wallGroup = new THREE.Group();
    const halfW = totalWidth / 2;
    const baseH = height * 0.45;
    const glassH = height - baseH;

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.35, metalness: 0.05 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#E0F2FE', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45 });
    const frameMat = new THREE.MeshStandardMaterial({ color: '#F1F5F9', metalness: 0.3, roughness: 0.3 });
    const baseboardMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 });

    const seg1Width = Math.max(1, halfW + doorOffset - doorwayWidth / 2);
    const seg2Width = Math.max(1, halfW - doorOffset - doorwayWidth / 2);

    // Segment 1 (Left of doorway)
    if (seg1Width > 0.5) {
      const seg1X = -halfW + seg1Width / 2;
      const bBoard1 = new THREE.Mesh(new THREE.BoxGeometry(seg1Width, 0.22, depth + 0.08), baseboardMat);
      bBoard1.position.set(seg1X, 0.11, 0);
      wallGroup.add(bBoard1);

      const wall1 = new THREE.Mesh(new THREE.BoxGeometry(seg1Width, baseH, depth), wallMat);
      wall1.position.set(seg1X, baseH / 2, 0);
      wallGroup.add(wall1);

      const glass1 = new THREE.Mesh(new THREE.BoxGeometry(seg1Width, glassH, depth * 0.7), glassMat);
      glass1.position.set(seg1X, baseH + glassH / 2, 0);
      wallGroup.add(glass1);

      const top1 = new THREE.Mesh(new THREE.BoxGeometry(seg1Width, 0.12, depth + 0.08), frameMat);
      top1.position.set(seg1X, height, 0);
      wallGroup.add(top1);
    }

    // Segment 2 (Right of doorway)
    if (seg2Width > 0.5) {
      const seg2X = halfW - seg2Width / 2;
      const bBoard2 = new THREE.Mesh(new THREE.BoxGeometry(seg2Width, 0.22, depth + 0.08), baseboardMat);
      bBoard2.position.set(seg2X, 0.11, 0);
      wallGroup.add(bBoard2);

      const wall2 = new THREE.Mesh(new THREE.BoxGeometry(seg2Width, baseH, depth), wallMat);
      wall2.position.set(seg2X, baseH / 2, 0);
      wallGroup.add(wall2);

      const glass2 = new THREE.Mesh(new THREE.BoxGeometry(seg2Width, glassH, depth * 0.7), glassMat);
      glass2.position.set(seg2X, baseH + glassH / 2, 0);
      wallGroup.add(glass2);

      const top2 = new THREE.Mesh(new THREE.BoxGeometry(seg2Width, 0.12, depth + 0.08), frameMat);
      top2.position.set(seg2X, height, 0);
      wallGroup.add(top2);
    }

    // Doorway Header lintel beam
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorwayWidth, 0.25, depth + 0.1), frameMat);
    lintel.position.set(doorOffset, height, 0);
    wallGroup.add(lintel);

    if (label) {
      const plaqueWidth = Math.min(seg1Width * 0.85, 5.5);
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(plaqueWidth, 0.48, depth + 0.16),
        new THREE.MeshStandardMaterial({ color: signBgColor, metalness: 0.4, roughness: 0.3 })
      );
      signMesh.position.set(-halfW + seg1Width / 2, baseH - 0.24, 0);
      wallGroup.add(signMesh);
    }

    wallGroup.position.set(x, y, z);
    scene.add(wallGroup);
  };

  // Helper: Build High-Fidelity Modern Tech Workstation
  const buildSimsWorkstation = (
    scene: THREE.Scene, 
    x: number, 
    y: number, 
    z: number, 
    deskWoodColor: string, 
    chairAccentColor: string,
    screenGlowColor: string,
    agentId?: string
  ) => {
    const group = new THREE.Group();

    // Natural Oak / Mahogany Desktop Top with beveled edge
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.16, 2.3),
      new THREE.MeshStandardMaterial({ color: deskWoodColor, roughness: 0.35 })
    );
    deskTop.position.y = 0.95;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);

    // Premium Leather Desk Mat
    const deskMatMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.02, 1.4),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.7 })
    );
    deskMatMesh.position.set(0, 1.04, 0.2);
    group.add(deskMatMesh);

    // Wooden Drawer Unit on Right
    const drawers = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.82, 2.0),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
    );
    drawers.position.set(1.4, 0.45, 0);
    drawers.castShadow = true;
    group.add(drawers);

    // Sleek Brushed Aluminum Legs
    const legMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.85, roughness: 0.2 });
    [-1.9, -1.9].forEach((lx, i) => {
      const lz = i === 0 ? 0.9 : -0.9;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95), legMat);
      leg.position.set(lx, 0.475, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Dual Ultrawide Monitors with Real High-Res Screen Textures
    const monMat = new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.85, roughness: 0.25 });
    const effectiveAgentId = agentId || 'agent_david';
    const leftTex = getWorkstationScreenTexture(effectiveAgentId, 'left');
    const rightTex = getWorkstationScreenTexture(effectiveAgentId, 'right');

    const leftScreenMat = new THREE.MeshBasicMaterial({ map: leftTex });
    const rightScreenMat = new THREE.MeshBasicMaterial({ map: rightTex });

    [-0.75, 0.75].forEach((mx, idx) => {
      const mon = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.75, 0.06), monMat);
      mon.position.set(mx, 1.54, -0.5);
      mon.rotation.y = idx === 0 ? 0.18 : -0.18;
      group.add(mon);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 0.68), 
        idx === 0 ? leftScreenMat : rightScreenMat
      );
      screen.position.set(mx, 1.54, -0.46);
      screen.rotation.y = idx === 0 ? 0.18 : -0.18;
      group.add(screen);

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), legMat);
      stand.position.set(mx, 1.18, -0.5);
      group.add(stand);
    });

    // Screen light glow onto desk
    const glowLight = new THREE.PointLight(screenGlowColor, 0.45, 4.2);
    glowLight.position.set(0, 1.45, -0.2);
    group.add(glowLight);

    // Architectural Minimalist Task Lamp with Warm Soft Light Pool
    const lampMat = new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.8, roughness: 0.2 });
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16), lampMat);
    lampBase.position.set(-1.6, 1.05, -0.6);
    group.add(lampBase);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65), lampMat);
    lampArm.position.set(-1.6, 1.38, -0.5);
    lampArm.rotation.z = -0.22;
    group.add(lampArm);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 16), lampMat);
    lampShade.position.set(-1.45, 1.68, -0.4);
    lampShade.rotation.x = Math.PI / 3;
    group.add(lampShade);

    const deskLampLight = new THREE.PointLight('#FFFBEB', 0.65, 4.0, 1.6);
    deskLampLight.position.set(-1.45, 1.62, -0.2);
    group.add(deskLampLight);

    // Backlit Mechanical Keyboard & RGB Underglow Strip
    const kbd = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.04, 0.52), 
      new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.5 })
    );
    kbd.position.set(0, 1.065, 0.15);
    group.add(kbd);

    const rgbStrip = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.015, 0.54), 
      new THREE.MeshBasicMaterial({ color: screenGlowColor || '#38BDF8' })
    );
    rgbStrip.position.set(0, 1.045, 0.15);
    group.add(rgbStrip);

    // Ergonomic Wireless Mouse
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.05, 0.26),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3 })
    );
    mouse.position.set(0.95, 1.06, 0.2);
    group.add(mouse);

    // Ergonomic Office Mesh Chair with 5 Castor Wheels
    const chairGroup = new THREE.Group();
    const chairMat = new THREE.MeshStandardMaterial({ color: chairAccentColor, roughness: 0.35 });
    
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.14, 1.05), chairMat);
    seat.position.y = 0.68;
    seat.castShadow = true;
    chairGroup.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.1, 0.14), chairMat);
    back.position.set(0, 1.18, 0.48);
    chairGroup.add(back);

    const chromeMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9, roughness: 0.1 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5), chromeMat);
    stem.position.y = 0.35;
    chairGroup.add(stem);

    for (let w = 0; w < 5; w++) {
      const angle = (w / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.08), chromeMat);
      spoke.position.set(Math.cos(angle) * 0.25, 0.1, Math.sin(angle) * 0.25);
      spoke.rotation.y = angle;
      chairGroup.add(spoke);

      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: '#0F172A' }));
      wheel.position.set(Math.cos(angle) * 0.45, 0.06, Math.sin(angle) * 0.45);
      chairGroup.add(wheel);
    }

    chairGroup.position.set(0, 0, 1.05);
    group.add(chairGroup);

    // Modern Vertical Oak Slat Acoustic Feature Panel behind desk
    const slatTex = getAcousticSlatsTexture();
    const slatWall = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 3.2),
      new THREE.MeshStandardMaterial({ map: slatTex, roughness: 0.55 })
    );
    slatWall.position.set(0, 1.6, -1.1);
    group.add(slatWall);

    // Grounding Contact Shadows
    const shadowMat = new THREE.MeshBasicMaterial({ color: '#090D16', transparent: true, opacity: 0.28 });
    const deskShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.9), shadowMat);
    deskShadow.rotation.x = -Math.PI / 2;
    deskShadow.position.set(0, 0.02, 0);
    group.add(deskShadow);

    const chairShadow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16), shadowMat);
    chairShadow.rotation.x = -Math.PI / 2;
    chairShadow.position.set(0, 0.02, 1.05);
    group.add(chairShadow);

    // Potted Succulent Plant on desk
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 }));
    pot.position.set(1.6, 1.12, 0.5);
    group.add(pot);
    const succulent = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.6 }));
    succulent.position.set(1.6, 1.28, 0.5);
    group.add(succulent);

    // Coffee Mug on Desk
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.2), new THREE.MeshStandardMaterial({ color: '#F87171' }));
    mug.position.set(-1.6, 1.12, 0.5);
    group.add(mug);

    group.position.set(x, y, z);
    scene.add(group);
  };

  // Build The Sims Architecture with ALL FURNITURE & COMPLETE FACILITIES
  const buildTheSimsOfficeArchitecture = (scene: THREE.Scene) => {
    // =========================================================================
    // LANTAI 1 (GROUND FLOOR - Y = 0) - SANGAT LUAS (104 x 58 units)
    // =========================================================================
    const floor1Geo = new THREE.BoxGeometry(104, 0.6, 58);
    const parquetTexture = getParquetFloorTexture();
    const mainFloorMat = new THREE.MeshStandardMaterial({ 
      map: parquetTexture,
      roughness: 0.32,
      metalness: 0.04
    });
    const mainFloor = new THREE.Mesh(floor1Geo, mainFloorMat);
    mainFloor.position.set(0, -0.3, 0);
    mainFloor.receiveShadow = true;
    scene.add(mainFloor);

    // Exterior Skirting Foundation Plinth
    const floorTrim = new THREE.Mesh(
      new THREE.BoxGeometry(105.2, 0.2, 59.2),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 })
    );
    floorTrim.position.set(0, -0.05, 0);
    scene.add(floorTrim);

    // Low Cutaway Glass Perimeter Balustrade
    const glassPerimeterMat = new THREE.MeshStandardMaterial({
      color: '#E0F2FE',
      transparent: true,
      opacity: 0.38,
      roughness: 0.1
    });

    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(104, 2.2, 0.15), glassPerimeterMat);
    rearGlass.position.set(0, 1.1, -29);
    scene.add(rearGlass);

    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 58), glassPerimeterMat);
    leftGlass.position.set(-52, 1.1, 0);
    scene.add(leftGlass);

    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 58), glassPerimeterMat);
    rightGlass.position.set(52, 1.1, 0);
    scene.add(rightGlass);

    // Architectural Wood Accent Slats on Rear Wall
    for (let bx = -22; bx <= 22; bx += 2.8) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 15, 0.35), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 }));
      slat.position.set(bx, 7.5, -28.8);
      scene.add(slat);
    }

    // =========================================================================
    // LANTAI 2: TEPAT 2 RUANGAN AJA (EXECUTIVE MEZZANINE: Y = 7.4)
    // =========================================================================
    const mezFloor = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.6, 20),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.35 })
    );
    mezFloor.position.set(0, 7.1, -8);
    mezFloor.receiveShadow = true;
    scene.add(mezFloor);

    // Mezzanine Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', metalness: 0.4, roughness: 0.2 });
    [-20, 0, 20].forEach((px) => {
      [-17, 1].forEach((pz) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 7.1, 16), pillarMat);
        col.position.set(px, 3.55, pz);
        col.castShadow = true;
        scene.add(col);
      });
    });

    const mezRailing = new THREE.Mesh(new THREE.BoxGeometry(45, 1.4, 0.12), glassPerimeterMat);
    mezRailing.position.set(0, 8.1, 2.0);
    scene.add(mezRailing);

    const handrail = new THREE.Mesh(new THREE.BoxGeometry(45.2, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 }));
    handrail.position.set(0, 8.8, 2.0);
    scene.add(handrail);

    // FLOATING STAIRCASE
    const numSteps = 16;
    for (let s = 0; s < numSteps; s++) {
      const stepH = 7.4 / numSteps;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, stepH, 0.8),
        new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.35 })
      );
      stepMesh.position.set(-38, s * stepH + stepH / 2, 5.0 - s * 0.7);
      stepMesh.castShadow = true;
      scene.add(stepMesh);
    }

    // =========================================================================
    // LANTAI 1: 10 RUANGAN UTAMA DENGAN PINTU MASUK TERBUKA (NO CLIPPING)
    // =========================================================================

    // 1. Grand Lobi & Resepsionis Utama
    const recepFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 9),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.15 })
    );
    recepFloor.rotation.x = -Math.PI / 2;
    recepFloor.position.set(0, 0.04, 18);
    scene.add(recepFloor);

    // Partition wall with open entrance archway (5 units open in center)
    createSimsPartitionWallWithDoor(scene, 0, 0, 13.5, 18, 5.0, 0, 0.15, 2.6, 'LOBI & RESEPSIONIS UTAMA', '#475569');

    // Marble Reception Desk with iMac terminal & Reception Bell
    const recepDesk = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.2, 1.8), new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.2 }));
    recepDesk.position.set(0, 0.6, 18);
    scene.add(recepDesk);

    const recepFrontPlate = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.8, 0.1), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    recepFrontPlate.position.set(0, 0.6, 18.96);
    scene.add(recepFrontPlate);

    // Gold Brass Desk Bell
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.12), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.95 }));
    bell.position.set(2.2, 1.26, 18);
    scene.add(bell);

    // Turnstile Security Speed Gates (Optical glass flaps)
    [-3.8, 3.8].forEach((tx) => {
      const gatePod = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 1.6), new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.8 }));
      gatePod.position.set(tx, 0.55, 14.5);
      scene.add(gatePod);
      const gateLed = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: '#22C55E' }));
      gateLed.position.set(tx, 1.12, 14.5);
      gateLed.rotation.x = -Math.PI / 2;
      scene.add(gateLed);
    });

    // Digital Company Directory Pedestal
    const dirKiosk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.7, 0.4), new THREE.MeshStandardMaterial({ color: '#1E293B' }));
    dirKiosk.position.set(-6.5, 0.85, 18);
    scene.add(dirKiosk);
    const dirScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.1), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    dirScreen.position.set(-6.5, 1.15, 18.21);
    scene.add(dirScreen);

    // Guest Lounge: Royal Blue Tufted Sofa & Glass Coffee Table with Magazines
    const guestSofa = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.9, 1.8), new THREE.MeshStandardMaterial({ color: '#2563EB', roughness: 0.4 }));
    guestSofa.position.set(8.5, 0.45, 18);
    scene.add(guestSofa);

    const lobbyTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.4), new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.2 }));
    lobbyTable.position.set(8.5, 0.22, 15.5);
    scene.add(lobbyTable);

    // Fiddle Leaf Fig Plant
    const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.8), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 }));
    plantPot.position.set(-8.5, 0.4, 18);
    scene.add(plantPot);
    const plantTree = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85), new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.6 }));
    plantTree.position.set(-8.5, 1.2, 18);
    scene.add(plantTree);

    // --- KANTOR SERASA RUMAH: SUDUT KUCING & PET CORNER (Office Cat / Dog Station) ---
    // Multi-tier Wooden & Sisal Cat Tree Tower
    const catTreeGroup = new THREE.Group();
    const ctBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 1.6), new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 }));
    catTreeGroup.add(ctBase);

    const ctPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.9 }));
    ctPost1.position.set(-0.35, 0.9, -0.35);
    catTreeGroup.add(ctPost1);

    const ctPlatform = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 1.1), new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.6 }));
    ctPlatform.position.set(-0.2, 1.4, -0.2);
    catTreeGroup.add(ctPlatform);

    // Cozy Plush Doughnut Pet Bed on Floor
    const petBed = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.2, 12, 24), new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.8 }));
    petBed.rotation.x = Math.PI / 2;
    petBed.position.set(0.6, 0.12, 0.4);
    catTreeGroup.add(petBed);

    // Cute Calico Office Mascot Cat sleeping curled up
    const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.8 }));
    catBody.scale.set(1.2, 0.8, 1.0);
    catBody.position.set(0.6, 0.22, 0.4);
    catTreeGroup.add(catBody);

    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.7 }));
    catHead.position.set(0.8, 0.28, 0.4);
    catTreeGroup.add(catHead);

    catTreeGroup.position.set(12.5, 0.08, 18);
    scene.add(catTreeGroup);

    // 2. Ruang Rapat Utama (Boardroom)
    const boardFloor = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), new THREE.MeshStandardMaterial({ color: '#1E1B4B', roughness: 0.3 }));
    boardFloor.rotation.x = -Math.PI / 2;
    boardFloor.position.set(0, 0.04, 0);
    scene.add(boardFloor);

    // Front & Back Boardroom partitions with open doorways at center (4 units gap)
    createSimsPartitionWallWithDoor(scene, 0, 0, 6.0, 20, 4.0, 0, 0.15, 2.8, 'RUANG RAPAT UTAMA (BOARDROOM)', '#3B82F6', '#93C5FD');
    createSimsPartitionWallWithDoor(scene, 0, 0, -6.0, 20, 4.0, 0, 0.15, 2.8, '', '#3B82F6');
    
    // Side glass partitions
    createSimsPartitionWallWithDoor(scene, -10, 0, 0, 12, 0, 0, 0.15, 2.8, '', '#3B82F6');
    createSimsPartitionWallWithDoor(scene, 10, 0, 0, 12, 0, 0, 0.15, 2.8, '', '#3B82F6');

    // Walnut Conference Table
    const confTable = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.85, 32), new THREE.MeshStandardMaterial({ color: '#5C3A21', roughness: 0.25 }));
    confTable.scale.set(2.0, 1, 0.95);
    confTable.position.set(0, 0.425, 0);
    scene.add(confTable);

    // Conference Polycom Speakerphone Disc on Table
    const speakerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.1, 16), new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.8 }));
    speakerDisc.position.set(0, 0.9, 0);
    scene.add(speakerDisc);

    // Wall-Mounted Presentation Screen & Agile Sticky Notes Whiteboard
    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.2, 0.1), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    screenMesh.position.set(0, 2.8, -5.9);
    scene.add(screenMesh);

    // Agile Sticky Notes Board
    const stickiesGroup = new THREE.Group();
    const stickyColors = ['#FACC15', '#EC4899', '#22C55E', '#38BDF8'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const sticky = new THREE.Mesh(
          new THREE.PlaneGeometry(0.35, 0.35),
          new THREE.MeshBasicMaterial({ color: stickyColors[(r * 5 + c) % stickyColors.length] })
        );
        sticky.position.set(-1.4 + c * 0.7, 2.2 + r * 0.5, -5.84);
        stickiesGroup.add(sticky);
      }
    }
    scene.add(stickiesGroup);

    // 3. Tech Hub (David Kim) - Doorway on East side towards corridor
    const itFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.3 }));
    itFloor.rotation.x = -Math.PI / 2;
    itFloor.position.set(-30, 0.04, 10);
    scene.add(itFloor);
    createSimsPartitionWallWithDoor(scene, -30, 0, 4.5, 14, 4.0, 5.0, 0.15, 2.6, 'TECH & ENGINEERING HUB', '#8B5CF6', '#DDD6FE');
    buildSimsWorkstation(scene, -30, 0, 10, '#475569', '#38BDF8', '#8B5CF6', 'agent_david');

    // 4. QA & Audit Station (Kenji Sato)
    const qaFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshStandardMaterial({ color: '#FDF2F8', roughness: 0.4 }));
    qaFloor.rotation.x = -Math.PI / 2;
    qaFloor.position.set(-30, 0.04, -8);
    scene.add(qaFloor);
    createSimsPartitionWallWithDoor(scene, -30, 0, -13.5, 14, 0, 0, 0.15, 2.6, 'QA & COMPLIANCE AUDIT', '#DB2777', '#FCE7F3');
    buildSimsWorkstation(scene, -30, 0, -8, '#DB2777', '#EC4899', '#F472B6', 'agent_kenji');

    // 5. Cloud Architecture & Cyber Vault (Liam O'Connor)
    const devopsFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshStandardMaterial({ color: '#090D16', roughness: 0.2 }));
    devopsFloor.rotation.x = -Math.PI / 2;
    devopsFloor.position.set(-15, 0.04, -8);
    scene.add(devopsFloor);
    createSimsPartitionWallWithDoor(scene, -15, 0, -13.5, 13, 0, 0, 0.15, 2.6, 'CLOUD & CYBER DEVOPS', '#06B6D4', '#CFFAFE');
    buildSimsWorkstation(scene, -15, 0, -8, '#0891B2', '#06B6D4', '#22D3EE', 'agent_liam');

    const serverRack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.4, 1.8), new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.9 }));
    serverRack.position.set(-21, 2.2, -8);
    scene.add(serverRack);
    const ledPanel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.6, 0.05), new THREE.MeshBasicMaterial({ color: '#00F0FF' }));
    ledPanel.position.set(-21, 2.2, -7.08);
    scene.add(ledPanel);

    // 6. Growth & Marketing (Sarah Jenkins) - Doorway on West side towards corridor
    const mktFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshStandardMaterial({ color: '#FEF2F2', roughness: 0.4 }));
    mktFloor.rotation.x = -Math.PI / 2;
    mktFloor.position.set(-15, 0.04, 10);
    scene.add(mktFloor);
    createSimsPartitionWallWithDoor(scene, -15, 0, 4.5, 13, 4.0, 0, 0.15, 2.6, 'GROWTH & MARKETING WING', '#EF4444', '#FEE2E2');
    buildSimsWorkstation(scene, -15, 0, 10, '#DC2626', '#EF4444', '#F87171', 'agent_sarah');

    // 7. Creative Media Studio (Elena Rostova)
    const mediaFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshStandardMaterial({ color: '#FCE7F3', roughness: 0.3 }));
    mediaFloor.rotation.x = -Math.PI / 2;
    mediaFloor.position.set(15, 0.04, 10);
    scene.add(mediaFloor);
    createSimsPartitionWallWithDoor(scene, 15, 0, 4.5, 13, 4.0, 0, 0.15, 2.6, 'CREATIVE MEDIA STUDIO', '#EC4899', '#FBCFE8');
    buildSimsWorkstation(scene, 15, 0, 10, '#DEB887', '#EC4899', '#A855F7', 'agent_elena');

    const easelMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.7 });
    const easelStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2), easelMat);
    easelStand.position.set(19, 1.6, 10);
    scene.add(easelStand);
    const canvasArt = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 0.08), new THREE.MeshBasicMaterial({ color: '#F43F5E' }));
    canvasArt.position.set(19, 1.8, 9.9);
    scene.add(canvasArt);

    // 8. Product Strategy Pod (Nadia Thorne)
    const prodFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshStandardMaterial({ color: '#ECFCCB', roughness: 0.4 }));
    prodFloor.rotation.x = -Math.PI / 2;
    prodFloor.position.set(30, 0.04, 10);
    scene.add(prodFloor);
    createSimsPartitionWallWithDoor(scene, 30, 0, 4.5, 14, 4.0, -5.0, 0.15, 2.6, 'PRODUCT STRATEGY POD', '#65A30D', '#D9F99D');
    buildSimsWorkstation(scene, 30, 0, 10, '#65A30D', '#84CC16', '#A3E635', 'agent_nadia');

    // 9. Finance & Investment (Marcus Vance)
    const finFloor = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.4 }));
    finFloor.rotation.x = -Math.PI / 2;
    finFloor.position.set(15, 0.04, -8);
    scene.add(finFloor);
    createSimsPartitionWallWithDoor(scene, 15, 0, -13.5, 13, 0, 0, 0.15, 2.6, 'FINANCE & CAPITAL WING', '#D97706', '#FEF3C7');
    buildSimsWorkstation(scene, 15, 0, -8, '#0D9488', '#14B8A6', '#2DD4BF', 'agent_marcus');

    // 10. Legal & Governance (Priya Sharma)
    const legFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshStandardMaterial({ color: '#E0E7FF', roughness: 0.4 }));
    legFloor.rotation.x = -Math.PI / 2;
    legFloor.position.set(30, 0.04, -8);
    scene.add(legFloor);
    createSimsPartitionWallWithDoor(scene, 30, 0, -13.5, 14, 0, 0, 0.15, 2.6, 'LEGAL & GOVERNANCE OFFICE', '#4F46E5', '#C7D2FE');
    buildSimsWorkstation(scene, 30, 0, -8, '#4F46E5', '#6366F1', '#818CF8', 'agent_priya');

    const bShelf = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.8, 0.8), new THREE.MeshStandardMaterial({ color: '#451A03', roughness: 0.7 }));
    bShelf.position.set(35, 1.9, -8);
    scene.add(bShelf);

    // =========================================================================
    // 11. COMPLETE PANTRY KAFE & REFRESHMENT LOUNGE (DILENGKAPI DISPENSER GALON!)
    // =========================================================================
    const pantryFloor = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.3 }));
    pantryFloor.rotation.x = -Math.PI / 2;
    pantryFloor.position.set(0, 0.04, -18);
    scene.add(pantryFloor);
    createSimsPartitionWallWithDoor(scene, 0, 0, -13.5, 18, 6.0, 0, 0.15, 2.6, 'PANTRY KAFE & LOUNGE', '#EA580C', '#FFEDD5');

    // Kitchen Counter & Island Bar
    const pantryBar = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.15, 1.6), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.4 }));
    pantryBar.position.set(0, 0.575, -18);
    scene.add(pantryBar);

    // Double-Door Stainless Refrigerator with Colorful Magnets & Notes
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.4, 1.4), new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.85, roughness: 0.2 }));
    fridge.position.set(-5.5, 1.7, -18);
    scene.add(fridge);

    const magnetColors = ['#EF4444', '#FACC15', '#3B82F6', '#22C55E'];
    magnetColors.forEach((col, idx) => {
      const mag = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: col }));
      mag.position.set(-5.5 + (idx % 2 === 0 ? -0.2 : 0.2), 2.2 + Math.floor(idx / 2) * 0.4, -17.28);
      scene.add(mag);
    });

    // Espresso Machine with Steam Particles
    const coffeeMach = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.9, roughness: 0.2 }));
    coffeeMach.position.set(-2, 1.55, -18);
    scene.add(coffeeMach);

    const steamDrops: THREE.Mesh[] = [];
    const steamMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.65 });
    for (let st = 0; st < 4; st++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), steamMat);
      drop.position.set(-2 + (st - 1.5) * 0.15, 2.0, -18);
      scene.add(drop);
      steamDrops.push(drop);
    }
    coffeeSteamParticlesRef.current = steamDrops;

    // BARANG BARU: WATER DISPENSER DENGAN GALON AIR BIRU 19L!
    const dispenserGroup = new THREE.Group();
    // Dispenser Base (White floor cabinet)
    const dispBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.3 }));
    dispBase.position.y = 1.1;
    dispenserGroup.add(dispBase);

    // Hot & Cold Faucets (Red & Blue taps)
    const hotTap = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.14), new THREE.MeshBasicMaterial({ color: '#EF4444' }));
    hotTap.position.set(-0.2, 1.45, 0.48);
    dispenserGroup.add(hotTap);
    const coldTap = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.14), new THREE.MeshBasicMaterial({ color: '#3B82F6' }));
    coldTap.position.set(0.2, 1.45, 0.48);
    dispenserGroup.add(coldTap);

    // Blue 19L Aqua Water Gallon Bottle on top (Upside-down)
    const gallonBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 1.1, 16),
      new THREE.MeshStandardMaterial({ color: '#0284C7', transparent: true, opacity: 0.82, roughness: 0.1 })
    );
    gallonBottle.position.y = 2.75;
    dispenserGroup.add(gallonBottle);
    const gallonCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16), new THREE.MeshStandardMaterial({ color: '#FFFFFF' }));
    gallonCap.position.y = 2.25;
    dispenserGroup.add(gallonCap);

    dispenserGroup.position.set(4.5, 0, -18);
    scene.add(dispenserGroup);

    // Microwave on counter
    const microwave = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.7), new THREE.MeshStandardMaterial({ color: '#1E293B' }));
    microwave.position.set(2.0, 1.45, -18);
    scene.add(microwave);
    const mwScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.15), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    mwScreen.position.set(2.35, 1.45, -17.64);
    scene.add(mwScreen);

    // Bar Stools
    [-2, 0, 2].forEach((sx) => {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.75, 16), new THREE.MeshStandardMaterial({ color: '#F97316' }));
      stool.position.set(sx, 0.375, -16.2);
      scene.add(stool);
    });

    // --- KANTOR SERASA RUMAH: MEJA MAKAN BERSAMA & KERANJANG BUAH ---
    // Warm Oak Dining Table where team can sit and eat together like family
    const diningTable = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 2.0), new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.4 }));
    diningTable.position.set(0, 0.88, -21);
    scene.add(diningTable);

    [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].forEach(([dx, dz]) => {
      const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.88), new THREE.MeshStandardMaterial({ color: '#78350F' }));
      tLeg.position.set(dx, 0.44, -21 + dz);
      scene.add(tLeg);
    });

    // 4 Comfortable Padded Dining Chairs
    [[-1.2, -22.2], [1.2, -22.2], [-1.2, -19.8], [1.2, -19.8]].forEach(([cx, cz]) => {
      const dSeat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.5 }));
      dSeat.position.set(cx, 0.52, cz);
      scene.add(dSeat);
      const dBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.06), new THREE.MeshStandardMaterial({ color: '#0369A1' }));
      dBack.position.set(cx, 0.82, cz > -21 ? cz + 0.38 : cz - 0.38);
      scene.add(dBack);
    });

    // Fresh Fruit Bowl on Dining Table
    const fruitBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.2, 0.15, 16), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.1 }));
    fruitBowl.position.set(0, 1.02, -21);
    scene.add(fruitBowl);

    const fruitColors = ['#EF4444', '#F97316', '#FACC15', '#22C55E'];
    fruitColors.forEach((fCol, fi) => {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: fCol }));
      fruit.position.set(Math.sin(fi * 1.5) * 0.18, 1.14, -21 + Math.cos(fi * 1.5) * 0.18);
      scene.add(fruit);
    });

    // Chrome Pop-up Bread Toaster & Glass Cookie Jar on Island
    const toaster = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.4), new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9, roughness: 0.1 }));
    toaster.position.set(-3.2, 1.4, -18);
    scene.add(toaster);

    const cookieJar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16), new THREE.MeshStandardMaterial({ color: '#FEF08A', transparent: true, opacity: 0.7 }));
    cookieJar.position.set(3.2, 1.42, -18);
    scene.add(cookieJar);

    // --- KANTOR SERASA RUMAH: LAUNDRY CORNER (Washer & Dryer Stack) ---
    const washerDryer = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 1.4), new THREE.MeshStandardMaterial({ color: '#F1F5F9', metalness: 0.6, roughness: 0.2 }));
    washerDryer.position.set(-6.5, 1.6, -21);
    scene.add(washerDryer);

    // Front-load Glass Porthole Doors (Circle)
    [-0.5, 0.6].forEach((oy) => {
      const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: '#0284C7', metalness: 0.8 }));
      doorRing.position.set(-6.5, 1.6 + oy, -20.28);
      scene.add(doorRing);
    });

    // Laundry Hamper with Towels
    const hamper = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.1, 16), new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.8 }));
    hamper.position.set(-7.8, 0.55, -21);
    scene.add(hamper);

    // =========================================================================
    // 12. BARANG BARU: RESTROOM & TOILET POWDER ROOM (X: -42, Z: -16)
    // =========================================================================
    const restFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.2 }));
    restFloor.rotation.x = -Math.PI / 2;
    restFloor.position.set(-42, 0.04, -18);
    scene.add(restFloor);

    // Ceramic Toilet Cubicle
    const toiletCubicle = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.8), new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.3 }));
    toiletCubicle.position.set(-44, 1.3, -19);
    scene.add(toiletCubicle);

    // Porcelain Toilet Bowl
    const toiletBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.1 }));
    toiletBowl.position.set(-44, 0.3, -18);
    scene.add(toiletBowl);
    const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.35), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.1 }));
    toiletTank.position.set(-44, 0.7, -19.1);
    scene.add(toiletTank);

    // Vanity Washbasin & Mirror
    const vanityCounter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.2), new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.2 }));
    vanityCounter.position.set(-39, 0.425, -19);
    scene.add(vanityCounter);

    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.6), new THREE.MeshBasicMaterial({ color: '#BAE6FD' }));
    mirror.position.set(-39, 1.9, -19.5);
    scene.add(mirror);

    // Restroom Plaque
    const restSign = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.08), new THREE.MeshStandardMaterial({ color: '#0284C7' }));
    restSign.position.set(-38, 2.0, -13.5);
    scene.add(restSign);

    // =========================================================================
    // 13. BARANG BARU: PRINT, COPY, SCAN & ARCHIVE CENTER (X: -42, Z: 10)
    // =========================================================================
    const printFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4 }));
    printFloor.rotation.x = -Math.PI / 2;
    printFloor.position.set(-42, 0.04, 10);
    scene.add(printFloor);

    // Multifunction Commercial Office Copier / Laser Printer
    const printerBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 1.8), new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.7, roughness: 0.3 }));
    printerBody.position.set(-42, 1.05, 10);
    scene.add(printerBody);

    // Document Scanner Glass Top with Animated Scanning Light Bar
    const scanGlass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 1.2), new THREE.MeshStandardMaterial({ color: '#0F172A', transparent: true, opacity: 0.7 }));
    scanGlass.position.set(-42, 2.12, 10);
    scene.add(scanGlass);

    const scanBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: '#22C55E' }));
    scanBar.position.set(-42, 2.14, 10);
    scene.add(scanBar);
    printerScannerBarRef.current = scanBar;

    // Metal 3-Drawer File Archive Cabinet
    const fileCab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 1.4), new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.85, roughness: 0.3 }));
    fileCab.position.set(-45, 1.6, 12);
    scene.add(fileCab);

    // =========================================================================
    // 14. BARANG BARU: RECREATION & GAME LOUNGE (FOOSBALL & VENDING MACHINE)
    // (X: 42, Z: 10)
    // =========================================================================
    const gameFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.4 }));
    gameFloor.rotation.x = -Math.PI / 2;
    gameFloor.position.set(42, 0.04, 10);
    scene.add(gameFloor);

    // Professional Foosball Table (Soccer Table)
    const foosballGroup = new THREE.Group();
    // Wooden Cabinet
    const fbBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.4 }));
    fbBox.position.y = 1.3;
    foosballGroup.add(fbBox);

    // Green Playing Field with White Center Line
    const fbField = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.6 }));
    fbField.rotation.x = -Math.PI / 2;
    fbField.position.y = 1.35;
    foosballGroup.add(fbField);

    // 4 Steel Chrome Player Rods with Miniature Red & Blue Figurines!
    [-1.0, -0.3, 0.3, 1.0].forEach((rx, idx) => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.0), new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.95 }));
      rod.position.set(rx, 1.45, 0);
      rod.rotation.x = Math.PI / 2;
      foosballGroup.add(rod);

      const teamColor = idx % 2 === 0 ? '#EF4444' : '#3B82F6';
      [-0.4, 0.4].forEach((pz) => {
        const player = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.12), new THREE.MeshStandardMaterial({ color: teamColor }));
        player.position.set(rx, 1.45, pz);
        foosballGroup.add(player);
      });
    });

    // 4 Wooden Table Legs
    [[-1.6, 0.9], [1.6, 0.9], [-1.6, -0.9], [1.6, -0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 1.3), new THREE.MeshStandardMaterial({ color: '#1E293B' }));
      leg.position.set(lx, 0.65, lz);
      foosballGroup.add(leg);
    });

    foosballGroup.position.set(38, 0, 10);
    scene.add(foosballGroup);

    // Cold Drinks & Snack Vending Machine with Glowing Display
    const vendingMachine = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.4, 1.2), new THREE.MeshStandardMaterial({ color: '#DC2626', metalness: 0.6 }));
    vendingMachine.position.set(44, 1.7, 8);
    scene.add(vendingMachine);

    const vendingWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    vendingWindow.position.set(44, 2.1, 8.61);
    scene.add(vendingWindow);

    // Plush Circular Gaming Beanbag
    const beanbag = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshStandardMaterial({ color: '#8B5CF6', roughness: 0.8 }));
    beanbag.scale.set(1.2, 0.7, 1.2);
    beanbag.position.set(41, 0.4, 13);
    scene.add(beanbag);

    // --- KANTOR SERASA RUMAH: COZY NAP SLEEP POD / DAYBED ---
    // Comfortable wood-frame daybed with memory foam mattress & soft teal blanket
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 2.2), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.5 }));
    bedFrame.position.set(42, 0.2, 14);
    scene.add(bedFrame);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 2.0), new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.3 }));
    mattress.position.set(42, 0.55, 14);
    scene.add(mattress);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.05), new THREE.MeshStandardMaterial({ color: '#0D9488', roughness: 0.7 }));
    blanket.position.set(42.8, 0.76, 14);
    scene.add(blanket);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 1.4), new THREE.MeshStandardMaterial({ color: '#FEF08A', roughness: 0.4 }));
    pillow.position.set(40.4, 0.8, 14);
    scene.add(pillow);

    // --- KANTOR SERASA RUMAH: VINYL RECORD TURNTABLE & ACOUSTIC GUITAR ---
    // Wooden console table for audio
    const audioTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.0), new THREE.MeshStandardMaterial({ color: '#451A03', roughness: 0.4 }));
    audioTable.position.set(36, 0.55, 14);
    scene.add(audioTable);

    // Vinyl Record Turntable with Black LP Disc
    const turntable = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.8 }));
    turntable.position.set(36, 1.2, 14);
    scene.add(turntable);

    const vinylLP = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), new THREE.MeshStandardMaterial({ color: '#09090B', roughness: 0.1, metalness: 0.9 }));
    vinylLP.position.set(36, 1.32, 14);
    scene.add(vinylLP);

    const tonearm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.95 }));
    tonearm.position.set(36.35, 1.34, 14.15);
    tonearm.rotation.y = 0.5;
    scene.add(tonearm);

    // Crate of Classic Vinyl Albums
    const albumCrate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.6 }));
    albumCrate.position.set(34.8, 0.2, 14);
    scene.add(albumCrate);

    // Acoustic Guitar on Metal A-Frame Floor Stand
    const guitarGroup = new THREE.Group();
    const gBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.2, 16), new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.3 }));
    gBody.position.y = 0.7;
    gBody.rotation.x = Math.PI / 2;
    guitarGroup.add(gBody);

    const gNeck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: '#78350F' }));
    gNeck.position.set(0, 1.3, 0);
    guitarGroup.add(gNeck);

    const gStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.9 }));
    gStand.position.set(0, 0.4, -0.15);
    guitarGroup.add(gStand);

    guitarGroup.position.set(34.6, 0, 12);
    guitarGroup.rotation.y = 0.4;
    scene.add(guitarGroup);

    // =========================================================================
    // LANTAI 2: TEPAT 2 RUANGAN AJA (EXECUTIVE MEZZANINE LEVEL)
    // =========================================================================

    // RUANG 1: EXECUTIVE SUITE CEO (Alex Morgan)
    const ceoFloor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), new THREE.MeshStandardMaterial({ color: '#DBEAFE', roughness: 0.3 }));
    ceoFloor.rotation.x = -Math.PI / 2;
    ceoFloor.position.set(-15, 7.44, -4);
    scene.add(ceoFloor);
    createSimsPartitionWallWithDoor(scene, -15, 7.4, -11.0, 18, 0, 0, 0.15, 2.8, 'RUANG 1: EXECUTIVE SUITE CEO (ALEX)', '#2563EB', '#BFDBFE');
    createSimsPartitionWallWithDoor(scene, -6, 7.4, -4, 14, 4.0, 0, 0.15, 2.8, '', '#2563EB');
    buildSimsWorkstation(scene, -15, 7.4, -4, '#78350F', '#3B82F6', '#6366F1', 'agent_alex');

    // Trophy Shelf
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.9 }));
    trophy.position.set(-15, 9.4, -10.8);
    scene.add(trophy);

    // Classic Brass Banker's Lamp in CEO suite
    const bLamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), new THREE.MeshStandardMaterial({ color: '#15803D', metalness: 0.8 }));
    bLamp.position.set(-16.2, 8.5, -4.2);
    scene.add(bLamp);

    // RUANG 2: AI INTELLIGENCE & QUANTUM RESEARCH LAB (Dr. Maya Chen)
    const aiLabFloor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), new THREE.MeshStandardMaterial({ color: '#D1FAE5', roughness: 0.3 }));
    aiLabFloor.rotation.x = -Math.PI / 2;
    aiLabFloor.position.set(15, 7.44, -4);
    scene.add(aiLabFloor);
    createSimsPartitionWallWithDoor(scene, 15, 7.4, -11.0, 18, 0, 0, 0.15, 2.8, 'RUANG 2: AI QUANTUM LAB (DR. MAYA)', '#10B981', '#A7F3D0');
    createSimsPartitionWallWithDoor(scene, 6, 7.4, -4, 14, 4.0, 0, 0.15, 2.8, '', '#10B981');
    buildSimsWorkstation(scene, 15, 7.4, -4, '#B45309', '#10B981', '#06B6D4', 'agent_maya');

    // Holographic Quantum Core Orb in AI Lab
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    orb.position.set(21, 9.0, -4);
    scene.add(orb);
    quantumOrbRef.current = orb;

    const qRings: THREE.Mesh[] = [];
    [1.3, 1.7].forEach((rad, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rad, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({ color: idx === 0 ? '#00F0FF' : '#A855F7' })
      );
      ring.position.set(21, 9.0, -4);
      scene.add(ring);
      qRings.push(ring);
    });
    quantumRingsRef.current = qRings;

    // =========================================================================
    // OUTDOOR: THE SIMS GARDEN & YARD
    // =========================================================================
    const gardenGroup = new THREE.Group();

    const grassMat = new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.8, metalness: 0.02 });
    const grassLawn = new THREE.Mesh(new THREE.BoxGeometry(50, 0.5, 32), grassMat);
    grassLawn.position.set(-27, -0.25, 36);
    grassLawn.receiveShadow = true;
    gardenGroup.add(grassLawn);

    const stoneMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.7 });
    for (let sz = 22; sz <= 50; sz += 2.8) {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.1, 8), stoneMat);
      stone.position.set(-26 + Math.sin(sz * 0.35) * 2.8, 0.06, sz);
      stone.receiveShadow = true;
      gardenGroup.add(stone);
    }

    // Grand Tiered Water Fountain in Garden Center
    const fountainBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.0, 4.2, 0.7, 24),
      new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4 })
    );
    fountainBase.position.set(-26, 0.35, 36);
    gardenGroup.add(fountainBase);

    const fountainWaterPool = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.6, 0.45, 24),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.1, transparent: true, opacity: 0.85 })
    );
    fountainWaterPool.position.set(-26, 0.5, 36);
    gardenGroup.add(fountainWaterPool);

    const fDrops: THREE.Mesh[] = [];
    const waterDropMat = new THREE.MeshBasicMaterial({ color: '#7DD3FC' });
    for (let f = 0; f < 10; f++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), waterDropMat);
      drop.position.set(-26 + Math.cos(f * 0.6) * 0.7, 1.3, 36 + Math.sin(f * 0.6) * 0.7);
      gardenGroup.add(drop);
      fDrops.push(drop);
    }
    fountainDropletsRef.current = fDrops;

    // Stylized Trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.7 });
    [
      { x: -46, z: 24 },
      { x: -46, z: 42 },
      { x: -6, z: 46 },
      { x: -6, z: 26 },
      { x: -38, z: 48 }
    ].forEach((tp) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 4.2), trunkMat);
      trunk.position.set(tp.x, 2.1, tp.z);
      gardenGroup.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8), foliageMat);
      crown.position.set(tp.x, 5.0, tp.z);
      gardenGroup.add(crown);
    });

    // Flower Beds
    const flowerColors = ['#EF4444', '#EC4899', '#FACC15', '#A855F7'];
    for (let fl = 0; fl < 16; fl++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 6, 6),
        new THREE.MeshStandardMaterial({ color: flowerColors[fl % flowerColors.length], roughness: 0.5 })
      );
      flower.position.set(-36 + Math.sin(fl) * 4.0, 0.35, 34 + Math.cos(fl) * 3.5);
      gardenGroup.add(flower);
    }

    // Sprinkler Stand & Droplets
    const sprinklerStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.7, 8), new THREE.MeshStandardMaterial({ color: '#64748B' }));
    sprinklerStand.position.set(-34, 0.35, 32);
    gardenGroup.add(sprinklerStand);

    const sDrops: THREE.Mesh[] = [];
    const waterSprayMat = new THREE.MeshBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0.75 });
    for (let wp = 0; wp < 12; wp++) {
      const angle = (wp / 12) * Math.PI * 2;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), waterSprayMat);
      drop.position.set(-34 + Math.cos(angle) * 2.2, 0.9 + Math.sin(wp) * 0.4, 32 + Math.sin(angle) * 2.2);
      gardenGroup.add(drop);
      sDrops.push(drop);
    }
    sprinklerDropletsRef.current = sDrops;

    // Wooden Garden Benches
    const benchWoodMat = new THREE.MeshStandardMaterial({ color: '#92400E', roughness: 0.5 });
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 1.2), benchWoodMat);
    benchSeat.position.set(-18, 0.55, 40);
    gardenGroup.add(benchSeat);

    // --- KANTOR SERASA RUMAH: OUTDOOR BBQ GRILL & PATIO PICNIC AREA ---
    // Stainless Steel & Black BBQ Grill Station
    const bbqGroup = new THREE.Group();
    const bbqBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.9), new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.85, roughness: 0.3 }));
    bbqBase.position.y = 0.6;
    bbqGroup.add(bbqBase);

    const bbqHood = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 16, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.9, roughness: 0.2 }));
    bbqHood.rotation.z = Math.PI / 2;
    bbqHood.position.set(0, 1.2, 0);
    bbqGroup.add(bbqHood);

    // Chimney & Animated Smoke Drops
    const bbqChimney = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: '#0F172A' }));
    bbqChimney.position.set(-0.4, 1.6, 0);
    bbqGroup.add(bbqChimney);

    bbqGroup.position.set(-12, 0, 36);
    gardenGroup.add(bbqGroup);

    // Wooden Outdoor Picnic Dining Table & Benches
    const picnicTable = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 }));
    picnicTable.position.set(-12, 0.82, 40);
    gardenGroup.add(picnicTable);

    [[-1.4, 39], [1.4, 39], [-1.4, 41], [1.4, 41]].forEach(([px, pz]) => {
      const pLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.82), new THREE.MeshStandardMaterial({ color: '#451A03' }));
      pLeg.position.set(px, 0.41, pz);
      gardenGroup.add(pLeg);
    });

    [-1.2, 1.2].forEach((bz) => {
      const pBench = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 }));
      pBench.position.set(-12, 0.48, 40 + bz);
      gardenGroup.add(pBench);
    });

    // Sun Patio Umbrella over Picnic Table
    const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2), new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.8 }));
    umbrellaPole.position.set(-12, 1.6, 40);
    gardenGroup.add(umbrellaPole);

    const umbrellaCanopy = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.9, 16), new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.4 }));
    umbrellaCanopy.position.set(-12, 3.2, 40);
    gardenGroup.add(umbrellaCanopy);

    scene.add(gardenGroup);

    // =========================================================================
    // OUTDOOR: GARASI MOBIL GANDA & CARPORT DENGAN SEDAN, SUV & EV STATION
    // =========================================================================
    const garageGroup = new THREE.Group();
    const asphaltMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.65, metalness: 0.1 });
    const garageGround = new THREE.Mesh(new THREE.BoxGeometry(40, 0.5, 32), asphaltMat);
    garageGround.position.set(27, -0.25, 36);
    garageGround.receiveShadow = true;
    garageGroup.add(garageGround);

    const lineMat = new THREE.MeshBasicMaterial({ color: '#F8FAFC' });
    [14, 26, 38].forEach((lx) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 16), lineMat);
      line.position.set(lx, 0.02, 34);
      garageGroup.add(line);
    });

    const carportSteelMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.85, roughness: 0.2 });
    [
      { x: 10, z: 24 },
      { x: 44, z: 24 },
      { x: 10, z: 46 },
      { x: 44, z: 46 }
    ].forEach((cp) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.8, 0.4), carportSteelMat);
      post.position.set(cp.x, 2.9, cp.z);
      post.castShadow = true;
      garageGroup.add(post);
    });

    const canopyRoof = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: '#0F172A', transparent: true, opacity: 0.88, metalness: 0.5 })
    );
    canopyRoof.position.set(27, 5.8, 35);
    garageGroup.add(canopyRoof);

    // CAR 1: LUXURY EXECUTIVE SEDAN (Metallic Cobalt Blue)
    const car1Group = new THREE.Group();
    const car1Body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.25, 8.8), new THREE.MeshStandardMaterial({ color: '#1D4ED8', metalness: 0.85, roughness: 0.2 }));
    car1Body.position.y = 0.9;
    car1Body.castShadow = true;
    car1Group.add(car1Body);

    const car1Cabin = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.95, 4.4), new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.1 }));
    car1Cabin.position.set(0, 1.85, -0.4);
    car1Group.add(car1Cabin);

    const headLight = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 0.1), new THREE.MeshBasicMaterial({ color: '#F8FAFC' }));
    headLight.position.set(0, 0.9, 4.41);
    car1Group.add(headLight);

    car1Group.position.set(20, 0, 34);
    garageGroup.add(car1Group);

    // CAR 2: ELECTRIC SUV (Alpine White)
    const car2Group = new THREE.Group();
    const car2Body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.5, 9.2), new THREE.MeshStandardMaterial({ color: '#F8FAFC', metalness: 0.5, roughness: 0.25 }));
    car2Body.position.y = 1.05;
    car2Body.castShadow = true;
    car2Group.add(car2Body);

    const car2Cabin = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.15, 5.2), new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.1 }));
    car2Cabin.position.set(0, 2.15, -0.2);
    car2Group.add(car2Cabin);

    car2Group.position.set(32, 0, 34);
    garageGroup.add(car2Group);

    // EV CHARGING STATION
    const evStation = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 0.8), new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.8 }));
    evStation.position.set(42, 1.3, 28);
    garageGroup.add(evStation);

    const evScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), new THREE.MeshBasicMaterial({ color: '#22C55E' }));
    evScreen.position.set(42, 1.8, 28.41);
    garageGroup.add(evScreen);

    scene.add(garageGroup);
  };

  // Build The Sims Characters (NO eyes, NO mouth, Distinct Hair & Clothing, Plumbob)
  const buildTheSimsCharacters = (scene: THREE.Scene) => {
    agentsMapRef.current.clear();

    agents.forEach((agent, index) => {
      const group = new THREE.Group();

      const skinMat = new THREE.MeshStandardMaterial({ 
        color: '#FDE68A', 
        roughness: 0.38,
        metalness: 0.02
      });

      // HEAD: Clean stylized sculpt head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 24), skinMat);
      head.position.y = 1.58;
      head.castShadow = true;
      group.add(head);

      const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.12), skinMat);
      noseBridge.position.set(0, 1.54, 0.44);
      group.add(noseBridge);

      // Stylized Expressive Facial Features (Eyes, Catchlights, Eyebrows)
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const pupilMat = new THREE.MeshBasicMaterial({ color: '#0F172A' });
      const eyeCatchlightMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const browMat = new THREE.MeshBasicMaterial({ color: '#1E293B' });

      [-0.14, 0.14].forEach((ex) => {
        // Eye Sclera (White)
        const eyeWhite = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.08), eyeWhiteMat);
        eyeWhite.position.set(ex, 1.6, 0.435);
        eyeWhite.rotation.y = ex > 0 ? 0.08 : -0.08;
        group.add(eyeWhite);

        // Dark Focused Pupil
        const pupil = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), pupilMat);
        pupil.position.set(ex, 1.6, 0.438);
        group.add(pupil);

        // Specular Catchlight (Gives lively human sparkle!)
        const catchlight = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.022), eyeCatchlightMat);
        catchlight.position.set(ex + 0.015, 1.615, 0.441);
        group.add(catchlight);

        // Eyebrows
        const brow = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.025), browMat);
        brow.position.set(ex, 1.68, 0.432);
        brow.rotation.z = ex > 0 ? -0.06 : 0.06;
        group.add(brow);
      });

      // Gentle smile mouth curve
      const mouth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 0.022), 
        new THREE.MeshBasicMaterial({ color: '#E11D48' })
      );
      mouth.position.set(0, 1.44, 0.43);
      group.add(mouth);

      // Over-Ear Studio Headphones worn around the neck
      const hpMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.35, metalness: 0.6 });
      const hpRingMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9, roughness: 0.1 });
      const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 24, Math.PI), hpMat);
      hpBand.position.set(0, 1.28, -0.04);
      hpBand.rotation.x = Math.PI / 2;
      group.add(hpBand);

      [-0.32, 0.32].forEach((hx) => {
        const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16), hpMat);
        earcup.position.set(hx, 1.28, 0.04);
        earcup.rotation.z = Math.PI / 2;
        group.add(earcup);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 16), hpRingMat);
        ring.position.set(hx > 0 ? hx + 0.045 : hx - 0.045, 1.28, 0.04);
        ring.rotation.y = Math.PI / 2;
        group.add(ring);
      });

      // Company Employee ID Card & Lanyard Ribbon
      const lanyardMat = new THREE.MeshStandardMaterial({ color: agent.color || '#3B82F6', roughness: 0.5 });
      const lLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.48), lanyardMat);
      lLeft.position.set(-0.1, 1.15, 0.22);
      lLeft.rotation.z = -0.2;
      group.add(lLeft);

      const lRight = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.48), lanyardMat);
      lRight.position.set(0.1, 1.15, 0.22);
      lRight.rotation.z = 0.2;
      group.add(lRight);

      const badgeHolder = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.24, 0.02),
        new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.8 })
      );
      badgeHolder.position.set(0, 0.92, 0.23);
      group.add(badgeHolder);

      const badgeCard = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.2),
        new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
      );
      badgeCard.position.set(0, 0.92, 0.242);
      group.add(badgeCard);

      const badgePhoto = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 0.08),
        new THREE.MeshBasicMaterial({ color: agent.color || '#2563EB' })
      );
      badgePhoto.position.set(0, 0.96, 0.244);
      group.add(badgePhoto);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3), skinMat);
      neck.position.y = 1.26;
      group.add(neck);

      // The Sims Floating Plumbob Crystal
      let plumbobColor = '#22C55E';
      let plumbobEmissive = '#15803D';
      if (agent.id === 'agent_alex') {
        plumbobColor = '#F59E0B';
        plumbobEmissive = '#B45309';
      } else if (agent.id === 'agent_maya') {
        plumbobColor = '#06B6D4';
        plumbobEmissive = '#0891B2';
      } else if (agent.id === 'agent_elena') {
        plumbobColor = '#EC4899';
        plumbobEmissive = '#BE185D';
      }

      const plumbobGeo = new THREE.OctahedronGeometry(0.32, 0);
      plumbobGeo.scale(0.85, 1.9, 0.85);
      const plumbobMat = new THREE.MeshStandardMaterial({
        color: plumbobColor,
        emissive: plumbobEmissive,
        emissiveIntensity: plumbobGlow ? 0.65 : 0.25,
        roughness: 0.15,
        metalness: 0.2,
        transparent: true,
        opacity: 0.94
      });
      const plumbob = new THREE.Mesh(plumbobGeo, plumbobMat);
      plumbob.position.set(0, 2.45, 0);
      group.add(plumbob);

      // Distinct Hairstyles & Accessories
      const hairGroup = new THREE.Group();

      switch (agent.id) {
        case 'agent_alex': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#1C1917', roughness: 0.7 });
          const mainHair = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          mainHair.position.set(0, 1.76, -0.04);
          mainHair.scale.set(1.04, 0.82, 1.05);
          hairGroup.add(mainHair);

          const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.5), hairMat);
          quiff.position.set(0.04, 1.94, 0.15);
          quiff.rotation.x = -0.2;
          hairGroup.add(quiff);
          break;
        }

        case 'agent_maya': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#0A0A0A', roughness: 0.4 });
          const bobCrown = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          bobCrown.position.set(0, 1.74, -0.04);
          bobCrown.scale.set(1.06, 0.85, 1.1);
          hairGroup.add(bobCrown);

          const bobLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.45), hairMat);
          bobLeft.position.set(-0.42, 1.48, 0.05);
          hairGroup.add(bobLeft);

          const bobRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.45), hairMat);
          bobRight.position.set(0.42, 1.48, 0.05);
          hairGroup.add(bobRight);

          const glassesMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.9, roughness: 0.2 });
          const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.14), glassesMat);
          glasses.position.set(0, 1.6, 0.42);
          hairGroup.add(glasses);
          break;
        }

        case 'agent_elena': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.8 });
          const curls = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 18), hairMat);
          curls.position.set(0, 1.7, -0.05);
          curls.scale.set(1.1, 0.85, 1.15);
          hairGroup.add(curls);

          [-0.38, 0.38].forEach((hx) => {
            const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7), hairMat);
            lock.position.set(hx, 1.35, 0.08);
            hairGroup.add(lock);
          });

          const beretMat = new THREE.MeshStandardMaterial({ color: '#DB2777', roughness: 0.5 });
          const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 0.22, 18), beretMat);
          beret.position.set(0.08, 1.95, -0.02);
          beret.rotation.z = -0.22;
          hairGroup.add(beret);

          const beretStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12), beretMat);
          beretStem.position.set(0.1, 2.08, -0.02);
          hairGroup.add(beretStem);
          break;
        }

        case 'agent_david': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.7 });
          const crop = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          crop.position.set(0, 1.75, -0.05);
          crop.scale.set(1.02, 0.8, 1.05);
          hairGroup.add(crop);

          const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.3), hairMat);
          fringe.position.set(0, 1.88, 0.2);
          hairGroup.add(fringe);
          break;
        }

        case 'agent_kenji': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.6 });
          const sidePart = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          sidePart.position.set(0, 1.74, -0.04);
          sidePart.scale.set(1.05, 0.78, 1.08);
          hairGroup.add(sidePart);

          const partSlope = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.35), hairMat);
          partSlope.position.set(0.12, 1.86, 0.16);
          partSlope.rotation.z = -0.15;
          hairGroup.add(partSlope);
          break;
        }

        case 'agent_sarah': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.7 });
          const crown = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          crown.position.set(0, 1.74, -0.06);
          crown.scale.set(1.04, 0.85, 1.08);
          hairGroup.add(crown);

          const scrunchie = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.06, 8, 16), new THREE.MeshStandardMaterial({ color: '#0D9488' }));
          scrunchie.position.set(0, 1.88, -0.42);
          hairGroup.add(scrunchie);

          const ponyTail = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.7), hairMat);
          ponyTail.position.set(0, 1.55, -0.52);
          ponyTail.rotation.x = -0.28;
          hairGroup.add(ponyTail);
          break;
        }

        case 'agent_liam': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 });
          const spikes = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          spikes.position.set(0, 1.75, -0.04);
          spikes.scale.set(1.06, 0.85, 1.1);
          hairGroup.add(spikes);

          const spikeTop = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.35, 6), hairMat);
          spikeTop.position.set(0, 1.98, 0.05);
          hairGroup.add(spikeTop);

          const hpMat = new THREE.MeshStandardMaterial({ color: '#06B6D4', metalness: 0.8 });
          const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 8, 20), hpMat);
          hpBand.position.set(0, 1.25, 0.05);
          hpBand.rotation.x = Math.PI / 2;
          hairGroup.add(hpBand);

          [-0.34, 0.34].forEach((hx) => {
            const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12), new THREE.MeshBasicMaterial({ color: '#00F0FF' }));
            earcup.position.set(hx, 1.25, 0.05);
            earcup.rotation.z = Math.PI / 2;
            hairGroup.add(earcup);
          });
          break;
        }

        case 'agent_nadia': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.6 });
          const lobCrown = new THREE.Mesh(new THREE.SphereGeometry(0.49, 18, 18), hairMat);
          lobCrown.position.set(0, 1.74, -0.05);
          lobCrown.scale.set(1.05, 0.84, 1.1);
          hairGroup.add(lobCrown);

          [-0.38, 0.38].forEach((lx) => {
            const strand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.35), hairMat);
            strand.position.set(lx, 1.4, 0.08);
            hairGroup.add(strand);
          });
          break;
        }

        case 'agent_marcus': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.7 });
          const crop = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          crop.position.set(0, 1.74, -0.04);
          crop.scale.set(1.04, 0.8, 1.06);
          hairGroup.add(crop);

          const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.95 }));
          watch.position.set(0.48, 0.8, 0.1);
          group.add(watch);
          break;
        }

        case 'agent_priya': {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#18181B', roughness: 0.5 });
          const sleekCrown = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), hairMat);
          sleekCrown.position.set(0, 1.74, -0.04);
          sleekCrown.scale.set(1.05, 0.84, 1.08);
          hairGroup.add(sleekCrown);

          const chignon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), hairMat);
          chignon.position.set(0, 1.62, -0.44);
          hairGroup.add(chignon);

          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.95 }));
          pin.position.set(0, 1.62, -0.44);
          pin.rotation.z = Math.PI / 4;
          hairGroup.add(pin);
          break;
        }

        default: {
          const hairMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });
          const defHair = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), hairMat);
          defHair.position.set(0, 1.72, -0.04);
          hairGroup.add(defHair);
          break;
        }
      }

      group.add(hairGroup);

      // Multi-Layered The Sims Clothing
      let torsoColor = agent.color;
      let pantsColor = '#1E293B';
      let shoesColor = '#0F172A';

      if (agent.id === 'agent_alex') {
        torsoColor = '#1E3A8A';
        pantsColor = '#172554';
        shoesColor = '#09090B';
      } else if (agent.id === 'agent_maya') {
        torsoColor = '#F8FAFC';
        pantsColor = '#0F172A';
        shoesColor = '#FFFFFF';
      } else if (agent.id === 'agent_elena') {
        torsoColor = '#DB2777';
        pantsColor = '#18181B';
        shoesColor = '#451A03';
      } else if (agent.id === 'agent_david') {
        torsoColor = '#4338CA';
        pantsColor = '#1E293B';
        shoesColor = '#F1F5F9';
      } else if (agent.id === 'agent_kenji') {
        torsoColor = '#334155';
        pantsColor = '#0F172A';
        shoesColor = '#78350F';
      } else if (agent.id === 'agent_sarah') {
        torsoColor = '#F87171';
        pantsColor = '#475569';
        shoesColor = '#FDE68A';
      } else if (agent.id === 'agent_liam') {
        torsoColor = '#0F172A';
        pantsColor = '#1E293B';
        shoesColor = '#06B6D4';
      } else if (agent.id === 'agent_nadia') {
        torsoColor = '#4D7C0F';
        pantsColor = '#FEF3C7';
        shoesColor = '#B45309';
      } else if (agent.id === 'agent_marcus') {
        torsoColor = '#475569';
        pantsColor = '#1E293B';
        shoesColor = '#450A0A';
      } else if (agent.id === 'agent_priya') {
        torsoColor = '#312E81';
        pantsColor = '#0F172A';
        shoesColor = '#000000';
      }

      const suitMat = new THREE.MeshStandardMaterial({ color: torsoColor, roughness: 0.35 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.65 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.4 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.86, 0.44), suitMat);
      body.position.y = 0.98;
      body.castShadow = true;
      group.add(body);

      const shirtMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
      const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.08), shirtMat);
      innerShirt.position.set(0, 1.25, 0.21);
      group.add(innerShirt);

      if (agent.id === 'agent_alex') {
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.06), new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.2 }));
        tie.position.set(0, 1.08, 0.24);
        group.add(tie);
      } else if (agent.id === 'agent_kenji') {
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.06), new THREE.MeshStandardMaterial({ color: '#09090B' }));
        tie.position.set(0, 1.1, 0.24);
        group.add(tie);
      } else if (agent.id === 'agent_marcus') {
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.06), new THREE.MeshStandardMaterial({ color: '#991B1B' }));
        tie.position.set(0, 1.1, 0.24);
        group.add(tie);
      } else if (agent.id === 'agent_maya') {
        const badge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.05), new THREE.MeshBasicMaterial({ color: '#06B6D4' }));
        badge.position.set(0.18, 0.95, 0.24);
        group.add(badge);
      }

      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.1, 0.46), new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.4 }));
      belt.position.y = 0.58;
      group.add(belt);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.9 }));
      buckle.position.set(0, 0.58, 0.24);
      group.add(buckle);

      const legGeo = new THREE.BoxGeometry(0.24, 0.68, 0.24);

      const legL = new THREE.Mesh(legGeo, pantsMat);
      legL.position.set(-0.2, 0.34, 0);
      legL.castShadow = true;
      group.add(legL);

      const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.38), shoeMat);
      shoeL.position.set(-0.2, 0.08, 0.06);
      shoeL.castShadow = true;
      group.add(shoeL);

      const legR = new THREE.Mesh(legGeo, pantsMat);
      legR.position.set(0.2, 0.34, 0);
      legR.castShadow = true;
      group.add(legR);

      const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.38), shoeMat);
      shoeR.position.set(0.2, 0.08, 0.06);
      shoeR.castShadow = true;
      group.add(shoeR);

      const armGeo = new THREE.BoxGeometry(0.18, 0.62, 0.22);
      const armL = new THREE.Mesh(armGeo, suitMat);
      armL.position.set(-0.46, 0.95, 0);
      group.add(armL);

      const armR = new THREE.Mesh(armGeo, suitMat);
      armR.position.set(0.46, 0.95, 0);
      group.add(armR);

      const handGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const handL = new THREE.Mesh(handGeo, skinMat);
      handL.position.set(-0.46, 0.6, 0);
      group.add(handL);

      const handR = new THREE.Mesh(handGeo, skinMat);
      handR.position.set(0.46, 0.6, 0);
      group.add(handR);

      group.scale.set(1.4, 1.4, 1.4);

      const deskVec = getDeskVector(agent.id);
      group.position.copy(deskVec);
      scene.add(group);

      const initialDelay = 5000 + index * 3500;
      const initialEmoji = getAgentInitialThoughtEmoji(agent.id);

      agentsMapRef.current.set(agent.id, {
        id: agent.id,
        group,
        plumbob,
        head,
        body,
        legL,
        legR,
        armL,
        armR,
        handL,
        handR,
        hairGroup,
        currentPos: deskVec.clone(),
        targetPos: deskVec.clone(),
        pathQueue: [],
        isWalking: false,
        isTyping: true,
        deskVector: deskVec.clone(),
        speechText: agent.currentAction || 'Bekerja Aktif di Meja 💻',
        thoughtEmoji: initialEmoji,
        nextScheduleTime: Date.now() + initialDelay,
        currentActivity: 'working_desk'
      });
    });
  };

  const getAgentInitialThoughtEmoji = (id: string): string => {
    switch (id) {
      case 'agent_alex': return '💭👑';
      case 'agent_maya': return '💭🔬';
      case 'agent_elena': return '💭🎨';
      case 'agent_david': return '💭💻';
      case 'agent_kenji': return '💭✅';
      case 'agent_sarah': return '💭📈';
      case 'agent_liam': return '💭⚡';
      case 'agent_nadia': return '💭📱';
      case 'agent_marcus': return '💭💰';
      case 'agent_priya': return '💭⚖️';
      default: return '💭✨';
    }
  };

  const getDeskVector = (agentId: string): THREE.Vector3 => {
    switch (agentId) {
      case 'agent_alex': return WAYPOINTS.alexDesk.clone();
      case 'agent_maya': return WAYPOINTS.mayaDesk.clone();
      case 'agent_david': return WAYPOINTS.davidDesk.clone();
      case 'agent_kenji': return WAYPOINTS.kenjiDesk.clone();
      case 'agent_liam': return WAYPOINTS.liamDesk.clone();
      case 'agent_sarah': return WAYPOINTS.sarahDesk.clone();
      case 'agent_elena': return WAYPOINTS.elenaDesk.clone();
      case 'agent_nadia': return WAYPOINTS.nadiaDesk.clone();
      case 'agent_marcus': return WAYPOINTS.marcusDesk.clone();
      case 'agent_priya': return WAYPOINTS.priyaDesk.clone();
      default: return WAYPOINTS.davidDesk.clone();
    }
  };

  // Autonomous Roaming AI: Wanders through rooms using collision-free corridors
  const tickAutonomousScheduler = (instance: Agent3DInstance, now: number) => {
    if (now < instance.nextScheduleTime) return;
    if (instance.isWalking) return;

    if (instance.currentActivity !== 'working_desk') {
      instance.currentActivity = 'working_desk';
      navigateAgentCollisionFree(instance.id, instance.deskVector, 'Kembali ke meja: Lanjut analisis data di komputer 💻', '💭💻');
      instance.nextScheduleTime = now + 14000 + Math.random() * 14000;
      return;
    }

    const possibleDestinations: Array<{ waypoint: THREE.Vector3; speech: string; emoji: string; activity: Agent3DInstance['currentActivity'] }> = [
      { waypoint: WAYPOINTS.cafeCoffeeMachine, speech: 'Menyeduh kopi espresso di pantry ☕', emoji: '💭☕', activity: 'visiting_cafe' },
      { waypoint: WAYPOINTS.cafeWaterDispenser, speech: 'Mengambil air dingin di galon dispenser 💧', emoji: '💭💧', activity: 'visiting_cafe' },
      { waypoint: WAYPOINTS.cafeDiningTable, speech: 'Makan snack & ngobrol hangat di meja makan keluarga 🍲', emoji: '💭🍲', activity: 'visiting_cafe' },
      { waypoint: WAYPOINTS.cafeLaundry, speech: 'Mengecek cucian handuk bersih di laundry kantor 🧺', emoji: '💭🧺', activity: 'visiting_cafe' },
      { waypoint: WAYPOINTS.gameFoosball, speech: 'Bermain foosball seru di lounge game ⚽', emoji: '💭⚽', activity: 'roaming' },
      { waypoint: WAYPOINTS.gameVending, speech: 'Membeli minuman dingin di vending machine 🥤', emoji: '💭🥤', activity: 'roaming' },
      { waypoint: WAYPOINTS.loungeNapPod, speech: 'Rebahan santai sejenak di nap pod / daybed empuk 🛏️', emoji: '💭🛏️', activity: 'roaming' },
      { waypoint: WAYPOINTS.loungeVinylMusic, speech: 'Memutar piringan hitam vinyl & petik gitar akustik 🎵', emoji: '💭🎵', activity: 'roaming' },
      { waypoint: WAYPOINTS.lobbyPetCatStation, speech: 'Mengelus kucing maskot kantor di pet bed 🐱', emoji: '💭🐱', activity: 'roaming' },
      { waypoint: WAYPOINTS.printStation, speech: 'Mencetak dokumen & arsip di printer kantor 🖨️', emoji: '💭🖨️', activity: 'roaming' },
      { waypoint: WAYPOINTS.restroomSink, speech: 'Mencuci tangan & merapikan pakaian di restroom 🚻', emoji: '💭🚻', activity: 'roaming' },
      { waypoint: WAYPOINTS.meetingTable, speech: 'Mengecek slide presentasi di ruang rapat 📊', emoji: '💭📊', activity: 'meeting' },
      { waypoint: WAYPOINTS.waitingSofa, speech: 'Menunggu brief kerja di sofa lobi 🛋️', emoji: '💭🛋️', activity: 'roaming' },
      { waypoint: WAYPOINTS.gardenFountain, speech: 'Jalan santai ke taman: Menikmati air mancur 🌱', emoji: '💭⛲', activity: 'visiting_garden' },
      { waypoint: WAYPOINTS.gardenBench, speech: 'Menghirup udara segar di bangku taman 🌸', emoji: '💭🌸', activity: 'visiting_garden' },
      { waypoint: WAYPOINTS.gardenBBQ, speech: 'Cek panggangan BBQ patio taman bersama tim 🍖', emoji: '💭🍖', activity: 'visiting_garden' },
      { waypoint: WAYPOINTS.garageEVCharger, speech: 'Cek level baterai armada mobil listrik di garasi 🚗', emoji: '💭⚡', activity: 'roaming' }
    ];

    if (instance.id !== 'agent_elena') {
      possibleDestinations.push({ waypoint: WAYPOINTS.elenaDesk, speech: 'Konsultasi desain visual ke studio Elena 🎨', emoji: '💭🎨', activity: 'collaborating' });
    }
    if (instance.id !== 'agent_david') {
      possibleDestinations.push({ waypoint: WAYPOINTS.davidDesk, speech: 'Membahas arsitektur microservices dengan David 💻', emoji: '💭💾', activity: 'collaborating' });
    }
    if (instance.id !== 'agent_maya') {
      possibleDestinations.push({ waypoint: WAYPOINTS.quantumOrb, speech: 'Melihat simulasi Quantum Core di Lab AI Dr. Maya 🔬', emoji: '💭⚛️', activity: 'collaborating' });
    }
    if (instance.id !== 'agent_alex') {
      possibleDestinations.push({ waypoint: WAYPOINTS.alexDesk, speech: 'Melaporkan progres kerja ke Executive Suite CEO Alex 👑', emoji: '💭💼', activity: 'collaborating' });
    }

    const picked = possibleDestinations[Math.floor(Math.random() * possibleDestinations.length)];
    instance.currentActivity = picked.activity;
    navigateAgentCollisionFree(instance.id, picked.waypoint, picked.speech, picked.emoji);

    instance.nextScheduleTime = now + 12000 + Math.random() * 12000;
  };

  // Step Animation & Movement along Path Waypoints
  const updateAgentMovement = (instance: Agent3DInstance, delta: number, elapsed: number) => {
    const { group, currentPos, targetPos, legL, legR, armL, armR, pathQueue } = instance;
    const dist = currentPos.distanceTo(targetPos);

    if (dist > 0.08) {
      instance.isWalking = true;
      instance.isTyping = false;

      const speed = 5.4 * delta;
      const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
      currentPos.addScaledVector(dir, Math.min(speed, dist));
      group.position.copy(currentPos);

      const angle = Math.atan2(dir.x, dir.z);
      group.rotation.y = angle;

      const stepFreq = elapsed * 14;
      legL.rotation.x = Math.sin(stepFreq) * 0.75;
      legR.rotation.x = -Math.sin(stepFreq) * 0.75;
      armL.rotation.x = -Math.sin(stepFreq) * 0.65;
      armR.rotation.x = Math.sin(stepFreq) * 0.65;
      group.position.y = currentPos.y + Math.abs(Math.sin(stepFreq * 2)) * 0.1;
    } else {
      currentPos.copy(targetPos);
      group.position.copy(currentPos);

      if (pathQueue.length > 0) {
        instance.targetPos.copy(pathQueue.shift()!);
      } else {
        instance.isWalking = false;
        legL.rotation.x = 0;
        legR.rotation.x = 0;

        const atDesk = currentPos.distanceTo(instance.deskVector) < 1.0;
        if (atDesk) {
          instance.isTyping = true;
          const typeFreq = elapsed * 16;
          armL.rotation.x = -0.6 + Math.sin(typeFreq) * 0.14;
          armR.rotation.x = -0.6 + Math.cos(typeFreq) * 0.14;
          if (instance.handL && instance.handR) {
            instance.handL.position.y = 0.6 + Math.sin(typeFreq) * 0.035;
            instance.handR.position.y = 0.6 + Math.cos(typeFreq) * 0.035;
          }
          instance.head.rotation.x = 0.14 + Math.sin(elapsed * 2) * 0.03;
          group.rotation.y = 0; // Face forward towards monitors and keyboard
          group.position.y = currentPos.y;
        } else {
          instance.isTyping = false;
          armL.rotation.x = Math.sin(elapsed * 2) * 0.1;
          armR.rotation.x = -Math.sin(elapsed * 2) * 0.1;
          if (instance.handL && instance.handR) {
            instance.handL.position.y = 0.6;
            instance.handR.position.y = 0.6;
          }
          instance.head.rotation.x = 0;
          instance.head.rotation.y = Math.sin(elapsed * 1.5) * 0.2;
          group.position.y = currentPos.y;
        }
      }
    }
  };

  // Collision-Free Navigation through Hallways & Doorways (NO CLIPPING THROUGH WALLS)
  const navigateAgentCollisionFree = (agentId: string, dest: THREE.Vector3, speechText?: string, emoji?: string) => {
    const inst = agentsMapRef.current.get(agentId);
    if (!inst) return;
    if (speechText) {
      inst.speechText = speechText;
      inst.thoughtEmoji = emoji || '💭✨';
      inst.tempSpeechTimer = Date.now() + 6000;
    }

    const calculatedPath = findCollisionFreeCorridorPath(inst.currentPos, dest);
    inst.pathQueue = calculatedPath;
    if (inst.pathQueue.length > 0) {
      inst.targetPos.copy(inst.pathQueue.shift()!);
      inst.isWalking = true;
    }
  };

  const updateScreenBubbles = () => {
    if (!cameraRef.current || !containerRef.current) return;
    const camera = cameraRef.current;
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const newBubbles: Record<string, { x: number; y: number; text: string; emoji: string; visible: boolean }> = {};

    agentsMapRef.current.forEach((inst, id) => {
      const charPos = inst.currentPos.clone().add(new THREE.Vector3(0, 3.8, 0));
      charPos.project(camera);

      if (charPos.z < 1) {
        const sx = ((charPos.x + 1) * w) / 2;
        const sy = ((-charPos.y + 1) * h) / 2;

        newBubbles[id] = {
          x: sx,
          y: sy,
          text: inst.speechText,
          emoji: inst.thoughtEmoji || '💭✨',
          visible: true
        };
      }
    });

    setBubbles(newBubbles);
  };

  useEffect(() => {
    if (activeTask && activeTask.status === 'in_progress') {
      triggerTeamMeeting('Merapat ke ruang rapat untuk pengarahan tugas!');
    }
  }, [activeTask]);

  // Interactive Facility Commands (Navigates Without Clipping Walls)
  const triggerBrewCoffee = () => {
    navigateAgentCollisionFree('agent_david', WAYPOINTS.cafeCoffeeMachine, 'Menyeduh kopi espresso di mesin pantry ☕', '💭☕');
  };

  const triggerDispenserWater = () => {
    navigateAgentCollisionFree('agent_kenji', WAYPOINTS.cafeWaterDispenser, 'Mengambil segelas air segar di galon dispenser 💧', '💭💧');
  };

  const triggerPlayFoosball = () => {
    navigateAgentCollisionFree('agent_liam', WAYPOINTS.gameFoosball, 'Ajak main foosball di lounge rekreasi ⚽', '💭⚽');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_sarah', WAYPOINTS.gameFoosball, 'Tanding foosball lawan Liam! 🎮', '💭🎮');
    }, 400);
  };

  const triggerPrintDoc = () => {
    navigateAgentCollisionFree('agent_priya', WAYPOINTS.printStation, 'Mencetak berkas audit di mesin fotokopi & laser printer 🖨️', '💭🖨️');
  };

  const triggerRestroom = () => {
    navigateAgentCollisionFree('agent_nadia', WAYPOINTS.restroomSink, 'Mencuci tangan & merapikan diri di restroom 🚻', '💭🚻');
  };

  const triggerWaterGarden = (customSpeech?: string) => {
    navigateAgentCollisionFree('agent_elena', WAYPOINTS.gardenSprinkler, customSpeech || 'Menyiram kebun bunga & cek sprinkler 🌱', '💭🌱');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_sarah', WAYPOINTS.gardenFlowers, 'Memetik sampel bunga di kebun 🌸', '💭🌸');
    }, 400);
  };

  const triggerInspectGarage = (customSpeech?: string) => {
    navigateAgentCollisionFree('agent_liam', WAYPOINTS.garageEVCharger, customSpeech || 'Memeriksa daya stasiun charger EV & armada mobil 🚗', '💭⚡');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_marcus', WAYPOINTS.garageCar1, 'Inspeksi sedan dinas eksekutif 🚘', '💭🚗');
    }, 450);
  };

  const triggerTeamMeeting = (customSpeech?: string) => {
    navigateAgentCollisionFree('agent_alex', WAYPOINTS.meetingTable, customSpeech || 'Memimpin rapat strategis di boardroom 📊', '💭📊');
    setTimeout(() => navigateAgentCollisionFree('agent_maya', WAYPOINTS.meetingTable, 'Presentasi hasil riset data 🔬', '💭🔬'), 300);
    setTimeout(() => navigateAgentCollisionFree('agent_david', WAYPOINTS.meetingTable, 'Diskusi arsitektur backend 💻', '💭💻'), 600);
    setTimeout(() => navigateAgentCollisionFree('agent_elena', WAYPOINTS.meetingTable, 'Presentasi mockup visual UI 🎨', '💭🎨'), 900);
  };

  const triggerNapDaybed = () => {
    navigateAgentCollisionFree('agent_david', WAYPOINTS.loungeNapPod, 'Rebahan nyaman di nap daybed / kasur tidur siang 🛏️', '💭🛏️');
  };

  const triggerVinylMusic = () => {
    navigateAgentCollisionFree('agent_elena', WAYPOINTS.loungeVinylMusic, 'Memutar piringan hitam vinyl jazz & petik gitar 🎵', '💭🎵');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_liam', WAYPOINTS.loungeVinylMusic, 'Mendengarkan alunan musik santai di lounge 🎶', '💭🎶');
    }, 400);
  };

  const triggerDiningTogether = () => {
    navigateAgentCollisionFree('agent_marcus', WAYPOINTS.cafeDiningTable, 'Makan bersama tim di meja makan keluarga 🍲', '💭🍲');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_priya', WAYPOINTS.cafeDiningTable, 'Mencicipi buah segar & ngobrol hangat di meja makan 🍎', '💭🍎');
    }, 350);
  };

  const triggerPetCat = () => {
    navigateAgentCollisionFree('agent_sarah', WAYPOINTS.lobbyPetCatStation, 'Bermain dan mengelus kucing maskot kantor yang lucu 🐱', '💭🐱');
  };

  const triggerGardenBBQ = () => {
    navigateAgentCollisionFree('agent_kenji', WAYPOINTS.gardenBBQ, 'Memanggang sate & BBQ di patio kebun luar 🍖', '💭🍖');
    setTimeout(() => {
      navigateAgentCollisionFree('agent_nadia', WAYPOINTS.gardenBBQ, 'Duduk santai di bangku piknik menikmati aroma BBQ 🥩', '💭🥩');
    }, 450);
  };

  const triggerWorkAtComputers = () => {
    agentsMapRef.current.forEach((inst, id) => {
      navigateAgentCollisionFree(id, inst.deskVector, 'Kembali bekerja aktif di komputer workstation 💻', '💭💻');
    });
  };

  // Camera Presets
  const applyCameraPreset = (key: CameraPresetKey) => {
    const preset = CAMERA_PRESETS[key];
    if (!preset) return;
    setActivePreset(key);

    const startTheta = cameraAngleRef.current.theta;
    const startPhi = cameraAngleRef.current.phi;
    const startRadius = cameraAngleRef.current.radius;
    const startLookAt = targetLookAtRef.current.clone();

    const targetTheta = preset.theta;
    const targetPhi = preset.phi;
    const targetRadius = preset.radius;
    const targetLook = preset.lookAt.clone();

    setZoomLevelPercent(radiusToPercent(targetRadius));

    const startTime = performance.now();
    const duration = 650;

    const animateTransition = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      cameraAngleRef.current.theta = THREE.MathUtils.lerp(startTheta, targetTheta, ease);
      cameraAngleRef.current.phi = THREE.MathUtils.lerp(startPhi, targetPhi, ease);
      cameraAngleRef.current.radius = THREE.MathUtils.lerp(startRadius, targetRadius, ease);
      targetLookAtRef.current.lerpVectors(startLookAt, targetLook, ease);

      updateCameraPosition();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  };

  const zoomToAgentDesk = (agentId: string, zoomMode: 'super' | 'desk' | 'room' = 'super') => {
    setSelectedAgentId(agentId);
    setInspectorOpen(true);
    setInspectorZoomLevel(zoomMode);

    const agentInst = agentsMapRef.current.get(agentId);
    // If agent is roaming or away, recall to desk so user sees them working!
    if (agentInst && agentInst.currentActivity !== 'working_desk') {
      agentInst.currentActivity = 'working_desk';
      navigateAgentCollisionFree(agentId, agentInst.deskVector, 'Kembali ke meja: Lanjut fokus mengetik di komputer 💻', '💭💻');
    }

    const deskPos = getDeskVector(agentId);
    const targetPos = agentInst ? agentInst.currentPos.clone() : deskPos;
    // Eye level target right at the agent & monitor
    const targetLook = new THREE.Vector3(targetPos.x, targetPos.y + 1.15, targetPos.z);
    const startTheta = cameraAngleRef.current.theta;
    const startPhi = cameraAngleRef.current.phi;
    const startRadius = cameraAngleRef.current.radius;
    const startLookAt = targetLookAtRef.current.clone();

    // Multi-tier close-up zoom:
    // 'super': 4.8 (Super Zoom Makro: camera is right in front of monitor, keyboard, hands & face)
    // 'desk': 8.5 (Workstation view: full desk setup, dual monitors, chair, coffee cup)
    // 'room': 16.0 (Room view: full department section)
    let targetRadius = 4.8;
    let targetTheta = 0.38;
    let targetPhi = 1.22;

    if (zoomMode === 'desk') {
      targetRadius = 8.5;
      targetTheta = 0.44;
      targetPhi = 1.05;
    } else if (zoomMode === 'room') {
      targetRadius = 16.0;
      targetTheta = 0.52;
      targetPhi = 0.88;
    }

    setZoomLevelPercent(radiusToPercent(targetRadius));

    const startTime = performance.now();
    const duration = 650;

    const animateTransition = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      cameraAngleRef.current.theta = THREE.MathUtils.lerp(startTheta, targetTheta, ease);
      cameraAngleRef.current.phi = THREE.MathUtils.lerp(startPhi, targetPhi, ease);
      cameraAngleRef.current.radius = THREE.MathUtils.lerp(startRadius, targetRadius, ease);
      targetLookAtRef.current.lerpVectors(startLookAt, targetLook, ease);

      updateCameraPosition();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  };

  useEffect(() => {
    const handleZoomEvent = (e: any) => {
      const agentId = e.detail?.agentId;
      const mode = e.detail?.mode || 'super';
      if (agentId) {
        zoomToAgentDesk(agentId, mode);
      }
    };
    window.addEventListener('office-zoom-to-agent', handleZoomEvent);
    return () => window.removeEventListener('office-zoom-to-agent', handleZoomEvent);
  }, []);

  const applyZoomPercent = (newPercent: number) => {
    const clampedPct = Math.max(25, Math.min(300, newPercent));
    setZoomLevelPercent(clampedPct);
    const newR = percentToRadius(clampedPct);
    cameraAngleRef.current.radius = newR;
    updateCameraPosition();
  };

  const handleStepZoom = (deltaPct: number) => {
    applyZoomPercent(zoomLevelPercent + deltaPct);
  };

  // Mouse Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= dx * 0.007;
    cameraAngleRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - dy * 0.007));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    // Allow macro zoom up close to desk (radius 4.2)
    const newR = Math.max(4.2, Math.min(135, cameraAngleRef.current.radius + zoomDelta));
    cameraAngleRef.current.radius = newR;
    setZoomLevelPercent(radiusToPercent(newR));
    updateCameraPosition();
  };

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
      
      {/* Top Header & Command Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <Gem className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Kantor The Sims (Sangat Lengkap • Kantor Serasa Rumah)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span>🏡 Serasa Rumah</span>
                  <span>•</span>
                  <span>💎 Anti-Nembus Tembok</span>
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Fasilitas super lengkap serasa rumah: Meja makan keluarga & keranjang buah, laundry pakaian, daybed tidur siang, piringan hitam vinyl & gitar, sudut kucing peliharaan, serta patio BBQ kebun luar.
            </p>
          </div>
        </div>

        {/* Action Direct Command Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setAutoPatrolEnabled(prev => !prev)}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              autoPatrolEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Aktifkan atau jeda agen bergerak aktif mondar-mandir secara otomatis"
          >
            {autoPatrolEnabled ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{autoPatrolEnabled ? 'Mondar-Mandir: AKTIF' : 'Mondar-Mandir: JEDA'}</span>
          </button>

          {/* Quick Interactive Items Actions */}
          <button
            onClick={triggerBrewCoffee}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Karyawan menyeduh kopi di mesin espresso pantry"
          >
            <Coffee className="h-3.5 w-3.5" />
            <span>Kopi Pantry</span>
          </button>

          <button
            onClick={triggerDispenserWater}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Karyawan mengambil air di dispenser galon biru 19L"
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Galon Air</span>
          </button>

          <button
            onClick={triggerPlayFoosball}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Karyawan bermain sepak bola meja (foosball) di game lounge"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Main Foosball</span>
          </button>

          <button
            onClick={triggerPrintDoc}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Karyawan mencetak dokumen di mesin fotokopi & laser printer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak Dokumen</span>
          </button>

          <button
            onClick={triggerRestroom}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Karyawan ke restroom untuk cuci tangan & merapikan diri"
          >
            <span>🚻</span>
            <span>Restroom</span>
          </button>

          {/* Fitur Kantor Serasa Rumah */}
          <button
            onClick={triggerDiningTogether}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Makan bersama tim di meja makan keluarga pantry"
          >
            <span>🍲</span>
            <span>Makan Bersama</span>
          </button>

          <button
            onClick={triggerNapDaybed}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-600 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Rebahan santai di daybed nap pod empuk"
          >
            <span>🛏️</span>
            <span>Rebahan Tidur</span>
          </button>

          <button
            onClick={triggerVinylMusic}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-fuchsia-700 hover:bg-fuchsia-600 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Putar piringan hitam vinyl & petik gitar akustik santai"
          >
            <span>🎵</span>
            <span>Musik Vinyl</span>
          </button>

          <button
            onClick={triggerPetCat}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Bermain & mengelus kucing maskot kantor"
          >
            <span>🐱</span>
            <span>Kucing Kantor</span>
          </button>

          <button
            onClick={triggerGardenBBQ}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-700 hover:bg-orange-600 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Pesta BBQ santai di patio kebun luar bersama tim"
          >
            <span>🍖</span>
            <span>Pesta BBQ</span>
          </button>

          <button
            onClick={triggerWorkAtComputers}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Semua agen kembali ke workstation dan aktif mengetik di komputer"
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Semua di Meja</span>
          </button>

          <button
            onClick={() => triggerTeamMeeting()}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Kumpulkan tim ke meja ruang rapat utama"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Rapat Boardroom</span>
          </button>

          <button
            onClick={() => onDispatchTask()}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Beri Mandat AI</span>
          </button>
        </div>
      </div>

      {/* Camera View Switcher Bar (Includes All New Rooms) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-800/95 border-b border-slate-700/80 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-semibold shrink-0 text-[11px] mr-1">🎥 Sorot Ruangan:</span>
          {(Object.keys(CAMERA_PRESETS) as CameraPresetKey[]).map((key) => {
            const item = CAMERA_PRESETS[key];
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                onClick={() => applyCameraPreset(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Height & Plumbob Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlumbobGlow(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              plumbobGlow 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                : 'bg-slate-700 text-slate-400'
            }`}
            title="Nyalakan/matikan pendaran kristal Plumbob The Sims"
          >
            <Gem className="h-3.5 w-3.5 text-emerald-400" />
            <span>{plumbobGlow ? 'Plumbob: Bersinar' : 'Plumbob: Redup'}</span>
          </button>

          <button
            onClick={() => setIsExpandedHeight(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
            title={isExpandedHeight ? 'Kembalikan tinggi standar' : 'Perluas tinggi tampilan layar'}
          >
            {isExpandedHeight ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isExpandedHeight ? 'Tinggi Standar' : 'Perluas Layar (Panorama)'}</span>
          </button>

          <button
            onClick={() => setBubbleMode(prev => prev === 'focused' ? 'all' : 'focused')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              bubbleMode === 'focused' 
                ? 'bg-slate-700 text-cyan-300 border border-cyan-500/40' 
                : 'bg-blue-600 text-white'
            }`}
            title="Ubah tampilan balon teks agar layar bersih dan tidak bertumpuk"
          >
            {bubbleMode === 'focused' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{bubbleMode === 'focused' ? '💬 Balon: Rapi' : '💬 Balon: Semua'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Arena */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full transition-all duration-300 bg-sky-100/40 cursor-grab active:cursor-grabbing overflow-hidden select-none ${
          isExpandedHeight ? 'h-[850px] lg:h-[950px]' : 'h-[640px] sm:h-[720px] lg:h-[820px]'
        }`}
      >
        {/* Top-Left Floating Clean Info Pill */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] text-slate-700 shadow-md">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            <span>Jalur Koridor Bebas Halangan • Karakter Berjalan Lewat Pintu & Lorong (Anti-Tembus Tembok)</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-extrabold shadow-xs">
              🌟 L2: Suite CEO Alex & Lab AI Dr. Maya (2 Ruangan Aja)
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
              🏡 L1: Meja Makan Keluarga • Nap Daybed • Musik Vinyl • Kucing Kantor • BBQ Garden • Galon Air • Foosball
            </span>
          </div>
        </div>

        {/* Floating Active Task Live Banner with Zoom to Working Agent */}
        {activeTask && activeTask.status === 'in_progress' && (() => {
          const activeStep = activeTask.steps.find(s => s.status === 'running') || activeTask.steps[0];
          return (
            <div className="absolute top-20 left-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 text-white border border-blue-500/60 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping shrink-0" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                    Sedang Diproses
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                    {activeTask.title}
                  </span>
                </div>
                {activeStep && (
                  <p className="text-[11px] text-blue-200 mt-0.5 font-medium">
                    Karyawan: <span className="font-bold text-amber-300">{activeStep.agentName}</span> ({activeStep.stageName})
                  </p>
                )}
              </div>
              {activeStep && (
                <button
                  onClick={() => zoomToAgentDesk(activeStep.agentId, 'super')}
                  className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
                  title="Arahkan kamera 3D super dekat ke meja agen dan pantau apa yang sedang dikerjakannya!"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>🔍 Zoom Meja & Layar Kerja</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Top-Right Dedicated Zoom Panel */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-lg">
          <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
            <span>🔍 Zoom:</span>
            <span className="font-mono text-emerald-600 font-extrabold">{zoomLevelPercent}%</span>
          </span>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
            <button
              onClick={() => applyZoomPercent(30)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                zoomLevelPercent <= 40 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Zoom Jauh"
            >
              🔭 30% Jauh
            </button>

            <button
              onClick={() => applyZoomPercent(65)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                zoomLevelPercent > 40 && zoomLevelPercent <= 80 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Zoom Kawasan"
            >
              🌐 65% Kawasan
            </button>

            <button
              onClick={() => applyZoomPercent(100)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                zoomLevelPercent > 80 && zoomLevelPercent <= 125 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Zoom Standar"
            >
              🏢 100% Normal
            </button>

            <button
              onClick={() => applyZoomPercent(145)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                zoomLevelPercent > 125 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Zoom Dekat Karyawan"
            >
              🎯 145% Dekat
            </button>
          </div>
        </div>

        {/* Bottom-Right Floating Stepped Zoom Controls & Reset View */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl">
          <button
            onClick={() => handleStepZoom(-10)}
            className="p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <input
            type="range"
            min={25}
            max={200}
            step={5}
            value={zoomLevelPercent}
            onChange={(e) => applyZoomPercent(Number(e.target.value))}
            className="w-20 sm:w-28 accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            title="Geser untuk zoom in / zoom out"
          />

          <button
            onClick={() => handleStepZoom(10)}
            className="p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            onClick={() => applyCameraPreset('all')}
            className="p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors border-l border-slate-200 ml-1"
            title="Reset Pandangan Standar"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* 2D Projected The Sims Agent Badges & Speech Elements */}
        {Object.keys(bubbles).map((id) => {
          const b = bubbles[id];
          const agent = agents.find((a) => a.id === id);
          if (!b || !b.visible || !agent) return null;

          const isSelected = selectedAgentId === id;
          const isHovered = hoveredAgentId === id;
          const showFullBubble = bubbleMode === 'all' || isSelected || isHovered;

          return (
            <div
              key={id}
              onClick={() => {
                setSelectedAgentId(id);
                onSelectAgent(agent);
                zoomToAgentDesk(id, 'super');
              }}
              onMouseEnter={() => setHoveredAgentId(id)}
              onMouseLeave={() => setHoveredAgentId(null)}
              className="absolute z-20 cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all hover:scale-110"
              style={{
                left: `${b.x}px`,
                top: `${b.y}px`
              }}
            >
              {showFullBubble && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/40 shadow-2xl text-[10px] font-bold whitespace-nowrap mb-1 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-sm">{b.emoji}</span>
                  <span>{b.text}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-1">
                <span 
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-white shadow-md border border-white/50 flex items-center gap-1.5 transition-all ${
                    isSelected ? 'ring-2 ring-emerald-400 scale-105' : ''
                  }`}
                  style={{ backgroundColor: agent.color }}
                >
                  <span className="text-[10px]">💎</span>
                  <span>{agent.name.split(' ')[0]}</span>
                  {agent.apiEngine && (
                    <span className="text-[8px] bg-black/35 px-1 py-0.2 rounded font-mono">
                      {agent.apiEngine.icon} {agent.apiEngine.badge}
                    </span>
                  )}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    zoomToAgentDesk(agent.id, 'super');
                  }}
                  className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-all hover:scale-110 flex items-center gap-0.5"
                  title={`Zoom Makro Meja & Pantau Layar Kerja ${agent.name}`}
                >
                  <ZoomIn className="h-2.5 w-2.5" />
                </button>

                {onDirectCommand && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDirectCommand(agent);
                    }}
                    className="p-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-md transition-all hover:scale-110"
                    title={`Beri perintah langsung ke ${agent.name}`}
                  >
                    <Send className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Workstation Inspector Overlay (Screen + Real-time Activity Stream) */}
        {inspectorOpen && selectedAgentId && (() => {
          const targetAgent = agents.find(a => a.id === selectedAgentId);
          if (!targetAgent) return null;
          return (
            <WorkstationInspector
              agent={targetAgent}
              activeTask={activeTask}
              zoomLevel={inspectorZoomLevel}
              onSetZoomLevel={(lvl) => zoomToAgentDesk(targetAgent.id, lvl)}
              onClose={() => setInspectorOpen(false)}
              onDirectCommand={onDirectCommand}
              onRecallToDesk={(id) => {
                const inst = agentsMapRef.current.get(id);
                if (inst) {
                  inst.currentActivity = 'working_desk';
                  navigateAgentCollisionFree(id, inst.deskVector, 'Kembali ke meja: Lanjut fokus mengetik di komputer 💻', '💭💻');
                }
              }}
              onSendCoffee={(id) => {
                navigateAgentCollisionFree(id, WAYPOINTS.cafeCoffeeMachine, 'Menyeduh kopi espresso di pantry ☕', '💭☕');
              }}
              onDispatchTask={onDispatchTask}
            />
          );
        })()}
      </div>
    </div>
  );
};
