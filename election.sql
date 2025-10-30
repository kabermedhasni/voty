-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 30, 2025 at 09:29 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `voty`
--

-- --------------------------------------------------------

--
-- Table structure for table `election`
--

CREATE TABLE `election` (
  `id` int NOT NULL,
  `en_organizer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fr_organizer` varchar(255) NOT NULL,
  `ar_organizer` varchar(255) NOT NULL,
  `election_type` varchar(100) DEFAULT NULL,
  `year` year NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `results` enum('publish','nopublish') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'nopublish',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `election`
--

INSERT INTO `election` (`id`, `en_organizer`, `fr_organizer`, `ar_organizer`, `election_type`, `year`, `start_date`, `end_date`, `results`, `status`, `created_by`, `created_at`) VALUES
(15, 'SupNum', 'SupNum', 'SupNum', 'municipal', '2025', '2025-10-24', '2025-10-30', 'publish', 1, NULL, '2025-10-27 08:15:33'),
(17, 'dfghjk', 'jack', 'jfl', 'university', '2025', '2025-12-20', '2026-12-30', 'nopublish', 1, NULL, '2025-10-27 08:15:33'),
(22, 'jfkdlj', 'jkdlj', 'ابيتا', 'university', '2025', '2000-12-12', '2054-12-12', 'publish', 1, 1, '2025-10-27 14:17:53'),
(23, 'jflj', 'fjdkl', 'تبنيست', 'municipal', '2002', '2000-12-12', '2028-02-02', 'nopublish', 1, 1, '2025-10-27 15:12:56'),
(24, 'jflj', 'fjdkl', 'تبنيست', 'municipal', '2002', '2000-12-12', '2028-02-02', 'nopublish', 1, 1, '2025-10-27 15:13:00'),
(25, 'fdjkla', 'dfjklaj', 'تبيست j', 'university', '2004', '2000-12-12', '2025-12-12', 'nopublish', 1, 1, '2025-10-27 15:18:22'),
(26, 'UN', 'UN', 'نشلاشثق', '', '2027', '2025-10-12', '2027-12-12', 'publish', 1, 1, '2025-10-30 09:01:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `election`
--
ALTER TABLE `election`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_election_creator` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `election`
--
ALTER TABLE `election`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `election`
--
ALTER TABLE `election`
  ADD CONSTRAINT `fk_election_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
