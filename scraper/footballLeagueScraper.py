# Scraper to get league information given a leagueId and seasonId
# for ESPN fantasy football

import requests
import bs4
import re
import sys
import json

leagueId = str(sys.argv[1])
seasonId = str(sys.argv[2])

# leagueId = str(187575)
# seasonId = str(2016)


# retrieve number of weeks from the number of weeks that the league provides
# (see what the last element )
numberOfWeeks = 12

# final JSON result
data = {}

# teams information
teams = []

# matchup information
matchups = []





# for each team, we need to include the following fields:
# league_id | team_id | team_name | year | owner_name
teamsURL = 'http://games.espn.com/ffl/scoreboard?leagueId=' + leagueId + '&seasonId=' + seasonId
response = requests.get(teamsURL)
soup = bs4.BeautifulSoup(response.content, 'lxml')

teamsInfo = soup.findAll(id=re.compile('^teamscrg_*'))

for team in teamsInfo:
	row = {}
	row['league_id'] = leagueId
	row['year'] = seasonId
	row['team_id'] = team['id'].split("_")[1]
	row['team_name'] = team.select("a")[0].get_text()
	row['owner_name'] = team.select('.owners')[0].get_text()
	teams.append(row)




# URL for ESPN scoreboard
scoreboardURL = 'http://games.espn.com/ffl/scoreboard?leagueId=' + leagueId + '&seasonId=' + seasonId + '&matchupPeriodId='

# for each matchup, we need to include the following fields:
# league_id | week | year (seasonId) | team_id1 | team_id2
for week in range(0, 12):
	# HTML response
	response = requests.get(scoreboardURL + str(week + 1))

	# create DOM tree using BeautifulSoup
	soup = bs4.BeautifulSoup(response.content, 'lxml')
	matchupInfo = soup.select('.matchup')
	#print teamInfo
	
	# add into row
	for matchupBox in matchupInfo:
		row = {}
		row['league_id'] = leagueId
		row['week'] = week + 1
		row['year'] = seasonId
		
		names = matchupBox.findAll(id=re.compile('^teamscrg_*'))
		for i in range(0, 2):
			# get team id out of string (teamscrg_ID_activeteamrow)
			teamId = names[i]['id'].split("_")[1] 
			row['team_id' + str(i + 1)] = teamId
		matchups.append(row)
#print matchups

data['teams'] = teams
data['matchups'] = matchups

print json.dumps(data)