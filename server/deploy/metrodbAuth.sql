--
-- PostgreSQL database dump
--

\restrict gHUilpYPShifVfHg5OmLTWUugdvFhTKpBcZHApuaisCEpddfACD7Sh0OR57yV1a

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: authuser
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.account OWNER TO authuser;

--
-- Name: session; Type: TABLE; Schema: public; Owner: authuser
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


ALTER TABLE public.session OWNER TO authuser;

--
-- Name: user; Type: TABLE; Schema: public; Owner: authuser
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "operatorId" integer NOT NULL
);


ALTER TABLE public."user" OWNER TO authuser;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: authuser
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verification OWNER TO authuser;

--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: authuser
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: authuser
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
kGqyYtYX2q5eT3ZJnGNnSk6YELLQIfhT	2026-08-19 12:43:19.435+00	Nhc46KNpFFTkaUMHNDBJsmNVZgNPoCDK	2026-08-12 12:43:19.435+00	2026-08-12 12:43:19.435+00		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
SDLoLOifJpiVn30FaHcS3Seu8JFZC4cV	2026-08-19 13:27:27.705+00	BIRy8fHic2aeX42GuzPfOXU7OTSh5sHA	2026-08-12 13:27:27.706+00	2026-08-12 13:27:27.706+00		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
5Aecqc9bMQrai6weq63emfR2Xp6T7hJi	2026-08-19 11:05:07.487+00	r6gW1XYKBI8uH6G4yXZO6pHdaQSYnPEl	2026-08-12 11:05:07.487+00	2026-08-12 11:05:07.487+00			eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
zlED4F18NjXO5VJ55DbceK13lkRbvTXr	2026-08-19 11:12:42.461+00	tJcMPQOaBEgksS94Ib68XvZgweWI6HUz	2026-08-12 11:12:42.461+00	2026-08-12 11:12:42.461+00			eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
fz0tcH7i8o3MqQbzNEXXoiw3OipqvQ29	2026-08-19 11:18:08.478+00	1lZHiKHhqwSOXBOIgvfq9Qg6RLBicLKf	2026-08-12 11:18:08.478+00	2026-08-12 11:18:08.478+00			eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
veMFlOMv3BjPfeievrprLH5Xl7KIGmJW	2026-08-19 11:31:48.965+00	8xKWs0fwUJbJ6Jh2noCYdVHgE1oXHWPY	2026-08-12 11:31:48.965+00	2026-08-12 11:31:48.965+00		PostmanRuntime/7.56.0	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
9cCitC9Dthy9Wc6NjA3bO4nizC7ebgsk	2026-08-19 11:35:11.226+00	AXWFbU5ilsLpkeghkEPeLIot7oM98F9g	2026-08-12 11:35:11.226+00	2026-08-12 11:35:11.226+00		PostmanRuntime/7.56.0	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
UPLB4SVXvast6bzGwIDvGoA4Aak843Ej	2026-08-19 11:39:36.288+00	vQIIcjp0Lpgc4tIOD5v7HW7JEhCMaBbV	2026-08-12 11:39:36.288+00	2026-08-12 11:39:36.288+00		PostmanRuntime/7.56.0	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
azpojvqvOprSPf7EmDXHQh5verCrB9zj	2026-08-19 11:46:54.118+00	OgwDXBvMcWmS7PREGNoEDpQhvwdr8hZ8	2026-08-12 11:46:54.118+00	2026-08-12 11:46:54.118+00		PostmanRuntime/7.56.0	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
XhrdcIeaK9GThoStv0KIBrk5pojOCvPh	2026-08-19 11:48:14.023+00	rasyCml97KW2HxQFz38tRbLu2Sdjcn0f	2026-08-12 11:48:14.023+00	2026-08-12 11:48:14.023+00		PostmanRuntime/7.56.0	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
CmNiAfxtuEto53YgQjzCsSxFzRjg92PR	2026-08-19 12:14:47.427+00	N2NI7H68NyH8qV29pr3yYUsIsBdYC0Nc	2026-08-12 12:14:47.427+00	2026-08-12 12:14:47.427+00		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
wXy9EF0a0Icq4xxV0n1VgSDYuN2sXGno	2026-08-19 13:35:28.155+00	qNlcrYve41qpC4QdKgKhYsZBaKb0sUWx	2026-08-12 13:35:28.155+00	2026-08-12 13:35:28.155+00		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
UpNYdww72fKcuHYkY3foJpEZkocsZ1mO	2026-08-21 11:20:28.983+00	QsaL7mEKRkhpJBlcszqCXaPREui6qkdU	2026-08-14 11:20:28.983+00	2026-08-14 11:20:28.983+00		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	eeb630cd-7d5c-4c93-98c2-3f88d924ee0f
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: authuser
--

COPY public."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", "operatorId") FROM stdin;
eeb630cd-7d5c-4c93-98c2-3f88d924ee0f	CRIS ADMIN	admcrs@internal.metro	t	\N	2026-08-12 10:49:50.583+00	2026-08-12 10:49:50.583+00	1
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: authuser
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_operatorId_unique; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_operatorId_unique" UNIQUE ("operatorId");


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: authuser
--

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: authuser
--

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: authuser
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: authuser
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gHUilpYPShifVfHg5OmLTWUugdvFhTKpBcZHApuaisCEpddfACD7Sh0OR57yV1a

