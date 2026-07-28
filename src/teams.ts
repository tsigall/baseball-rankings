export type Team = {
  id: string
  name: string
  city: string
  color: string
}

// Primary team colors. Edit freely — nothing else depends on these values.
export const TEAMS: Team[] = [
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

export const TEAMS_BY_ID = new Map(TEAMS.map((t) => [t.id, t]))
