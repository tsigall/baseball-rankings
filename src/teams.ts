// The leagues you can rank, and the teams in each.
//
// Everything in the app is scoped to one sport at a time: the quiz, the share
// link, the community page. Team ids only have to be unique *within* a sport —
// several are reused across leagues (Miami, Baltimore, Kansas City...), so
// always look teams up through a Sport, never through a global map.

export type SportId = 'mlb' | 'nfl'

export type Team = {
  id: string
  name: string
  city: string
  color: string
}

export type Sport = {
  id: SportId
  /** Short name for tabs and buttons. */
  label: string
  teams: Team[]
  byId: Map<string, Team>
}

// Primary team colors. Edit freely — nothing else depends on these values.
// They're used as button backgrounds behind white text, so darker shades of a
// team's palette work better than its lightest one.
const MLB_TEAMS: Team[] = [
  { id: 'bal', city: 'Baltimore', name: 'Orioles', color: '#DF4601' },
  { id: 'bos', city: 'Boston', name: 'Red Sox', color: '#BD3039' },
  { id: 'nyy', city: 'New York', name: 'Yankees', color: '#003087' },
  { id: 'tb', city: 'Tampa Bay', name: 'Rays', color: '#092C5C' },
  { id: 'tor', city: 'Toronto', name: 'Blue Jays', color: '#134A8E' },

  { id: 'cws', city: 'Chicago', name: 'White Sox', color: '#27251F' },
  { id: 'cle', city: 'Cleveland', name: 'Guardians', color: '#00385D' },
  { id: 'det', city: 'Detroit', name: 'Tigers', color: '#0C2340' },
  { id: 'kc', city: 'Kansas City', name: 'Royals', color: '#004687' },
  { id: 'min', city: 'Minnesota', name: 'Twins', color: '#002B5C' },

  { id: 'hou', city: 'Houston', name: 'Astros', color: '#002D62' },
  { id: 'laa', city: 'Los Angeles', name: 'Angels', color: '#BA0021' },
  { id: 'ath', city: '', name: 'Athletics', color: '#003831' },
  { id: 'sea', city: 'Seattle', name: 'Mariners', color: '#0C2C56' },
  { id: 'tex', city: 'Texas', name: 'Rangers', color: '#003278' },

  { id: 'atl', city: 'Atlanta', name: 'Braves', color: '#CE1141' },
  { id: 'mia', city: 'Miami', name: 'Marlins', color: '#00A3E0' },
  { id: 'nym', city: 'New York', name: 'Mets', color: '#002D72' },
  { id: 'phi', city: 'Philadelphia', name: 'Phillies', color: '#E81828' },
  { id: 'wsh', city: 'Washington', name: 'Nationals', color: '#AB0003' },

  { id: 'chc', city: 'Chicago', name: 'Cubs', color: '#0E3386' },
  { id: 'cin', city: 'Cincinnati', name: 'Reds', color: '#C6011F' },
  { id: 'mil', city: 'Milwaukee', name: 'Brewers', color: '#12284B' },
  { id: 'pit', city: 'Pittsburgh', name: 'Pirates', color: '#FDB827' },
  { id: 'stl', city: 'St. Louis', name: 'Cardinals', color: '#C41E3A' },

  { id: 'ari', city: 'Arizona', name: 'Diamondbacks', color: '#A71930' },
  { id: 'col', city: 'Colorado', name: 'Rockies', color: '#33006F' },
  { id: 'lad', city: 'Los Angeles', name: 'Dodgers', color: '#005A9C' },
  { id: 'sd', city: 'San Diego', name: 'Padres', color: '#2F241D' },
  { id: 'sf', city: 'San Francisco', name: 'Giants', color: '#FD5A1E' },
]

const NFL_TEAMS: Team[] = [
  { id: 'buf', city: 'Buffalo', name: 'Bills', color: '#00338D' },
  { id: 'mia', city: 'Miami', name: 'Dolphins', color: '#008E97' },
  { id: 'ne', city: 'New England', name: 'Patriots', color: '#002244' },
  { id: 'nyj', city: 'New York', name: 'Jets', color: '#125740' },

  { id: 'bal', city: 'Baltimore', name: 'Ravens', color: '#241773' },
  { id: 'cin', city: 'Cincinnati', name: 'Bengals', color: '#FB4F14' },
  { id: 'cle', city: 'Cleveland', name: 'Browns', color: '#311D00' },
  { id: 'pit', city: 'Pittsburgh', name: 'Steelers', color: '#101820' },

  { id: 'hou', city: 'Houston', name: 'Texans', color: '#03202F' },
  { id: 'ind', city: 'Indianapolis', name: 'Colts', color: '#002C5F' },
  { id: 'jax', city: 'Jacksonville', name: 'Jaguars', color: '#006778' },
  { id: 'ten', city: 'Tennessee', name: 'Titans', color: '#0C2340' },

  { id: 'den', city: 'Denver', name: 'Broncos', color: '#FB4F14' },
  { id: 'kc', city: 'Kansas City', name: 'Chiefs', color: '#E31837' },
  { id: 'lv', city: 'Las Vegas', name: 'Raiders', color: '#101820' },
  { id: 'lac', city: 'Los Angeles', name: 'Chargers', color: '#0080C6' },

  { id: 'dal', city: 'Dallas', name: 'Cowboys', color: '#041E42' },
  { id: 'nyg', city: 'New York', name: 'Giants', color: '#0B2265' },
  { id: 'phi', city: 'Philadelphia', name: 'Eagles', color: '#004C54' },
  { id: 'wsh', city: 'Washington', name: 'Commanders', color: '#5A1414' },

  { id: 'chi', city: 'Chicago', name: 'Bears', color: '#0B162A' },
  { id: 'det', city: 'Detroit', name: 'Lions', color: '#0076B6' },
  { id: 'gb', city: 'Green Bay', name: 'Packers', color: '#203731' },
  { id: 'min', city: 'Minnesota', name: 'Vikings', color: '#4F2683' },

  { id: 'atl', city: 'Atlanta', name: 'Falcons', color: '#A71930' },
  { id: 'car', city: 'Carolina', name: 'Panthers', color: '#0085CA' },
  { id: 'no', city: 'New Orleans', name: 'Saints', color: '#101820' },
  { id: 'tb', city: 'Tampa Bay', name: 'Buccaneers', color: '#D50A0A' },

  { id: 'ari', city: 'Arizona', name: 'Cardinals', color: '#97233F' },
  { id: 'lar', city: 'Los Angeles', name: 'Rams', color: '#003594' },
  { id: 'sf', city: 'San Francisco', name: '49ers', color: '#AA0000' },
  { id: 'sea', city: 'Seattle', name: 'Seahawks', color: '#002244' },
]

function sport(id: SportId, label: string, teams: Team[]): Sport {
  return { id, label, teams, byId: new Map(teams.map((t) => [t.id, t])) }
}

export const SPORTS: Sport[] = [
  sport('mlb', 'MLB', MLB_TEAMS),
  sport('nfl', 'NFL', NFL_TEAMS),
]

// MLB came first, so it's what a link with no sport in it means. Changing this
// would silently re-point every link shared before sports existed.
export const DEFAULT_SPORT: SportId = 'mlb'

export function isSportId(value: string): value is SportId {
  return SPORTS.some((s) => s.id === value)
}

export function getSport(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id)!
}
