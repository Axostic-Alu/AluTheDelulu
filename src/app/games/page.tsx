"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import { ParticleCard, GlobalSpotlight } from "@/components/MagicBento";
import { games } from "@/data/games";
import PetalsBackground from "@/components/PetalsBackground";

// Dynamically derive unique genres from the data
function getGenres() {
  const genreSet = new Set(games.map((g) => g.genre));
  return ["All", ...Array.from(genreSet).sort()];
}

const GENRES = getGenres();

export default function GamesPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const filteredGames = useMemo(
    () =>
      selectedGenre === "All"
        ? games
        : games.filter((g) => g.genre === selectedGenre),
    [selectedGenre]
  );

  return (
    <>
      <PetalsBackground />
      <main className="relative min-h-screen text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
          🎮 Games I&apos;ve Played
        </h1>
        <p className="mt-3 text-gray-400 text-lg max-w-2xl">
          Over 300 games played. Here are some of my favorites and the ones that left a mark.
        </p>
      </div>

      {/* Genre Filter */}
      <div className="max-w-7xl mx-auto mb-10 relative z-10">
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedGenre === genre
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* ── MagicBento-merged games grid ── */}
      <GlobalSpotlight
        gridRef={gridRef}
        spotlightRadius={350}
        glowColor="99, 102, 241"
      />

      <div
        ref={gridRef}
        className="bento-section max-w-7xl mx-auto relative z-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, i) => (
            <ParticleCard
              key={i}
              className="game-particle-wrapper"
              particleCount={8}
              glowColor={(() => {
                const h = game.accentColor.replace("#", "");
                return `${parseInt(h.substring(0, 2), 16)}, ${parseInt(h.substring(2, 4), 16)}, ${parseInt(h.substring(4, 6), 16)}`;
              })()}
              enableTilt={false}
              clickEffect={true}
              enableMagnetism={false}
            >
              <GameCard
                title={game.title}
                description={game.description}
                review={game.review}
                rating={game.rating}
                gradient={game.gradient}
                accentColor={game.accentColor}
              />
            </ParticleCard>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 && (
        <p className="text-center text-gray-500 mt-20 relative z-10">No games found for this genre.</p>
      )}

      {/* Back link */}
      <div className="max-w-7xl mx-auto mt-16 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-sky-400 transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </main>
    </>
  );
}
