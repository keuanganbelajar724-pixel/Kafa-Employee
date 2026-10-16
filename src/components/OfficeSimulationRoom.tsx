import React, { useState, useEffect } from 'react';
import { Agent, Task } from '../types';
import { WalkingAgent3D } from './WalkingAgent3D';
import { 
  Building2, 
  Coffee, 
  Users, 
  Laptop, 
  Sparkles, 
  Layers, 
  Navigation,
  Compass,
  CheckCircle2,
  Calendar,
  Zap,
  Volume2,
  VolumeX,
  Dumbbell
} from 'lucide-react';

interface OfficeSimulationRoomProps {
  agents: Agent[];
  activeTask?: Task | null;
  onSelectAgent: (agent: Agent) => void;
  onDispatchTask: (agent?: Agent) => void;
  onToggleViewMode?: () => void;
}

// Complete Locations in the 2-Floor 2.5D Office Room (percentages 0-100)
// Floor 1 (Dasar): Paling Luas (8 Workstations Tim, Boardroom, Lobi, Pantry, Halaman Kebun & Garasi Mobil)
// Floor 2 (Mezzanine): Tepat 2 Ruangan Aja (Executive Suite CEO & AI Research Lab)
const LOCATIONS = {
  // === LANTAI 1 (PALING LUAS): 8 WORKSTATIONS TIM & FASILITAS ===
  davidDesk: { floor: 1, x: 14, y: 72 },     // Tech & Engineering Hub
  kenjiDesk: { floor: 1, x: 28, y: 72 },     // QA & Compliance Station
  liamDesk: { floor: 1, x: 14, y: 46 },      // Cloud & DevOps Center
  priyaDesk: { floor: 1, x: 28, y: 46 },     // Legal & Governance Office
  sarahDesk: { floor: 1, x: 72, y: 72 },     // Growth & Marketing Wing
  elenaDesk: { floor: 1, x: 86, y: 72 },     // Media & Content Studio
  nadiaDesk: { floor: 1, x: 86, y: 46 },     // Product Strategy Pod
  marcusDesk: { floor: 1, x: 72, y: 46 },    // Finance & Investment Wing

  // === LANTAI 2: TEPAT 2 RUANGAN AJA (EXECUTIVE MEZZANINE) ===
  alexDesk: { floor: 2, x: 30, y: 48 },      // Ruang 1: Executive Suite CEO (Alex Morgan)
  mayaDesk: { floor: 2, x: 70, y: 48 },      // Ruang 2: AI Intelligence & Quantum Lab (Dr. Maya Chen)

  // === HALAMAN KEBUN & GARASI (OUTDOOR LANTAI 1) ===
  gardenSprinkler: { floor: 1, x: 16, y: 18 },
  gardenFlowers: { floor: 1, x: 26, y: 20 },
  gardenBench: { floor: 1, x: 10, y: 22 },
  garageCar1: { floor: 1, x: 76, y: 18 },
  garageCar2: { floor: 1, x: 86, y: 20 },
  garageEV: { floor: 1, x: 92, y: 18 },

  // === BOARDROOM & FASILITAS TIM (LANTAI 1) ===
  meetingTableAlex: { floor: 1, x: 45, y: 50 },
  meetingTableMaya: { floor: 1, x: 50, y: 46 },
  meetingTableDavid: { floor: 1, x: 55, y: 50 },
  meetingTableElena: { floor: 1, x: 47, y: 54 },
  meetingTableKenji: { floor: 1, x: 53, y: 54 },
  receptionDesk: { floor: 1, x: 50, y: 88 },
  pantryCoffee: { floor: 1, x: 50, y: 70 },

  // === FITUR KANTOR SERASA RUMAH (LANTAI 1) ===
  pantryDiningTable: { floor: 1, x: 50, y: 75 },     // Meja Makan Keluarga Bersama
  loungeNapDaybed: { floor: 1, x: 92, y: 64 },       // Daybed / Kasur Tidur Siang
  loungeVinylMusic: { floor: 1, x: 88, y: 60 },      // Piringan Hitam Vinyl & Gitar
  lobbyPetCatStation: { floor: 1, x: 58, y: 88 },    // Sudut Kucing Kantor & Pet Bed
  gardenBBQGrill: { floor: 1, x: 22, y: 22 },        // Patio BBQ Grill Taman

  // === FASILITAS MEZZANINE (LANTAI 2) ===
  mezzanineBalcony: { floor: 2, x: 50, y: 78 },
  executiveLounge: { floor: 2, x: 50, y: 35 }
};

interface AgentSimState {
  currentFloor: 1 | 2;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isWalking: boolean;
  isSitting: boolean;
  facing: 'left' | 'right';
  currentPlace: string;
  speech: string | null;
}

export const OfficeSimulationRoom: React.FC<OfficeSimulationRoomProps> = ({
  agents,
  activeTask,
  onSelectAgent,
  onDispatchTask,
  onToggleViewMode
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent_alex');
  const [activeFloorView, setActiveFloorView] = useState<1 | 2>(1);
  const [simZoom, setSimZoom] = useState<number>(1);

  // Positions and active working states for all 10 agents across 2 floors
  const [simStates, setSimStates] = useState<Record<string, AgentSimState>>({
    // Lantai 2 (Tepat 2 Ruangan Aja):
    agent_alex: {
      currentFloor: 2,
      currentX: LOCATIONS.alexDesk.x,
      currentY: LOCATIONS.alexDesk.y,
      targetX: LOCATIONS.alexDesk.x,
      targetY: LOCATIONS.alexDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'left',
      currentPlace: 'alexDesk',
      speech: 'Bekerja Aktif: Orkestrasi tugas kantor 📋'
    },
    agent_maya: {
      currentFloor: 2,
      currentX: LOCATIONS.mayaDesk.x,
      currentY: LOCATIONS.mayaDesk.y,
      targetX: LOCATIONS.mayaDesk.x,
      targetY: LOCATIONS.mayaDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'right',
      currentPlace: 'mayaDesk',
      speech: 'Bekerja Aktif: Riset model AI & data 🔬'
    },
    // Lantai 1 (Paling Luas):
    agent_priya: {
      currentFloor: 1,
      currentX: LOCATIONS.priyaDesk.x,
      currentY: LOCATIONS.priyaDesk.y,
      targetX: LOCATIONS.priyaDesk.x,
      targetY: LOCATIONS.priyaDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'right',
      currentPlace: 'priyaDesk',
      speech: 'Bekerja Aktif: Draf kontrak & tata kelola ⚖️'
    },
    agent_marcus: {
      currentFloor: 1,
      currentX: LOCATIONS.marcusDesk.x,
      currentY: LOCATIONS.marcusDesk.y,
      targetX: LOCATIONS.marcusDesk.x,
      targetY: LOCATIONS.marcusDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'left',
      currentPlace: 'marcusDesk',
      speech: 'Bekerja Aktif: Analisis ROI & kas 💰'
    },

    // Lantai 1 (Paling Luas):
    agent_david: {
      currentFloor: 1,
      currentX: LOCATIONS.davidDesk.x,
      currentY: LOCATIONS.davidDesk.y,
      targetX: LOCATIONS.davidDesk.x,
      targetY: LOCATIONS.davidDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'right',
      currentPlace: 'davidDesk',
      speech: 'Arsitektur sistem kode 💻'
    },
    agent_kenji: {
      currentFloor: 1,
      currentX: LOCATIONS.kenjiDesk.x,
      currentY: LOCATIONS.kenjiDesk.y,
      targetX: LOCATIONS.kenjiDesk.x,
      targetY: LOCATIONS.kenjiDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'right',
      currentPlace: 'kenjiDesk',
      speech: 'Pengujian QA sistem 🛡️'
    },
    agent_liam: {
      currentFloor: 1,
      currentX: LOCATIONS.liamDesk.x,
      currentY: LOCATIONS.liamDesk.y,
      targetX: LOCATIONS.liamDesk.x,
      targetY: LOCATIONS.liamDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'right',
      currentPlace: 'liamDesk',
      speech: 'DevOps & server cloud ⚡'
    },
    agent_sarah: {
      currentFloor: 1,
      currentX: LOCATIONS.sarahDesk.x,
      currentY: LOCATIONS.sarahDesk.y,
      targetX: LOCATIONS.sarahDesk.x,
      targetY: LOCATIONS.sarahDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'left',
      currentPlace: 'sarahDesk',
      speech: 'Strategi pertumbuhan pasar 📈'
    },
    agent_elena: {
      currentFloor: 1,
      currentX: LOCATIONS.elenaDesk.x,
      currentY: LOCATIONS.elenaDesk.y,
      targetX: LOCATIONS.elenaDesk.x,
      targetY: LOCATIONS.elenaDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'left',
      currentPlace: 'elenaDesk',
      speech: 'Desain konten & brand media 🎨'
    },
    agent_nadia: {
      currentFloor: 1,
      currentX: LOCATIONS.nadiaDesk.x,
      currentY: LOCATIONS.nadiaDesk.y,
      targetX: LOCATIONS.nadiaDesk.x,
      targetY: LOCATIONS.nadiaDesk.y,
      isWalking: false,
      isSitting: true,
      facing: 'left',
      currentPlace: 'nadiaDesk',
      speech: 'Roadmap & strategi produk 📝'
    }
  });

  // Smooth movement engine
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setSimStates((prev) => {
        let changed = false;
        const next = { ...prev };

        Object.keys(next).forEach((agentId) => {
          const st = next[agentId];
          if (!st || !st.isWalking) return;

          const dx = st.targetX - st.currentX;
          const dy = st.targetY - st.currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 1.2) {
            changed = true;
            const step = Math.min(dist, 1.4);
            const nx = st.currentX + (dx / dist) * step;
            const ny = st.currentY + (dy / dist) * step;

            next[agentId] = {
              ...st,
              currentX: nx,
              currentY: ny,
              facing: dx < 0 ? 'left' : 'right',
              isSitting: false
            };
          } else {
            changed = true;
            next[agentId] = {
              ...st,
              currentX: st.targetX,
              currentY: st.targetY,
              isWalking: false,
              isSitting: true
            };
          }
        });

        return changed ? next : prev;
      });
    }, 40);

    return () => clearInterval(moveInterval);
  }, []);

  // Periodic ambient movement & speech
  useEffect(() => {
    const roamInterval = setInterval(() => {
      if (activeTask && activeTask.status === 'in_progress') return;

      const agentKeys = Object.keys(simStates);
      const chosenId = agentKeys[Math.floor(Math.random() * agentKeys.length)];
      const st = simStates[chosenId];
      if (!st || st.isWalking) return;

      const dice = Math.random();
      if (dice < 0.25) {
        // Go to garden to water plants (Floor 1)
        sendAgentTo(chosenId, 1, LOCATIONS.gardenSprinkler.x, LOCATIONS.gardenSprinkler.y, 'Menyiram kebun bunga 🌱💧');
        setTimeout(() => returnAgentToDesk(chosenId), 8000);
      } else if (dice < 0.45) {
        // Go to garage (Floor 1)
        sendAgentTo(chosenId, 1, LOCATIONS.garageCar1.x, LOCATIONS.garageCar1.y, 'Inspeksi armada di garasi 🚗');
        setTimeout(() => returnAgentToDesk(chosenId), 8000);
      } else if (dice < 0.65) {
        // Grab coffee
        sendAgentTo(chosenId, 1, LOCATIONS.pantryCoffee.x, LOCATIONS.pantryCoffee.y, 'Mengambil secangkir kopi panas ☕');
        setTimeout(() => returnAgentToDesk(chosenId), 7000);
      } else if (dice < 0.85) {
        // Balcony overlooking Floor 1
        sendAgentTo(chosenId, 2, LOCATIONS.mezzanineBalcony.x, LOCATIONS.mezzanineBalcony.y, 'Menikmati pemandangan dari Balkon Mezzanine L2 🌟');
        setTimeout(() => returnAgentToDesk(chosenId), 8000);
      }
    }, 8500);

    return () => clearInterval(roamInterval);
  }, [simStates, activeTask]);

  // Dispatch agent to a position & floor
  const sendAgentTo = (agentId: string, floor: 1 | 2, x: number, y: number, speech?: string) => {
    setSimStates((prev) => {
      const cur = prev[agentId];
      if (!cur) return prev;
      return {
        ...prev,
        [agentId]: {
          ...cur,
          currentFloor: floor,
          targetX: x,
          targetY: y,
          isWalking: true,
          isSitting: false,
          speech: speech || cur.speech
        }
      };
    });
  };

  const returnAgentToDesk = (agentId: string) => {
    let deskLoc = LOCATIONS.davidDesk;
    let floor: 1 | 2 = 1;

    switch (agentId) {
      case 'agent_alex': deskLoc = LOCATIONS.alexDesk; floor = 2; break;
      case 'agent_maya': deskLoc = LOCATIONS.mayaDesk; floor = 2; break;
      case 'agent_priya': deskLoc = LOCATIONS.priyaDesk; floor = 2; break;
      case 'agent_marcus': deskLoc = LOCATIONS.marcusDesk; floor = 2; break;
      case 'agent_david': deskLoc = LOCATIONS.davidDesk; floor = 1; break;
      case 'agent_kenji': deskLoc = LOCATIONS.kenjiDesk; floor = 1; break;
      case 'agent_liam': deskLoc = LOCATIONS.liamDesk; floor = 1; break;
      case 'agent_sarah': deskLoc = LOCATIONS.sarahDesk; floor = 1; break;
      case 'agent_elena': deskLoc = LOCATIONS.elenaDesk; floor = 1; break;
      case 'agent_nadia': deskLoc = LOCATIONS.nadiaDesk; floor = 1; break;
    }

    sendAgentTo(agentId, floor, deskLoc.x, deskLoc.y, 'Fokus kembali di meja kerja 💻');
  };

  // Click on floor to walk
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedAgentId) {
      sendAgentTo(selectedAgentId, activeFloorView, Math.round(x), Math.round(y), 'Menuju lokasi yang ditunjuk 🚶');
    }
  };

  // Commands
  const triggerWaterGarden = () => {
    setActiveFloorView(1);
    agents.forEach((ag, idx) => {
      setTimeout(() => {
        sendAgentTo(ag.id, 1, LOCATIONS.gardenSprinkler.x + (idx % 3) * 4, LOCATIONS.gardenSprinkler.y + (idx % 2) * 3, 'Menyiram kebun bunga di halaman 🌱💧');
      }, idx * 300);
    });
  };

  const triggerInspectGarage = () => {
    setActiveFloorView(1);
    agents.forEach((ag, idx) => {
      setTimeout(() => {
        sendAgentTo(ag.id, 1, LOCATIONS.garageCar1.x + (idx % 3) * 4, LOCATIONS.garageCar1.y + (idx % 2) * 3, 'Inspeksi armada mobil di garasi 🚗⚡');
      }, idx * 300);
    });
  };

  const triggerTeamMeeting = () => {
    setActiveFloorView(1);
    const meetingSeats = [
      LOCATIONS.meetingTableAlex,
      LOCATIONS.meetingTableMaya,
      LOCATIONS.meetingTableDavid,
      LOCATIONS.meetingTableElena,
      LOCATIONS.meetingTableKenji
    ];
    agents.forEach((ag, idx) => {
      const seat = meetingSeats[idx % meetingSeats.length];
      sendAgentTo(ag.id, 1, seat.x, seat.y, 'Rapat koordinasi tim di Boardroom L1 🎙️');
    });
  };

  const triggerMezzanineVisit = () => {
    setActiveFloorView(2);
    sendAgentTo('agent_alex', 2, LOCATIONS.alexDesk.x, LOCATIONS.alexDesk.y, 'Di Executive Suite CEO Lantai 2 👑');
    sendAgentTo('agent_maya', 2, LOCATIONS.mayaDesk.x, LOCATIONS.mayaDesk.y, 'Di AI & Quantum Lab Lantai 2 🔬');
  };

  const triggerDiningTogether = () => {
    setActiveFloorView(1);
    sendAgentTo('agent_marcus', 1, LOCATIONS.pantryDiningTable.x - 3, LOCATIONS.pantryDiningTable.y, 'Makan bersama tim di meja makan keluarga 🍲');
    sendAgentTo('agent_priya', 1, LOCATIONS.pantryDiningTable.x + 3, LOCATIONS.pantryDiningTable.y, 'Makan buah segar bersama 🍎');
  };

  const triggerNapDaybed = () => {
    setActiveFloorView(1);
    sendAgentTo('agent_david', 1, LOCATIONS.loungeNapDaybed.x, LOCATIONS.loungeNapDaybed.y, 'Rebahan nyaman di nap daybed / kasur siang 🛏️');
  };

  const triggerVinylMusic = () => {
    setActiveFloorView(1);
    sendAgentTo('agent_elena', 1, LOCATIONS.loungeVinylMusic.x, LOCATIONS.loungeVinylMusic.y, 'Memutar piringan hitam vinyl & petik gitar 🎵');
  };

  const triggerPetCat = () => {
    setActiveFloorView(1);
    sendAgentTo('agent_sarah', 1, LOCATIONS.lobbyPetCatStation.x, LOCATIONS.lobbyPetCatStation.y, 'Bermain & mengelus kucing maskot kantor 🐱');
  };

  const triggerGardenBBQ = () => {
    setActiveFloorView(1);
    sendAgentTo('agent_kenji', 1, LOCATIONS.gardenBBQGrill.x, LOCATIONS.gardenBBQGrill.y, 'Memanggang sate BBQ di patio kebun luar 🍖');
    sendAgentTo('agent_nadia', 1, LOCATIONS.gardenBBQGrill.x + 4, LOCATIONS.gardenBBQGrill.y, 'Santai di meja piknik menikmati BBQ 🥩');
  };

  const triggerWorkAtComputers = () => {
    agents.forEach((ag) => {
      returnAgentToDesk(ag.id);
    });
  };

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl p-5 space-y-4">
      {/* Top Banner & Multi-story Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Denah Kantor Virtual 2 Lantai
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-300">
                  <Layers className="h-3 w-3 text-blue-600" />
                  2 Lantai (L1 Paling Luas • L2 Ruang Khusus)
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              L1: Dasar Paling Luas (Workstation Tim, Boardroom, Halaman Kebun & Garasi Mobil) • L2: Mezzanine Khusus (CEO Suite, AI Lab, Finance, Legal)
            </p>
          </div>
        </div>

        {/* Floor Level Switcher & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 px-1.5">Zoom:</span>
            <button
              onClick={() => setSimZoom(0.8)}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                simZoom === 0.8 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80% Jauh
            </button>
            <button
              onClick={() => setSimZoom(1)}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                simZoom === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              100% Normal
            </button>
            <button
              onClick={() => setSimZoom(1.25)}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                simZoom === 1.25 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              125% Dekat
            </button>
          </div>

          {/* Floor Switcher (2 Floors Only) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveFloorView(1)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFloorView === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏛️ L1: Dasar</span>
            </button>
            <button
              onClick={() => setActiveFloorView(2)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFloorView === 2
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌟 L2: Mezzanine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons to control roaming agents - Swipeable on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full border-b border-slate-200 pb-2 sm:pb-3 sm:flex-wrap no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 sm:flex-wrap">
          <button
            onClick={triggerWaterGarden}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-xs shrink-0"
            title="Siram tanaman & rawat kebun bunga di halaman luas"
          >
            <span>🌱</span>
            <span>Siram Kebun (L1)</span>
          </button>

          <button
            onClick={triggerInspectGarage}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all shadow-xs"
            title="Inspeksi armada mobil di garasi & stasiun EV"
          >
            <span>🚗</span>
            <span>Garasi Mobil (L1)</span>
          </button>

          <button
            onClick={triggerTeamMeeting}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 transition-all shadow-xs"
          >
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            <span>Rapat Boardroom (L1)</span>
          </button>

          <button
            onClick={triggerMezzanineVisit}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-xs"
            title="Kunjungi Lantai 2: Tepat 2 Ruangan Eksekutif (CEO & Lab AI)"
          >
            <span>🌟</span>
            <span>Mezzanine L2 (2 Ruangan)</span>
          </button>

          <button
            onClick={triggerDiningTogether}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-xs"
            title="Makan bersama tim di meja makan keluarga"
          >
            <span>🍲</span>
            <span>Makan Bersama (L1)</span>
          </button>

          <button
            onClick={triggerNapDaybed}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 transition-all shadow-xs"
            title="Rebahan santai di daybed nap pod"
          >
            <span>🛏️</span>
            <span>Rebahan Daybed (L1)</span>
          </button>

          <button
            onClick={triggerVinylMusic}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 transition-all shadow-xs"
            title="Putar vinyl jazz & gitar akustik santai"
          >
            <span>🎵</span>
            <span>Musik Vinyl (L1)</span>
          </button>

          <button
            onClick={triggerPetCat}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-300 transition-all shadow-xs"
            title="Elus kucing maskot kantor"
          >
            <span>🐱</span>
            <span>Kucing Kantor (L1)</span>
          </button>

          <button
            onClick={triggerGardenBBQ}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 transition-all shadow-xs"
            title="Pesta BBQ santai di patio kebun"
          >
            <span>🍖</span>
            <span>BBQ Kebun (L1)</span>
          </button>

          <button
            onClick={triggerWorkAtComputers}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 transition-all shadow-xs"
          >
            <Laptop className="h-3.5 w-3.5 text-blue-600" />
            <span>Kembali ke Komputer</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Lihat 3D Penuh
            </button>
          )}

          <button
            onClick={() => onDispatchTask()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Beri Tugas AI</span>
          </button>
        </div>
      </div>

      {/* 2.5D INTERACTIVE ARENA CONTAINER */}
      <div
        onClick={handleFloorClick}
        className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] rounded-2xl border-2 border-slate-300 overflow-hidden cursor-crosshair select-none shadow-inner"
        style={{
          backgroundColor: activeFloorView === 1 ? '#E2B170' : '#475569',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '45px 45px'
        }}
      >
        {/* Scale zoom wrapper */}
        <div 
          className="relative w-full h-full"
          style={{ 
            transform: `scale(${simZoom})`, 
            transformOrigin: 'center center',
            transition: 'transform 0.25s ease-out' 
          }}
        >
        {/* FLOOR 1 CONTENT (PALING LUAS) */}
        {activeFloorView === 1 && (
          <>
            {/* Top Bar Label */}
            <div className="absolute top-2 left-4 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md z-10 flex items-center gap-2">
              <span>🏡 LANTAI 1: Dasar Sangat Luas (Kantor Serasa Rumah • Workstations, Meja Makan, Daybed, Vinyl, Pet, BBQ)</span>
            </div>

            {/* HALAMAN KEBUN & TAMAN BUNGA (Top Left Outdoor Zone) */}
            <div className="absolute left-3 top-10 w-[34%] h-[26%] rounded-2xl bg-emerald-900/90 text-white border-2 border-emerald-400 p-2.5 pointer-events-none shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                  <span>🌱</span>
                  <span>HALAMAN KEBUN & TAMAN</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">Outdoor Lawn</span>
              </div>
              <div className="flex items-center justify-around py-1 text-2xl">
                <span title="Bunga Mawar & Lavender">🌸</span>
                <span title="Sprinkler Air Otomatis">💧</span>
                <span title="Panggangan BBQ Patio">🍖</span>
                <span title="Meja Piknik Luar">🪑</span>
              </div>
              <div className="w-full bg-emerald-950/80 rounded py-0.5 text-center text-[9px] text-emerald-300 font-medium">
                Penyiram Otomatis • Patio BBQ Taman • Bangku Piknik & Bunga
              </div>
            </div>

            {/* GARASI MOBIL & CARPORT (Top Right Outdoor Zone) */}
            <div className="absolute right-3 top-10 w-[34%] h-[26%] rounded-2xl bg-slate-900 text-white border-2 border-slate-500 p-2.5 pointer-events-none shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-slate-700 text-white text-[10px] font-extrabold flex items-center gap-1">
                  <span>🚗</span>
                  <span>GARASI MOBIL & CARPORT</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">EV Supercharger</span>
              </div>
              <div className="flex items-center justify-around py-1 text-2xl">
                <span title="Sedan Eksekutif Biru">🚘</span>
                <span title="Sport Electric SUV">🚗</span>
                <span title="Stasiun EV Charger">⚡</span>
                <span title="Kotak Perkakas">🧰</span>
              </div>
              <div className="w-full bg-slate-800 rounded py-0.5 text-center text-[9px] text-cyan-300 font-medium">
                Sedan Dinas • Electric SUV Pearl White • EV Charging Totem
              </div>
            </div>

            {/* RUANG RAPAT UTAMA / BOARDROOM KACA (Center Ground) */}
            <div className="absolute left-[37%] top-[22%] w-[26%] h-[32%] rounded-2xl bg-indigo-950/90 border-2 border-blue-400 backdrop-blur-md pointer-events-none shadow-2xl flex flex-col items-center justify-between p-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                🎙️ RUANG RAPAT UTAMA (BOARDROOM)
              </span>
              <div className="w-full h-14 rounded-xl bg-amber-900 border border-amber-600 flex items-center justify-around px-2 shadow-inner">
                <span className="text-xs">💻</span>
                <span className="text-xs">📊</span>
                <span className="text-xs">📑</span>
                <span className="text-xs">☕</span>
              </div>
              <span className="text-[9px] text-blue-200 font-semibold">Meja Konferensi Walnut • 10 Kursi Eksekutif</span>
            </div>

            {/* WORKSTATIONS TIM LANTAI 1 (SANGAT LUAS - 8 ROOMS/WORKSTATIONS TERSEBAR) */}
            {/* 1. Tech, QA, DevOps & Legal Pod (Left Wing) */}
            <div className="absolute left-3 bottom-3 w-[47%] h-[40%] rounded-2xl bg-slate-900/95 text-white border-2 border-indigo-400 p-3 pointer-events-none shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                  <span>💻</span>
                  <span>ENGINEERING, QA, CLOUD & LEGAL</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">David • Kenji • Liam • Priya</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                <div className="bg-slate-800/80 rounded p-1 border border-indigo-500/30">
                  <span className="text-xl">🖥️</span>
                  <p className="text-[9px] text-indigo-300 font-bold truncate">David (Tech)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Code & System</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-pink-500/30">
                  <span className="text-xl">🛡️</span>
                  <p className="text-[9px] text-pink-300 font-bold truncate">Kenji (QA)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Logic Audit</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-cyan-500/30">
                  <span className="text-xl">⚡</span>
                  <p className="text-[9px] text-cyan-300 font-bold truncate">Liam (DevOps)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Cloud Server</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-purple-500/30">
                  <span className="text-xl">⚖️</span>
                  <p className="text-[9px] text-purple-300 font-bold truncate">Priya (Legal)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Compliance</p>
                </div>
              </div>
              <div className="w-full bg-slate-800/90 rounded py-0.5 text-center text-[9px] text-cyan-300 font-mono">
                Ruang 1: Tech Hub • Ruang 2: QA • Ruang 3: Cloud Vault • Ruang 4: Legal Chambers
              </div>
            </div>

            {/* 2. Growth, Media, Product & Finance Wing (Right Wing) */}
            <div className="absolute right-3 bottom-3 w-[47%] h-[40%] rounded-2xl bg-slate-900/95 text-white border-2 border-pink-400 p-3 pointer-events-none shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-pink-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                  <span>📈</span>
                  <span>GROWTH, MEDIA, PRODUCT & FINANCE</span>
                </span>
                <span className="text-[10px] text-amber-300 font-mono">Sarah • Elena • Nadia • Marcus</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                <div className="bg-slate-800/80 rounded p-1 border border-red-500/30">
                  <span className="text-xl">📊</span>
                  <p className="text-[9px] text-red-300 font-bold truncate">Sarah (Growth)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Traffic Funnel</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-amber-500/30">
                  <span className="text-xl">🎨</span>
                  <p className="text-[9px] text-amber-300 font-bold truncate">Elena (Media)</p>
                  <p className="text-[8px] text-slate-400 font-mono">Content Design</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-lime-500/30">
                  <span className="text-xl">📝</span>
                  <p className="text-[9px] text-lime-300 font-bold truncate">Nadia (Product)</p>
                  <p className="text-[8px] text-slate-400 font-mono">PRD & Roadmap</p>
                </div>
                <div className="bg-slate-800/80 rounded p-1 border border-teal-500/30">
                  <span className="text-xl">💰</span>
                  <p className="text-[9px] text-teal-300 font-bold truncate">Marcus (CFO)</p>
                  <p className="text-[8px] text-slate-400 font-mono">ROI & Capital</p>
                </div>
              </div>
              <div className="w-full bg-slate-800/90 rounded py-0.5 text-center text-[9px] text-pink-300 font-mono">
                Ruang 5: Growth • Ruang 6: Media Studio • Ruang 7: Product Pod • Ruang 8: Finance
              </div>
            </div>
          </>
        )}

        {/* FLOOR 2 CONTENT: TEPAT 2 RUANGAN AJA (EXECUTIVE MEZZANINE) */}
        {activeFloorView === 2 && (
          <>
            {/* Top Bar Label */}
            <div className="absolute top-2 left-4 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold shadow-md z-10 flex items-center gap-2">
              <span>🌟 LANTAI 2: Mezzanine Eksekutif (Tepat 2 Ruangan Aja + Balkon Kaca Pemandangan)</span>
            </div>

            {/* RUANG 1: EXECUTIVE SUITE CEO (Alex Morgan) */}
            <div className="absolute left-6 top-14 w-[45%] h-[58%] rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white border-2 border-blue-400 p-5 pointer-events-none shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-blue-500/40 pb-2">
                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                  <span>👑</span>
                  <span>RUANG 1: EXECUTIVE SUITE CEO</span>
                </span>
                <span className="text-xs text-blue-300 font-mono font-bold">Alex Morgan</span>
              </div>

              <div className="flex items-center justify-around py-3">
                <div className="flex flex-col items-center">
                  <span className="text-4xl">💼</span>
                  <span className="text-[10px] text-blue-200 mt-1 font-bold">Meja Eksekutif</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🛋️</span>
                  <span className="text-[10px] text-blue-200 mt-1 font-bold">Sofa Kulit Mewah</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🏆</span>
                  <span className="text-[10px] text-amber-300 mt-1 font-bold">Piala & Strategi</span>
                </div>
              </div>

              <div className="w-full bg-blue-900/60 border border-blue-400/40 rounded-xl p-2 text-center text-xs text-blue-200">
                Kantor Direktur Utama & Orkestrator Multi-Agen • Pemandangan Menghadap Lantai 1
              </div>
            </div>

            {/* RUANG 2: AI INTELLIGENCE & QUANTUM RESEARCH LAB (Dr. Maya Chen) */}
            <div className="absolute right-6 top-14 w-[45%] h-[58%] rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border-2 border-emerald-400 p-5 pointer-events-none shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                  <span>🔬</span>
                  <span>RUANG 2: AI & QUANTUM RESEARCH LAB</span>
                </span>
                <span className="text-xs text-emerald-300 font-mono font-bold">Dr. Maya Chen</span>
              </div>

              <div className="flex items-center justify-around py-3">
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🔮</span>
                  <span className="text-[10px] text-cyan-300 mt-1 font-bold">Quantum Core</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🧬</span>
                  <span className="text-[10px] text-emerald-200 mt-1 font-bold">Neural Models</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl">💻</span>
                  <span className="text-[10px] text-teal-200 mt-1 font-bold">Supercomputer</span>
                </div>
              </div>

              <div className="w-full bg-emerald-900/60 border border-emerald-400/40 rounded-xl p-2 text-center text-xs text-emerald-200">
                Pusat Riset Kecerdasan Buatan & Investigasi Data Pasar • Terminal Komputasi Kuantum
              </div>
            </div>

            {/* BALKON KACA MEZZANINE (Bottom Area Lantai 2 overlooking Lantai 1) */}
            <div className="absolute left-6 right-6 bottom-4 h-[20%] rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-400/50 p-2.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white text-[10px] font-bold">
                  🪟 BALKON & SKYWALK KACA MEZZANINE
                </span>
                <span className="text-[10px] text-slate-300">
                  Menghubungkan Ruang CEO dan Lab AI dengan pagar kaca transparan menghadap atrium luas Lantai 1.
                </span>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold">Tepat 2 Ruangan Tertentu Saja ✨</span>
            </div>
          </>
        )}

        {/* 2.5D INTERACTIVE WALKING CHARACTERS (Rendered on Active Floor) */}
        {agents.map((agent) => {
          const sim = simStates[agent.id] || {
            currentFloor: 1,
            currentX: 50,
            currentY: 50,
            isWalking: false,
            isSitting: true,
            facing: 'right',
            speech: null
          };

          // Only render characters on the currently viewed floor
          if (sim.currentFloor !== activeFloorView) return null;

          return (
            <div
              key={agent.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgentId(agent.id);
                onSelectAgent(agent);
              }}
              style={{
                left: `${sim.currentX}%`,
                top: `${sim.currentY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-30 transition-transform duration-75 cursor-pointer hover:scale-110 group"
            >
              <WalkingAgent3D
                agent={agent}
                isWalking={sim.isWalking}
                isSitting={sim.isSitting}
                facing={sim.facing}
                speechText={sim.speech}
                scale="large"
              />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
