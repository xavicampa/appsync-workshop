CREATE DATABASE IF NOT EXISTS hotelinventory;
CREATE TABLE IF NOT EXISTS hotelinventory.rooms (room INT PRIMARY KEY,beds TINYINT,price INT,status TINYINT NOT NULL,priority TINYINT NOT NULL,description TEXT);
CREATE TABLE IF NOT EXISTS hotelinventory.statuscodes (statuscode INT PRIMARY KEY,description TEXT NOT NULL);
INSERT INTO hotelinventory.rooms VALUES (100, 1, 100, 1, 1, 'Single bed room');
INSERT INTO hotelinventory.rooms VALUES (101, 2, 101, 1, 1, 'Double bed room');
INSERT INTO hotelinventory.rooms VALUES (102, 1, 102, 1, 1, 'Single bed room');
INSERT INTO hotelinventory.rooms VALUES (104, 3, 103, 1, 2, 'Suite');
INSERT INTO hotelinventory.rooms VALUES (301, 2, 301, 1, 1, 'Moved Permanently');
INSERT INTO hotelinventory.rooms VALUES (404, 2, 404, 1, 1, 'Not Found');
INSERT INTO hotelinventory.rooms VALUES (503, 0, 503, 1, 2, 'Service Unavailable');
INSERT INTO hotelinventory.statuscodes VALUES (1,"OK");
INSERT INTO hotelinventory.statuscodes VALUES (2,"Closed");
GRANT SELECT on hotelinventory.* TO 'roomview'@'%';
FLUSH PRIVILEGES; 
