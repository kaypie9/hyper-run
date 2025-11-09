'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Overlay } from './ui/Overlay';
import ConnectWallet from './ConnectWallet';

const Runner3D = dynamic(() => import('./Runner3D'), { ssr: false });

type RunnerAPI = {
  start?: () => void;
  pause?: () => void;
  resume?: () => void;
  restart?: () => void;
  getStats?: () => { score: number; best: number; speed: number; lives?: number; world?: string };
};

function getPlayerId() {
  const k = 'velocity:player'
  let id = localStorage.getItem(k)
  if (!id) {
    id = 'player_' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem(k, id)
  }
  return id
}

async function submitScoreToLB(score: number) {
  try {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ game: 'velocity', member: getPlayerId(), score })
    })
  } catch (err) {
    console.error('leaderboard submit failed', err)
  }
}


export default function GameClient() {
  const apiRef = useRef<RunnerAPI | null>(null);
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [lives, setLives] = useState<number | undefined>(undefined);
  const [world, setWorld] = useState<string | undefined>(undefined);
  const bgVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDead, setIsDead] = useState(false);

  // receive lightweight ticks from Runner3D if it emits them
  const handleTick = useCallback((s: { score: number; best: number; speed: number; lives?: number; world?: string }) => {
    setScore(s.score);
    scoreRef.current = s.score
    setBest(s.best);
    setSpeed(s.speed);
    if (typeof s.lives === 'number') setLives(s.lives);
    if (s.world) setWorld(s.world);
  }, []);

  const handleState = useCallback((state: 'start' | 'run' | 'pause' | 'resume' | 'die' | 'restart') => {
    if (state === 'start') {
      setIsReady(false);
      setIsRunning(true);
      setIsPaused(false);
      setIsDead(false);
    } else if (state === 'pause') {
      setIsPaused(true);
    } else if (state === 'resume') {
      setIsPaused(false);
    } else if (state === 'die') {
      setIsRunning(false);
      setIsDead(true);
      submitScoreToLB(scoreRef.current)
    } else if (state === 'restart') {
      setIsDead(false);
      setIsRunning(true);
      setIsPaused(false);
    }
  }, []);

  // fallback key events if RunnerAPI is not implemented inside Runner3D
  const key = (k: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
  };

  const start = () => {
    if (apiRef.current?.start) apiRef.current.start();
    else key(' ');
    handleState('start');
  };

  const pause = () => {
    if (apiRef.current?.pause) apiRef.current.pause();
    else key('p');
    handleState('pause');
  };

  const resume = () => {
    if (apiRef.current?.resume) apiRef.current.resume();
    else key('p');
    handleState('resume');
  };

  const restart = () => {
    if (apiRef.current?.restart) apiRef.current.restart();
    else key('r');
    handleState('restart');
  };

  const left = () => key('ArrowLeft');
  const right = () => key('ArrowRight');
  const jump = () => key(' ');

  // poll basic stats if Runner3D exposes getStats
  useEffect(() => {
    const t = setInterval(() => {
      const s = apiRef.current?.getStats?.();
      if (s) handleTick(s);
    }, 100);
    return () => clearInterval(t);
  }, [handleTick]);

return (
  <div id="game-frame" style={{ position: 'relative', width: 'min(420px, 100%)', aspectRatio: '9 / 16', margin: '0 auto', overflow: 'hidden' }}>

        {/* background video */}
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/bg-poster.jpg"
        className="h-full w-full object-cover pointer-events-none"
        aria-hidden="true"
      >
        <source src="/media/bg.webm" type="video/webm" />
        <source src="/media/bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30" />
    </div>

    <div className="absolute inset-0">
      <Runner3D
        {...({
          onTick: handleTick,
          onState: handleState,
          apiRef: apiRef,
        } as any)}
      />
    </div>
    
        {/* connect wallet on home (menu) only */}
{!isRunning && !isDead && (
  <div className="absolute left-0 right-0 z-20" style={{ top: '58%' }}>
    <div className="flex justify-center">
      <ConnectWallet />
    </div>
  </div>
)}




    {/* top right pause button */}
    {isRunning && !isPaused && (
      <button
        onClick={pause}
        className="absolute top-3 right-3 z-20 px-3 py-2 rounded-xl bg-black/40 backdrop-blur border border-white/10 text-white"
      >
        pause
      </button>
    )}
    {isPaused && (
      <button
        onClick={resume}
        className="absolute top-3 right-3 z-20 px-3 py-2 rounded-xl bg-white text-black font-semibold"
      >
        resume
      </button>
    )}

    {/* overlays */}
    <Overlay
      visible={isPaused}
      title="paused"
      primaryText="resume"
      secondaryText="restart"
      onPrimary={resume}
      onSecondary={restart}
    />
    <Overlay
      visible={isDead}
      title="rip"
      subtitle={`score ${score.toLocaleString()}`}
      primaryText="restart"
      secondaryText="menu"
      onPrimary={restart}
      onSecondary={() => {
        setIsReady(true);
        setIsDead(false);
      }}
    />
    </div>
);
}
