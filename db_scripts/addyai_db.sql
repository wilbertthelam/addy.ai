CREATE DATABASE  IF NOT EXISTS `addy_ai`
/*!40100 DEFAULT CHARACTER SET latin1 */;
USE `addy_ai`;

##########################
# BASKETBALL STATS TABLE #
##########################
DROP TABLE IF EXISTS `basketball_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `basketball_stats` (`team_id` int(70) NOT NULL,
  `league_id` int(70) NOT NULL,
  `week` int(70) NOT NULL,
  `FT` DECIMAL(4,4) NOT NULL,
  `FG` DECIMAL(4,4) NOT NULL,
  `BLK` int(70) NOT NULL,
  `RB` int(70) NOT NULL,
  `STL` int(70) NOT NULL,
  `AST` int(70) NOT NULL,
  `3PM` int(70) NOT NULL,
  `PTS` int(70) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);

# sample data
INSERT INTO `basketball_stats` VALUES(1, 1, 1, 0.334, 0.2934, 5, 25, 1, 34, 4, 53, '2016-02-21 22:21:06');
INSERT INTO `basketball_stats` VALUES(2, 1, 1, 0.534, 0.932, 15, 12, 3, 15, 22, 70, '2016-02-21 22:21:06');
INSERT INTO `basketball_stats` VALUES(3, 1, 1, 0.754, 0.432, 4, 35, 8, 50, 1, 38, '2016-02-21 22:21:06');

##########################
# BASEBALL STATS TABLE   #
##########################
DROP TABLE IF EXISTS `baseball_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `baseball_stats` (
  `team_id` int(70) NOT NULL,
  `league_id` int(70) NOT NULL,
  `week` int(70) NOT NULL,
  `year` int(70) NOT NULL,
  `OBP` DECIMAL(6,4) NOT NULL,
  `ERA` DECIMAL(6,4) NOT NULL,
  `WHIP` DECIMAL(6,4) NOT NULL,
  `RBI` int(10) NOT NULL,
  `SB` int(10) NOT NULL,
  `SV` int(10) NOT NULL,
  `HR` int(10) NOT NULL,
  `W` int(10) NOT NULL,
  `R` int(10) NOT NULL,
  `K` int(10) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`,`league_id`,`week`,`year`));
  
  

###############
# TEAMS TABLE #
###############
DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `teams` (`team_id` int(70) NOT NULL,
  `league_id` int(70) NOT NULL,
  `team_name` VARCHAR(70) NOT NULL,
  `owner_name` VARCHAR(70) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);

# sample data
INSERT INTO `teams` VALUES(1, 44067, 'This Team is UnFrazierable', 'Wilbert Lam', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(2, 44067, 'Team dickbutt is coming for u', 'Davy Til', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(3, 44067, 'SSID PLWUYANG', 'Chris Chan', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(4, 44067, 'Baseball sucks so does Wilburt', 'Linsen Wu', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(5, 44067, 'Davys Manny Pujols', 'Addison Wright', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(6, 44067, 'Caves Kitchen Curries', 'John Luu', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(7, 44067, 'The Number One Fanned', 'Kevin Yan', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(8, 44067, 'BURT THE MILFHUNTER', 'Loc Nguyen', '2016-02-22 12:22:25');

CREATE OR REPLACE VIEW statv AS
SELECT  teams.team_name, teams.owner_name, baseball_stats.*
	FROM teams, baseball_stats
	WHERE teams.team_id = baseball_stats.team_id;
    
########################
# Player STATS TABLE   #
########################
DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `player_stats` (
  `team_id` int(40) NOT NULL,
  `league_id` int(40) NOT NULL,
  `season_id` int(40) NOT NULL,
  `scoring_period_id` int(40) NOT NULL,
  `player_id` int(70) NOT NULL,
  `player_name` varchar(70) NOT NULL,
  `OBP` DECIMAL(6,4) DEFAULT 0.0,
  `ERA` DECIMAL(6,4) DEFAULT 0.0,
  `WHIP` DECIMAL(6,4) DEFAULT 0.0,
  `RBI` int(10) DEFAULT 0,
  `SB` int(10) DEFAULT 0,
  `SV` int(10) DEFAULT 0,
  `HR` int(10) DEFAULT 0,
  `W` int(10) DEFAULT 0,
  `R` int(10) DEFAULT 0,
  `K` int(10) DEFAULT 0,
  `AB` int(10) DEFAULT 0,
  `BH` int(10) DEFAULT 0,
  `BBB` int(10) DEFAULT 0,
  `IP` DECIMAL(6,1) DEFAULT 0.0,
  `PBB` int(10) DEFAULT 0,
  `ER` int(10) DEFAULT 0,
  `PH` int(10) DEFAULT 0,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`,`league_id`,`season_id`,`scoring_period_id`,`player_id`));
