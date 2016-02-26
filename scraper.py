# Sample tester to webscrape
# Gets Team ID and their names

import requests
import bs4
import urlparse
import re

playersNameDict = {} # key: playerId, value: teamName
teamDict = {} # key: playerId, value: dict with stats for each category

def stripId(url):
	parsed = urlparse.urlparse(url)
	return urlparse.parse_qs(parsed.query)['teamId'][0]

def baseballStatsObjCreator(statsDOM):
	stats = {}

	statHeaders = ['R', 'HR', 'RBI', 'SB', 'OBP', 'K', 'W', 'S', 'ERA', 'WHIP']

	for i in range(0, len(statHeaders)):
		stats[statHeaders[i]] = statsDOM[i].string

	return stats

def basketballStatsObjCreator(statsDOM):
	stats = {}

	statHeaders = ['FG', 'FT', '3PM', 'RB', 'AST', 'STL', 'BLK', 'PTS']

	for i in range(0, len(statHeaders)):
		stats[statHeaders[i]] = statsDOM[i].string

	return stats

# URL we want to scrape from
scrapeURL = 'http://games.espn.go.com/flb/scoreboard?leagueId=44067&seasonId=2016'

# HTML response
response = requests.get(scrapeURL)

# create DOM tree using BeautifulSoup
soup = bs4.BeautifulSoup(response.content, 'lxml')


teamInfo = soup.select(".linescoreTeamRow")

for t in teamInfo:
	t_team = t.select(".teamName a[title]")
	teamId = stripId(t_team[0]['href'])
	teamName = t_team[0]['title']

	t_stats = t.findAll('td', id=re.compile('^ls_tmTotalStat_'))

	playersNameDict[teamId] = teamName
	teamDict[teamId] = baseballStatsObjCreator(t_stats)

for key, value in playersNameDict.iteritems():
	print key, value

for key, value in teamDict.iteritems():
	print key, value







