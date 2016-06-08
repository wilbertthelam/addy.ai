# Wilbert Lam
# 06/06/2016
# Top player algorithm
import numpy as np 
import sys
import requests
import json
import operator

# stat types for batters and pitchers which match up to the database categories 
batterStats = ['R','HR','RBI','SB','OBP']
pitcherStats = ['K','W','SV','ERA','WHIP']

# arguments provided by the route
currentWeek = int(sys.argv[1])
leagueId = int(sys.argv[2])
seasonId = int(sys.argv[3])
position = sys.argv[4]
category = sys.argv[5]

# currentWeek = 9
# leagueId = 44067
# seasonId = 2016
# position = "SS"

# make dict where key = stat and value = data retrieved from database
playerDataScore = {}
meanData = {}
stdDevData = {}
playerData = {}
finalResults = []

def calcPlayerScore(score, mean, std_dev):
    return (score - mean) * 1.0 / std_dev

lst = batterStats
if (position in ['SP', 'RP']):
    lst = pitcherStats

for stat in lst:
    meanData[stat] = 0
    #url = "https://addyai.herokuapp.com/topWeeklyPlayerStats"
    url = "http://addyai.herokuapp.com/topWeeklyPlayerStats"
    url += "?week=" + str(currentWeek) + "&leagueId=" + str(leagueId) + "&seasonId=" + str(seasonId) + "&position=" + position + "&category=" + stat
    myResponse = requests.get(url)
    if myResponse.ok:
        # we got top 20 players for each category
        # we check to see if the player has already been calculated
        # if not, we just calculate their score
        # if they are, we ignore
        jData = (json.loads(myResponse.content))['data']
        statList = []
        for row in jData:
            statList.append(row[stat])
            if row['player_id'] not in playerData:
                playerData[row['player_id']] = row      
        meanData[stat] = np.mean(statList)
        stdDevData[stat] = std_dev = np.std(statList, ddof=1)
    else:
        print "E - Couldn't get data for topWeeklyPlayerStats"

# for each player in that qualifies, we go and calculate their score for each category
for player in playerData:
    score = 0
    for category in lst:
        indScore = calcPlayerScore(playerData[player][category], meanData[category], stdDevData[category])
        if (category == 'ERA' or category == 'WHIP'):
            score -= indScore
        else:
            score += indScore
    playerDataScore[player] = score

    res = playerDataScore.values()

res = sorted(playerDataScore, key=playerDataScore.get, reverse=True)
for i in res:
    playerLine = playerData[i]
    playerLine['ranking_score'] = playerDataScore[i]
    finalResults.append(playerLine)

print json.dumps(finalResults)


