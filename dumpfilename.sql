-- MySQL dump 10.13  Distrib 8.0.11, for Win64 (x86_64)
--
-- Host: localhost    Database: spotifai
-- ------------------------------------------------------
-- Server version	8.0.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `friend`
--

DROP TABLE IF EXISTS `friend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `friend` (
  `friend1` varchar(100) NOT NULL,
  `friend2` varchar(100) NOT NULL,
  PRIMARY KEY (`friend1`,`friend2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend`
--

LOCK TABLES `friend` WRITE;
/*!40000 ALTER TABLE `friend` DISABLE KEYS */;
INSERT INTO `friend` VALUES ('aaa2122','amerigo'),('aaa2122','sdfd'),('crisz','crisz'),('crisz','cvodsv'),('crisz','marcocast'),('crisz','pinco_pallino'),('marcocast','marcocast'),('public','marcocast'),('public','public');
/*!40000 ALTER TABLE `friend` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `playlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `playlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist`
--

LOCK TABLES `playlist` WRITE;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
INSERT INTO `playlist` VALUES (1,16,'Ciccio'),(2,16,'sss'),(3,16,'musica bella'),(4,16,'musica brutta'),(5,16,'musica così così'),(6,16,'Classica'),(7,19,'Ciao'),(8,16,'Musica napoletana'),(9,16,'Musica classica'),(10,16,'Musica classica');
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist_has_song`
--

DROP TABLE IF EXISTS `playlist_has_song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `playlist_has_song` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `playlist_id` int(11) NOT NULL,
  `song_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `playlist_id` (`playlist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `playlist_has_song_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `playlist` (`id`),
  CONSTRAINT `playlist_has_song_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_has_song`
--

LOCK TABLES `playlist_has_song` WRITE;
/*!40000 ALTER TABLE `playlist_has_song` DISABLE KEYS */;
INSERT INTO `playlist_has_song` VALUES (1,3,2,16),(3,4,2,16),(9,6,2,16),(10,7,6,19),(20,9,8,16),(21,9,9,16);
/*!40000 ALTER TABLE `playlist_has_song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `queue`
--

DROP TABLE IF EXISTS `queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `song_id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `owner` varchar(100) NOT NULL,
  `seconds` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `song_id` (`song_id`),
  CONSTRAINT `queue_ibfk_1` FOREIGN KEY (`song_id`) REFERENCES `song` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue`
--

LOCK TABLES `queue` WRITE;
/*!40000 ALTER TABLE `queue` DISABLE KEYS */;
INSERT INTO `queue` VALUES (14,3,1,'banana',10),(15,5,2,'banana',10),(16,5,3,'banana',10),(17,5,4,'banana',10),(409,7,0,'public',7),(848,6,0,'marcocast',44),(1181,8,0,'crisz',17),(1182,12,1,'crisz',17),(1183,11,2,'crisz',17),(1184,13,3,'crisz',17),(1185,7,4,'crisz',17),(1186,7,5,'crisz',17),(1187,7,6,'crisz',17),(1188,7,7,'crisz',17);
/*!40000 ALTER TABLE `queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `song`
--

DROP TABLE IF EXISTS `song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `song` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `author` varchar(100) NOT NULL,
  `album` varchar(100) NOT NULL,
  `mp3_path` varchar(100) NOT NULL,
  `img_path` varchar(100) NOT NULL,
  `owner` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `song`
--

LOCK TABLES `song` WRITE;
/*!40000 ALTER TABLE `song` DISABLE KEYS */;
INSERT INTO `song` VALUES (3,'Bocca di rosa','Fabrizio De Andrè','Volume I','85a02b115451df96e7807236fff24c7c','827cc415b5050d4f9577b718d14b978a','pinco_pallino'),(5,'Sinfonia n° 25','Mozart','Best of','bbe34fef094d551e30da8e6e3225d45c','d94e5b1a9bc7973095c6e573f1e05442','crisz'),(6,'Dolcenera','Fabrizio De Andrè','Grandi successi','c06c613841d2495cb5fc5c21ab0af66a','b0d5cf74617bca22d3bee33e656e93ab','marcocast'),(7,'Fantasie 4','Wolfgang Amadeus Mozart','Classical Music','184d93a24c05819866f75f46d4f3329f','5d7f2ee26f15c47ec8c62021fbe46add','public'),(8,'Sonata n° 10','Wolfgang Amadeus Mozart','Classical Music','3488291d92fbe6f479ae884af6d66f1a','38540a7912847dca2c261be70d79e5f4','public'),(9,'Sonata n° 19','Wolfgang Amadeus Mozart','Classical Music','71703ae8de9cfe49651d973ac044b100','34b33b3ed4a78df12b1433291324155b','public'),(10,'Dormono sulla collina','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','7916256fc07515e19df8f08c84c5d8ec','8bf1eb96a82c687ad35741c6f2728423','public'),(11,'Un matto','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','d8c3f686e47e6308cd2705fc786a571a','69703cbad3f8423602aeb661c7653a5c','public'),(12,'Un giudice','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','46ff4cfae086deff340c3dd3df90bc39','179f728fadfe1feb08a33ccf720812b4','public'),(13,'Un blasfemo','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','28682ce6c87282b520d91b4b6f8aece5','220f038444b9b11950c1e4614ff173f6','public'),(14,'Un malato di cuore','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','41f8ebe0fdbb2b8fa5535419ce4059bd','68f55c269d2725dc92fb41fae247cdcf','public'),(15,'Un medico','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','2aab5b7d4896ba1914bf4e6d5d436acb','1b1dee04ce9df9a34a7a9270fb0ecf14','public'),(16,'Un chimico','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','687e11adeb38e1029e2a11c5c82b0319','e4cd907bd98b9d72a637863bd88a551f','public'),(17,'Un ottico','Fabrizio De Andrè','Non al denaro non all\'amore nè al cielo','cee4fe05a9152a1c1e146c9aa96f94e2','7721be60df0a4bf3aa61d0b2127d88ef','public'),(18,'Rimini','Fabrizio De Andrè','Rimini','0975173b9caef005e57a81a905e95dc4','fe32c84eae42538455ef947be6d8f48d','public'),(19,'Volta la carta','Fabrizio De Andrè','Rimini','31cbe79d5af781b3f8d7390aeb11f5bd','1b2d7651c7572248a12282464965d67b','public'),(20,'Coda di lupo','Fabrizio De Andrè','Rimini','4cf15c5c3436092bdf80cbf437727a6d','2498d47a1342b303f50a4ea176633339','public'),(21,'Andrea','Fabrizio De Andrè','Rimini','da783dd3c0e418993085182f7a53d1b3','280cc1f27cfdede2d18d2b7ce644387f','public'),(22,'Sally','Fabrizio De Andrè','Rimini','0719513b1354722ec9b7a9c9cc91d8d8','6a231be3d6ea5ab54ab5fb4f52750dfb','public'),(23,'Canzone del maggio','Fabrizio De Andrè','Storia di un impiegato','1bbebb28dde01dc8d0d996e92cf7d0d6','f6d078acdc44bb83dee7b568ba6040c4','public'),(24,'La bomba in testa','Fabrizio De Andrè','Storia di un impiegato','ce0e9e37e1c847b624cfefee694feacf','bf276567bddc4f3c5afebfb82113ee3c','public'),(25,'Il bombarolo','Fabrizio De Andrè','Storia di un impiegato','a6987abbcd061e82e4960e13696b65f0','9aa88841b5bc882f61256d1f71cba0d4','public'),(26,'Verranno a chiederti del nostro amore','Fabrizio De Andrè','Storia di un impiegato','cedb38fa22c579fc0f65da0e3ee70304','c33909d9d1ec0ae67e769156c559b76e','public'),(27,'Anna verrà','Pino Daniele','Mascalzone latino','0dd2eee0e9a47fa76adf5f27fa59498c','3021beb8c413437cedc9c41876e9e4f4','crisz'),(28,'Faccia gialla','Pino Daniele','Mascalzone latino','8fdcf989204c1eab37c217d4fe88e57a','3859ff652c59906700617abe3ede97de','crisz');
/*!40000 ALTER TABLE `song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `last_access` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'aasd','asdsdf','sdfgsd','fdsgdf','fdsfgsdf',NULL),(2,'lll','lll','lll','lll','ooo',NULL),(3,'vincenzino','123','cane gatto bu bu','ciao ciao','ciao ciao',NULL),(4,'aaa','bbb','ccc','cri@gmail.com','aaaaaaaaaaaa1',NULL),(11,'aaa','bbc','aaa','cri2@gmail.com','dfskfsmf9',NULL),(13,'adsdsf','vdskvsd','aaa2122','cri4@gmail.com','dsdfds32rw',NULL),(14,'aaa','cx','aaald','asa@vma.com','dscsfds@mca12',NULL),(15,'Pinco','Pallino','pinco_pallino','pinco@pallino.com','pincopallino123',NULL),(16,'Cristian','Traina','crisz','crisz@gmail.com','Canerosso1!','1529191393028'),(17,'s','s','sss','sdad@dsfs.com','ccccccccccc9',NULL),(18,'dsfksdafk','sfdjfsj','fdsjf','difjsdf@gdskf.com','dfsfisdf23',NULL),(19,'Marco','Castiglione','marcocast','marcocast@gmail.com','sucaforte8','1529100628957'),(20,'public','public','public','public@public.public','public123','1529096892571');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-17 13:53:45
