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
  `user_id` int(50) NOT NULL AUTO_INCREMENT,
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
INSERT INTO `users` VALUES(4, 'christine@gmail.com', 'christine', 'christine', 'yeh', '2016-02-21 22:21:08');


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
  
INSERT INTO `matchups` VALUES(100, 123456, 1, 2016, 100, 101, '2016-02-21 22:21:08');
INSERT INTO `matchups` VALUES(101, 123456, 1, 2016, 102, 103, '2016-02-21 22:21:08');
INSERT INTO `matchups` VALUES(102, 123456, 1, 2016, 104, 105, '2016-02-21 22:21:08');


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
  `owner_name` VARCHAR(70) NOT NULL DEFAULT 'Unnamed Owner',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);

# sample data
INSERT INTO `teams` VALUES(100, 123456, 100, 'Name of Amys Sextape!', 2016, 'Jake Peralta', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(101, 123456, 101, 'I Skipped 4th Grade', 2016, 'Amy Santiago', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(102, 123456, 102, 'Basement Dweller', 2016, 'Charles Boyle', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(103, 123456, 103, 'i hate you', 2016, 'Rosa Diaz', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(104, 123456, 104, 'Give me my Yogurt!', 2016, 'Terry Giffords', '2016-02-22 12:22:25');
INSERT INTO `teams` VALUES(105, 123456, 105, 'Married to Kevin Cozner', 2016, 'Captain Ray Holt', '2016-02-22 12:22:25');


########################
# Football leagues #
########################
DROP TABLE IF EXISTS `leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `leagues` (
  `league_id` int(50) NOT NULL AUTO_INCREMENT,
  `espn_id` int(50) NOT NULL,
  `year` int(50) NOT NULL,
  `league_name` varchar(70) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`league_id`,`espn_id`,`year`));
  
INSERT INTO `leagues` VALUES(2, 44012, 2016, 'Chipotle Kitchen', '2016-02-22 12:22:25');
INSERT INTO `leagues` VALUES(3, 44012, 2016, 'Auction League', '2016-02-22 12:22:25');
INSERT INTO `leagues` VALUES(4, 44012, 2016, 'Arjun League', '2016-02-22 12:22:25');
INSERT INTO `leagues` VALUES(123456, 123456, 2016, 'Test Mock Football League', '2016-02-22 12:22:25');


########################
# Football user_leagues #
########################
DROP TABLE IF EXISTS `user_leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `user_leagues` (
  `league_id` int(50) NOT NULL,
  `user_id` int(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`league_id`,`user_id`));
  
INSERT INTO `user_leagues` VALUES(1, 1, '2016-02-22 12:22:25');
INSERT INTO `user_leagues` VALUES(2, 1, '2016-02-22 12:22:25'); 
INSERT INTO `user_leagues` VALUES(3, 1, '2016-02-22 12:22:25'); 
INSERT INTO `user_leagues` VALUES(4, 1, '2016-02-22 12:22:25');  
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
  `matchup_id` int(50) NOT NULL,
  `user_id` int(50) NOT NULL,
  `winning_team_id` int(50) NOT NULL,
  `losing_team_id` int(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchup_id`, `user_id`));
  
  
########################
# Football results #
########################
DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `results` (
  `matchup_id` int(50) NOT NULL AUTO_INCREMENT,
  `winning_team_id` int(50) NOT NULL,
  `losing_team_id` int(50) NOT NULL,
  `winning_team_score` int(50) NOT NULL,
  `losing_team_score` int(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`matchup_id`));
  
INSERT INTO `results` VALUES(100, 100, 101, 93, 90, '2016-02-22 12:22:25');
INSERT INTO `results` VALUES(101, 103, 102, 100, 89, '2016-02-22 12:22:25');
INSERT INTO `results` VALUES(102, 104, 105, 67, 43, '2016-02-22 12:22:25');



