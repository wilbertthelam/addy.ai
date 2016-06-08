# Gets current matchup scores for scoreboard ticker
# Wilbert Lam, David Lee

import requests
import bs4
import urlparse
import re
import sys
import json

# get the teamId from the url (that way we can ID each user to their stats)
def stripId(url):
	parsed = urlparse.urlparse(url)
	return urlparse.parse_qs(parsed.query)['teamId'][0]

# ----------------------
#	SCRIPT BELOW
# ----------------------

# get current week from route 
currentWeek = int(sys.argv[1])
leagueId = sys.argv[2]
seasonId = sys.argv[3]

# currentWeek = 10
# leagueId = 44067
# seasonId = 2016

matchupList = [] # list of matchup objects with scores

# URL we want to scrape from
currentWeekURL = 'leagueId=' + str(leagueId) + '&seasonId=' + str(seasonId) + '&matchupPeriodId=' + str(currentWeek)
baseballBaseURL = 'http://games.espn.go.com/flb/scoreboard?' + currentWeekURL

# basketbalBaseURL = 'http://games.espn.go.com/fba/scoreboard?leagueId=229752&seasonId=2016'

# HTML response
response = requests.get(baseballBaseURL)

# create DOM tree using BeautifulSoup
soup = bs4.BeautifulSoup(response.content, 'lxml')


teamInfo = soup.select(".linescoreTeamRow")

# populate dictionaries for team names and their respective stats
for i in range (0, len(teamInfo), 2):
	# get top team (a)
	matchupObj = {}
	t_team_a = teamInfo[i].select(".teamName a[title]")
	matchupObj['teamId_a'] = stripId(t_team_a[0]['href'])
	matchupObj['teamName_a'] = t_team_a[0].getText()

	# get bottom team (b)
	t_team_b = teamInfo[i+1].select(".teamName a[title]")
	matchupObj['teamId_b'] = stripId(t_team_b[0]['href'])
	matchupObj['teamName_b'] = t_team_b[0].getText()

	match_result_string = teamInfo[i].find('nobr')
	match_result_list = match_result_string.string.split("-")
	matchupObj['result_a'] = match_result_list[0]
	matchupObj['result_b'] = match_result_list[1]
	matchupObj['result_tie'] = match_result_list[2]

	matchupList.append(matchupObj)

# print into Node.JS script
#print teamNameDict
print json.dumps(matchupList)






