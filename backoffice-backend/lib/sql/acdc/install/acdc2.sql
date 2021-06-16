--
-- PostgreSQL database dump
--

-- Dumped from database version 12.7
-- Dumped by pg_dump version 12.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acdcuser; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.acdcuser (
    userid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(100) NOT NULL,
    passhash character varying(100) NOT NULL
);


ALTER TABLE public.acdcuser OWNER TO acdc;

--
-- Name: TABLE acdcuser; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.acdcuser IS 'Acu - AcdcUser - a generic user, access right will depend to which entities is the user associated';


--
-- Name: COLUMN acdcuser.userid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.acdcuser.userid IS 'userid - primary key';


--
-- Name: COLUMN acdcuser.email; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.acdcuser.email IS 'email - not null, user mail';


--
-- Name: COLUMN acdcuser.passhash; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.acdcuser.passhash IS 'passHash - password hash';


--
-- Name: appresource; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.appresource (
    id bigint NOT NULL,
    key character varying(256) NOT NULL,
    locale character varying(5),
    value text NOT NULL,
    help text
);


ALTER TABLE public.appresource OWNER TO acdc;

--
-- Name: TABLE appresource; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.appresource IS 'Arc - operational parameters or messages/resources that may need translation';


--
-- Name: COLUMN appresource.id; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appresource.id IS 'id - PK';


--
-- Name: COLUMN appresource.key; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appresource.key IS 'key - resource key';


--
-- Name: COLUMN appresource.locale; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appresource.locale IS 'locale - if NULL then this resource is not translateable, and should be considered a configuration parameter.';


--
-- Name: COLUMN appresource.value; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appresource.value IS 'value - value of the resource. Set to "?" to represent absence.';


--
-- Name: COLUMN appresource.help; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appresource.help IS 'help - help message describing the parameter or resource';


--
-- Name: appresource_id_seq; Type: SEQUENCE; Schema: public; Owner: acdc
--

CREATE SEQUENCE public.appresource_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appresource_id_seq OWNER TO acdc;

--
-- Name: appresource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: acdc
--

ALTER SEQUENCE public.appresource_id_seq OWNED BY public.appresource.id;


--
-- Name: appuser; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.appuser (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    passhash character varying(100) NOT NULL
);


ALTER TABLE public.appuser OWNER TO acdc;

--
-- Name: TABLE appuser; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.appuser IS 'Au - AppUser - a username+credential to login';


--
-- Name: COLUMN appuser.id; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appuser.id IS 'id - primary key';


--
-- Name: COLUMN appuser.username; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appuser.username IS 'username - unique string identifier';


--
-- Name: COLUMN appuser.passhash; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.appuser.passhash IS 'passHash - password hash';


--
-- Name: event; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.event (
    eventid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mahid uuid,
    createdon timestamp without time zone NOT NULL,
    eventdata json NOT NULL
);


ALTER TABLE public.event OWNER TO acdc;

--
-- Name: TABLE event; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.event IS 'Ev - Event - a generic event record, most events will be associated to some MAH (as they have an underlying GTIN associated)';


--
-- Name: COLUMN event.eventid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.event.eventid IS 'eventid - primary key';


--
-- Name: COLUMN event.mahid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.event.mahid IS 'mahid - manufactor (mah) id';


--
-- Name: COLUMN event.createdon; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.event.createdon IS 'createdon - datetime in timestamp when the event was requested';


--
-- Name: COLUMN event.eventdata; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.event.eventdata IS 'eventdata - event data as json';


--
-- Name: eventinput; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.eventinput (
    eventinputid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    eventid uuid,
    eventinputdata json NOT NULL
);


ALTER TABLE public.eventinput OWNER TO acdc;

--
-- Name: TABLE eventinput; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.eventinput IS 'Ei - Event Input - A generic record to describe the data that came from the end-user.';


--
-- Name: COLUMN eventinput.eventinputid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventinput.eventinputid IS 'eventinputid - primary key';


--
-- Name: COLUMN eventinput.eventid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventinput.eventid IS 'eventid - a generic event record identifier';


--
-- Name: COLUMN eventinput.eventinputdata; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventinput.eventinputdata IS 'eventinputdata - input data provided by end-user';


--
-- Name: eventoutput; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.eventoutput (
    eventoutputid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    eventid uuid,
    eventoutputdata json NOT NULL
);


ALTER TABLE public.eventoutput OWNER TO acdc;

--
-- Name: TABLE eventoutput; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.eventoutput IS 'Eo - EventOutput - A generic record to describe the data that the MAH replied back to the end-user.';


--
-- Name: COLUMN eventoutput.eventoutputid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventoutput.eventoutputid IS 'eventoutputid - primary key - event output id to identify reply to the end-user';


--
-- Name: COLUMN eventoutput.eventid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventoutput.eventid IS 'eventid - a generic event record identifier';


--
-- Name: COLUMN eventoutput.eventoutputdata; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.eventoutput.eventoutputdata IS 'eventinputdata - record data replied back to the end-user';


--
-- Name: locale; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.locale (
    code character varying(5) NOT NULL,
    description character varying(200)
);


ALTER TABLE public.locale OWNER TO acdc;

--
-- Name: TABLE locale; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.locale IS 'Loc - Locales. Does not include encoding.';


--
-- Name: COLUMN locale.code; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.locale.code IS 'code - locale code. Ex: "en", "en_US"';


--
-- Name: COLUMN locale.description; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.locale.description IS 'description - a desription of the locale';


--
-- Name: mah; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.mah (
    mahid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.mah OWNER TO acdc;

--
-- Name: TABLE mah; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.mah IS 'Ma - Mah - information for a Marketing Authorization Holder';


--
-- Name: COLUMN mah.mahid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.mah.mahid IS 'mahid - primary key';


--
-- Name: COLUMN mah.name; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.mah.name IS 'name - company name';


--
-- Name: mahuser; Type: TABLE; Schema: public; Owner: acdc
--

CREATE TABLE public.mahuser (
    mahuserid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mahid uuid,
    userid uuid
);


ALTER TABLE public.mahuser OWNER TO acdc;

--
-- Name: TABLE mahuser; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON TABLE public.mahuser IS 'Mu - MAHUser - information associating a User with an MAH.';


--
-- Name: COLUMN mahuser.mahuserid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.mahuser.mahuserid IS 'mahuserid - primary key';


--
-- Name: COLUMN mahuser.mahid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.mahuser.mahid IS 'mahid - mah identifier';


--
-- Name: COLUMN mahuser.userid; Type: COMMENT; Schema: public; Owner: acdc
--

COMMENT ON COLUMN public.mahuser.userid IS 'userid - user identifier';


--
-- Name: appresource id; Type: DEFAULT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.appresource ALTER COLUMN id SET DEFAULT nextval('public.appresource_id_seq'::regclass);


--
-- Data for Name: acdcuser; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.acdcuser (userid, email, passhash) FROM stdin;
744b02da-ee30-46dd-b894-35218029e87e	admin@somecompany.com	123456
06127849-9b1c-41fa-8461-4fac6eeb1d97	username@somecompany.com	123456
\.


--
-- Data for Name: appresource; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.appresource (id, key, locale, value, help) FROM stdin;
1	acdc.version	\N	0.3.0	Schema version
\.


--
-- Data for Name: appuser; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.appuser (id, username, passhash) FROM stdin;
5c6d5a11-9144-49ed-a4ad-7233804ed1a4	admin@somecompany.com	123456
706a903e-b29e-46c3-9d50-0fa66d3b9ee2	username@somecompany.com	123456
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.event (eventid, mahid, createdon, eventdata) FROM stdin;
\.


--
-- Data for Name: eventinput; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.eventinput (eventinputid, eventid, eventinputdata) FROM stdin;
\.


--
-- Data for Name: eventoutput; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.eventoutput (eventoutputid, eventid, eventoutputdata) FROM stdin;
\.


--
-- Data for Name: locale; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.locale (code, description) FROM stdin;
en	en
en_US	en_US
pt	pt
pt_BR	pt_BR
pt_PT	pt_PT
en_GB	en_GBx
\.


--
-- Data for Name: mah; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.mah (mahid, name) FROM stdin;
0c1aec99-a17f-495d-adfc-008888baef6c	Novartis AG
27e79e87-940a-475b-9d46-c266d3550d82	MSD
e076cc6c-5bfd-4785-a06d-e79e057f80cf	GSK
\.


--
-- Data for Name: mahuser; Type: TABLE DATA; Schema: public; Owner: acdc
--

COPY public.mahuser (mahuserid, mahid, userid) FROM stdin;
adc6e4b3-df5e-4426-8b97-45b6fcad5eb4	0c1aec99-a17f-495d-adfc-008888baef6c	744b02da-ee30-46dd-b894-35218029e87e
3aaba9fb-8af7-4b62-9b08-bf1d27214af7	0c1aec99-a17f-495d-adfc-008888baef6c	06127849-9b1c-41fa-8461-4fac6eeb1d97
482b5721-8358-4357-b8e0-0127fe5192fa	27e79e87-940a-475b-9d46-c266d3550d82	06127849-9b1c-41fa-8461-4fac6eeb1d97
081b018a-a7e5-42de-bf82-22e6b4920123	27e79e87-940a-475b-9d46-c266d3550d82	744b02da-ee30-46dd-b894-35218029e87e
24aa6f5d-bcea-40f0-88ea-d0913f326453	e076cc6c-5bfd-4785-a06d-e79e057f80cf	744b02da-ee30-46dd-b894-35218029e87e
58a49081-2938-4a75-9598-58e8f97a58fa	e076cc6c-5bfd-4785-a06d-e79e057f80cf	06127849-9b1c-41fa-8461-4fac6eeb1d97
\.


--
-- Name: appresource_id_seq; Type: SEQUENCE SET; Schema: public; Owner: acdc
--

SELECT pg_catalog.setval('public.appresource_id_seq', 1, true);


--
-- Name: appresource pk_appresource_id; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.appresource
    ADD CONSTRAINT pk_appresource_id PRIMARY KEY (id);


--
-- Name: appuser pk_appuser_id; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.appuser
    ADD CONSTRAINT pk_appuser_id PRIMARY KEY (id);


--
-- Name: event pk_event_eventid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT pk_event_eventid PRIMARY KEY (eventid);


--
-- Name: eventinput pk_eventinput_eventinputid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.eventinput
    ADD CONSTRAINT pk_eventinput_eventinputid PRIMARY KEY (eventinputid);


--
-- Name: eventoutput pk_eventoutput_eventoutputid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.eventoutput
    ADD CONSTRAINT pk_eventoutput_eventoutputid PRIMARY KEY (eventoutputid);


--
-- Name: locale pk_locale_code; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.locale
    ADD CONSTRAINT pk_locale_code PRIMARY KEY (code);


--
-- Name: mah pk_mah_mahid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.mah
    ADD CONSTRAINT pk_mah_mahid PRIMARY KEY (mahid);


--
-- Name: mahuser pk_mahuser_mahuserid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.mahuser
    ADD CONSTRAINT pk_mahuser_mahuserid PRIMARY KEY (mahuserid);


--
-- Name: acdcuser pk_users_userid; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.acdcuser
    ADD CONSTRAINT pk_users_userid PRIMARY KEY (userid);


--
-- Name: acdcuser unq_acdcuser_email; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.acdcuser
    ADD CONSTRAINT unq_acdcuser_email UNIQUE (email);


--
-- Name: mahuser unq_mahuser; Type: CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.mahuser
    ADD CONSTRAINT unq_mahuser UNIQUE (mahid, userid);


--
-- Name: event_createdon_idx; Type: INDEX; Schema: public; Owner: acdc
--

CREATE INDEX event_createdon_idx ON public.event USING btree (((createdon)::date));


--
-- Name: appresource fk_appresource_locale; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.appresource
    ADD CONSTRAINT fk_appresource_locale FOREIGN KEY (locale) REFERENCES public.locale(code);


--
-- Name: event fk_event_mah; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT fk_event_mah FOREIGN KEY (mahid) REFERENCES public.mah(mahid);


--
-- Name: eventinput fk_eventinput_event; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.eventinput
    ADD CONSTRAINT fk_eventinput_event FOREIGN KEY (eventid) REFERENCES public.event(eventid);


--
-- Name: eventoutput fk_eventoutput_event; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.eventoutput
    ADD CONSTRAINT fk_eventoutput_event FOREIGN KEY (eventid) REFERENCES public.event(eventid);


--
-- Name: mahuser fk_mahuser_mah; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.mahuser
    ADD CONSTRAINT fk_mahuser_mah FOREIGN KEY (mahid) REFERENCES public.mah(mahid);


--
-- Name: mahuser fk_mahuser_users; Type: FK CONSTRAINT; Schema: public; Owner: acdc
--

ALTER TABLE ONLY public.mahuser
    ADD CONSTRAINT fk_mahuser_users FOREIGN KEY (userid) REFERENCES public.acdcuser(userid);


--
-- PostgreSQL database dump complete
--

