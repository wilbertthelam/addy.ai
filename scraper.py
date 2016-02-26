# Sample tester to webscrape
# Gets Team ID and their names

import requests
import bs4
import urlparse

playersDict = {}

def stripId(url):
	parsed = urlparse.urlparse(url)
	return urlparse.parse_qs(parsed.query)['teamId'][0]

# URL we want to scrape from
scrapeURL = 'http://games.espn.go.com/flb/scoreboard?leagueId=44067&seasonId=2016'

# HTML response
response = requests.get(scrapeURL)

# create DOM tree using BeautifulSoup
soup = bs4.BeautifulSoup(response.content, 'lxml')

team = {}
teamInfo = soup.select(".linescoreTeamRow .teamName a[title]")


for t in teamInfo:
	teamId = stripId(t['href'])
	teamName = t['title']

	playersDict[teamId] = teamName

for key, value in playersDict.iteritems():
	print key, value







