BEGIN TRANSACTION;
/*
\set DBC_ID 1
INSERT INTO DbChange (id, description)
VALUES (:"DBC_ID", '#30 - FGT integration');
*/

SELECT pg_catalog.setval('public.appresource_id_seq', 3, true);

COPY appresource (id, key, locale, value, help) FROM stdin;
2	fgt.url	\N	https://api-mah-msd-fgt-dev.pharmaledger.pdmfc.com/traceability	URL for the REST services for the same MAH on the Finish Goods Traceability. This URL path will be appended with /traceability/create for traceability requests.
3	fgt.authorization	\N	Basic TUFIMTM2MzY2MzU1OlRoaXMxc1N1Y2hBUzNjdXJlUGFzc3cwcmQ=	Value of the Authorization header for the REST services. This is a BASIC http authentication, which is string that ends with username:password encoded in base64.
\.

UPDATE appresource SET value='0.9.0' WHERE key='acdc.version';

/*
UPDATE DbChange SET execution=CLOCK_TIMESTAMP() WHERE id=:"DBC_ID";
\unset DBC_ID
*/
COMMIT;
