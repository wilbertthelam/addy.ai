# Webscraper for individual player data
# Gets the following categories for each team:
#
# Wilbert Lam, David Lee

import requests
import bs4
import urlparse
import re
import sys
import json

totalData = [] # list holding all data objects

# TODO: turn these into sys argv
leagueId = str(44067)
scoringPeriodId = str(43)
seasonId = str(2016)
teamNum = 8

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
    # season_id, team_id, scoring_period_id, player_id, player_name,
    # (MUST BE IN ORDER) AB, BH, R, HR, RBI, BBB, SB, OBP
    for player in listOfBatters:
        batter = {}
        batter['season_id'] = seasonId
        batter['team_id'] = teamId
        batter['scoring_period_id'] = scoringPeriodId

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
            batter[batterStats[i]] = playerStat.string
            i += 1

        totalData.append(batter)

    # parse through pitchers table and create a list of all the players
    pitchersTable = soup.select('#playertable_1')
    listOfPitchers = pitchersTable[0].find_all('tr', {'class': 'pncPlayerRow'})

    # loop through each pitcher and extract the following:
    # season_id, team_id, scoring_period_id, player_id, player_name,
    # (MUST BE IN ORDER) IP, PH, ER, PBB, K, W, SV, ERA, WHIP
    for player in listOfPitchers:
        pitcher = {}
        pitcher['season_id'] = seasonId
        pitcher['team_id'] = teamId
        pitcher['scoring_period_id'] = scoringPeriodId

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
            pitcher[pitcherStats[i]] = playerStat.string
            i += 1

        totalData.append(pitcher)

print totalData
