export const GET_ENCOUNTERS = `
  query GetEncounters {
    worldData {
      expansions {
        id
        name
        zones {
          id
          name
          difficulties { id name }
          encounters { id name }
        }
      }
    }
  }
`;

export const GET_JOBS = `
  query GetJobs {
    gameData {
      classes {
        id
        name
        specs { id name }
      }
    }
  }
`;

export const GET_RANKINGS = `
  query GetRankings(
    $encounterId: Int!
    $specName: String
    $metric: CharacterRankingMetricType
    $difficulty: Int
    $page: Int
  ) {
    worldData {
      encounter(id: $encounterId) {
        name
        characterRankings(
          specName: $specName
          metric: $metric
          difficulty: $difficulty
          page: $page
        )
      }
    }
  }
`;

export const GET_FIGHT_AND_ACTORS = `
  query GetFightAndActors($reportCode: String!, $fightIDs: [Int!]) {
    reportData {
      report(code: $reportCode) {
        fights(fightIDs: $fightIDs) {
          id
          startTime
          endTime
          name
          friendlyPlayers
        }
        masterData {
          actors(type: "Player") {
            id
            name
            type
            subType
            server
          }
          abilities {
            gameID
            name
            icon
            type
          }
        }
      }
    }
  }
`;

export const GET_EVENTS = `
  query GetEvents(
    $reportCode: String!
    $fightIDs: [Int!]
    $startTime: Float!
    $endTime: Float!
    $sourceID: Int!
  ) {
    reportData {
      report(code: $reportCode) {
        events(
          dataType: Casts
          fightIDs: $fightIDs
          startTime: $startTime
          endTime: $endTime
          sourceID: $sourceID
          limit: 10000
        ) {
          data
          nextPageTimestamp
        }
      }
    }
  }
`;

// Fetch damage done table for a specific fight (includes synergy rDPS given/taken per player)
export const GET_DAMAGE_TABLE = `
  query GetDamageTable($reportCode: String!, $fightIDs: [Int!]!) {
    reportData {
      report(code: $reportCode) {
        table(dataType: DamageDone, fightIDs: $fightIDs)
      }
    }
  }
`;

// Fetch a small sample of events without sourceID filter (for anonymous actor detection)
export const GET_EVENTS_SAMPLE = `
  query GetEventsSample(
    $reportCode: String!
    $fightIDs: [Int!]
    $startTime: Float!
    $endTime: Float!
  ) {
    reportData {
      report(code: $reportCode) {
        events(
          dataType: Casts
          fightIDs: $fightIDs
          startTime: $startTime
          endTime: $endTime
          limit: 500
        ) {
          data
        }
      }
    }
  }
`;
