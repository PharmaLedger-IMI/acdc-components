BEGIN TRANSACTION;
/*
\set DBC_ID 1
INSERT INTO DbChange (id, description)
VALUES (:"DBC_ID", '#30 - FGT integration');
*/

SELECT pg_catalog.setval('public.appresource_id_seq', 3, true);

COPY appresource (id, key, locale, value, help) FROM stdin;
2	fgt.url	\N	https://api-mah-msd-fgt-dev.pharmaledger.pdmfc.com/traceability	URL for the REST services for the same MAH on the Finish Goods Traceability. This URL path will be appended with /traceability/create for traceability requests. Due to security reasons, the URL hostname is constrained to *.pharmaledger.pdmfc.com.
3	fgt.authorization	\N	Onfvp GHSVZGZ2ZmL2ZmH1ByEbnKZkp1A1L2uOHmAwqKWyHTSmp3pjpzD=	Value of the Authorization header for the REST services. This is a BASIC http authentication, which is string a "Basic " followed by username:password encoded in base64. rot13 is recognized and decoded.
\.

UPDATE appresource SET value='0.9.0' WHERE key='acdc.version';

/*
UPDATE DbChange SET execution=CLOCK_TIMESTAMP() WHERE id=:"DBC_ID";
\unset DBC_ID
*/
COMMIT;
