'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Layers, RefreshCw, BookOpen, AlertTriangle, CheckCircle2, Share2, Check, Trophy, Sparkles } from 'lucide-react';

const ACCENT_COLOR = '#d97706'; // Warm Amber/Wood color

/* ═══════════════════════ VOICE & AUDIO SYNTHESIZER ═══════════════════════ */
function speakVoice(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

function playJengaSFX(type: 'pull' | 'place' | 'wobble' | 'crash') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'pull') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'place') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'wobble') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'crash') {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      whiteNoise.connect(gain); gain.connect(ctx.destination);
      whiteNoise.start(); whiteNoise.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {}
}

/* ═══════════════════════ GRADE-BASED TRIVIA QUESTIONS ═══════════════════════ */
const JENGA_TRIVIA = {
  g12: [
    { q: 'What is 5 + 3?', options: ['7', '8', '9', '10'], a: 1 },
    { q: 'Which animal says "Moo"?', options: ['Dog', 'Cat', 'Cow', 'Duck'], a: 2 },
    { q: 'What color is the sky on a clear day?', options: ['Green', 'Blue', 'Red', 'Yellow'], a: 1 },
    { q: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], a: 1 }
  ],
  g36: [
    { q: 'Which gas do plants absorb from the air?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], a: 1 },
    { q: 'What is the capital of Nigeria?', options: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], a: 1 },
    { q: 'What is 12 × 12?', options: ['124', '144', '164', '140'], a: 1 },
    { q: 'Which body organ pumps blood?', options: ['Lungs', 'Brain', 'Heart', 'Stomach'], a: 2 }
  ],
  g712: [
    { q: 'What is the chemical symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], a: 1 },
    { q: 'Solve for x: 2x + 10 = 26', options: ['6', '8', '10', '12'], a: 1 },
    { q: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], a: 2 },
    { q: 'What is the speed of light approximately?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], a: 0 }
  ]
};

export default function JengaGame() {
  const [gradeTier, setGradeTier] = useState<'g12' | 'g36' | 'g712'>('g36');
  
  // Layer count based on Grade
  const totalLayers = gradeTier === 'g12' ? 12 : gradeTier === 'g36' ? 18 : 24;

  const [tower, setTower] = useState<{ id: number; layer: number; pos: number; pulled: boolean }[]>([]);
  const [wobble, setWobble] = useState(0); // 0 to 100%
  const [score, setScore] = useState(0);
  const [isCrashed, setIsCrashed] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<typeof JENGA_TRIVIA['g36'][0] | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(-35);
  
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize Jenga Tower
  const initTower = useCallback(() => {
    const blocks = [];
    let id = 0;
    for (let l = 0; l < totalLayers; l++) {
      for (let p = 0; p < 3; p++) {
        blocks.push({ id: id++, layer: l, pos: p, pulled: false });
      }
    }
    setTower(blocks);
    setWobble(5);
    setScore(0);
    setIsCrashed(false);
    setActiveQuestion(null);
    setSelectedBlockId(null);

    const label = gradeTier === 'g12' ? 'Grade 1-2' : gradeTier === 'g36' ? 'Grade 3-6' : 'Grade 7-12';
    speakVoice(`Jenga physics tower initialized for ${label}. Pull a block carefully!`);
  }, [totalLayers, gradeTier]);

  useEffect(() => {
    initTower();
  }, [gradeTier, initTower]);

  const handleBlockPull = (blockId: number, layer: number) => {
    if (isCrashed || activeQuestion) return;

    // Do not allow pulling from top layer
    if (layer >= totalLayers - 1) {
      speakVoice("You cannot pull blocks from the top layer!");
      return;
    }

    playJengaSFX('pull');
    setSelectedBlockId(blockId);

    // Pick random trivia question based on grade
    const questions = JENGA_TRIVIA[gradeTier];
    const q = questions[Math.floor(Math.random() * questions.length)];
    setActiveQuestion(q);
    speakVoice(`Block pulled! Answer the question: ${q.q}`);
  };

  const handleAnswerSubmit = (optionIdx: number) => {
    if (!activeQuestion || selectedBlockId === null) return;

    if (optionIdx === activeQuestion.a) {
      // Correct Answer: Place block safely on top
      playJengaSFX('place');
      setScore(s => s + 20);

      // Increase wobble slightly
      const nextWobble = Math.min(100, wobble + (gradeTier === 'g712' ? 12 : gradeTier === 'g36' ? 8 : 4));
      setWobble(nextWobble);

      setTower(prev => prev.map(b => b.id === selectedBlockId ? { ...b, pulled: true } : b));
      setActiveQuestion(null);
      setSelectedBlockId(null);
      speakVoice("Correct! Block placed safely on top. Plus 20 points.");

      if (nextWobble >= 100) {
        triggerCrash();
      }
    } else {
      // Incorrect Answer: Increase wobble significantly!
      playJengaSFX('wobble');
      const penaltyWobble = wobble + (gradeTier === 'g712' ? 30 : gradeTier === 'g36' ? 22 : 15);
      setWobble(penaltyWobble);
      speakVoice("Wrong answer! The tower is wobbling dangerously!");

      if (penaltyWobble >= 100) {
        triggerCrash();
      } else {
        setActiveQuestion(null);
        setSelectedBlockId(null);
      }
    }
  };

  const triggerCrash = () => {
    setIsCrashed(true);
    playJengaSFX('crash');
    speakVoice("Oh no! The tower collapsed! Game over.");
    setActiveQuestion(null);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    playJengaSFX('pull');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <GameLayout
      title="Jenga Physics Block Tower"
      icon={<Layers style={{ width: '24px', height: '24px' }} />}
      accentColor={ACCENT_COLOR}
      score={score}
      fullscreen={true}
    >
      <div style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        
        {/* ─── LEFT SIDEBAR: GRADE TIER & WOBBLE GAUGE ─── */}
        <div style={{
          flex: '0 0 210px', width: '210px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Grade Selector */}
          <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: '12px', padding: '8px 10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px' }}>
              🎓 Grade Level
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'g12', label: 'Grade 1 - 2 (12 Layers)' },
                { id: 'g36', label: 'Grade 3 - 6 (18 Layers)' },
                { id: 'g712', label: 'Grade 7 - 12 (24 Layers)' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setGradeTier(g.id as any)}
                  style={{
                    padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                    fontSize: '10px', fontWeight: 900, cursor: 'pointer', textAlign: 'left',
                    background: gradeTier === g.id ? ACCENT_COLOR : '#1e293b',
                    color: '#ffffff'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tower Wobble & Balance Gauge */}
          <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: '12px', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>⚖️ Wobble Gauge</span>
              <span style={{ color: wobble > 70 ? '#ef4444' : wobble > 40 ? '#f59e0b' : '#22c55e', fontWeight: 950 }}>{wobble}%</span>
            </div>

            {/* Wobble Bar */}
            <div style={{ height: '12px', background: '#1e293b', borderRadius: '6px', border: '1px solid #000', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${wobble}%`,
                background: wobble > 70 ? '#ef4444' : wobble > 40 ? '#f59e0b' : '#22c55e',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4, marginTop: 'auto' }}>
              {wobble < 30 ? '🟢 Tower is stable.' : wobble < 70 ? '🟡 Tower is leaning!' : '🔴 DANGER! High crash risk!'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={copyInviteLink}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: copiedLink ? '#22c55e' : '#fbbf24', color: '#000',
                fontWeight: 900, fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
              {copiedLink ? 'Link Copied!' : 'Share Challenge'}
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#38bdf8', color: '#000', fontWeight: 900, fontSize: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <BookOpen size={12} /> Rules & Guide
            </button>
          </div>
        </div>

        {/* ─── CENTER AREA: TRUE 3D ISOMETRIC JENGA TOWER CANVAS ─── */}
        <div style={{
          flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
        }}>
          {/* 3D View Control Bar */}
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'center', background: '#111827',
            padding: '4px 16px', borderRadius: '10px', border: '1.5px solid #1e293b',
            marginBottom: '6px', zIndex: 10
          }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#fbbf24' }}>🎲 3D View Angle:</span>
            <input
              type="range"
              min="-90"
              max="90"
              value={rotationAngle}
              onChange={e => setRotationAngle(Number(e.target.value))}
              style={{ width: '120px', cursor: 'pointer', accentColor: ACCENT_COLOR }}
            />
            <button
              onClick={() => setRotationAngle(-35)}
              style={{ padding: '2px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
            >
              Reset 3D
            </button>
          </div>

          {/* 3D Perspective Stage Container */}
          <div style={{
            width: '100%', height: 'calc(100% - 40px)', background: '#0b0f19', border: '3px solid #000',
            borderRadius: '16px', overflow: 'hidden', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            perspective: '1400px'
          }}>
            
            {/* 3D Rotating Tower Wrapper with Dynamic Scaling */}
            {(() => {
              const layerSpacing = totalLayers === 12 ? 16 : totalLayers === 18 ? 11 : 8.5;
              const towerScale = totalLayers === 12 ? 0.85 : totalLayers === 18 ? 0.68 : 0.54;

              return (
                <div style={{
                  display: 'flex', flexDirection: 'column-reverse', alignItems: 'center',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                  transform: isCrashed
                    ? `scale(${towerScale}) rotateX(65deg) rotateZ(45deg) translateZ(-40px)`
                    : `scale(${towerScale}) rotateX(46deg) rotateZ(${rotationAngle + (Math.sin(wobble) * (wobble / 15))}deg) translateY(60px)`,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  
                  {/* Wooden Base Platform */}
                  <div style={{
                    width: '210px', height: '210px', background: '#451a03',
                    border: '4px solid #000000', borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.5)',
                    marginBottom: '10px', transform: 'translateZ(-15px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fbbf24', fontSize: '12px', fontWeight: 950, letterSpacing: '2px'
                  }}>
                    EDVOURA 3D TOWER
                  </div>

                  {/* Stacked 3D Wood Block Layers */}
                  {Array.from({ length: totalLayers }).map((_, layerIdx) => {
                    const layerBlocks = tower.filter(b => b.layer === layerIdx);
                    const isOddLayer = layerIdx % 2 === 1;

                    // Wobble vibration calculation for layer
                    const layerJitter = wobble > 30 ? (Math.sin(layerIdx * 1.5) * (wobble / 25)) : 0;

                    return (
                      <div
                        key={layerIdx}
                        style={{
                          display: 'flex', gap: '6px',
                          transformStyle: 'preserve-3d',
                          transform: `rotateZ(${isOddLayer ? 90 : 0}deg) translateX(${layerJitter}px) translateZ(${layerIdx * layerSpacing}px)`,
                          margin: '2px 0',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        {layerBlocks.map(block => {
                          if (block.pulled) return <div key={block.id} style={{ width: '56px', height: '26px' }} />;

                          return (
                            <div
                              key={block.id}
                              onClick={() => handleBlockPull(block.id, block.layer)}
                              style={{
                                width: '56px', height: '26px', position: 'relative',
                                transformStyle: 'preserve-3d', cursor: isCrashed ? 'default' : 'pointer',
                                transition: 'transform 0.15s ease'
                              }}
                            >
                              {/* 3D Top Face */}
                              <div style={{
                                position: 'absolute', inset: 0, background: '#d97706',
                                border: '1.5px solid #000000', borderRadius: '4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', fontWeight: 950, color: '#ffffff',
                                boxShadow: 'inset 0 0 4px rgba(255,255,255,0.4)',
                                transform: 'translateZ(12px)'
                              }}>
                                L{block.layer + 1}
                              </div>

                              {/* 3D Front Face */}
                              <div style={{
                                position: 'absolute', width: '100%', height: '12px', bottom: 0,
                                background: '#b45309', border: '1.5px solid #000000', borderRadius: '2px',
                                transformOrigin: 'bottom', transform: 'rotateX(-90deg)'
                              }} />

                              {/* 3D Right Side Face */}
                              <div style={{
                                position: 'absolute', width: '12px', height: '100%', right: 0,
                                background: '#78350f', border: '1.5px solid #000000', borderRadius: '2px',
                                transformOrigin: 'right', transform: 'rotateY(90deg)'
                              }} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Crash Game Over Overlay */}
          {isCrashed && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '16px', zIndex: 30, color: '#fff', textAlign: 'center'
            }}>
              <AlertTriangle size={48} color="#ef4444" />
              <h2 style={{ fontSize: '24px', fontWeight: 950, color: '#ef4444', margin: '8px 0' }}>TOWER COLLAPSED!</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>Final Score: {score} Points</p>
              <button
                onClick={initTower}
                style={{ padding: '10px 24px', background: ACCENT_COLOR, color: '#fff', border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}
              >
                Rebuild Tower
              </button>
            </div>
          )}

          {/* Trivia Question Pop-over */}
          {activeQuestion && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 40
            }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '3px solid #000', padding: '20px', width: '380px', color: '#000', boxShadow: '6px 6px 0 #000' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: ACCENT_COLOR, textTransform: 'uppercase', marginBottom: '6px' }}>
                  🪵 Block Extracted — Trivia Challenge
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 950, margin: '0 0 12px 0' }}>{activeQuestion.q}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(idx)}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #000',
                        fontSize: '12px', fontWeight: 800, background: '#f1f5f9', color: '#000',
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL: STATS & RESTART ─── */}
        <div style={{
          flex: '0 0 180px', width: '180px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Current Score</div>
            <div style={{ fontSize: '24px', fontWeight: 950, color: ACCENT_COLOR }}>{score}</div>
          </div>

          <button
            onClick={initTower}
            style={{
              padding: '10px', background: ACCENT_COLOR, color: '#fff', border: '2px solid #000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000', marginTop: 'auto'
            }}
          >
            <RefreshCw size={14} /> Rebuild Tower
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '3px solid #000',
            padding: '24px', width: '440px', color: '#000', boxShadow: '8px 8px 0 #000'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 950, color: ACCENT_COLOR, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} /> Jenga Tower Rules
            </div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
              Pull wooden blocks from the lower layers of the tower. Each block pull triggers a trivia challenge. Answer correctly to safely place the block on top and score points! Answering incorrectly increases tower wobble risk!
            </p>
            <button
              onClick={() => setShowRulesModal(false)}
              style={{ width: '100%', padding: '10px', background: ACCENT_COLOR, color: '#fff', border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}
            >
              Got It! Close
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
