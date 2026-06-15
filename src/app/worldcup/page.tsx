"use client";

import { motion } from "motion/react";
import { useEffect, useState, useCallback } from "react";
import {
  getWorldCupData,
  type Match,
  type GroupStandings,
  type Standing,
} from "@/lib/worldcup";
import {
  SoccerBall,
  Clock,
  CalendarBlank,
  Trophy,
  CaretRight,
  CaretDown,
  MapPin,
  Timer,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(utcStr: string) {
  const d = new Date(utcStr);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getMatchStatusBadge(m: Match) {
  if (m.status === "live")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {m.matchMinute ? `${m.matchMinute}'` : "LIVE"}
      </span>
    );
  if (m.status === "finished")
    return (
      <span className="rounded-full bg-zinc-700/50 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
        FT
      </span>
    );
  return (
    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
      {m.time} UTC
    </span>
  );
}

// ─── Countdown to Next Match ──────────────────────────────────────────

function CountdownToMatch({ match }: { match: Match }) {
  const targetDate = new Date(match.dateUTC);
  const [diff, setDiff] = useState(targetDate.getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setDiff(targetDate.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [match.dateUTC]);

  if (diff <= 0) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">🔴 LIVE NOW</div>
        <p className="text-sm text-zinc-400 mt-1">Match is underway!</p>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {[
        { label: "Days", value: days },
        { label: "Hours", value: hours },
        { label: "Mins", value: mins },
        { label: "Secs", value: secs },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-white tabular-nums tracking-tight">
            {unit.value.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-500/60 mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Group Table ──────────────────────────────────────────────────────

function GroupTable({ group, teams }: { group: string; teams: Standing[] }) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-900/30 bg-gradient-to-b from-emerald-950/40 to-zinc-950/60 backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-emerald-900/20"
      >
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" weight="fill" />
          <span className="text-sm font-bold tracking-wider text-emerald-300">
            {group}
          </span>
        </div>
        {open ? (
          <CaretDown size={14} className="text-zinc-500" />
        ) : (
          <CaretRight size={14} className="text-zinc-500" />
        )}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-emerald-900/20 text-zinc-500">
                <th className="px-3 py-2 text-left font-medium w-6">#</th>
                <th className="px-3 py-2 text-left font-medium">Team</th>
                <th className="px-2 py-2 text-center font-medium w-7">P</th>
                <th className="px-2 py-2 text-center font-medium w-6">W</th>
                <th className="px-2 py-2 text-center font-medium w-6">D</th>
                <th className="px-2 py-2 text-center font-medium w-6">L</th>
                <th className="px-2 py-2 text-center font-medium w-8">GF</th>
                <th className="px-2 py-2 text-center font-medium w-8">GA</th>
                <th className="px-2 py-2 text-center font-medium w-8">GD</th>
                <th className="px-3 py-2 text-center font-medium w-8">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => {
                const isQualifying = i < 2;
                return (
                  <tr
                    key={t.teamId}
                    className={`border-b border-emerald-900/10 transition-colors hover:bg-emerald-900/10 ${
                      isQualifying ? "bg-emerald-900/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-zinc-400 font-mono">{t.rank}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{t.badge}</span>
                        <span className={isQualifying ? "text-emerald-200 font-medium" : "text-zinc-300"}>
                          {t.teamName}
                        </span>
                        {isQualifying && (
                          <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Q
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.played}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.won}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.drawn}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.lost}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.goalsFor}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-zinc-300">{t.goalsAgainst}</td>
                    <td className={`px-2 py-2.5 text-center font-mono ${
                      t.goalDiff > 0 ? "text-emerald-400" : t.goalDiff < 0 ? "text-red-400" : "text-zinc-400"
                    }`}>
                      {t.goalDiff > 0 ? "+" : ""}{t.goalDiff}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-white">{t.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// ─── Match Card ────────────────────────────────────────────────────────

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isNext = match.status === "scheduled";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-4 transition-all ${
        isLive
          ? "border-green-500/40 bg-gradient-to-r from-green-950/40 to-emerald-950/20 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
          : isFinished
            ? "border-zinc-800/60 bg-zinc-900/40"
            : "border-zinc-800/40 bg-zinc-900/20"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">
          {match.groupName || match.round}
        </span>
        {getMatchStatusBadge(match)}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span className={`text-sm font-semibold ${
            isFinished
              ? match.homeScore! > match.awayScore! ? "text-white" : "text-zinc-400"
              : "text-zinc-200"
          }`}>
            {match.homeTeam}
          </span>
          <span className="text-xl">{match.homeBadge}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isFinished || isLive ? (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold font-mono ${
                isLive
                  ? "bg-green-500/20 text-green-400"
                  : match.homeScore! > match.awayScore!
                    ? "bg-emerald-900/30 text-white"
                    : match.homeScore === match.awayScore
                      ? "bg-zinc-800/60 text-zinc-300"
                      : "bg-zinc-800/40 text-zinc-500"
              }`}>
                {match.homeScore}
              </span>
              <span className="text-sm text-zinc-600">:</span>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold font-mono ${
                isLive
                  ? "bg-green-500/20 text-green-400"
                  : match.awayScore! > match.homeScore!
                    ? "bg-emerald-900/30 text-white"
                    : match.homeScore === match.awayScore
                      ? "bg-zinc-800/60 text-zinc-300"
                      : "bg-zinc-800/40 text-zinc-500"
              }`}>
                {match.awayScore}
              </span>
            </div>
          ) : (
            <span className="text-sm font-mono text-zinc-500">vs</span>
          )}
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-xl">{match.awayBadge}</span>
          <span className={`text-sm font-semibold ${
            isFinished
              ? match.awayScore! > match.homeScore! ? "text-white" : "text-zinc-400"
              : "text-zinc-200"
          }`}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600">
        <span className="flex items-center gap-1">
          <MapPin size={10} /> {match.venue}
        </span>
        <span className="flex items-center gap-1">
          <CalendarBlank size={10} /> {formatDateTime(match.dateUTC)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function WorldCupPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{
    matches: Match[];
    standings: GroupStandings[];
    nextMatch: Match | null;
    currentMatch: Match | null;
    realData: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"countdown" | "standings" | "matches">("countdown");
  const [visibleGroups, setVisibleGroups] = useState(4);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    getWorldCupData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [mounted]);

  // Auto-refresh every 30 seconds
  const refresh = useCallback(async () => {
    const d = await getWorldCupData();
    setData(d);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [mounted, refresh]);

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a1a0a] to-[#050508] px-6 py-28 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="mt-4 text-sm text-zinc-500">Loading World Cup data...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { matches, standings, nextMatch, currentMatch, realData } = data!;

  const liveMatches = matches.filter((m) => m.status === "live");
  const finishedMatches = matches.filter((m) => m.status === "finished");
  const upcomingMatches = matches.filter((m) => m.status === "scheduled");

  const activeMatch = currentMatch || liveMatches[0];
  const targetMatch = activeMatch || nextMatch;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1a0a] via-[#070d07] to-[#050508] px-6 py-28 md:px-16">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/3 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-green-500/3 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-600/2 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/30 bg-emerald-950/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-400/80">
            <SoccerBall size={12} weight="fill" className="text-emerald-400" />
            / 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mt-3">
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              World Cup 2026
            </span>
          </h1>
          <p className="text-emerald-200/60 mt-3 max-w-2xl text-lg">
            Live scores, standings & schedule for the 2026 FIFA World Cup
            hosted by{" "}
            <span className="text-white font-medium">USA • Canada • Mexico</span>
            {!realData && (
              <span className="block mt-1 text-xs text-amber-500/70">
                ⚡ Live API unavailable — showing simulated data
              </span>
            )}
          </p>
        </motion.div>

        {/* ═══ COUNTDOWN HERO ═══ */}
        {targetMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 rounded-2xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/50 via-zinc-950/60 to-emerald-950/30 p-6 md:p-10 relative overflow-hidden"
          >
            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-green-500/5 blur-[60px]" />

            <div className="relative z-10">
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <Timer size={16} className="text-emerald-400" weight="fill" />
                <span className="text-xs uppercase tracking-[0.2em] text-emerald-400/70">
                  {activeMatch?.status === "live"
                    ? "🔴 LIVE — Match in Progress"
                    : nextMatch
                      ? "⏳ Countdown to Next Match"
                      : "No upcoming matches"}
                </span>
              </div>

              {/* Matchup */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-5xl sm:text-6xl">{targetMatch.homeBadge}</span>
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {targetMatch.homeTeam}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  {activeMatch?.status === "live" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl font-bold font-mono text-green-400">
                        {targetMatch.homeScore}
                      </span>
                      <span className="text-xl text-zinc-500">:</span>
                      <span className="text-3xl sm:text-4xl font-bold font-mono text-green-400">
                        {targetMatch.awayScore}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-zinc-600 mb-1">VS</span>
                      <span className="text-xs text-emerald-500/60">
                        {formatDateTime(targetMatch.dateUTC)}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-5xl sm:text-6xl">{targetMatch.awayBadge}</span>
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {targetMatch.awayTeam}
                  </span>
                </div>
              </div>

              {/* Countdown or Live indicator */}
              {activeMatch?.status === "live" ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                    </span>
                    <span className="text-sm font-semibold text-green-400">
                      {targetMatch.matchMinute ? `${targetMatch.matchMinute}'` : "LIVE"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    {targetMatch.venue}
                  </p>
                </div>
              ) : targetMatch.status === "scheduled" ? (
                <div className="text-center">
                  <CountdownToMatch match={targetMatch} />
                  <p className="text-xs text-zinc-500 mt-3 flex items-center justify-center gap-1">
                    <MapPin size={10} /> {targetMatch.venue}
                  </p>
                </div>
              ) : null}

              {/* Group info */}
              <div className="text-center mt-3">
                <span className="text-[11px] uppercase tracking-wider text-zinc-600">
                  {targetMatch.groupName || targetMatch.round}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Tab Navigation ─── */}
        <div className="flex gap-1 mb-6 rounded-xl border border-emerald-900/20 bg-emerald-950/20 p-1 w-fit">
          {[
            { key: "countdown", label: "Countdown", icon: Timer },
            { key: "standings", label: "Standings", icon: Trophy },
            { key: "matches", label: "All Matches", icon: SoccerBall },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-emerald-900/10"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: Countdown ─── */}
        {activeTab === "countdown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 mb-10"
          >
            {/* Tournament countdown */}
            <div className="rounded-xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/30 to-zinc-950/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-amber-400" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">Time until Final</span>
              </div>
              <CountdownToFinal />
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/30 to-zinc-950/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">Tournament Stats</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{matches.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{finishedMatches.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Played</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400 font-mono">{liveMatches.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Live Now</div>
                </div>
              </div>
            </div>

            {/* Upcoming matches list */}
            <div className="sm:col-span-2 rounded-xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/30 to-zinc-950/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarBlank size={14} className="text-blue-400" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">Upcoming Matches</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {upcomingMatches.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-900/40 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.homeBadge}</span>
                      <span className="text-zinc-300">{m.homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span>vs</span>
                      <span className="text-zinc-300">{m.awayTeam}</span>
                      <span>{m.awayBadge}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(m.dateUTC).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── TAB: Standings ─── */}
        {activeTab === "standings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            {standings.length > 0 ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {standings.slice(0, visibleGroups).map((g) => (
                    <GroupTable key={g.group} group={g.group} teams={g.teams} />
                  ))}
                </div>
                {visibleGroups < standings.length && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setVisibleGroups((v) => v + 4)}
                    className="mt-4 mx-auto block rounded-lg border border-emerald-800/30 px-4 py-2 text-xs text-emerald-400/70 hover:bg-emerald-900/20 transition-colors"
                  >
                    Show {Math.min(4, standings.length - visibleGroups)} more groups
                  </motion.button>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-zinc-500">
                <Trophy size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Standings data coming soon</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TAB: All Matches ─── */}
        {activeTab === "matches" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-green-400">LIVE NOW</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {liveMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Latest Results */}
            {finishedMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                  Latest Results
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {finishedMatches
                    .sort((a, b) => new Date(b.dateUTC).getTime() - new Date(a.dateUTC).getTime())
                    .slice(0, 8)
                    .map((m) => (
                      <MatchCard key={m.id} match={m} />
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                  Upcoming Matches
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcomingMatches.slice(0, 12).map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[11px] text-zinc-700 mt-12 pb-8"
        >
          Data from OpenLigaDB • Auto-refreshes every 30s
        </motion.p>
      </div>
    </main>
  );
}

// ─── Countdown to Final ────────────────────────────────────────────────

function CountdownToFinal() {
  const targetDate = new Date("2026-07-19T18:00:00Z");
  const [diff, setDiff] = useState(targetDate.getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setDiff(targetDate.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (diff <= 0) return <div className="text-2xl font-bold text-amber-400">🏆 The World Cup is HERE!</div>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-3 sm:gap-5">
      {[
        { label: "Days", value: d },
        { label: "Hours", value: h },
        { label: "Mins", value: m },
        { label: "Secs", value: s },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {unit.value.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-500/70 mt-0.5">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
