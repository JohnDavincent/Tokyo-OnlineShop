--
-- PostgreSQL database dump
--

\restrict bVZ8y8DpGglWofDkCoSWTa6r2E4uNLXx0zTHKbKlUaBwM0HwX8qGSfnV73j0Ahr

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

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
-- Name: product_service; Type: SCHEMA; Schema: -; Owner: admin
--

CREATE SCHEMA product_service;


ALTER SCHEMA product_service OWNER TO admin;

--
-- Name: transaction_service; Type: SCHEMA; Schema: -; Owner: admin
--

CREATE SCHEMA transaction_service;


ALTER SCHEMA transaction_service OWNER TO admin;

--
-- Name: user_service; Type: SCHEMA; Schema: -; Owner: admin
--

CREATE SCHEMA user_service;


ALTER SCHEMA user_service OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.brands (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    last_modified_by character varying(255),
    updated_at timestamp(6) without time zone,
    brand_name character varying(255),
    slug character varying(255) NOT NULL,
    status character varying(255),
    CONSTRAINT brands_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OUT_OF_STOCK'::character varying, 'REMOVED'::character varying, 'IS_NOT_AVAILABLE'::character varying])::text[])))
);


ALTER TABLE product_service.brands OWNER TO admin;

--
-- Name: categories; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.categories (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    last_modified_by character varying(255),
    updated_at timestamp(6) without time zone,
    category_name character varying(255),
    parent_category uuid,
    slug character varying(255) NOT NULL,
    status character varying(255),
    CONSTRAINT categories_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OUT_OF_STOCK'::character varying, 'REMOVED'::character varying, 'IS_NOT_AVAILABLE'::character varying])::text[])))
);


ALTER TABLE product_service.categories OWNER TO admin;

--
-- Name: product_images; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.product_images (
    id uuid NOT NULL,
    alt_text character varying(255),
    is_primary boolean,
    url character varying(255),
    products_id uuid,
    slug character varying(255)
);


ALTER TABLE product_service.product_images OWNER TO admin;

--
-- Name: product_units; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.product_units (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    last_modified_by character varying(255),
    updated_at timestamp(6) without time zone,
    convert_quantity integer,
    status character varying(255),
    product_unit character varying(255),
    product_base_unit_price numeric(38,2),
    product_sell_unit_price numeric(38,2),
    products uuid,
    quantity_unit integer,
    CONSTRAINT product_units_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OUT_OF_STOCK'::character varying, 'REMOVED'::character varying, 'IS_NOT_AVAILABLE'::character varying])::text[])))
);


ALTER TABLE product_service.product_units OWNER TO admin;

--
-- Name: products; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.products (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    last_modified_by character varying(255),
    updated_at timestamp(6) without time zone,
    base_unit character varying(255),
    base_wight_unit integer,
    product_name character varying(255),
    sku character varying(255),
    product_status character varying(255),
    stock integer,
    brands_id uuid,
    categories_id uuid,
    supplier_id uuid,
    description character varying(255),
    is_featured_page boolean,
    CONSTRAINT products_product_status_check CHECK (((product_status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OUT_OF_STOCK'::character varying, 'REMOVED'::character varying, 'IS_NOT_AVAILABLE'::character varying])::text[])))
);


ALTER TABLE product_service.products OWNER TO admin;

--
-- Name: supplier; Type: TABLE; Schema: product_service; Owner: admin
--

CREATE TABLE product_service.supplier (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    last_modified_by character varying(255),
    updated_at timestamp(6) without time zone,
    supplier_code character varying(255),
    supplier_name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(255),
    phone_number character varying(255),
    CONSTRAINT supplier_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OUT_OF_STOCK'::character varying, 'REMOVED'::character varying, 'IS_NOT_AVAILABLE'::character varying])::text[])))
);


ALTER TABLE product_service.supplier OWNER TO admin;

--
-- Name: addresses; Type: TABLE; Schema: user_service; Owner: admin
--

CREATE TABLE user_service.addresses (
    id uuid NOT NULL,
    address character varying(255),
    city character varying(255),
    is_default_shipping boolean,
    label character varying(255),
    notes character varying(255),
    postal_code character varying(255),
    province character varying(255),
    recipient_name character varying(255),
    recipient_phone_number character varying(255),
    user_entities_id uuid
);


ALTER TABLE user_service.addresses OWNER TO admin;

--
-- Name: admin_account; Type: TABLE; Schema: user_service; Owner: admin
--

CREATE TABLE user_service.admin_account (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(255) NOT NULL,
    last_login timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    status character varying(255),
    update_at timestamp(6) without time zone,
    CONSTRAINT admin_account_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'VERIFIED'::character varying, 'SUSPENDED'::character varying, 'LOCKED'::character varying])::text[])))
);


ALTER TABLE user_service.admin_account OWNER TO admin;

--
-- Name: otp_verification; Type: TABLE; Schema: user_service; Owner: admin
--

CREATE TABLE user_service.otp_verification (
    id uuid NOT NULL,
    attempt_count integer,
    code_hash character varying(255),
    created_at timestamp(6) without time zone,
    expired_at timestamp(6) without time zone,
    phone_number character varying(255),
    purpose character varying(255),
    resend_count integer,
    used_at timestamp(6) without time zone,
    CONSTRAINT otp_verification_purpose_check CHECK (((purpose)::text = ANY ((ARRAY['REGISTER'::character varying, 'LOGIN'::character varying, 'RESET_PIN'::character varying, 'CHANGE_PHONE'::character varying])::text[])))
);


ALTER TABLE user_service.otp_verification OWNER TO admin;

--
-- Name: refresh_token; Type: TABLE; Schema: user_service; Owner: admin
--

CREATE TABLE user_service.refresh_token (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    expired_at timestamp(6) without time zone,
    revoke boolean,
    revoke_at timestamp(6) without time zone,
    token_hash character varying(255),
    user_entities_id uuid
);


ALTER TABLE user_service.refresh_token OWNER TO admin;

--
-- Name: user_entities; Type: TABLE; Schema: user_service; Owner: admin
--

CREATE TABLE user_service.user_entities (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    last_login_at timestamp(6) without time zone,
    membership character varying(255),
    name character varying(255),
    password character varying(255),
    phone_number character varying(255),
    phone_verified_at timestamp(6) without time zone,
    pin_hash character varying(255),
    status character varying(255),
    updated_at timestamp(6) without time zone,
    CONSTRAINT user_entities_membership_check CHECK (((membership)::text = ANY ((ARRAY['REGULAR'::character varying, 'VIP'::character varying])::text[]))),
    CONSTRAINT user_entities_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'VERIFIED'::character varying, 'SUSPENDED'::character varying, 'LOCKED'::character varying])::text[])))
);


ALTER TABLE user_service.user_entities OWNER TO admin;

--
-- Data for Name: brands; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.brands (id, created_at, created_by, last_modified_by, updated_at, brand_name, slug, status) FROM stdin;
53cc6b63-9152-437c-a394-68f1c74596dd	2026-04-14 13:53:59.584298	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-14 13:53:59.584298	Chocolatos	chocolatos	AVAILABLE
22a4f9a8-2990-475d-bd0a-993eaed3a94e	2026-04-21 15:14:57.476514	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:14:57.476514	Hokkaido	hokkaido	AVAILABLE
f6cdc125-0d6c-40d3-af43-260dfade73d2	2026-04-21 15:29:27.195972	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:29:27.195972	Indomie	indomie	AVAILABLE
779addf8-8a2d-4def-b2ca-d666a7684884	2026-04-21 16:09:51.934921	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:09:51.934921	Marjan	marjan	AVAILABLE
d6de3a6a-5f6e-4bb1-8a74-baaa64657768	2026-04-21 16:21:27.419994	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:21:27.419994	Ahah	ahah	AVAILABLE
34ac9ba4-15e9-413b-b9a2-9f99664900cc	2026-04-21 16:31:35.342411	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:31:35.342411	Jiva	jiva	AVAILABLE
e8e95122-6805-47e5-a1d0-9f797c18a8a9	2026-04-21 16:36:33.66126	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:36:33.66126	Oreo	oreo	AVAILABLE
b6774124-06f0-45ea-ada0-e14db944f8c6	2026-04-21 16:41:14.993989	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:41:14.993989	Kapal Api	kapal api	AVAILABLE
de1ec5f1-9ce4-403b-baf9-8a85cbb31848	2026-04-21 16:41:23.568993	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:41:23.568993	SilverQueen	silverqueen	AVAILABLE
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.categories (id, created_at, created_by, last_modified_by, updated_at, category_name, parent_category, slug, status) FROM stdin;
b03680f6-77cd-4fac-8ca8-eee1edc76784	2026-04-14 08:53:49.025039			2026-04-14 08:53:49.025039	Makanan	\N	makanan	AVAILABLE
e01ca164-b116-4b5d-be52-c989aa7637ac	2026-04-14 10:05:08.512825			2026-04-14 10:05:08.512825	Kerupuk	b03680f6-77cd-4fac-8ca8-eee1edc76784	kerupuk	AVAILABLE
eca907f1-9fe8-4c3d-bc52-d6ea502f5024	\N	\N	\N	\N	Chips	b03680f6-77cd-4fac-8ca8-eee1edc76784	chips	AVAILABLE
9e46d6d2-55d3-46e1-a0ac-61b6f86547b8	\N	\N	\N	\N	Permen	b03680f6-77cd-4fac-8ca8-eee1edc76784	permen	AVAILABLE
2e9625de-fdb3-46a1-b9de-7ee3eeb2aa1b	2026-04-14 10:39:26.975947	\N	\N	2026-04-14 10:39:26.975947	Cokelat	b03680f6-77cd-4fac-8ca8-eee1edc76784	cokelat	AVAILABLE
9c7aead8-b564-412b-bc04-92e50a97c15c	2026-04-14 10:45:11.763851	\N	\N	2026-04-14 10:45:11.763851	Es krim	b03680f6-77cd-4fac-8ca8-eee1edc76784	es krim	AVAILABLE
5c649510-1be1-41bb-a468-7de2da36c1d5	2026-04-14 10:57:34.215029	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-14 10:57:34.215029	Mi Instant	b03680f6-77cd-4fac-8ca8-eee1edc76784	mi instant	AVAILABLE
273347ad-49f3-4fde-b487-cbf03ffa4b9b	2026-04-21 15:05:47.149955	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:05:47.149955	Milk	\N	milk	AVAILABLE
4a184c1f-100c-453a-8f37-1ed305899ca6	2026-04-21 15:06:04.541661	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:06:04.541661	Syrup	\N	syrup	AVAILABLE
f3d15e3f-a587-424a-8b14-b29fd3ed7f5c	2026-04-21 15:06:58.232649	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:06:58.232649	Susu Import	273347ad-49f3-4fde-b487-cbf03ffa4b9b	susu import	AVAILABLE
f06f3d1f-bafb-4fe7-b6dd-19ff6b6a4014	2026-04-21 15:08:14.777308	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:08:14.777308	Fruit Syrup	4a184c1f-100c-453a-8f37-1ed305899ca6	fruit syrup	AVAILABLE
5f16556f-7a3c-403c-83e0-c6f269e98672	2026-04-21 16:22:21.400282	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:22:21.400282	Snack	b03680f6-77cd-4fac-8ca8-eee1edc76784	snack	AVAILABLE
fb622035-fc6a-4918-8acf-8862e8e897ff	2026-04-21 16:30:27.347716	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:30:27.347716	Kebutuhan Pangan	\N	kebutuhan pangan	AVAILABLE
df894d4e-44a3-4310-8f15-0996d280bec5	2026-04-21 16:30:43.760972	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:30:43.760972	Beras	fb622035-fc6a-4918-8acf-8862e8e897ff	beras	AVAILABLE
6b617087-42cb-4d97-8b15-8569c7075d44	2026-04-21 16:59:34.815748	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:59:34.815748	Minuman	\N	minuman	AVAILABLE
784cbd7a-2ef1-449a-b648-f9fc2b24d0b3	2026-04-21 17:00:19.106129	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 17:00:19.106129	Kopi	6b617087-42cb-4d97-8b15-8569c7075d44	kopi	AVAILABLE
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.product_images (id, alt_text, is_primary, url, products_id, slug) FROM stdin;
48b9ffdb-b98e-40f9-93f5-00b581f721ff	Premium Arabica Coffee Beans - Main Image	t	https://example.com/images/coffee-primary.jpg	23b7eab1-661e-4666-8b24-4c13024b549f	\N
360b835c-32ea-48bc-a3e7-953d6b4f5ded	Coffee Packaging	f	https://example.com/images/coffee-packaging.jpg	23b7eab1-661e-4666-8b24-4c13024b549f	\N
668335c9-a599-4f66-9b65-c6fdb14d0f1e	picture of hokaido milk	t	/images/products/hokaido-milk-c693c500.jpg	4dd59900-48ee-48f5-934e-0128b3d74110	hokkaido-premium-milk
3c463336-39b1-48f7-acb3-d4274994cfe8	picture of Sirup marjan Melon	t	/images/products/sirup-marjan-melon-73650820.jpg	756e553b-092b-478a-aa15-2f8d1c215d37	sirup-marjan-melon
b5e2de36-b336-4609-94e4-a76c16b622f6	picture of Mie Goreng	t	/images/products/indomie-goreng-28901028.png	a9bf210c-77c8-4f54-a851-c8bccc490fb2	indomie-goreng
3cbe0a32-7730-4f45-9e83-2674be9546ac	picture of snack biscuit ahah	t	/images/products/biskuit-ahah-63961c8e.jpg	d2121073-220b-46ae-a745-d1476d365488	biskuit-ahah
455257b3-e2e9-49d3-945f-eddc4758ba46	picture of rice-jiva	t	/images/products/beras-jiva-7bf12e12.jpg	06ac4019-2d37-4ba4-bc88-7dc580829ec1	beras-jiva
2ace1a7e-d0f0-4569-bf15-ceeadc11e6f7	wafer-oreo	t	/images/products/wafer-oreo-d4df2dcd.jpg	8511cf4e-af83-4a33-86c6-f6f7d1bf703e	wafer-oreo
76e0374c-af8f-4df6-b552-5e1111ec9019	coklat-silverqueen	t	/images/products/coklat-silverqueen-abd07950.jpg	8394591c-eda3-4fde-a322-c599ee87756d	coklat-silverqueen
104ce745-263b-4aa0-a9cb-d76b9c7b07a6	kopi-kapal-api	t	/images/products/kopi-kapal-api-f78a0e8c.jpg	c3523023-f23a-4714-9bde-f1327e3d3a7d	kopi-kapal-api
\.


--
-- Data for Name: product_units; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.product_units (id, created_at, created_by, last_modified_by, updated_at, convert_quantity, status, product_unit, product_base_unit_price, product_sell_unit_price, products, quantity_unit) FROM stdin;
96763c86-a1a1-4b14-9901-50ec14aef803	2026-04-16 10:19:22.222453	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-16 10:19:22.222453	12	AVAILABLE	box	15000.00	20000.00	99c32cb2-3336-4d06-a35f-adbaf1914609	\N
a87bb85a-e0d3-4fb0-9aa5-65c79857ca10	2026-04-17 10:59:49.557589	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-17 10:59:49.557589	10	AVAILABLE	pack	45000.00	60000.00	23b7eab1-661e-4666-8b24-4c13024b549f	\N
03042fff-2412-48ea-bc6d-ac7597e72474	2026-04-17 10:59:49.589321	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-17 10:59:49.589321	50	AVAILABLE	box	200000.00	260000.00	23b7eab1-661e-4666-8b24-4c13024b549f	\N
36d1a8fb-2856-4448-a897-24cf69814f5a	2026-04-21 15:17:42.364325	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:17:42.364325	1	AVAILABLE	pcs	\N	35000.00	4dd59900-48ee-48f5-934e-0128b3d74110	\N
5d7cf839-178b-4bed-8924-070b9538e4ca	2026-04-21 15:17:42.400625	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:17:42.400625	20	AVAILABLE	boxes	\N	650000.00	4dd59900-48ee-48f5-934e-0128b3d74110	\N
d5628cdd-ece5-496c-a991-999dc594b13f	2026-04-21 16:12:53.907866	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:12:53.907866	1	AVAILABLE	pcs	\N	23000.00	756e553b-092b-478a-aa15-2f8d1c215d37	\N
2fe0df99-2836-4686-b20f-a63121b76779	2026-04-21 16:12:53.915194	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:12:53.915194	20	AVAILABLE	boxes	\N	430000.00	756e553b-092b-478a-aa15-2f8d1c215d37	\N
05221250-0a19-4f41-b8f3-4bb9af1f8ac8	2026-04-21 16:18:30.3617	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:18:30.3617	1	AVAILABLE	pcs	2000.00	3500.00	a9bf210c-77c8-4f54-a851-c8bccc490fb2	\N
ff90959a-870c-4e02-9426-ab7c4bbaeaac	2026-04-21 16:18:30.367132	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:18:30.367132	30	AVAILABLE	boxes	120000.00	150000.00	a9bf210c-77c8-4f54-a851-c8bccc490fb2	\N
74e3ad09-224d-4cf3-bf45-cedb954d3417	2026-04-21 16:25:13.453166	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:25:13.453166	1	AVAILABLE	pcs	4000.00	7000.00	d2121073-220b-46ae-a745-d1476d365488	\N
437302f3-fafd-47fc-8ff9-e333bd3aeae8	2026-04-21 16:25:13.457515	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:25:13.457515	20	AVAILABLE	pack	50000.00	60000.00	d2121073-220b-46ae-a745-d1476d365488	\N
7baca6b2-285a-4ace-b496-eb6f3e0e5037	2026-04-21 16:25:13.497028	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:25:13.497028	20	AVAILABLE	boxes	200000.00	270000.00	d2121073-220b-46ae-a745-d1476d365488	\N
0997f149-2d66-428a-93b7-5d37eb27dd84	2026-04-21 16:35:04.147942	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:35:04.147942	1	AVAILABLE	boxs	50000.00	80000.00	06ac4019-2d37-4ba4-bc88-7dc580829ec1	\N
4c4d96b2-42bd-4886-8a9d-5555c4f4d65f	2026-04-21 16:38:35.978378	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:38:35.978378	1	AVAILABLE	pcs	7000.00	10000.00	8511cf4e-af83-4a33-86c6-f6f7d1bf703e	\N
a1ea636c-cf9a-4c04-9f34-90fd7910fad8	2026-04-21 16:38:35.986553	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:38:35.986553	20	AVAILABLE	boxs	100000.00	135000.00	8511cf4e-af83-4a33-86c6-f6f7d1bf703e	\N
ef27a51a-aa1a-4dba-9bfd-9624ee343d72	2026-04-21 16:45:27.834682	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:45:27.834682	1	AVAILABLE	pcs	10000.00	17000.00	8394591c-eda3-4fde-a322-c599ee87756d	\N
e965c5dc-868a-4ae1-9150-7f1fa8af8bc6	2026-04-21 16:45:27.842301	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:45:27.842301	50	AVAILABLE	boxs	450000.00	500000.00	8394591c-eda3-4fde-a322-c599ee87756d	\N
93101db5-cac8-44d0-aef7-97cbdb77158b	2026-04-21 17:01:02.111203	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 17:01:02.111203	1	AVAILABLE	pcs	10000.00	17000.00	c3523023-f23a-4714-9bde-f1327e3d3a7d	\N
42a45d58-f878-4af1-bed9-a896a8e0dbfc	2026-04-21 17:01:02.120769	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 17:01:02.120769	50	AVAILABLE	boxs	450000.00	500000.00	c3523023-f23a-4714-9bde-f1327e3d3a7d	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.products (id, created_at, created_by, last_modified_by, updated_at, base_unit, base_wight_unit, product_name, sku, product_status, stock, brands_id, categories_id, supplier_id, description, is_featured_page) FROM stdin;
99c32cb2-3336-4d06-a35f-adbaf1914609	2026-04-16 10:19:22.09473	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-16 10:19:22.152885	Pcs	250	Premium Chocolate Cookies	CHK-001	AVAILABLE	120	53cc6b63-9152-437c-a394-68f1c74596dd	2e9625de-fdb3-46a1-b9de-7ee3eeb2aa1b	\N	Delicious premium chocolate cookies packed in a box of 12 pieces.	\N
23b7eab1-661e-4666-8b24-4c13024b549f	2026-04-17 10:59:49.349793	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-17 10:59:49.401349	Pcs	1000	Premium Arabica Coffee Beans	COF-ARAB-001	AVAILABLE	150	53cc6b63-9152-437c-a394-68f1c74596dd	2e9625de-fdb3-46a1-b9de-7ee3eeb2aa1b	\N	High-quality Arabica coffee beans with rich aroma and smooth taste.	\N
4dd59900-48ee-48f5-934e-0128b3d74110	2026-04-21 15:17:42.179046	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 15:17:42.278	Pcs	1000	Hokkaido Premium Milk	MILK-001	AVAILABLE	15	22a4f9a8-2990-475d-bd0a-993eaed3a94e	f3d15e3f-a587-424a-8b14-b29fd3ed7f5c	\N	Fresh premium milk	t
756e553b-092b-478a-aa15-2f8d1c215d37	2026-04-21 16:12:53.854522	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:12:53.874509	Pcs	350	Sirup Marjan Melon	SMM-001	AVAILABLE	30	779addf8-8a2d-4def-b2ca-d666a7684884	f06f3d1f-bafb-4fe7-b6dd-19ff6b6a4014	\N	Populer Rahmadan Drinks	t
a9bf210c-77c8-4f54-a851-c8bccc490fb2	2026-04-21 16:18:30.279179	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:18:30.340175	Pcs	200	Indomie Goreng	IG-001	AVAILABLE	100	f6cdc125-0d6c-40d3-af43-260dfade73d2	5c649510-1be1-41bb-a468-7de2da36c1d5	\N	Populer Indonesian instant noodle	t
d2121073-220b-46ae-a745-d1476d365488	2026-04-21 16:25:13.429093	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:25:13.440183	Pcs	30	Biskuit Ahah	SBA-001	AVAILABLE	50	f6cdc125-0d6c-40d3-af43-260dfade73d2	5f16556f-7a3c-403c-83e0-c6f269e98672	\N	Cheese Snack from indonesia	t
06ac4019-2d37-4ba4-bc88-7dc580829ec1	2026-04-21 16:35:04.101892	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:35:04.118495	Pcs	5000	Beras Jiva	BJ-001	AVAILABLE	10	34ac9ba4-15e9-413b-b9a2-9f99664900cc	df894d4e-44a3-4310-8f15-0996d280bec5	\N	Rice From indonesia	t
8511cf4e-af83-4a33-86c6-f6f7d1bf703e	2026-04-21 16:38:35.926471	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:38:35.953789	Pcs	300	Wafer Oreo	WO-001	AVAILABLE	30	e8e95122-6805-47e5-a1d0-9f797c18a8a9	5f16556f-7a3c-403c-83e0-c6f269e98672	\N	Popular Wafer with vanila cream	t
8394591c-eda3-4fde-a322-c599ee87756d	2026-04-21 16:45:27.772734	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 16:45:27.801318	Pcs	200	Coklat Silverqueen	CS-001	AVAILABLE	100	de1ec5f1-9ce4-403b-baf9-8a85cbb31848	2e9625de-fdb3-46a1-b9de-7ee3eeb2aa1b	\N	Popular Chocolate bar in Indonesia	t
c3523023-f23a-4714-9bde-f1327e3d3a7d	2026-04-21 17:01:02.078765	admin1@tokyo-go.com	admin1@tokyo-go.com	2026-04-21 17:01:02.095338	Pcs	50	Kopi Kapal Api	KKA-001	AVAILABLE	100	b6774124-06f0-45ea-ada0-e14db944f8c6	784cbd7a-2ef1-449a-b648-f9fc2b24d0b3	\N	Popular  Coffee in Indonesia	t
\.


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: product_service; Owner: admin
--

COPY product_service.supplier (id, created_at, created_by, last_modified_by, updated_at, supplier_code, supplier_name, slug, status, phone_number) FROM stdin;
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: user_service; Owner: admin
--

COPY user_service.addresses (id, address, city, is_default_shipping, label, notes, postal_code, province, recipient_name, recipient_phone_number, user_entities_id) FROM stdin;
\.


--
-- Data for Name: admin_account; Type: TABLE DATA; Schema: user_service; Owner: admin
--

COPY user_service.admin_account (id, created_at, email, last_login, name, password_hash, status, update_at) FROM stdin;
37f53c4e-f447-4043-ba59-4b30fb169812	2026-04-09 16:02:32.724463	admin1@tokyo-go.com	\N	Main_Admin	$2y$10$ETXqSrc0mheNyGJsILls7ufmyKxayy34k1Ty2wT5cKDBfS48PJ8Vq	VERIFIED	2026-04-09 16:02:32.724463
\.


--
-- Data for Name: otp_verification; Type: TABLE DATA; Schema: user_service; Owner: admin
--

COPY user_service.otp_verification (id, attempt_count, code_hash, created_at, expired_at, phone_number, purpose, resend_count, used_at) FROM stdin;
0308f5ee-287e-4ced-9e5e-8fa2a6c0d45f	0	$2a$10$D/orj/8tZgdWxcB70A.20uXfWXWG4D5uGJi1Dk9ES2tKMBhIGkf1u	2026-04-09 09:16:44.776445	2026-04-09 09:19:44.776481	081276296731	REGISTER	0	2026-04-09 09:18:23.711299
a60a7035-5cdd-4678-9da1-548bf54a8759	0	$2a$10$.inYbWAqEDkxh6hs4F8mfO3dFFs3lMBF9aPX9V3yRKkD/QHAFLGje	2026-04-10 10:07:59.838109	2026-04-10 10:10:59.838137	081276296731	REGISTER	0	\N
9dd482a6-e9f2-40c2-b6b6-4da9a2f3b540	0	$2a$10$wWZhJam.3bOAbIa.x1qcIuO62iHB7lcrEk8z7Nwz4BTrxxmmseipa	2026-04-10 10:11:01.672898	2026-04-10 10:14:01.672955	087778948281	REGISTER	0	\N
769ff41d-9d8d-46d0-a8e8-cfed379a670f	0	$2a$10$dFSzHfADE.H3mbGHntq8l.ZCWmVEcec1448YwM9QmnPBUbpwTKy3q	2026-04-10 10:17:24.575667	2026-04-10 10:20:24.576006	0877711234	REGISTER	0	\N
b5a67149-e57e-4ab5-87da-590c6720e639	0	$2a$10$Z7sI1gS3deRgOJSbwJsm3ONPzkvjbWpa0sunT3oAZnbJDdstAYFoO	2026-04-10 10:20:32.265395	2026-04-10 10:23:32.265414	0877711222	REGISTER	0	\N
32014d97-524e-446e-8d62-850be58776c6	0	$2a$10$bVvGHJdu.3FpGfwAAwivteGEmQjonrHFCJV/J0nTg1DaZUlMaFYe2	2026-04-10 10:28:07.621567	2026-04-10 10:31:07.622359	08777113453	REGISTER	0	2026-04-10 10:28:18.543723
d2a1eb05-ab3c-484e-aa9e-879142a0075a	0	$2a$10$9gxtNRMt17a10aNWIwPeKezOV8nMTL144W7id4tYkRWpnmHnpHFuS	2026-04-10 10:31:46.895789	2026-04-10 10:34:46.896113	081233323	REGISTER	0	2026-04-10 10:31:55.017562
4be36fa2-c6b0-4a4f-a6b2-c7d6b727d3f1	0	$2a$10$BUY8CwR9zdsFXtvg1zNss.ssz.83Bfv374Y1Hwx0B2f24HhFpBIiq	2026-04-10 17:41:36.620818	2026-04-10 17:44:36.620843	0812333453	REGISTER	0	2026-04-10 17:41:51.401188
8d0bcc2f-23f7-42bf-b443-2065d0355c74	0	$2a$10$Jj0mbMEXgdjaWt3nWWc0D.PvtO0MQz2QF6TiaRQ85RJCyR1Zl2mWu	2026-04-10 22:36:56.752399	2026-04-10 22:39:56.756825	23321219921	REGISTER	0	\N
8dfab208-4e6e-4dfb-b0ae-8fdce10aea8e	0	$2a$10$g7XQMULNuzj4bCmYvGkyBOsUQN6L9XRFQzEAhuqLp3ONeqXissr12	2026-04-14 21:36:33.875981	2026-04-14 21:39:33.876258	12344431	REGISTER	0	2026-04-14 21:36:43.64112
7f470f49-f7a2-4392-ac83-6326be85bd32	0	$2a$10$vAE905tW4HgZlaudaXDGdezP9qQSC5.4X/srjkG0Y24qq7CH1mzZy	2026-04-14 21:38:42.951396	2026-04-14 21:41:42.95146	198378383	REGISTER	0	2026-04-14 21:38:53.943865
2c76a8f7-0940-491d-a977-177d6a656498	0	$2a$10$eJOLPY2OUeh10Enhf0E89.dWwtpryQem7v7GgeErMrFBS2z8.lxiO	2026-04-14 21:41:19.675652	2026-04-14 21:44:19.680641	2123213333	REGISTER	0	2026-04-14 21:41:35.679241
\.


--
-- Data for Name: refresh_token; Type: TABLE DATA; Schema: user_service; Owner: admin
--

COPY user_service.refresh_token (id, created_at, expired_at, revoke, revoke_at, token_hash, user_entities_id) FROM stdin;
\.


--
-- Data for Name: user_entities; Type: TABLE DATA; Schema: user_service; Owner: admin
--

COPY user_service.user_entities (id, created_at, last_login_at, membership, name, password, phone_number, phone_verified_at, pin_hash, status, updated_at) FROM stdin;
9089d266-fde7-4f16-bc48-7ced9a46e2cd	2026-04-09 09:23:20.219531	\N	REGULAR	JohnDavincent	\N	081276296731	2026-04-09 09:23:20.372332	$2a$10$OgN1doR6bn.3kk111GoYpurvQ0qkwWkdmFhjFh5vhY.PbKfkbrvL2	VERIFIED	\N
cc1201c8-e4ca-4e1f-99d1-692940eb25af	2026-04-10 10:29:04.647019	\N	REGULAR	Erick Van Ren	\N	08777113453	2026-04-10 10:29:04.744807	$2a$10$Dcsq47aMFd8PuoCmrIDiHuARDQSqaWni26dKsBrwH12jsvMx/uQX.	VERIFIED	\N
94da8c83-567b-4b30-bf92-89ce4ad0c81c	2026-04-10 10:32:04.851511	\N	REGULAR	Cent Goh	\N	081233323	2026-04-10 10:32:04.982219	$2a$10$f8JkCiJcD8oR3.u8Gse9vOR/K8.0FZDYD7teH5RonEIYwIZVU1N9y	VERIFIED	\N
ca38eb8f-9da5-400c-9868-983586aa19f8	2026-04-10 17:42:04.33454	\N	REGULAR	Xendwr	\N	0812333453	2026-04-10 17:42:04.483859	$2a$10$8empBxXcHrD/5UnBEahfn.hOtRQ84F1eMgqCBORUc4fQaSoBPaAUS	VERIFIED	\N
2909c49f-af31-4a81-951d-22e1cd2a20ed	2026-04-14 21:39:15.18387	\N	REGULAR	Donk wekr	\N	198378383	2026-04-14 21:39:15.344676	$2a$10$Fb7j.n/qthS6V9TTA8RaC.B4Uku14bxT3H84qGiHtquQQ3Omiezli	VERIFIED	\N
bb38b5ae-e76f-4039-9af3-f8ab86b15a60	2026-04-14 21:41:58.987748	\N	REGULAR	JOhn Davin	\N	2123213333	2026-04-14 21:41:59.177107	$2a$10$kdS/A7ZdbNVJJ7VvmaRDn.mDhavEB4ZmmJ4mV/iowxmaexX2vKIsG	VERIFIED	\N
\.


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_units product_units_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.product_units
    ADD CONSTRAINT product_units_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: supplier ukdmfv36elpj0kp8jyx90bgopll; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.supplier
    ADD CONSTRAINT ukdmfv36elpj0kp8jyx90bgopll UNIQUE (supplier_code);


--
-- Name: supplier ukhp8at2k0t1fspl9u1j8gmdadt; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.supplier
    ADD CONSTRAINT ukhp8at2k0t1fspl9u1j8gmdadt UNIQUE (slug);


--
-- Name: supplier ukjjyslg6sq9s66hwyqd5bymtf8; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.supplier
    ADD CONSTRAINT ukjjyslg6sq9s66hwyqd5bymtf8 UNIQUE (supplier_name);


--
-- Name: categories ukoul14ho7bctbefv8jywp5v3i2; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.categories
    ADD CONSTRAINT ukoul14ho7bctbefv8jywp5v3i2 UNIQUE (slug);


--
-- Name: brands ukpnhnc9urm6fro7oseu9vka70q; Type: CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.brands
    ADD CONSTRAINT ukpnhnc9urm6fro7oseu9vka70q UNIQUE (slug);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: admin_account admin_account_pkey; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.admin_account
    ADD CONSTRAINT admin_account_pkey PRIMARY KEY (id);


--
-- Name: otp_verification otp_verification_pkey; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.otp_verification
    ADD CONSTRAINT otp_verification_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- Name: admin_account uk1bccthl9m3jrwpbwtc3iihk4i; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.admin_account
    ADD CONSTRAINT uk1bccthl9m3jrwpbwtc3iihk4i UNIQUE (email);


--
-- Name: user_entities uk76r1cqi4hju1wfe8radvws8yq; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.user_entities
    ADD CONSTRAINT uk76r1cqi4hju1wfe8radvws8yq UNIQUE (phone_number);


--
-- Name: user_entities user_entities_pkey; Type: CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.user_entities
    ADD CONSTRAINT user_entities_pkey PRIMARY KEY (id);


--
-- Name: product_images fk45bhjnm956d1f8x5mcivr4dq; Type: FK CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.product_images
    ADD CONSTRAINT fk45bhjnm956d1f8x5mcivr4dq FOREIGN KEY (products_id) REFERENCES product_service.products(id);


--
-- Name: products fk6yqecn232k0s30yt8wxrh4n9h; Type: FK CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.products
    ADD CONSTRAINT fk6yqecn232k0s30yt8wxrh4n9h FOREIGN KEY (brands_id) REFERENCES product_service.brands(id);


--
-- Name: product_units fkb3b62wm36il942xoc89wjl48j; Type: FK CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.product_units
    ADD CONSTRAINT fkb3b62wm36il942xoc89wjl48j FOREIGN KEY (products) REFERENCES product_service.products(id);


--
-- Name: products fkgro094vh0dp0tly1225wk8u37; Type: FK CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.products
    ADD CONSTRAINT fkgro094vh0dp0tly1225wk8u37 FOREIGN KEY (categories_id) REFERENCES product_service.categories(id);


--
-- Name: products fkkxyc9lj0tpsrm6jpmf32jbub2; Type: FK CONSTRAINT; Schema: product_service; Owner: admin
--

ALTER TABLE ONLY product_service.products
    ADD CONSTRAINT fkkxyc9lj0tpsrm6jpmf32jbub2 FOREIGN KEY (supplier_id) REFERENCES product_service.supplier(id);


--
-- Name: addresses fk91cntedp0b0w8pe5uq07oahbx; Type: FK CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.addresses
    ADD CONSTRAINT fk91cntedp0b0w8pe5uq07oahbx FOREIGN KEY (user_entities_id) REFERENCES user_service.user_entities(id);


--
-- Name: refresh_token fkjb8yw2lakykj3nswnbem0306h; Type: FK CONSTRAINT; Schema: user_service; Owner: admin
--

ALTER TABLE ONLY user_service.refresh_token
    ADD CONSTRAINT fkjb8yw2lakykj3nswnbem0306h FOREIGN KEY (user_entities_id) REFERENCES user_service.user_entities(id);


--
-- PostgreSQL database dump complete
--

\unrestrict bVZ8y8DpGglWofDkCoSWTa6r2E4uNLXx0zTHKbKlUaBwM0HwX8qGSfnV73j0Ahr

