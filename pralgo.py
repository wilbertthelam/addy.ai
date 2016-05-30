# Wilbert Lam
# 05/07/2016
# Power rankings algorithm
import numpy as np 
import sys
import requests
import json

url = "https://addyai.herokuapp.com/cumulativeStats"
myResponse = requests.get(url)
if (myResponse.ok):
    jData = (json.loads(myResponse.content))['data']

else:
    print "SHOOT"

# totalTeams = 8 # pass in with sys.args
# currentWeek = 5 - 1 # pass in with sys.args
totalTeams = int(sys.argv[1])
currentWeek = int(sys.argv[2])

totalCat = []
totalStats = []

for i in range(0, currentWeek):
    HRData = []
    RData = []
    SBData = []
    RBIData = []
    OBPData = []
    WHIPData = []
    ERAData = []
    SVData = []
    WData = []
    KData = []
    for j in range(0, totalTeams):
        HRData.append(jData[i*totalTeams + j]['HR'])
        RData.append(jData[i*totalTeams + j]['R'])
        SBData.append(jData[i*totalTeams + j]['SB'])
        RBIData.append(jData[i*totalTeams + j]['RBI'])
        OBPData.append(jData[i*totalTeams + j]['OBP'])
        WHIPData.append(jData[i*totalTeams + j]['WHIP'] * -1) # MUST BE NEGATED TO ACCOUNT FOR LOWER WHIP
        ERAData.append(jData[i*totalTeams + j]['ERA'] * -1) # MUST BE NEGATED TO ACCOUNT FOR LOWER ERA
        SVData.append(jData[i*totalTeams + j]['SV'])
        WData.append(jData[i*totalTeams + j]['W'])
        KData.append(jData[i*totalTeams + j]['K'])
        #print HRData
    totalCat = ([np.array(HRData), np.array(RData), np.array(SBData), np.array(RBIData), np.array(OBPData), np.array(WHIPData), np.array(ERAData), np.array(SVData), np.array(WData), np.array(KData)])
    totalStats.append(totalCat)
#print totalStats




# homeRunData = np.array([8, 8, 6, 14, 11, 6, 12, 5])
# runData = np.array([33,33,31,38,39,28,40,36])
# stolenBaseData = np.array([7,4,2,4,4,4,4,10])
# rbiData = np.array([23,25,24,43,37,34,46,35])
# obpData = np.array([0.3446, 0.3589, 0.3452, 0.3782, 0.3800, 0.3371, 0.3448, 0.3741])


# totalCat = [homeRunData, runData, stolenBaseData, rbiData, obpData]
# totalStats = [totalCat, totalCat, totalCat, totalCat, totalCat]

def calcIndvScore(data, stat_median, stat_std, norm_factor):
    #print "data" + amstr(data)
    #print ((data - stat_median) * 1.0 / stat_std) * norm_factor
    ceil_factor = 0.5
    x_std_dev = (data - stat_median) * 1.0 / stat_std
    if x_std_dev > ceil_factor:
        return ceil_factor * norm_factor
    elif x_std_dev < -1 * ceil_factor:
        return -1 * ceil_factor * norm_factor
    return x_std_dev * norm_factor

# normalization function returns values from 0 to ln(x+1) = 1
# return 
def normFactor(i):
    factor = np.log(((np.exp(1)-1)*(i * 1.0 / currentWeek)) + 1)
    return factor
        
def createRankingScore():
    #print totalCat
    # create default 0 array to aggregate individual team scores
    finalResult =  np.zeros(totalTeams)
    # loop through each category and calculate its score
    i = 1
    for week in totalStats:
        norm_factor = normFactor(i)

        weeklyResult = np.zeros(totalTeams)
        for cat in week:
            stat_mean = np.mean(cat)
            stat_median = np.median(cat)
            #print "stat median for week: " + str(i) + ": " + str(stat_median)
            stat_std = np.std(cat, ddof=1)

            indvStatsFunc = np.vectorize(calcIndvScore)
            statScore = indvStatsFunc(cat, stat_median, stat_std, norm_factor)
            weeklyResult = np.add(weeklyResult, statScore)
        i += 1
        finalResult = np.add(finalResult, weeklyResult)
    print parseResult(finalResult)

def parseResult(finalResult):
    finalMap = {}
    for i in range(0, len(finalResult)):
        finalMap[i + 1] = finalResult[i]

    return json.dumps(finalMap)

def main():
    createRankingScore()


main()