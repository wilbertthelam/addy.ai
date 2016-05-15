# Webscraper for individual player data
# Gets the following categories for each team:
#
# Wilbert Lam, David Lee

import requests
import bs4
import sys
import json

totalData = [] # list holding all data objects

# arguments inputed in the following order: currentWeek, leagueId, seasonId, teamNum.
# scoringPeriodId into URL will return up to date resuts for any scoringPeriodId in the week
# in which the scoring period is the current week * 7 + the # of days past Sunday
# ex. scoringPeriodId = 1-7 all represent the first week, 8-15 represent the second week, etc.
scoringPeriodId = str(int(sys.argv[1]) * 7 + 1)
leagueId = str(sys.argv[2])
seasonId = str(sys.argv[3])
teamNum = int(sys.argv[4])

# create the initial URL
baseUrl = "http://games.espn.go.com/flb/boxscorefull?view=matchup&version=full"
baseUrl += "&leagueId=" + leagueId + "&scoringPeriodId=" + scoringPeriodId + "&seasonId=" + seasonId

# create the URL for each team and then rip the data from it
for teamId in range(1, teamNum + 1):
    newUrl = baseUrl + "&teamId=" + str(teamId)

    # HTML response
    response = requests.get(newUrl)

    # create DOM tree using BeautifulSoup
    soup = bs4.BeautifulSoup(response.content, 'lxml')

    # parse through batters table and create a list of all the players
    battersTable = soup.select('#playertable_0')
    listOfBatters = battersTable[0].find_all('tr', {'class': 'pncPlayerRow'})

    # loop through each batter and extract the following:
    # league_id, season_id, team_id, scoring_period_id, player_id, player_name,
    # (MUST BE IN ORDER) AB, BH, R, HR, RBI, BBB, SB, OBP
    for player in listOfBatters:
        batter = {}
        batter['season_id'] = seasonId
        batter['team_id'] = teamId
        batter['scoring_period_id'] = scoringPeriodId
        batter['league_id'] = leagueId

        # get player information
        playerInfo = player.find('a', {'class': 'flexpop'})
        batter['player_id'] = playerInfo['playerid']
        batter['player_name'] = playerInfo.string

        # get player stats
        # player stat options:
        batterStats = ['AB', 'BH', 'R', 'HR', 'RBI', 'BBB', 'SB', 'OBP']
        playerStatLine = player.find_all('td', {'class': 'playertableStat'})
        i = 0
        for playerStat in playerStatLine:
            statString = playerStat.string
            if statString == '--':
                statString = 0
            batter[batterStats[i]] = statString
            i += 1

        # pitcherStats = ['IP', 'PH', 'ER', 'PBB', 'K', 'W', 'SV', 'ERA', 'WHIP']
        # for stat in pitcherStats:
        #     batter[stat] = 0

        totalData.append(batter)

    # parse through pitchers table and create a list of all the players
    pitchersTable = soup.select('#playertable_1')
    listOfPitchers = pitchersTable[0].find_all('tr', {'class': 'pncPlayerRow'})

    # loop through each pitcher and extract the following:
    # league_id, season_id, team_id, scoring_period_id, player_id, player_name,
    # (MUST BE IN ORDER) IP, PH, ER, PBB, K, W, SV, ERA, WHIP
    for player in listOfPitchers:
        pitcher = {}
        pitcher['season_id'] = seasonId
        pitcher['team_id'] = teamId
        pitcher['scoring_period_id'] = scoringPeriodId
        pitcher['league_id'] = leagueId

        # get player information
        playerInfo = player.find('a', {'class': 'flexpop'})
        pitcher['player_id'] = playerInfo['playerid']
        pitcher['player_name'] = playerInfo.string

        # get player stats
        # player stat options:
        pitcherStats = ['IP', 'PH', 'ER', 'PBB', 'K', 'W', 'SV', 'ERA', 'WHIP']
        playerStatLine = player.find_all('td', {'class': 'playertableStat'})
        i = 0
        for playerStat in playerStatLine:
            statString = playerStat.string
            if statString == '--':
                statString = 0
            pitcher[pitcherStats[i]] = statString
            i += 1

        # batterStats = ['AB', 'BH', 'R', 'HR', 'RBI', 'BBB', 'SB', 'OBP']
        # for stat in batterStats:
        #     pitcher[stat] = 0

        totalData.append(pitcher)

print json.dumps(totalData)
