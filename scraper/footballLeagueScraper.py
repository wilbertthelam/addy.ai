# Scraper to get league information given a leagueId and seasonId
# for ESPN fantasy football

import requests
import bs4
import re
import sys
import json

# leagueId = sys.argv[1]
# seasonId = sys.argv[2]

leagueId = str(721759)
seasonId = str(2016)

# URL for ESPN scoreboard
scoreboardURL = 'http://games.espn.go.com/ffl/scoreboard?leagueId=' + leagueId + '&seasonId=' + seasonId + 'matchupPeriodId='

# retrieve number of weeks from the number of weeks that the league provides
# (see what the last element )
numberOfWeeks = 12

# final JSON result
data = {}

# teams information
team = []

# matchup information
matchups = []

# for each matchup, we need to include the following fields:
# league_id | week | year (seasonId) | team_id1 | team_id2
for week in range(0, numberOfWeeks):
	# HTML response
	response = requests.get(scoreboardURL + str(week + 1))

	# create DOM tree using BeautifulSoup
	soup = bs4.BeautifulSoup(response.content, 'lxml')
	teamInfo = soup.findAll(id="teamscrg_6_activeteamrow")

	print teamInfo













# # ----------------------
# #	SCRIPT BELOW
# # ----------------------

# # get current week, league, year from route 
# currentWeekStart = int(sys.argv[1])
# leagueId = sys.argv[2]
# seasonId = sys.argv[3]

# totalList = []
# for currentWeek in range(1, currentWeekStart):
# 	teamNameDict = {} # key: teamId, value: teamName
# 	teamList = [] # key: teamId, value: dict with stats for each category

# 	# URL we want to scrape from
# 	currentWeekURL = 'leagueId=' + str(leagueId) + '&seasonId=' + str(seasonId) + '&matchupPeriodId=' + str(currentWeek)
# 	baseballBaseURL = 'http://games.espn.go.com/flb/scoreboard?' + currentWeekURL

# 	basketbalBaseURL = 'http://games.espn.go.com/fba/scoreboard?leagueId=229752&seasonId=2016'

# 	# HTML response
# 	response = requests.get(baseballBaseURL)

# 	# create DOM tree using BeautifulSoup
# 	soup = bs4.BeautifulSoup(response.content, 'lxml')


# 	teamInfo = soup.select(".linescoreTeamRow")

# 	# populate dictionaries for team names and their respective stats
# 	for t in teamInfo:
# 		t_team = t.select(".teamName a[title]")
# 		teamId = stripId(t_team[0]['href'])
# 		teamName = t_team[0]['title']

# 		t_stats = t.findAll('td', id=re.compile('^total_'))

# 		teamNameDict[teamId] = teamName

# 		# change obj type depending on sport
# 		#teamDict[teamId] = basketballStatsObjCreator(t_stats)
# 		teamLine = baseballStatsObjCreator(t_stats)
# 		teamLine['team_id'] = teamId
# 		teamLine['week'] = currentWeek
# 		teamLine['year'] = seasonId
# 		teamLine['league_id'] = leagueId
# 		teamList.append(teamLine)

# 	# # print out team names for each team
# 	# for key, value in teamNameDict.iteritems():
# 	# 	print key, value

# 	# # print out stats for each team
# 	# for key, value in teamDict.iteritems():
# 	# 	print key, value

# 	# print into Node.JS script
# 	#print teamNameDict
# 	#print teamDict
# 	totalList += (teamList)
# print json.dumps(totalList)






