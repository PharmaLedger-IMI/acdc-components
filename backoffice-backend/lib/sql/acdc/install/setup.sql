-- run as postgres
create user acdc password 'acdc' valid until 'infinity';
create database acdc owner = acdc;
\connect acdc
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 


