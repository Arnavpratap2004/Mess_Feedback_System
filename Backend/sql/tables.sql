-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: mess_feedback_system
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_name` varchar(100) NOT NULL,
  `employee_id` varchar(20) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--
LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','Emp101','$2b$10$t2..29DUyVnzXoBQOz0dpuAu7vOW2tom1JDvVnZyD8QWG5t02wLri'),(2,'Admin2','Emp102','$2b$10$HWedxkuISu./Co9hOtQkie.G8hdGNj.QlmAXqRCyU7PmbZJHiypE6');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_reg_no` varchar(20) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `block_name` varchar(50) NOT NULL,
  `room_number` varchar(20) NOT NULL,
  `mess_name` varchar(100) NOT NULL,
  `mess_type` enum('Veg','Non-Veg','Special','Night') NOT NULL,
  `category` enum('Quality','Quantity','Hygiene','Mess Timing','Others') NOT NULL,
  `feedback` text NOT NULL,
  `comments` text,
  `proof_path` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_reg_no` (`student_reg_no`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`student_reg_no`) REFERENCES `students` (`reg_no`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,'23BCE2354','Sarthak Verma','L','606','L-Special','Special','Quality','Quality is very poor','The food is tasteless and the quality is not upto the mark','https://qph.cf2.quoracdn.net/main-qimg-cb93d6e1cfd45e3cc4e556dde3ffdda5-lq','2025-04-02 11:24:27'),(2,'23BCE0891','Arnav Pratap','K','123','K- Non Veg','Non-Veg','Quantity','Quantity is very less','The food is in very less quantity, even if I ask for more they refuse',NULL,'2025-04-02 11:33:27'),(3,'23BCE0233','Abhigyan Prakhar','L','606','L-Veg','Veg','Hygiene','Maintain cleanliness in mess','found hair in food',NULL,'2025-04-02 13:01:19'),(4,'23BIT0254','Raghav Seth','Q','1109','Q-Veg','Veg','Others','Behaviour must be proper','Very rude staff',NULL,'2025-04-02 13:04:23'),(5,'23BCE2354','Sarthak Verma','L','606','L-Paid','Special','Quantity','Quantity is very less','Quantity is very less ',NULL,'2025-04-02 13:20:08');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_name` varchar(100) NOT NULL,
  `reg_no` varchar(20) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reg_no` (`reg_no`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--
LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'Sarthak Verma','23BCE2354','$2b$10$2tpJ9QNrx0AHsWHco81XM.OwMLT1ajSbG7Bv3UmU3M92/CJbGEsNu'),(2,'Arnav Pratap','23BCE0891','$2b$10$uThjO6E5UdEk.GL./Xi2Tuwlz1Hh6p492AhMWfUVAFfDpXkJrJKnG'),(3,'Abhigyan Prakhar','23BCE0233','$2b$10$5P7.07bGrZo8eLGDLhPTgOzGUqjtE/1EwJFCnBEqcHzT9TBr0Li8.'),(4,'Raghav Seth','23BIT0254','$2b$10$zInnNUek4VmA4seAbXjjGuHyFh2yPJ4gCjm8EQ759YLO45rsMc4Uq'),(5,'Student2','23BCE0000','$2b$10$6q85FaXItXAvPDhfSbr5GOAF0w/FBtT0Ui0I2gWs.u/lNcUeaM/KC');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'mess_feedback_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-03  9:02:23
