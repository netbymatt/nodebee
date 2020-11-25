-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 16, 2020 at 04:49 PM
-- Server version: 10.5.8-MariaDB-1:10.5.8+maria~xenial
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nodebee`
--
CREATE DATABASE IF NOT EXISTS `nodebee` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `nodebee`;

-- --------------------------------------------------------

--
-- Table structure for table `api_log`
--

CREATE TABLE `api_log` (
  `api_log_id` int(10) UNSIGNED NOT NULL,
  `method` enum('get','post') COLLATE utf8_unicode_ci NOT NULL,
  `endpoint` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `json_arguments` text COLLATE utf8_unicode_ci NOT NULL,
  `response` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `error_log`
--

CREATE TABLE `error_log` (
  `error_log_id` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `json_error` text COLLATE utf8_unicode_ci NOT NULL,
  `deleted` tinyint(1) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPRESSED;

-- --------------------------------------------------------

--
-- Table structure for table `runtime_report_sensor`
--

CREATE TABLE `runtime_report_sensor` (
  `runtime_report_sensor_id` int(10) UNSIGNED NOT NULL,
  `thermostat_id` int(10) UNSIGNED NOT NULL,
  `sensor_id` int(10) UNSIGNED NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `tsyear` int(11) DEFAULT NULL,
  `tsmonth` int(11) DEFAULT NULL,
  `tsday` int(11) DEFAULT NULL,
  `tshour` int(11) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `humidity` int(10) UNSIGNED DEFAULT NULL,
  `occupancy` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPRESSED;

--
-- Triggers `runtime_report_sensor`
--
DELIMITER $$
CREATE TRIGGER `AddTimestampGroups` BEFORE INSERT ON `runtime_report_sensor` FOR EACH ROW SET 
        NEW.tsyear = YEAR(NEW.timestamp),
        NEW.tsmonth = MONTH(NEW.timestamp),
        NEW.tsday = DAY(NEW.timestamp),
        NEW.tshour = HOUR(NEW.timestamp)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `runtime_report_thermostat`
--

CREATE TABLE `runtime_report_thermostat` (
  `runtime_report_thermostat_id` int(10) UNSIGNED NOT NULL,
  `thermostat_id` int(10) UNSIGNED NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `tsyear` int(11) DEFAULT NULL,
  `tsmonth` int(11) DEFAULT NULL,
  `tsday` int(11) DEFAULT NULL,
  `tshour` int(11) DEFAULT NULL,
  `auxiliary_heat_1` int(10) UNSIGNED DEFAULT NULL,
  `auxiliary_heat_2` int(10) UNSIGNED DEFAULT NULL,
  `auxiliary_heat_3` int(10) UNSIGNED DEFAULT NULL,
  `compressor_cool_1` int(10) UNSIGNED DEFAULT NULL,
  `compressor_cool_2` int(10) UNSIGNED DEFAULT NULL,
  `compressor_heat_1` int(10) UNSIGNED DEFAULT NULL,
  `compressor_heat_2` int(10) UNSIGNED DEFAULT NULL,
  `dehumidifier` int(10) UNSIGNED DEFAULT NULL,
  `demand_management_offset` decimal(4,1) DEFAULT NULL,
  `economizer` int(10) UNSIGNED DEFAULT NULL,
  `fan` int(10) UNSIGNED DEFAULT NULL,
  `humidifier` int(10) UNSIGNED DEFAULT NULL,
  `hvac_mode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `outdoor_humidity` int(10) UNSIGNED DEFAULT NULL,
  `outdoor_temperature` decimal(4,1) DEFAULT NULL,
  `sky` int(10) UNSIGNED DEFAULT NULL,
  `ventilator` int(10) UNSIGNED DEFAULT NULL,
  `wind` int(10) UNSIGNED DEFAULT NULL,
  `zone_average_temperature` decimal(4,1) DEFAULT NULL,
  `zone_calendar_event` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `zone_climate` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `zone_cool_temperature` decimal(4,1) DEFAULT NULL,
  `zone_heat_temperature` decimal(4,1) DEFAULT NULL,
  `zone_humidity` int(10) UNSIGNED DEFAULT NULL,
  `zone_humidity_high` int(10) UNSIGNED DEFAULT NULL,
  `zone_humidity_low` int(10) UNSIGNED DEFAULT NULL,
  `zone_hvac_mode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `zone_occupancy` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPRESSED;

--
-- Triggers `runtime_report_thermostat`
--
DELIMITER $$
CREATE TRIGGER `AddTimeStampGroups` BEFORE INSERT ON `runtime_report_thermostat` FOR EACH ROW BEGIN
    SET 
        NEW.tsyear = YEAR(NEW.timestamp),
        NEW.tsmonth = MONTH(NEW.timestamp),
        NEW.tsday = DAY(NEW.timestamp),
        NEW.tshour = HOUR(NEW.timestamp);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sensor`
--

CREATE TABLE `sensor` (
  `sensor_id` int(10) UNSIGNED NOT NULL,
  `thermostat_id` int(10) UNSIGNED NOT NULL,
  `identifier` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `in_use` tinyint(1) NOT NULL,
  `json_capability` text COLLATE utf8_unicode_ci NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `SensorDay`
-- (See below for the actual view)
--
CREATE TABLE `SensorDay` (
`timestamp` datetime
,`sensor_id` int(10) unsigned
,`thermostat_id` int(10) unsigned
,`temperature` decimal(5,1)
,`humidity` decimal(12,1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `SensorHour`
-- (See below for the actual view)
--
CREATE TABLE `SensorHour` (
`timestamp` datetime
,`sensor_id` int(10) unsigned
,`thermostat_id` int(10) unsigned
,`temperature` decimal(5,1)
,`humidity` decimal(12,1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `SensorMinute`
-- (See below for the actual view)
--
CREATE TABLE `SensorMinute` (
`timestamp` datetime
,`thermostat_id` int(10) unsigned
,`sensor_id` int(10) unsigned
,`temperature` decimal(4,1)
,`humidity` int(10) unsigned
,`occupancy` tinyint(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `SystemInfo`
-- (See below for the actual view)
--
CREATE TABLE `SystemInfo` (
`sensor_id` int(10) unsigned
,`sensor_name` varchar(255)
,`thermostat_id` int(10) unsigned
,`thermostat_name` varchar(255)
,`type` varchar(255)
);

-- --------------------------------------------------------

--
-- Table structure for table `thermostat`
--

CREATE TABLE `thermostat` (
  `thermostat_id` int(10) UNSIGNED NOT NULL,
  `identifier` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `connected` tinyint(1) NOT NULL,
  `thermostat_revision` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `alert_revision` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `runtime_revision` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `internal_revision` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `json_runtime` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_extended_runtime` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_electricity` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_settings` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_location` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_program` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_events` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_device` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_technician` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_utility` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_management` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_alerts` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_weather` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_house_details` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_oem_cfg` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_equipment_status` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_notification_settings` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_privacy` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_version` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_remote_sensors` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `json_audio` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPRESSED;

-- --------------------------------------------------------

--
-- Stand-in structure for view `ThermostatDay`
-- (See below for the actual view)
--
CREATE TABLE `ThermostatDay` (
`timestamp` datetime
,`thermostat_id` int(10) unsigned
,`fan` decimal(34,1)
,`cool` decimal(34,1)
,`heat` decimal(34,1)
,`outside` decimal(5,1)
,`outside min` decimal(4,1)
,`outside max` decimal(4,1)
,`setpoint` decimal(4,0)
,`average` decimal(5,1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `ThermostatHour`
-- (See below for the actual view)
--
CREATE TABLE `ThermostatHour` (
`timestamp` datetime
,`thermostat_id` int(10) unsigned
,`fan` decimal(33,0)
,`cool` decimal(33,0)
,`heat` decimal(33,0)
,`outside` decimal(5,1)
,`setpoint` decimal(4,0)
,`average` decimal(5,1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `ThermostatMinute`
-- (See below for the actual view)
--
CREATE TABLE `ThermostatMinute` (
`timestamp` datetime
,`thermostat_id` int(10) unsigned
,`fan` decimal(11,0)
,`cool` decimal(11,0)
,`heat` decimal(11,0)
,`outside` decimal(4,1)
,`setpoint` decimal(4,1)
,`average` decimal(4,1)
);

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `token_id` int(10) UNSIGNED NOT NULL,
  `access_token` varchar(8192) COLLATE utf8_unicode_ci NOT NULL,
  `refresh_token` varchar(8192) COLLATE utf8_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPRESSED;

-- --------------------------------------------------------

--
-- Structure for view `SensorDay`
--
DROP TABLE IF EXISTS `SensorDay`;

CREATE VIEW `SensorDay`  AS SELECT `runtime_report_sensor`.`timestamp` AS `timestamp`, `runtime_report_sensor`.`sensor_id` AS `sensor_id`, `runtime_report_sensor`.`thermostat_id` AS `thermostat_id`, round(avg(`runtime_report_sensor`.`temperature`),1) AS `temperature`, round(avg(`runtime_report_sensor`.`humidity`),1) AS `humidity` FROM `runtime_report_sensor` GROUP BY `runtime_report_sensor`.`tsyear`, `runtime_report_sensor`.`tsmonth`, `runtime_report_sensor`.`tsday`, `runtime_report_sensor`.`sensor_id` ;

-- --------------------------------------------------------

--
-- Structure for view `SensorHour`
--
DROP TABLE IF EXISTS `SensorHour`;

CREATE VIEW `SensorHour`  AS SELECT `runtime_report_sensor`.`timestamp` AS `timestamp`, `runtime_report_sensor`.`sensor_id` AS `sensor_id`, `runtime_report_sensor`.`thermostat_id` AS `thermostat_id`, round(avg(`runtime_report_sensor`.`temperature`),1) AS `temperature`, round(avg(`runtime_report_sensor`.`humidity`),1) AS `humidity` FROM `runtime_report_sensor` GROUP BY `runtime_report_sensor`.`tsyear`, `runtime_report_sensor`.`tsmonth`, `runtime_report_sensor`.`tsday`, `runtime_report_sensor`.`tshour`, `runtime_report_sensor`.`sensor_id` ;

-- --------------------------------------------------------

--
-- Structure for view `SensorMinute`
--
DROP TABLE IF EXISTS `SensorMinute`;

CREATE VIEW `SensorMinute`  AS SELECT `runtime_report_sensor`.`timestamp` AS `timestamp`, `runtime_report_sensor`.`thermostat_id` AS `thermostat_id`, `runtime_report_sensor`.`sensor_id` AS `sensor_id`, `runtime_report_sensor`.`temperature` AS `temperature`, `runtime_report_sensor`.`humidity` AS `humidity`, `runtime_report_sensor`.`occupancy` AS `occupancy` FROM `runtime_report_sensor` ;

-- --------------------------------------------------------

--
-- Structure for view `SystemInfo`
--
DROP TABLE IF EXISTS `SystemInfo`;

CREATE VIEW `SystemInfo`  AS SELECT `s`.`sensor_id` AS `sensor_id`, `s`.`name` AS `sensor_name`, `t`.`thermostat_id` AS `thermostat_id`, `t`.`name` AS `thermostat_name`, `s`.`type` AS `type` FROM (`thermostat` `t` left join `sensor` `s` on(`s`.`thermostat_id` = `t`.`thermostat_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `ThermostatDay`
--
DROP TABLE IF EXISTS `ThermostatDay`;

CREATE VIEW `ThermostatDay`  AS SELECT `runtime_report_thermostat`.`timestamp` AS `timestamp`, `runtime_report_thermostat`.`thermostat_id` AS `thermostat_id`, round(sum(`runtime_report_thermostat`.`fan`) / 3600,1) AS `fan`, round(sum(`runtime_report_thermostat`.`compressor_cool_1`) / 3600,1) AS `cool`, round(sum(`runtime_report_thermostat`.`auxiliary_heat_1`) / 3600,1) AS `heat`, round(avg(`runtime_report_thermostat`.`outdoor_temperature`),1) AS `outside`, min(`runtime_report_thermostat`.`outdoor_temperature`) AS `outside min`, max(`runtime_report_thermostat`.`outdoor_temperature`) AS `outside max`, round(avg(case when `runtime_report_thermostat`.`zone_hvac_mode` like '%cool%' then `runtime_report_thermostat`.`zone_cool_temperature` else `runtime_report_thermostat`.`zone_heat_temperature` end),0) AS `setpoint`, round(avg(`runtime_report_thermostat`.`zone_average_temperature`),1) AS `average` FROM `runtime_report_thermostat` GROUP BY `runtime_report_thermostat`.`tsyear`, `runtime_report_thermostat`.`tsmonth`, `runtime_report_thermostat`.`tsday` ;

-- --------------------------------------------------------

--
-- Structure for view `ThermostatHour`
--
DROP TABLE IF EXISTS `ThermostatHour`;

CREATE VIEW `ThermostatHour`  AS SELECT `T`.`timestamp` AS `timestamp`, `T`.`thermostat_id` AS `thermostat_id`, round(sum(`T`.`fan`) / 60,0) AS `fan`, round(sum(`T`.`compressor_cool_1`) / 60,0) AS `cool`, round(sum(`T`.`auxiliary_heat_1`) / 60,0) AS `heat`, round(avg(`T`.`outdoor_temperature`),1) AS `outside`, round(avg(case when `T`.`zone_hvac_mode` like '%cool%' then `T`.`zone_cool_temperature` else `T`.`zone_heat_temperature` end),0) AS `setpoint`, round(avg(`T`.`zone_average_temperature`),1) AS `average` FROM `runtime_report_thermostat` AS `T` GROUP BY `T`.`tsyear`, `T`.`tsmonth`, `T`.`tsday`, `T`.`tshour` ORDER BY `T`.`timestamp` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `ThermostatMinute`
--
DROP TABLE IF EXISTS `ThermostatMinute`;

CREATE VIEW `ThermostatMinute`  AS SELECT `T`.`timestamp` AS `timestamp`, `T`.`thermostat_id` AS `thermostat_id`, round(`T`.`fan` / 60,0) AS `fan`, round(`T`.`compressor_cool_1` / 60,0) AS `cool`, round(`T`.`auxiliary_heat_1` / 60,0) AS `heat`, `T`.`outdoor_temperature` AS `outside`, CASE WHEN `T`.`zone_hvac_mode` like '%cool%' THEN `T`.`zone_cool_temperature` ELSE `T`.`zone_heat_temperature` END AS `setpoint`, `T`.`zone_average_temperature` AS `average` FROM `runtime_report_thermostat` AS `T` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_log`
--
ALTER TABLE `api_log`
  ADD PRIMARY KEY (`api_log_id`);

--
-- Indexes for table `error_log`
--
ALTER TABLE `error_log`
  ADD PRIMARY KEY (`error_log_id`);

--
-- Indexes for table `runtime_report_sensor`
--
ALTER TABLE `runtime_report_sensor`
  ADD PRIMARY KEY (`runtime_report_sensor_id`),
  ADD UNIQUE KEY `sensor_id` (`sensor_id`,`timestamp`),
  ADD KEY `thermostat_id` (`thermostat_id`),
  ADD KEY `timestamp` (`timestamp`) USING BTREE,
  ADD KEY `tsyear` (`tsyear`),
  ADD KEY `tsmonth` (`tsmonth`),
  ADD KEY `tsday` (`tsday`),
  ADD KEY `tshour` (`tshour`);

--
-- Indexes for table `runtime_report_thermostat`
--
ALTER TABLE `runtime_report_thermostat`
  ADD PRIMARY KEY (`runtime_report_thermostat_id`),
  ADD UNIQUE KEY `thermostat_id_timestamp` (`thermostat_id`,`timestamp`),
  ADD KEY `tsyear` (`tsyear`),
  ADD KEY `tsmonth` (`tsmonth`),
  ADD KEY `tsday` (`tsday`),
  ADD KEY `tshour` (`tshour`),
  ADD KEY `thermostat` (`timestamp`) USING BTREE,
  ADD KEY `thermostat_id` (`thermostat_id`);

--
-- Indexes for table `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`sensor_id`),
  ADD KEY `thermostat_id` (`thermostat_id`);

--
-- Indexes for table `thermostat`
--
ALTER TABLE `thermostat`
  ADD PRIMARY KEY (`thermostat_id`),
  ADD UNIQUE KEY `identifier` (`identifier`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`token_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_log`
--
ALTER TABLE `api_log`
  MODIFY `api_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `error_log`
--
ALTER TABLE `error_log`
  MODIFY `error_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `runtime_report_sensor`
--
ALTER TABLE `runtime_report_sensor`
  MODIFY `runtime_report_sensor_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `runtime_report_thermostat`
--
ALTER TABLE `runtime_report_thermostat`
  MODIFY `runtime_report_thermostat_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sensor`
--
ALTER TABLE `sensor`
  MODIFY `sensor_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thermostat`
--
ALTER TABLE `thermostat`
  MODIFY `thermostat_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `token_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `runtime_report_sensor`
--
ALTER TABLE `runtime_report_sensor`
  ADD CONSTRAINT `runtime_report_sensor_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensor` (`sensor_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `runtime_report_sensor_ibfk_2` FOREIGN KEY (`thermostat_id`) REFERENCES `thermostat` (`thermostat_id`) ON DELETE CASCADE;

--
-- Constraints for table `runtime_report_thermostat`
--
ALTER TABLE `runtime_report_thermostat`
  ADD CONSTRAINT `runtime_report_thermostat_ibfk_1` FOREIGN KEY (`thermostat_id`) REFERENCES `thermostat` (`thermostat_id`) ON DELETE CASCADE;

--
-- Constraints for table `sensor`
--
ALTER TABLE `sensor`
  ADD CONSTRAINT `sensor_ibfk_1` FOREIGN KEY (`thermostat_id`) REFERENCES `thermostat` (`thermostat_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;