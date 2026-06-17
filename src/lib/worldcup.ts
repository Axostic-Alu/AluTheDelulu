// ─── World Cup 2026 Data Layer ─────────────────────────────────────────
// Uses OpenLigaDB API for live WC2026 data — no API key required

const OPENLIGA_BASE = "https://api.openligadb.de";
const LEAGUE_SHORTCUT = "wm26";
const SEASON = "2026";

// ─── Types ────────────────────────────────────────────────────────────

export type TeamInfo = {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  group: string;
};

export type Standing = {
  rank: number;
  teamId: string;
  teamName: string;
  badge: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string;
};

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge: string;
  awayBadge: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  dateUTC: string;
  status: "scheduled" | "live" | "finished";
  round: string;
  venue: string;
  groupName?: string;
  matchMinute?: number;
};

export type GroupStandings = {
  group: string;
  teams: Standing[];
};

// ─── Country Translation & Flag Map ──────────────────────────────────

// Maps German API country names to English names and flags
const TEAM_MAP: Record<string, { name: string; flag: string }> = {
  "Mexiko": { name: "Mexico", flag: "🇲🇽" },
  "Südafrika": { name: "South Africa", flag: "🇿🇦" },
  "Südkorea": { name: "South Korea", flag: "🇰🇷" },
  "Tschechien": { name: "Czech Republic", flag: "🇨🇿" },
  "Kanada": { name: "Canada", flag: "🇨🇦" },
  "Bosnien und Herzegowina": { name: "Bosnia & Herzegovina", flag: "🇧🇦" },
  "USA": { name: "USA", flag: "🇺🇸" },
  "Paraguay": { name: "Paraguay", flag: "🇵🇾" },
  "Katar": { name: "Qatar", flag: "🇶🇦" },
  "Schweiz": { name: "Switzerland", flag: "🇨🇭" },
  "Brasilien": { name: "Brazil", flag: "🇧🇷" },
  "Marokko": { name: "Morocco", flag: "🇲🇦" },
  "Haiti": { name: "Haiti", flag: "🇭🇹" },
  "Schottland": { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Australien": { name: "Australia", flag: "🇦🇺" },
  "Türkei": { name: "Turkey", flag: "🇹🇷" },
  "Deutschland": { name: "Germany", flag: "🇩🇪" },
  "Curaçao": { name: "Curaçao", flag: "🇨🇼" },
  "Niederlande": { name: "Netherlands", flag: "🇳🇱" },
  "Japan": { name: "Japan", flag: "🇯🇵" },
  "Elfenbeinküste": { name: "Ivory Coast", flag: "🇨🇮" },
  "Ecuador": { name: "Ecuador", flag: "🇪🇨" },
  "Schweden": { name: "Sweden", flag: "🇸🇪" },
  "Tunesien": { name: "Tunisia", flag: "🇹🇳" },
  "Spanien": { name: "Spain", flag: "🇪🇸" },
  "Kap Verde": { name: "Cape Verde", flag: "🇨🇻" },
  "Belgien": { name: "Belgium", flag: "🇧🇪" },
  "Ägypten": { name: "Egypt", flag: "🇪🇬" },
  "Saudi Arabien": { name: "Saudi Arabia", flag: "🇸🇦" },
  "Uruguay": { name: "Uruguay", flag: "🇺🇾" },
  "Iran": { name: "Iran", flag: "🇮🇷" },
  "Neuseeland": { name: "New Zealand", flag: "🇳🇿" },
  "Frankreich": { name: "France", flag: "🇫🇷" },
  "Senegal": { name: "Senegal", flag: "🇸🇳" },
  "Irak": { name: "Iraq", flag: "🇮🇶" },
  "Norwegen": { name: "Norway", flag: "🇳🇴" },
  "Argentinien": { name: "Argentina", flag: "🇦🇷" },
  "Algerien": { name: "Algeria", flag: "🇩🇿" },
  "Österreich": { name: "Austria", flag: "🇦🇹" },
  "Jordanien": { name: "Jordan", flag: "🇯🇴" },
  "Portugal": { name: "Portugal", flag: "🇵🇹" },
  "DR Kongo": { name: "DR Congo", flag: "🇨🇩" },
  "England": { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Kroatien": { name: "Croatia", flag: "🇭🇷" },
  "Ghana": { name: "Ghana", flag: "🇬🇭" },
  "Panama": { name: "Panama", flag: "🇵🇦" },
  "Usbekistan": { name: "Uzbekistan", flag: "🇺🇿" },
  "Kolumbien": { name: "Colombia", flag: "🇨🇴" },
};

function getTeamInfo(germanName: string): { name: string; flag: string } {
  return TEAM_MAP[germanName] || { name: germanName, flag: "🏳️" };
}

// ─── API Functions ────────────────────────────────────────────────────

async function fetchFromOpenLiga(endpoint: string): Promise<any | null> {
  try {
    const res = await fetch(`${OPENLIGA_BASE}/${endpoint}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function convertOpenLigaMatch(m: any): Match {
  const dtUTC = new Date(m.matchDateTimeUTC);
  const now = new Date();
  const isFinished = m.matchIsFinished === true;

  // Determine status
  let status: "scheduled" | "live" | "finished" = "scheduled";
  if (isFinished) {
    status = "finished";
  } else if (dtUTC <= now) {
    status = "live";
  }

  // Get final/current score
  let homeScore: number | null = null;
  let awayScore: number | null = null;
  if (m.matchResults) {
    for (const r of m.matchResults) {
      if (r.resultName === "Endergebnis" || r.resultName === "Aktuell") {
        homeScore = r.pointsTeam1;
        awayScore = r.pointsTeam2;
        break;
      }
    }
    // Fallback: if no Endergebnis but match is finished, use whatever result exists
    if (isFinished && homeScore === null && m.matchResults.length > 0) {
      const last = m.matchResults[m.matchResults.length - 1];
      homeScore = last.pointsTeam1;
      awayScore = last.pointsTeam2;
    }
  }

  // Estimate match minute for live matches
  let matchMinute: number | undefined;
  if (status === "live") {
    const elapsedMs = now.getTime() - dtUTC.getTime();
    matchMinute = Math.floor(elapsedMs / 60000);
    if (matchMinute > 120) matchMinute = 90 + Math.floor((matchMinute - 90) / 2); // approximate extra time
  }

  const rawHomeTeam = m.team1?.teamName || "TBD";
  const rawAwayTeam = m.team2?.teamName || "TBD";
  const homeTeamData = getTeamInfo(rawHomeTeam);
  const awayTeamData = getTeamInfo(rawAwayTeam);

  const dateStr = dtUTC.toISOString().slice(0, 10);
  const timeStr = dtUTC.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });

  return {
    id: String(m.matchID || Math.random()),
    homeTeam: homeTeamData.name,
    awayTeam: awayTeamData.name,
    homeBadge: homeTeamData.flag,
    awayBadge: awayTeamData.flag,
    homeScore,
    awayScore,
    date: dateStr,
    time: timeStr,
    dateUTC: m.matchDateTimeUTC,
    status,
    round: m.group?.groupName || "Group Stage",
    venue: m.location ? `${m.location.locationStadium}, ${m.location.locationCity}` : "TBD",
    groupName: m.group?.groupName || undefined,
    matchMinute,
  };
}

export async function fetchAllMatches(): Promise<Match[]> {
  const data = await fetchFromOpenLiga(`getmatchdata/${LEAGUE_SHORTCUT}/${SEASON}`);
  if (!data || !Array.isArray(data)) return [];
  return data.map(convertOpenLigaMatch);
}

export async function fetchNextMatch(): Promise<Match | null> {
  // OpenLigaDB has a dedicated next-match endpoint
  const data = await fetchFromOpenLiga(`getnextmatch/${LEAGUE_SHORTCUT}`);
  if (data && Array.isArray(data) && data.length > 0) {
    return convertOpenLigaMatch(data[0]);
  }
  // Fallback: manually find next match
  const all = await fetchAllMatches();
  const upcoming = all
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.dateUTC).getTime() - new Date(b.dateUTC).getTime());
  return upcoming[0] || null;
}

export async function fetchCurrentOrNextMatch(): Promise<Match | null> {
  const all = await fetchAllMatches();

  // Check for live matches first
  const live = all.filter((m) => m.status === "live");
  if (live.length > 0) return live[0];

  // Then next upcoming
  const upcoming = all
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.dateUTC).getTime() - new Date(b.dateUTC).getTime());
  return upcoming[0] || null;
}

export async function fetchStandings(): Promise<GroupStandings[]> {
  const data = await fetchFromOpenLiga(`getbltable/${LEAGUE_SHORTCUT}/${SEASON}`);
  if (!data || !Array.isArray(data)) return [];

  // OpenLigaDB's getbltable returns all teams; group them by groupName
  const groupMap = new Map<string, any[]>();
  for (const row of data) {
    const g = row.groupName || "Unknown";
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(row);
  }

  return Array.from(groupMap.entries()).map(([group, rows]) => {
    const teams: Standing[] = rows.map((r: any, idx: number) => {
      const rawName = r.teamName || "Unknown";
      const teamData = getTeamInfo(rawName);

      return {
        rank: idx + 1,
        teamId: String(r.teamId || ""),
        teamName: teamData.name,
        badge: teamData.flag,
        group,
        played: r.matches ?? 0,
        won: r.won ?? 0,
        drawn: r.draw ?? 0,
        lost: r.lost ?? 0,
        goalsFor: r.goals ?? 0,
        goalsAgainst: r.opponentGoals ?? 0,
        goalDiff: (r.goals ?? 0) - (r.opponentGoals ?? 0),
        points: r.points ?? 0,
        form: "-",
      };
    });
    return { group, teams };
  });
}

// ─── Combined Data Fetch ─────────────────────────────────────────────

export async function getWorldCupData(): Promise<{
  matches: Match[];
  standings: GroupStandings[];
  nextMatch: Match | null;
  currentMatch: Match | null;
  realData: boolean;
}> {
  try {
    const [matches, nextMatch, currentMatch, standings] = await Promise.all([
      fetchAllMatches(),
      fetchNextMatch(),
      fetchCurrentOrNextMatch(),
      fetchStandings(),
    ]);

    const hasRealData = matches.length > 0;

    return {
      matches,
      standings,
      nextMatch,
      currentMatch,
      realData: hasRealData,
    };
  } catch {
    return {
      matches: [],
      standings: [],
      nextMatch: null,
      currentMatch: null,
      realData: false,
    };
  }
}