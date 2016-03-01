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
INSERT INTO `teams` VALUES(1, 1, 'Corn In Corn Out', 'Addison Wright', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(2, 1, 'Han Sodanilo and Chewibaka', 'Wilbert Lam', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(3, 1, 'baseball sucks and so do wilbs', 'Linsen Wu', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(4, 1, 'Steph Curry Fanclub', 'Davy Til', '2016-02-22 12:22:25');