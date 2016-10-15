# Scraper to get league information given a leagueId and seasonId
# for ESPN fantasy football

import requests
import bs4
import re
import sys
import json
import ast

idList = sys.argv[1]
seasonId = str(sys.argv[2])
week = str(sys.argv[3])

#idList = [{'league_id': 123458, 'espn_id': 187575}, {'league_id': 123459, 'espn_id': 654532 }]
# espnId = str(187575)
# seasonId = str(2016)
# week = str(3)

# final JSON result
data = {}
data['leagueData'] = []
data['invalidLeagues'] = []

idListConvert = ast.literal_eval(idList)

for element in idListConvert:
	leagueId = str(element['league_id'])
	espnId = str(element['espn_id'])

	# get response and parse for each individual league
	teamsURL = 'http://games.espn.com/ffl/scoreboard?leagueId=' + espnId + '&seasonId=' + seasonId + '&matchupPeriodId=' + week
	response = requests.get(teamsURL)
	soup = bs4.BeautifulSoup(response.content, 'lxml')

	matchupInfo = soup.select('.matchup')

	# TODO: add list of non working leagues
	if len(matchupInfo) < 1:
		data['invalidLeagues'].append(leagueId)
	else:
		for matchup in matchupInfo:
			resultRow = {}
			names = matchup.findAll(id=re.compile('^teamscrg_*'))
			
			if len(names) < 1:
				data['invalidLeagues'].append(leagueId)
			else:
				winningScore = 0
				losingScore = 0
				winningId = 0
				losingId = 0

				# get team id out of string (teamscrg_ID_activeteamrow)
				teamId1 = names[0]['id'].split("_")[1]
				teamId2 = names[1]['id'].split("_")[1] 
				
				team1Score = names[0].select('.score')[0]['title']
				team2Score = names[1].select('.score')[0]['title']

				if float(team1Score) > float(team2Score):
					winningScore = team1Score
					winningId = teamId1
					losingScore = team2Score
					losingId = teamId2
				else:
					winningScore = team2Score
					winningId = teamId2
					losingScore = team1Score
					losingId = teamId1

				resultRow['winning_team_id'] = winningId
				resultRow['losing_team_id'] = losingId
				resultRow['winning_team_score'] = winningScore
				resultRow['losing_team_score'] = losingScore
				resultRow['league_id'] = leagueId
				resultRow['espn_id'] = espnId
				data['leagueData'].append(resultRow)

print json.dumps(data)