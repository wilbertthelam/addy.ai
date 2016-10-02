# Scraper to get league information given a espnId and seasonId
# for ESPN fantasy football

import requests
import bs4
import re
import sys
import json

espnId = str(sys.argv[1])
seasonId = str(sys.argv[2])

# espnId = str(187575)
# seasonId = str(2016)

# final JSON result
data = {}

# league information
league = {}
leagueUrl = 'http://games.espn.com/ffl/leagueoffice?leagueId=' + espnId + '&seasonId=' + seasonId

response = requests.get(leagueUrl)
soup = bs4.BeautifulSoup(response.content, 'lxml')

header = soup.find(id='lo-league-header')

if header == None:
	print json.dumps('empty')
	sys.exit()

info = header.select('.info-area')[0]

league['espn_id'] = espnId
league['year'] = seasonId
league['league_name'] = header.select('.league-team-names')[0].h1['title'].strip()


data['league'] = league

print json.dumps(data)