import * as THREE from 'three';

// Cache generated textures so we don't recreate them on every render
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedural Scandinavian Warm Oak Parquet Floor Texture
 */
export function getParquetFloorTexture(): THREE.CanvasTexture {
  const cacheKey = 'floor_parquet_oak';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Warm honey oak background
  ctx.fillStyle = '#DFB683';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankW = 256;
  const plankH = 64;
  const woodShades = ['#E2B887', '#DBAF7D', '#E5BD8E', '#D6A875', '#DCAE7B', '#E8C394'];

  for (let y = 0; y < 1024; y += plankH) {
    const row = Math.floor(y / plankH);
    const offsetX = (row % 2) * (plankW / 2);

    for (let x = -plankW; x < 1024 + plankW; x += plankW) {
      const shadeIndex = Math.abs((x * 13 + y * 29) % woodShades.length);
      ctx.fillStyle = woodShades[shadeIndex];
      ctx.fillRect(x + offsetX, y, plankW - 2, plankH - 2);

      // Fine natural wood grain curves
      ctx.strokeStyle = 'rgba(115, 60, 15, 0.07)';
      ctx.lineWidth = 1.2;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        const gy = y + 10 + g * 12;
        ctx.moveTo(x + offsetX, gy);
        ctx.bezierCurveTo(
          x + offsetX + 70, gy + (g % 2 === 0 ? 3 : -3),
          x + offsetX + 180, gy + (g % 2 === 0 ? -2 : 3),
          x + offsetX + plankW - 4, gy
        );
        ctx.stroke();
      }

      // Plank bevel edge highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y);
      ctx.lineTo(x + offsetX + plankW - 2, y);
      ctx.stroke();
    }
  }

  // Micro seams between floorboards
  ctx.strokeStyle = '#B38248';
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= 1024; y += plankH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 7);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Modern High-Resolution Dual-Monitor Workstation Screens
 * Realistic IDE, Neural Networks, Figma wireframes, Bloomberg terminals, etc.
 */
export function getWorkstationScreenTexture(
  agentId: string, 
  screenType: 'left' | 'right'
): THREE.CanvasTexture {
  const cacheKey = `screen_${agentId}_${screenType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background and UI frame
  ctx.fillStyle = '#0D1117';
  ctx.fillRect(0, 0, 512, 288);

  // Render content based on Agent Role & Screen Side
  switch (agentId) {
    // ------------------------------------------------------------------------
    // DAVID KIM & LIAM O'CONNOR (Fullstack, DevOps & Cloud Architect)
    // ------------------------------------------------------------------------
    case 'agent_david':
    case 'agent_liam':
    case 'agent_kenji': {
      if (screenType === 'left') {
        // VS Code Full IDE
        // Top window header
        ctx.fillStyle = '#161B22';
        ctx.fillRect(0, 0, 512, 26);

        // macOS Traffic Lights
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(14, 13, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath(); ctx.arc(28, 13, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10B981';
        ctx.beginPath(); ctx.arc(42, 13, 4, 0, Math.PI * 2); ctx.fill();

        // Active File Tab
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(60, 4, 150, 22);
        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('⚡ AgentWorker.ts', 70, 18);

        // Line Numbers & Gutter
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 26, 36, 238);
        ctx.fillStyle = '#4B5563';
        ctx.font = '9px monospace';
        for (let l = 1; l <= 14; l++) {
          ctx.fillText(String(l).padStart(2, ' '), 8, 38 + l * 15);
        }

        // Code Editor Lines
        const codeLines = [
          { text: "import { GoogleGenAI } from '@google/genai';", col: '#F472B6' },
          { text: "export class CoworkerPipeline {", col: '#60A5FA' },
          { text: "  private memoryCache = new Map();", col: '#E5E7EB' },
          { text: "  async executeTask(step: TaskStep) {", col: '#A78BFA' },
          { text: "    const prompt = step.instructions;", col: '#34D399' },
          { text: "    const stream = await ai.infer(prompt);", col: '#FBBF24' },
          { text: "    if (stream.verified) {", col: '#F472B6' },
          { text: "      this.emit('task:success', step);", col: '#38BDF8' },
          { text: "      return { status: 200, grade: 'A+' };", col: '#34D399' },
          { text: "    }", col: '#F472B6' },
          { text: "    return this.retryAutonomous();", col: '#F87171' },
          { text: "  }", col: '#60A5FA' },
          { text: "}", col: '#60A5FA' },
        ];

        codeLines.forEach((c, idx) => {
          ctx.fillStyle = c.col;
          ctx.font = '10px monospace';
          ctx.fillText(c.text, 44, 53 + idx * 15);
        });

        // Blinking Green Cursor
        ctx.fillStyle = '#10B981';
        ctx.fillRect(44 + ctx.measureText("    return this.retryAutonomous();").width + 3, 203, 7, 12);

        // Minimap on Right
        ctx.fillStyle = '#161B22';
        ctx.fillRect(485, 26, 27, 238);
        for (let m = 0; m < 16; m++) {
          ctx.fillStyle = m % 3 === 0 ? '#38BDF8' : '#374151';
          ctx.fillRect(488, 32 + m * 8, 16 + (m % 5) * 2, 3);
        }

        // Bottom Status Bar
        ctx.fillStyle = '#2563EB';
        ctx.fillRect(0, 264, 512, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('⑂ main*  |  TypeScript 5.4  |  UTF-8  |  Ln 11, Col 35  |  Prettier ✔', 12, 280);
      } else {
        // Live Terminal & Docker/Kubernetes Pod Cluster Monitor
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, 512, 288);

        // Terminal Header
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 512, 24);
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('📟 zsh - dev-cluster@virtual-office: ~ (Cloud Mesh)', 14, 16);

        // Output lines
        const termLines = [
          { text: "$ kubectl get pods -n virtual-office -w", col: '#94A3B8' },
          { text: "NAME                                READY   STATUS    RESTARTS   AGE", col: '#64748B' },
          { text: "agent-david-worker-7f98b84d4-x2v8   1/1     Running   0          42m", col: '#34D399' },
          { text: "agent-maya-inference-6d54c86b7-j9k1 1/1     Running   0          42m", col: '#34D399' },
          { text: "agent-kenji-security-audit-5c128-p7 1/1     Running   0          18m", col: '#38BDF8' },
          { text: "[INFRA] Latency: 1.2ms | CPU: 14.8% | Memory: 420MB / 1024MB", col: '#FBBF24' },
          { text: "[DOCKER] Building container image... DONE in 1.4s", col: '#A78BFA' },
          { text: "✔ Zero-Trust Security Verification Grade: A+ [100% Passed]", col: '#10B981' },
          { text: "$ gemini-stream --status active --throughput 24.5k tok/sec", col: '#60A5FA' },
          { text: "➜ [READY] Listening for new instructions on /api/coworker-bus...", col: '#34D399' }
        ];

        termLines.forEach((t, idx) => {
          ctx.fillStyle = t.col;
          ctx.font = '10px monospace';
          ctx.fillText(t.text, 14, 46 + idx * 19);
        });

        // Blinking terminal cursor
        ctx.fillStyle = '#34D399';
        ctx.fillRect(14 + ctx.measureText("➜ [READY] Listening for new instructions on /api/coworker-bus...").width + 4, 217, 7, 13);

        // Bottom GPU / Cluster Meter
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(14, 252, 484, 18);
        ctx.fillStyle = '#10B981';
        ctx.fillRect(14, 252, 380, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('GPU INFERENCE LOAD: 78.4% (CLUSTER HEALTHY)', 24, 265);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // DR. MAYA CHEN (AI Research, Neural Networks, Knowledge Graph)
    // ------------------------------------------------------------------------
    case 'agent_maya': {
      if (screenType === 'left') {
        // Deep Neural Network Loss Curve & Accuracy Metrics
        ctx.fillStyle = '#06101E';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🧠 GEMINI NEURAL TRAINING & CONVERGENCE GRAPH', 16, 24);

        // Graph Box
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 40, 450, 160);

        // Grid lines
        for (let gy = 40; gy <= 200; gy += 40) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(480, gy); ctx.stroke();
        }

        // Loss Curve (Orange fading down)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(30, 60);
        ctx.bezierCurveTo(120, 160, 260, 185, 480, 190);
        ctx.stroke();

        // Accuracy Curve (Cyan soaring up)
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(30, 180);
        ctx.bezierCurveTo(140, 90, 280, 55, 480, 48);
        ctx.stroke();

        // Metric callouts
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✔ Model Accuracy: 99.42%', 40, 225);
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('⚡ Loss: 0.014 (Optimal)', 240, 225);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('📊 Epoch: 4,000 / 4,000', 380, 225);

        ctx.fillStyle = '#64748B';
        ctx.font = '9px monospace';
        ctx.fillText('Knowledge Vector DB: 1.4M chunks indexed • Zero-shot reasoning active', 40, 256);
      } else {
        // Research Paper & Citations Analysis Document
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('📄 Autonomous Multi-Agent Reasoning Architecture (2026)', 16, 26);
        ctx.fillStyle = '#64748B';
        ctx.font = '10px sans-serif';
        ctx.fillText('Author: Dr. Maya Chen, Lead AI Researcher • Virtual Office Lab', 16, 42);

        // Abstract Box
        ctx.fillStyle = '#EEF2F6';
        ctx.fillRect(16, 54, 480, 75);
        ctx.fillStyle = '#1E293B';
        ctx.font = '9px sans-serif';
        ctx.fillText('ABSTRACT: We introduce an enterprise multi-agent cooperation framework utilizing autonomous', 24, 72);
        ctx.fillText('coordination protocols. Real-time reasoning steps demonstrate a 3.4x improvement over single-threaded', 24, 88);
        ctx.fillText('LLM pipelines with complete task decomposition and deterministic self-correcting agents.', 24, 104);

        // Citations Matrix
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(16, 142, 225, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('📚 Verified Sources & Benchmarks', 26, 162);
        ctx.font = '9px sans-serif';
        ctx.fillText('• arXiv:2603.04812 [Multi-Agent Consensus]', 26, 182);
        ctx.fillText('• IEEE Transactions on Autonomous Systems', 26, 198);
        ctx.fillText('• HumanEval Evaluation: 94.6% Grade A+', 26, 214);

        // Fact Verification Stamp
        ctx.fillStyle = '#10B981';
        ctx.fillRect(255, 142, 240, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✅ FACT-CHECKING ENGINE', 270, 166);
        ctx.font = '10px sans-serif';
        ctx.fillText('Status: Peer-Reviewed', 270, 190);
        ctx.fillText('Hallucination Rate: < 0.01%', 270, 208);
        ctx.fillText('Confidence Index: 99.8%', 270, 226);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // ELENA ROSTOVA (UI/UX Design, Visual Art & Storytelling)
    // ------------------------------------------------------------------------
    case 'agent_elena': {
      if (screenType === 'left') {
        // Figma Canvas with Mobile App UI Mockups
        ctx.fillStyle = '#1E1E1E';
        ctx.fillRect(0, 0, 512, 288);

        // Figma Toolbar
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(0, 0, 512, 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('❖ Virtual Office Design System v4.0 (Component Library)', 16, 18);

        // Mobile Device Frame
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.fillRect(60, 42, 140, 220);
        ctx.strokeRect(60, 42, 140, 220);

        // App Header
        ctx.fillStyle = '#6366F1';
        ctx.fillRect(65, 48, 130, 36);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('Dashboard Mobile', 75, 68);

        // App Cards
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(68, 92, 124, 45);
        ctx.fillRect(68, 144, 124, 45);
        ctx.fillRect(68, 196, 124, 45);

        // Color Palette Swatches on right
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Brand Color Tokens', 240, 54);
        const palette = ['#6366F1', '#EC4899', '#10B981', '#38BDF8', '#F59E0B', '#F43F5E'];
        palette.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(240 + (idx % 3) * 75, 68 + Math.floor(idx / 3) * 55, 60, 35);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(col, 245 + (idx % 3) * 75, 96 + Math.floor(idx / 3) * 55);
        });

        // Layer Inspector Box
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(240, 190, 245, 75);
        ctx.fillStyle = '#E5E7EB';
        ctx.font = '9px monospace';
        ctx.fillText('Frame: iPhone 16 Pro (393 × 852 px)', 250, 210);
        ctx.fillText('Border Radius: 24px | Glassmorphism: 40px Blur', 250, 228);
        ctx.fillText('Typography: Inter Display & JetBrains Mono', 250, 246);
      } else {
        // Creative Pitch Deck / Artwork Render Canvas
        ctx.fillStyle = '#0B0F19';
        ctx.fillRect(0, 0, 512, 288);

        // Slide Banner
        const grad = ctx.createLinearGradient(0, 0, 512, 288);
        grad.addColorStop(0, '#4F46E5');
        grad.addColorStop(0.5, '#EC4899');
        grad.addColorStop(1, '#F97316');
        ctx.fillStyle = grad;
        ctx.fillRect(16, 16, 480, 180);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('THE FUTURE OF WORK IS HERE', 36, 68);
        ctx.font = '12px sans-serif';
        ctx.fillText('Next-Gen AI Coworker Operating System • Seamless Human-AI Team', 36, 96);

        // Slide counter
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(36, 130, 180, 32);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('SLIDE 04 / 12 • PITCH DECK', 50, 150);

        // Timeline milestones
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(16, 210, 480, 60);
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('🎨 CREATIVE DELIVERABLES: Brand System, Hero Renders, Investor Deck Complete', 30, 245);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // MARCUS VANCE (Finance, Cash Flow & Financial Terminal)
    // ------------------------------------------------------------------------
    case 'agent_marcus': {
      if (screenType === 'left') {
        // Bloomberg Style Financial Candlestick Charts
        ctx.fillStyle = '#0A101D';
        ctx.fillRect(0, 0, 512, 288);

        // Header ticker
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, 512, 26);
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('▲ REVENUE: $1.48M (+34.2%)  |  ARR: $17.8M  |  RUNWAY: 36 MO', 14, 18);

        // Candlesticks (Green and Red)
        const candleData = [
          { x: 30, o: 140, c: 110, h: 95, l: 155 },
          { x: 60, o: 115, c: 135, h: 105, l: 145 },
          { x: 90, o: 130, c: 90, h: 80, l: 140 },
          { x: 120, o: 95, c: 70, h: 60, l: 105 },
          { x: 150, o: 75, c: 85, h: 65, l: 95 },
          { x: 180, o: 80, c: 50, h: 42, l: 90 },
          { x: 210, o: 55, c: 45, h: 38, l: 65 },
          { x: 240, o: 48, c: 60, h: 40, l: 70 },
          { x: 270, o: 58, c: 35, h: 28, l: 65 },
          { x: 300, o: 38, c: 30, h: 22, l: 45 },
          { x: 330, o: 32, c: 42, h: 26, l: 50 },
          { x: 360, o: 40, c: 25, h: 18, l: 48 },
          { x: 390, o: 28, c: 20, h: 14, l: 36 },
          { x: 420, o: 22, c: 15, h: 10, l: 30 },
          { x: 450, o: 18, c: 12, h: 8, l: 24 },
        ];

        candleData.forEach(c => {
          const isUp = c.c < c.o;
          const col = isUp ? '#22C55E' : '#EF4444';
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(c.x + 8, c.h + 20); ctx.lineTo(c.x + 8, c.l + 20); ctx.stroke();

          ctx.fillStyle = col;
          const top = Math.min(c.o, c.c) + 20;
          const h = Math.max(Math.abs(c.c - c.o), 4);
          ctx.fillRect(c.x, top, 16, h);
        });

        // Golden Trendline
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(35, 160);
        ctx.bezierCurveTo(140, 110, 280, 60, 465, 36);
        ctx.stroke();

        // Footer KPI Bar
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 240, 512, 48);
        ctx.fillStyle = '#E5E7EB';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('GROSS PROFIT MARGIN: 84.6%  •  EBITDA: +$620K  •  ROI: 4.8x', 16, 268);
      } else {
        // Corporate Financial Projections Spreadsheet
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 512, 288);

        // Excel / Sheet Grid
        ctx.fillStyle = '#059669';
        ctx.fillRect(0, 0, 512, 26);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('📊 FY2026 Cash Flow Projection Model (Optimistic vs Base Case)', 14, 18);

        // Columns
        const cols = ['LINE ITEM', 'Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026', 'TOTAL'];
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(0, 26, 512, 22);
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 9px monospace';
        cols.forEach((col, i) => {
          ctx.fillText(col, 14 + i * 82, 41);
        });

        // Rows
        const rows = [
          ['Subscription MRR', '$320,000', '$460,000', '$680,000', '$940,000', '$2.40M'],
          ['AI Infrastructure', '-$42,000', '-$58,000', '-$72,000', '-$85,000', '-$257K'],
          ['OpEx & Payroll', '-$120,000', '-$140,000', '-$165,000', '-$190,000', '-$615K'],
          ['Net Net Profit', '+$158,000', '+$262,000', '+$443,000', '+$665,000', '+$1.52M'],
          ['Net Profit Margin', '49.3%', '56.9%', '65.1%', '70.7%', '63.3%']
        ];

        rows.forEach((r, idx) => {
          const isTotal = idx === 3;
          ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          if (isTotal) ctx.fillStyle = '#DCFCE7';
          ctx.fillRect(0, 48 + idx * 24, 512, 24);

          ctx.fillStyle = isTotal ? '#166534' : '#1E293B';
          ctx.font = isTotal ? 'bold 9px monospace' : '9px monospace';
          r.forEach((cell, ci) => {
            ctx.fillText(cell, 14 + ci * 82, 64 + idx * 24);
          });
        });

        ctx.fillStyle = '#065F46';
        ctx.fillRect(14, 195, 484, 75);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('FINANCIAL VERDICT: Solvency Grade AAA • Payback Period 4.2 Months', 26, 220);
        ctx.font = '9px sans-serif';
        ctx.fillText('All capital investments fully protected with 28 months treasury reserves.', 26, 242);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // ALEX MORGAN (Chief AI Orchestrator & CEO)
    // ------------------------------------------------------------------------
    case 'agent_alex': {
      if (screenType === 'left') {
        // Executive Multi-Agent Topology & Mission Control
        ctx.fillStyle = '#0B1120';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('👑 EXECUTIVE AI ORCHESTRATION ENGINE (ALEX MORGAN)', 16, 24);

        // Nodes map
        const nodes = [
          { name: 'Alex (CEO)', x: 256, y: 70, col: '#F59E0B' },
          { name: 'Maya (AI)', x: 130, y: 120, col: '#06B6D4' },
          { name: 'David (Tech)', x: 380, y: 120, col: '#8B5CF6' },
          { name: 'Elena (Design)', x: 80, y: 190, col: '#EC4899' },
          { name: 'Marcus (Finance)', x: 190, y: 200, col: '#10B981' },
          { name: 'Liam (Cloud)', x: 320, y: 200, col: '#0284C7' },
          { name: 'Kenji (Security)', x: 430, y: 190, col: '#EF4444' },
        ];

        // Draw connections
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        nodes.forEach((n, idx) => {
          if (idx > 0) {
            ctx.beginPath();
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        });

        // Draw node circles
        nodes.forEach(n => {
          ctx.fillStyle = n.col;
          ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y + 24);
        });
        ctx.textAlign = 'left';

        // Bottom status
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(16, 245, 480, 30);
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('10/10 AI AGENTS SYNCHRONIZED • ZERO INSTRUCTION BOTTLENECKS', 28, 265);
      } else {
        // Corporate Strategic Roadmap & 30-Day OKRs
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🎯 Q1-2026 STRATEGIC OBJECTIVES & KEY RESULTS (OKRs)', 16, 24);

        const okrs = [
          { title: 'OKR 1: 100% Autonomous AI Employee Task Resolution', prog: 92, col: '#10B981' },
          { title: 'OKR 2: Sub-second Latency for Multi-Agent Consensus', prog: 88, col: '#38BDF8' },
          { title: 'OKR 3: Enterprise Zero-Trust Audit Compliance Grade A+', prog: 100, col: '#F59E0B' },
          { title: 'OKR 4: Viral Market Expansion & 300% Organic Growth', prog: 84, col: '#EC4899' },
        ];

        okrs.forEach((okr, idx) => {
          ctx.fillStyle = '#E2E8F0';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(okr.title, 20, 56 + idx * 48);

          // Progress bar background
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(20, 64 + idx * 48, 470, 16);

          // Progress fill
          ctx.fillStyle = okr.col;
          ctx.fillRect(20, 64 + idx * 48, (okr.prog / 100) * 470, 16);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${okr.prog}% COMPLETED`, 400, 76 + idx * 48);
        });

        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('EXECUTIVE SUMMARY: All department milestones on track for launch.', 20, 265);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // DEFAULT / MARKETING / PRODUCT / LEGAL SPECIALIZED SCREENS
    // ------------------------------------------------------------------------
    default: {
      if (screenType === 'left') {
        // Kanban Agile Backlog / Marketing Funnel
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('📋 SPRINT BACKLOG & WORKSTREAM AUTOMATION', 16, 24);

        // 3 Kanban columns
        const cols = ['TO DO (3)', 'IN PROGRESS (2)', 'COMPLETED (14)'];
        cols.forEach((col, i) => {
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(16 + i * 162, 38, 154, 230);
          ctx.fillStyle = '#94A3B8';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(col, 26 + i * 162, 54);

          // Cards
          ctx.fillStyle = i === 2 ? '#065F46' : '#334155';
          ctx.fillRect(22 + i * 162, 66, 142, 55);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '9px sans-serif';
          ctx.fillText(i === 2 ? '✔ Launch Campaign' : 'Sprint Milestone', 30 + i * 162, 86);
        });
      } else {
        // Analytics Metrics Stream & Live Insights
        ctx.fillStyle = '#0B132B';
        ctx.fillRect(0, 0, 512, 288);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('📈 LIVE PERFORMANCE TELEMETRY STREAM', 16, 24);

        // Stats boxes
        const stats = [
          { label: 'Weekly Active Users', val: '42,890', sub: '+18.4%' },
          { label: 'Conversion Funnel', val: '14.8%', sub: '+3.2%' },
          { label: 'Task Completion Rate', val: '99.8%', sub: 'Grade A+' },
          { label: 'Avg Customer Rating', val: '4.95 / 5', sub: '580 Reviews' },
        ];

        stats.forEach((st, idx) => {
          const bx = 16 + (idx % 2) * 242;
          const by = 40 + Math.floor(idx / 2) * 95;
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(bx, by, 232, 85);
          ctx.fillStyle = '#94A3B8';
          ctx.font = '10px sans-serif';
          ctx.fillText(st.label, bx + 14, by + 26);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px monospace';
          ctx.fillText(st.val, bx + 14, by + 54);
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(st.sub, bx + 14, by + 74);
        });

        ctx.fillStyle = '#64748B';
        ctx.font = '9px monospace';
        ctx.fillText('Continuous real-time aggregation active • 0 errors detected', 16, 265);
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Modern Vertical Oak Slat Acoustic Panel Texture
 */
export function getAcousticSlatsTexture(): THREE.CanvasTexture {
  const cacheKey = 'slat_wood_acoustic';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark charcoal felt backing
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 256, 256);

  // Vertical warm oak wood slats
  const slatWidth = 18;
  const slatGap = 14;
  for (let x = 0; x < 256; x += (slatWidth + slatGap)) {
    // Slat base
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x, 0, slatWidth, 256);

    // Bevel highlight on left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, 0, 2, 256);

    // Bevel shadow on right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + slatWidth - 2, 0, 2, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  textureCache.set(cacheKey, texture);
  return texture;
}
