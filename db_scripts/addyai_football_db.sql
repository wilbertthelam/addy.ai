CREATE DATABASE  IF NOT EXISTS `addy_ai_football`
/*!40100 DEFAULT CHARACTER SET latin1 */;
USE `addy_ai_football`;

##########################
# Football users #
##########################
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `users` (
  `user_id` int(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`));

# sample data
INSERT INTO `users` VALUES(1, 'wilbertthelam@gmail.com', 'wilbert', 'wilbert', 'lam', '2016-02-21 22:21:06');
INSERT INTO `users` VALUES(2, 'linsen@gmail.com', 'linsen', 'linsen', 'wu', '2016-02-21 22:21:07');
INSERT INTO `users` VALUES(3, 'addy@gmail.com', 'addy', 'addison', 'wright', '2016-02-21 22:21:08');


##########################
# Football matchups   #
##########################
DROP TABLE IF EXISTS `matchups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `matchups` (
  `matchup_id` int(50) NOT NULL AUTO_INCREMENT,
  `league_id` int(50) NOT NULL,
  `week` int(10) NOT NULL,
  `year` int(10) NOT NULL,
  `team_id1` int(50) NOT NULL,
  `team_id2` int(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchup_id`));

###############
# Football teams #
###############
DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `teams` (
  `team_id` int(50) NOT NULL,
  `league_id` int(50) NOT NULL,
  `user_id` int(50),
  `team_name` VARCHAR(70) NOT NULL DEFAULT 'Unnamed Team',
  `year` int(10) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);

# sample data
#INSERT INTO `teams` VALUES(1, 44067, 'This Team is UnFrazierable', 'Wilbert Lam', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(2, 44067, 'Team dickbutt is coming for u', 'Davy Til', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(3, 44067, 'SSID PLWUYANG', 'Chris Chan', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(4, 44067, 'Baseball sucks so does Wilburt', 'Linsen Wu', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(5, 44067, 'Davys Manny Pujols', 'Addison Wright', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(6, 44067, 'Caves Kitchen Curries', 'John Luu', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(7, 44067, 'The Number One Fanned', 'Kevin Yan', '2016-02-22 12:22:25');
#INSERT INTO `teams` VALUES(8, 44067, 'BURT THE MILFHUNTER', 'Loc Nguyen', '2016-02-22 12:22:25');

########################
# Football leagues #
########################
DROP TABLE IF EXISTS `leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `leagues` (
  `league_id` int(50) NOT NULL,
  `espn_id` int(50) NOT NULL,
  `year` int(50) NOT NULL,
  `league_name` varchar(70) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`league_id`,`year`));
  
#CREATE OR REPLACE VIEW weekly_player_statv AS
#SELECT  teams.team_name, teams.owner_name, player_stats.*
#	FROM teams, player_stats
#	WHERE teams.team_id = player_stats.team_id;
    
##################
# Football votes #
##################
DROP TABLE IF EXISTS `votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `votes` (
  `vote_id` int(50) NOT NULL AUTO_INCREMENT,
  `matchup_id` int(50) NOT NULL,
  `user_id` int(50) NOT NULL,
  `winning_team_id` int(50) NOT NULL,
  `losing_team_id` int(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vote_id`));
