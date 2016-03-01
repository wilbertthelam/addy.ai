# Sample tester to webscrape
# Gets Team ID and their names
# Wilbert Lam, David Lee

import requests
import bs4
import urlparse
import re

# get the teamId from the url (that way we can ID each user to their stats)
def stripId(url):
	parsed = urlparse.urlparse(url)
	return urlparse.parse_qs(parsed.query)['teamId'][0]

# put baseball stats in a storable object
def baseballStatsObjCreator(statsDOM):
	stats = {}

	statHeaders = ['R', 'HR', 'RBI', 'SB', 'OBP', 'K', 'W', 'S', 'ERA', 'WHIP']

	for i in range(0, len(statHeaders)):
		stats[statHeaders[i]] = statsDOM[i].string

	return stats

# put basketball stats in a storable object
def basketballStatsObjCreator(statsDOM):
	stats = {}

	statHeaders = ['FG', 'FT', '3PM', 'RB', 'AST', 'STL', 'BLK', 'PTS']

	for i in range(0, len(statHeaders)):
		stats[statHeaders[i]] = statsDOM[i].string

	return stats

# ----------------------
#	SCRIPT BELOW
# ----------------------

teamNameDict = {} # key: teamId, value: teamName
teamDict = {} # key: teamId, value: dict with stats for each category

# URL we want to scrape from
baseballBaseURL = 'http://games.espn.go.com/flb/scoreboard?leagueId=44067&seasonId=2016'
basketbalBaseURL = 'http://games.espn.go.com/fba/scoreboard?leagueId=229752&seasonId=2016'

# HTML response
response = requests.get(basketbalBaseURL)

# create DOM tree using BeautifulSoup
soup = bs4.BeautifulSoup(response.content, 'lxml')


teamInfo = soup.select(".linescoreTeamRow")

# populate dictionaries for team names and their respective stats
for t in teamInfo:
	t_team = t.select(".teamName a[title]")
	teamId = stripId(t_team[0]['href'])
	teamName = t_team[0]['title']

	t_stats = t.findAll('td', id=re.compile('^ls_tmTotalStat_'))

	teamNameDict[teamId] = teamName

	# change obj type depending on sport
	teamDict[teamId] = basketballStatsObjCreator(t_stats)

# # print out team names for each team
# for key, value in teamNameDict.iteritems():
# 	print key, value

# # print out stats for each team
# for key, value in teamDict.iteritems():
# 	print key, value

# print into Node.JS script
print teamNameDict
print teamDict







