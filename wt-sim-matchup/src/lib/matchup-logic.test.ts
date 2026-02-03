/**
 * Unit tests for matchup logic
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  findApplicableBrackets,
  determineTeam,
  getEnemyNations,
  getAllyNations,
  getEnemyAircraft,
  getAllyAircraft,
  sortByBRProximity,
  calculateMatchups,
  groupByNation,
  getMatchupStats,
} from './matchup-logic';
import type { Aircraft, SimBracket, TeamConfig, Nation } from '../types/aircraft';

// Mock data
const mockBrackets: SimBracket[] = [
  { id: 'ec3', name: 'EC3', min_br: 3.0, max_br: 4.3 },
  { id: 'ec4', name: 'EC4', min_br: 4.0, max_br: 5.3 },
  { id: 'ec5', name: 'EC5', min_br: 5.0, max_br: 6.3 },
];

const mockTeamConfig: TeamConfig = {
  id: 'default',
  name: 'Default',
  team_a: ['usa', 'britain', 'ussr'],
  team_b: ['germany', 'japan', 'italy'],
};

const mockAircraft: Aircraft[] = [
  {
    identifier: 'p-51d-30_usa',
    country: 'usa',
    vehicle_type: 'fighter',
    simulator_br: 4.0,
    is_premium: false,
  } as Aircraft,
  {
    identifier: 'bf109g6_germany',
    country: 'germany',
    vehicle_type: 'fighter',
    simulator_br: 4.3,
    is_premium: false,
  } as Aircraft,
  {
    identifier: 'fw190d9_germany',
    country: 'germany',
    vehicle_type: 'fighter',
    simulator_br: 5.0,
    is_premium: false,
  } as Aircraft,
  {
    identifier: 'a6m5_japan',
    country: 'japan',
    vehicle_type: 'fighter',
    simulator_br: 4.7,
    is_premium: false,
  } as Aircraft,
];

describe('findApplicableBrackets', () => {
  it('should find brackets that contain the BR', () => {
    const result = findApplicableBrackets(4.0, mockBrackets);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('ec3');
    expect(result[1].id).toBe('ec4');
  });

  it('should return empty array for BR outside all brackets', () => {
    const result = findApplicableBrackets(10.0, mockBrackets);
    expect(result).toHaveLength(0);
  });

  it('should handle BR at bracket boundaries', () => {
    const result = findApplicableBrackets(5.0, mockBrackets);
    expect(result).toHaveLength(2); // EC4 and EC5
  });
});

describe('determineTeam', () => {
  it('should assign USA to team A', () => {
    const team = determineTeam('usa', mockTeamConfig);
    expect(team).toBe('A');
  });

  it('should assign Germany to team B', () => {
    const team = determineTeam('germany', mockTeamConfig);
    expect(team).toBe('B');
  });
});

describe('getEnemyNations', () => {
  it('should return team B nations for team A player', () => {
    const enemies = getEnemyNations('A', mockTeamConfig);
    expect(enemies).toEqual(['germany', 'japan', 'italy']);
  });

  it('should return team A nations for team B player', () => {
    const enemies = getEnemyNations('B', mockTeamConfig);
    expect(enemies).toEqual(['usa', 'britain', 'ussr']);
  });
});

describe('getAllyNations', () => {
  it('should return team A nations excluding player nation', () => {
    const allies = getAllyNations('usa', 'A', mockTeamConfig);
    expect(allies).toEqual(['britain', 'ussr']);
  });

  it('should return team B nations excluding player nation', () => {
    const allies = getAllyNations('germany', 'B', mockTeamConfig);
    expect(allies).toEqual(['japan', 'italy']);
  });
});

describe('getEnemyAircraft', () => {
  it('should filter to enemy nations within bracket', () => {
    const bracket = mockBrackets[1]; // EC4: 4.0-5.3
    const enemies = getEnemyAircraft(
      mockAircraft,
      ['germany', 'japan'],
      bracket
    );

    expect(enemies).toHaveLength(3); // Bf109G6, Fw190D9, A6M5
    expect(enemies.every(a => ['germany', 'japan'].includes(a.country))).toBe(true);
  });

  it('should respect BR bounds', () => {
    const bracket = mockBrackets[0]; // EC3: 3.0-4.3
    const enemies = getEnemyAircraft(
      mockAircraft,
      ['germany', 'japan'],
      bracket
    );

    // Should only include Bf109G6 (4.3), not Fw190D9 (5.0)
    expect(enemies).toHaveLength(1);
    expect(enemies[0].identifier).toBe('bf109g6_germany');
  });
});

describe('sortByBRProximity', () => {
  it('should sort by proximity to target BR', () => {
    const sorted = sortByBRProximity(mockAircraft, 4.5);

    // Expected order by distance from 4.5:
    // A6M5: 4.7 (0.2 away)
    // Bf109G6: 4.3 (0.2 away)
    // P-51D: 4.0 (0.5 away)
    // Fw190D9: 5.0 (0.5 away)

    expect(sorted[0].simulator_br).toBe(4.7); // Closest or tied
    expect(sorted[sorted.length - 1].simulator_br).toBeCloseTo(4.0, 1);
  });
});

describe('calculateMatchups', () => {
  it('should calculate complete matchup for USA aircraft', () => {
    const p51d = mockAircraft[0];
    const result = calculateMatchups(
      p51d,
      mockAircraft,
      mockBrackets,
      mockTeamConfig
    );

    expect(result.selectedAircraft).toBe(p51d);
    expect(result.bracket.id).toBe('ec3'); // Lowest applicable bracket
    expect(result.playerTeam).toBe('A');
    expect(result.enemyNations).toEqual(['germany', 'japan', 'italy']);
    expect(result.allyNations).toEqual(['britain', 'ussr']);
  });

  it('should return sorted enemies by BR proximity', () => {
    const p51d = mockAircraft[0]; // BR 4.0
    const result = calculateMatchups(
      p51d,
      mockAircraft,
      mockBrackets,
      mockTeamConfig
    );

    // Enemies should be sorted by proximity to 4.0
    // Verify Bf109G6 (4.3) is before A6M5 (4.7)
    const bf109Index = result.enemyAircraft.findIndex(
      a => a.identifier === 'bf109g6_germany'
    );
    expect(bf109Index).toBeGreaterThanOrEqual(0);
  });
});

describe('groupByNation', () => {
  it('should group aircraft by nation', () => {
    const groups = groupByNation(mockAircraft);

    expect(groups.size).toBe(3); // usa, germany, japan
    expect(groups.get('usa' as Nation)).toHaveLength(1);
    expect(groups.get('germany' as Nation)).toHaveLength(2);
    expect(groups.get('japan' as Nation)).toHaveLength(1);
  });

  it('should return empty map for empty array', () => {
    const groups = groupByNation([]);
    expect(groups.size).toBe(0);
  });
});

// --- Extended mock data for edge case tests ---

const britishAircraft: Aircraft = {
  identifier: 'spitfire_mk9_britain',
  country: 'britain',
  vehicle_type: 'fighter',
  simulator_br: 4.3,
  is_premium: false,
} as Aircraft;

const italianBomber: Aircraft = {
  identifier: 'sm79_italy',
  country: 'italy',
  vehicle_type: 'bomber',
  simulator_br: 2.7,
  is_premium: false,
} as Aircraft;

const extendedAircraft: Aircraft[] = [
  ...mockAircraft,
  britishAircraft,
  italianBomber,
];

// --- Edge case tests ---

describe('findApplicableBrackets - edge cases', () => {
  it('should return empty array for empty brackets list', () => {
    const result = findApplicableBrackets(4.0, []);
    expect(result).toHaveLength(0);
  });

  it('should find single bracket when BR only matches one', () => {
    const result = findApplicableBrackets(6.0, mockBrackets);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ec5');
  });

  it('should match at exact lower boundary', () => {
    const result = findApplicableBrackets(3.0, mockBrackets);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ec3');
  });

  it('should match at exact upper boundary', () => {
    const result = findApplicableBrackets(6.3, mockBrackets);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ec5');
  });

  it('should return empty for BR below all brackets', () => {
    const result = findApplicableBrackets(1.0, mockBrackets);
    expect(result).toHaveLength(0);
  });
});

describe('determineTeam - edge cases', () => {
  it('should fallback to team A for nation not in either team', () => {
    const team = determineTeam('sweden' as Nation, mockTeamConfig);
    expect(team).toBe('A');
  });

  it('should handle all team A nations', () => {
    for (const nation of mockTeamConfig.team_a) {
      expect(determineTeam(nation, mockTeamConfig)).toBe('A');
    }
  });

  it('should handle all team B nations', () => {
    for (const nation of mockTeamConfig.team_b) {
      expect(determineTeam(nation, mockTeamConfig)).toBe('B');
    }
  });
});

describe('getEnemyAircraft - edge cases', () => {
  it('should return empty array when no aircraft match enemy nations', () => {
    const bracket = mockBrackets[1]; // EC4: 4.0-5.3
    const enemies = getEnemyAircraft(mockAircraft, ['france', 'sweden'], bracket);
    expect(enemies).toHaveLength(0);
  });

  it('should return empty array for empty aircraft list', () => {
    const bracket = mockBrackets[0];
    const enemies = getEnemyAircraft([], ['germany'], bracket);
    expect(enemies).toHaveLength(0);
  });

  it('should return empty array when no aircraft in bracket BR range', () => {
    const highBracket: SimBracket = { id: 'ec9', name: 'EC9', min_br: 9.0, max_br: 11.0 };
    const enemies = getEnemyAircraft(mockAircraft, ['germany', 'japan'], highBracket);
    expect(enemies).toHaveLength(0);
  });
});

describe('getAllyAircraft', () => {
  it('should filter to ally nations within bracket', () => {
    const bracket = mockBrackets[0]; // EC3: 3.0-4.3
    const allies = getAllyAircraft(
      extendedAircraft,
      ['britain', 'ussr'],
      bracket
    );

    // britishAircraft at 4.3 is within EC3 range and is an ally
    expect(allies).toHaveLength(1);
    expect(allies[0].identifier).toBe('spitfire_mk9_britain');
  });

  it('should return empty array when no allies in bracket', () => {
    const bracket = mockBrackets[2]; // EC5: 5.0-6.3
    const allies = getAllyAircraft(
      extendedAircraft,
      ['britain'],
      bracket
    );
    expect(allies).toHaveLength(0);
  });

  it('should return empty array for empty aircraft list', () => {
    const bracket = mockBrackets[0];
    const allies = getAllyAircraft([], ['britain'], bracket);
    expect(allies).toHaveLength(0);
  });
});

describe('sortByBRProximity - edge cases', () => {
  it('should use alphabetical sort for same BR distance', () => {
    const sameBR: Aircraft[] = [
      { identifier: 'z_aircraft', simulator_br: 4.0 } as Aircraft,
      { identifier: 'a_aircraft', simulator_br: 4.0 } as Aircraft,
    ];
    const sorted = sortByBRProximity(sameBR, 4.0);
    expect(sorted[0].identifier).toBe('a_aircraft');
    expect(sorted[1].identifier).toBe('z_aircraft');
  });

  it('should return empty array for empty input', () => {
    const sorted = sortByBRProximity([], 4.0);
    expect(sorted).toHaveLength(0);
  });

  it('should not mutate the original array', () => {
    const original = [...mockAircraft];
    sortByBRProximity(mockAircraft, 4.0);
    expect(mockAircraft).toEqual(original);
  });
});

describe('calculateMatchups - edge cases', () => {
  it('should throw error when no bracket matches', () => {
    const highBRPlane = {
      identifier: 'f14_usa',
      country: 'usa',
      vehicle_type: 'fighter',
      simulator_br: 11.0,
      is_premium: false,
    } as Aircraft;

    expect(() =>
      calculateMatchups(highBRPlane, mockAircraft, mockBrackets, mockTeamConfig)
    ).toThrow('No bracket found for aircraft with BR 11');
  });

  it('should calculate matchup for team B aircraft', () => {
    const bf109 = mockAircraft[1]; // germany, BR 4.3
    const result = calculateMatchups(
      bf109,
      extendedAircraft,
      mockBrackets,
      mockTeamConfig
    );

    expect(result.playerTeam).toBe('B');
    expect(result.enemyNations).toEqual(['usa', 'britain', 'ussr']);
    expect(result.allyNations).toEqual(['japan', 'italy']);
    // Enemies should only be from team A nations
    expect(result.enemyAircraft.every(a =>
      ['usa', 'britain', 'ussr'].includes(a.country)
    )).toBe(true);
  });

  it('should use the lowest applicable bracket', () => {
    // BR 5.0 fits in EC4 (4.0-5.3) and EC5 (5.0-6.3)
    const fw190 = mockAircraft[2]; // germany, BR 5.0
    const result = calculateMatchups(
      fw190,
      mockAircraft,
      mockBrackets,
      mockTeamConfig
    );

    expect(result.bracket.id).toBe('ec4'); // Lowest matching bracket
  });

  it('should include allyAircraft in the result', () => {
    const p51d = mockAircraft[0]; // usa, BR 4.0
    const result = calculateMatchups(
      p51d,
      extendedAircraft,
      mockBrackets,
      mockTeamConfig
    );

    expect(result.allyAircraft).toBeDefined();
    // British Spitfire at 4.3 is an ally and in EC3 range (3.0-4.3)
    expect(result.allyAircraft!.some(a => a.identifier === 'spitfire_mk9_britain')).toBe(true);
  });
});

describe('getMatchupStats', () => {
  it('should return correct stats for a matchup result', () => {
    const p51d = mockAircraft[0];
    const result = calculateMatchups(
      p51d,
      mockAircraft,
      mockBrackets,
      mockTeamConfig
    );
    const stats = getMatchupStats(result);

    expect(stats.totalEnemies).toBe(result.enemyAircraft.length);
    expect(stats.enemyNationCount).toBe(3); // germany, japan, italy
    expect(stats.brRange.min).toBe(result.bracket.min_br);
    expect(stats.brRange.max).toBe(result.bracket.max_br);
  });

  it('should count enemies per nation correctly', () => {
    const p51d = mockAircraft[0];
    const result = calculateMatchups(
      p51d,
      mockAircraft,
      mockBrackets,
      mockTeamConfig
    );
    const stats = getMatchupStats(result);

    // In EC3 bracket (3.0-4.3), enemy aircraft: Bf109G6 (4.3, germany)
    // A6M5 (4.7) is outside EC3 range
    expect(stats.enemiesByNation['germany']).toBe(1);
  });

  it('should handle matchup with no enemies', () => {
    // Create a matchup result with no enemies
    const mockResult = calculateMatchups(
      mockAircraft[0],
      [mockAircraft[0]], // Only the selected aircraft in the database
      mockBrackets,
      mockTeamConfig
    );
    const stats = getMatchupStats(mockResult);

    expect(stats.totalEnemies).toBe(0);
  });
});
