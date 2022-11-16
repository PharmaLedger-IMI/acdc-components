BEGIN TRANSACTION;
/*
\set DBC_ID 2
INSERT INTO DbChange (id, description)
VALUES (:"DBC_ID", '#30 - FGT integration changes from MSD to Bayer');
*/

UPDATE appresource SET value='https://api-mah-bayer-fgt-dev.pharmaledger.pdmfc.com/traceability' WHERE key='fgt.url';

UPDATE appresource SET value='Onfvp GHSVZwHkZmZ5ZwR5ByEbnKZkp1A1L2uOHmAwqKWyHTSmp3pjpzD=' WHERE key='fgt.authorization';

UPDATE appresource SET value='0.9.1' WHERE key='acdc.version';

/*
UPDATE DbChange SET execution=CLOCK_TIMESTAMP() WHERE id=:"DBC_ID";
\unset DBC_ID
*/
COMMIT;
