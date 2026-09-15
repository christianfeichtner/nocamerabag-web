---
title: "Privacy & Legal Policy"
draft: false
layout: "simple-page"
---

We have prepared this Privacy Policy in accordance with the requirements of the European General Data Protection Regulation (EU) 2016/679 (GDPR / DSGVO), the Austrian Data Protection Act (*Datenschutzgesetz* – DSG), and § 165 of the Austrian Telecommunications Act (*Telekommunikationsgesetz* – TKG 2021) to inform you transparently about what personal data is processed, for what purposes, on what legal bases, and what rights you have as a visitor to [nocamerabag.com](https://nocamerabag.com/) ("this website" or "this site").

We strive to explain complex technical and privacy concepts as clearly, concisely, and transparently as possible.

---

## 1. Data Controller

The controller responsible for data processing on this website within the meaning of Art. 4 No. 7 GDPR is:

**Christian Feichtner**  
Vienna, Austria  
Email: [hello@nocamerabag.com](mailto:hello@nocamerabag.com)  
Website: [nocamerabag.com](https://nocamerabag.com/)

For additional contact details and legal disclosures, please see our [Imprint & Legal Disclosure](/imprint/).

---

## 2. Serverless Hosting, CDN & Edge Security (Cloudflare Pages)

### Provider & Purpose
This website is hosted serverlessly and delivered globally via **Cloudflare Pages** and the global edge network operated by:

**Cloudflare, Inc.**  
101 Townsend St., San Francisco, CA 94107, USA

Cloudflare provides our serverless static hosting, global Content Delivery Network (CDN), Web Application Firewall (WAF), Distributed Denial of Service (DDoS) mitigation, and automated Bot Management. When you request a page or asset on this website, your request is served by the Cloudflare edge server geographically closest to you to ensure high availability, fast loading speeds, and resilient infrastructure protection.

### Processed Data (Server Log Files)
For technical routing, security analysis, and threat detection, Cloudflare automatically processes connection data in server log files. This data includes:

- IP address of the accessing device
- Date and time of the server request
- Uniform Resource Locator (URL) and file path requested
- HTTP response status code and data volume transferred
- Referrer URL (the previous webpage from which you navigated to our site)
- Browser user-agent string (operating system, browser type, and browser version)

Cloudflare processes this data to maintain system stability, optimize network routes, detect abusive or malicious traffic (such as automated brute force attacks or DDoS floods), and enforce firewall rules. Log files are held for short retention windows (typically under 24 hours to a maximum of 7 days for security logs, unless extended retention is required for legal investigations).

### Legal Basis
The processing of server log data is based on **Art. 6(1)(f) GDPR** (*legitimate interests*). Our legitimate interest lies in the secure, performant, fault-tolerant, and reliable operation of our website infrastructure and defense against cyberattacks.

### International Data Transfers & Guarantees
Cloudflare processes data globally, including in data centers located in the United States. To ensure adequate data protection safeguards:
- We have concluded a standard Data Processing Addendum (DPA) with Cloudflare.
- Cloudflare, Inc. is certified under the **EU-U.S. Data Privacy Framework (DPF)** as recognized by the European Commission's adequacy decision of July 10, 2023.

### Official Documentation & Links
- [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/)
- [Cloudflare Customer Data Processing Addendum (DPA)](https://www.cloudflare.com/cloudflare-customer-dpa/)
- [Cloudflare Certification under the EU-U.S. Data Privacy Framework](https://www.dataprivacyframework.gov/participant?id=a2zt0000000GnZKAA0&status=Active)

---

## 3. Consent Management at the Edge (Cloudflare Zaraz)

### Purpose & Architecture
To ensure rigorous compliance with EU privacy standards, we do not load external third-party tracking scripts directly in your browser upon initial page visit. Instead, consent management is executed directly at the edge layer using **Cloudflare Zaraz Consent Management**.

By integrating consent controls directly into Cloudflare's edge proxy:
- Unapproved third-party tracking codes are prevented from loading or executing on your device prior to explicit user choice.
- No unsolicited connections to third-party tracking domains occur during initial page delivery.
- Marketing and analytics tags are only triggered if and when you actively grant consent for the respective category or tool.

### Functionality & Storage
When you visit our site, the Zaraz consent modal gives you granular control over optional marketing and analytics tools. Your consent preference (grant or refusal) is stored locally in your browser (via local storage or a strictly necessary consent cookie) so your decision persists across subsequent page visits.

### Legal Basis
- **Art. 6(1)(c) GDPR**: Compliance with our statutory legal obligation to obtain, record, and document valid user consent under Art. 7(1) GDPR and § 165(3) TKG 2021.
- **Art. 6(1)(f) GDPR**: Legitimate interest in delivering a seamless, compliant, and privacy-preserving consent experience without loading bloated client-side scripts.

### Official Documentation & Links
- [Cloudflare Zaraz Privacy & Security Overview](https://developers.cloudflare.com/zaraz/reference/privacy/)
- [Cloudflare Zaraz Consent Management Documentation](https://developers.cloudflare.com/zaraz/consent-management/)

---

## 4. Server-Side Tag Management & Google Consent Mode v2

### Google Tag Manager (Server-Side Proxy)
- **Zweck & Funktion:** Einsatz zur Verwaltung und Ausspielung von Website-Tags. Der Dienst setzt keine Cookies und verarbeitet keine personenbezogenen Daten zu Werbe- oder Profilierungszwecken, sondern dient ausschließlich als technisches Routing-Framework.
- **EU-Hosting & IP-Masking:** Das Web-Container-Skript wird über unseren serverseitigen Tag Manager (sGTM) auf Servern innerhalb der Europäischen Union ausgeliefert. Hierdurch erfolgt vor Weiterleitung von Anfragen eine Pseudonymisierung bzw. Maskierung der IP-Adresse.
- **Rechtsgrundlage:** Berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO an der sicheren und zentralen Steuerung von Skripten und Consent-Zuständen.
- **Nachgelagerte Dienste:** Tracking- und Marketing-Dienste (GA4, Meta, Pinterest) bleiben standardmäßig blockiert und werden erst nach ausdrücklicher Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) aktiviert.

### Architecture & Privacy Advantages of Server-Side Tagging
We use a **Server-Side Google Tag Manager (sGTM)** container operated via:

**Google Ireland Limited**  
Gordon House, Barrow Street, Dublin 4, Ireland

Unlike traditional client-side tag managers that load dozens of third-party JavaScript libraries directly into your browser, our setup uses **Server-Side Tagging (sGTM Proxy)**:

1. **First-Party Context:** Your browser communicates solely with our own first-party server endpoint rather than establishing direct connections to disparate advertising networks.
2. **Server-Side Sanitization & IP Masking:** Incoming requests are received by our server container first. Before any data payload is forwarded to an downstream tool (such as GA4 or social conversion APIs), IP addresses are truncated, masked, or stripped entirely, and personal query parameters or device identifiers are cleansed.
3. **No Direct Third-Party Device Access:** Third-party vendors cannot inspect client headers, read unauthorized device cookies, or fingerprint your browser directly.

### Google Consent Mode v2 Integration
Our server container strictly implements **Google Consent Mode v2** in conjunction with Cloudflare Zaraz:

- **Default "Denied" State:** By default, all consent categories—specifically `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`—are set to `denied`. In this default state, the server-side container forwards zero advertising or tracking data to external platforms.
- **Dynamic Consent Update:** Only when you actively click to accept specific categories or tools in our consent banner is an updated event (`consent update`) transmitted via the `dataLayer`.
- **Granular Dispatch:** The server-side container dynamically gates each downstream tag, executing only those services that you have explicitly enabled.

### Legal Basis
- **Art. 6(1)(f) GDPR**: Legitimate interest in operating an efficient, security-hardened, first-party technical proxy architecture that shields visitors from third-party client-side script execution.
- **Art. 6(1)(a) GDPR**: Explicit consent for the activation and forwarding of data to specific downstream analytics and advertising tags.

### Official Documentation & Links
- [Google Server-Side Tagging Technical Overview](https://developers.google.com/tag-platform/tag-manager/server-side)
- [Google Ads / Tag Manager Data Processing Terms](https://business.safety.google.com/adsprocessorterms/)
- [Google Consent Mode v2 Architecture & Integration](https://developers.google.com/tag-platform/security/guides/consent)

---

## 5. Granular Server-Side Marketing & Analytics Tools

All optional analytics and conversion measurement tools are executed **server-side via sGTM** and are individually selectable in our consent manager. **No tool is activated in advance.** Processing occurs exclusively after your explicit opt-in under **Art. 6(1)(a) GDPR**.

You can adjust your choices or revoke your consent at any time with future effect via the consent footer link ("Consent Settings" / "Privacy Settings").

### A. Google Analytics 4 (GA4) – Server-Side
- **Provider:** Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
- **Purpose:** Statistical audience measurement, reach analysis, and performance optimization of website content.
- **Privacy Features & IP Masking:** GA4 is implemented via our server-side container. Native IP anonymization is active by default in GA4: your IP address is used solely to derive general geographical metadata (such as country or city) and is discarded before data is written to disk or stored. Raw IP addresses are never saved on Google servers.
- **Legal Basis:** Art. 6(1)(a) GDPR (Consent).
- **Official Documentation & Links:**
  - [Google Analytics 4 Server-Side Tagging](https://support.google.com/analytics/answer/12017362?hl=en)
  - [IP Masking & Anonymization in Google Analytics](https://support.google.com/analytics/answer/2763052?hl=en)
  - [Google Analytics Privacy Safeguards](https://support.google.com/analytics/answer/6004245?hl=en)

### B. Pinterest Tag (Server-to-Server / Conversions API)
- **Provider:** Pinterest Europe Ltd., Palmerston House, 2nd Floor, Fenian Street, Dublin 2, Ireland.
- **Purpose:** Measurement of campaign performance, referral evaluation, and conversion tracking for our photography content shared on Pinterest.
- **Mechanism:** Communication occurs server-to-server via the Pinterest Conversions API through our server proxy. No direct, unmanaged client-side Pinterest scripts run on your device.
- **Legal Basis:** Art. 6(1)(a) GDPR (Consent).
- **Official Documentation & Links:**
  - [Pinterest Privacy Policy](https://policy.pinterest.com/en/privacy-policy)
  - [Pinterest Conversions API Documentation](https://developers.pinterest.com/docs/conversions/conversions-api/)

### C. Meta Pixel / Conversions API (Facebook & Instagram)
- **Provider:** Meta Platforms Ireland Ltd., 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland.
- **Purpose:** Measuring the effectiveness of social media campaigns and evaluating visitor interaction with photography tutorials and reviews.
- **Mechanism:** Event measurement is routed via Meta's Conversions API (CAPI) through our server-side container. This eliminates third-party tracker injection in your browser and ensures that payloads are filtered and pseudonymized before dispatch.
- **Legal Basis:** Art. 6(1)(a) GDPR (Consent).
- **Official Documentation & Links:**
  - [Meta Privacy Policy](https://www.facebook.com/privacy/policy/)
  - [Meta Conversions API (Server-Side) Overview](https://developers.facebook.com/docs/marketing-api/conversions-api/)

---

## 6. Content Blocker / 2-Click Solution for YouTube

### Purpose & Functionality
On select tutorial and review articles, we embed informative videos hosted on YouTube (Google Ireland Limited / YouTube LLC).

To safeguard your privacy:
- **No Automatic Connection:** We implement a **2-click content blocker** (privacy-enhanced embedding). When you load a page containing a video, no connection to YouTube or Google servers is established, and no cookies or trackers are set on your device. Only a local placeholder or thumbnail stored on our own infrastructure is displayed.
- **On-Demand Activation:** External content is loaded only when you actively click the "Load & Play Video" (or "Watch Video") button.
- **Privacy-Enhanced Domain:** Upon activation, the video iframe is loaded exclusively via Google's privacy-enhanced mode domain: `https://www.youtube-nocookie.com/embed/[VIDEO-ID]`. According to YouTube, this domain does not store cookies used to personalize ads or build browsing profiles.

### Legal Basis
The initial presentation of local placeholders is based on **Art. 6(1)(f) GDPR** (legitimate interest in providing an appealing website). The loading of the external video iframe and subsequent data processing by YouTube occurs solely upon your explicit opt-in click in accordance with **Art. 6(1)(a) GDPR**.

### Official Documentation & Links
- [Google & YouTube Privacy Policy](https://policies.google.com/privacy)
- [YouTube Privacy-Enhanced Mode (youtube-nocookie.com) Documentation](https://support.google.com/youtube/answer/171780)

---

## 7. Interactive Features: Comments & Article Feedback

### Purpose & Processed Data
Our website provides interactive features including blog article comments and star ratings/feedback. These services are powered by custom serverless Cloudflare Workers:

- **Comments:** When you post a comment on a blog post, the data you submit (name/pseudonym, email address, comment text) is transmitted via encrypted HTTPS to our worker API. The submitting IP address and timestamp are processed solely for the duration necessary to prevent automated spam and abuse. We do not use third-party comment networks (such as Disqus).
- **Article Feedback & Ratings:** When you submit a rating or feedback vote, anonymous numerical counters are incremented without associating votes with personal user profiles.

### Legal Basis
- **Art. 6(1)(f) GDPR**: Legitimate interest in providing interactive reader discussions, gathering constructive feedback on articles, and preventing automated spam.

---

## 8. Affiliate Links & Amazon Associates Program

### Disclosure & Operation
[nocamerabag.com](https://nocamerabag.com/) participates in affiliate partner programs, most notably the **Amazon Associates Program**. On certain review, gear, and tutorial pages, we include affiliate links marked with an affiliate shopping bag icon or clearly indicated as affiliate/sponsored links in text.

When you click an affiliate link to an Amazon site, Amazon uses cookies and session parameters to track that you arrived from our website so that any qualified purchases can generate a small commission for us at no additional cost to you.

The responsible entities for Amazon services in Europe are:
- **Amazon Europe Core S.à r.l.**, 38 avenue John F. Kennedy, L-1855 Luxembourg
- **Amazon EU S.à r.l.**, 38 avenue John F. Kennedy, L-1855 Luxembourg

### Legal Basis
The inclusion of affiliate partner links is based on **Art. 6(1)(f) GDPR** (*legitimate interests* in operating an economically viable online publication and refinancing editorial time and hosting costs).

### Official Documentation & Links
- [Amazon Privacy Notice](https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010)

---

## 9. TLS / HTTPS Encryption

This site uses **Transport Layer Security (TLS/HTTPS)** encryption across all pages (data protection by design and default, Art. 25(1) GDPR). All traffic between your browser and our edge servers is encrypted using modern cryptographic protocols (TLS 1.3). You can verify the active encryption by checking for the padlock icon in your browser's address bar and the `https://` protocol prefix.

---

## 10. Your Rights Under the GDPR

Under the General Data Protection Regulation (EU) 2016/679 and the Austrian Data Protection Act (DSG), you have comprehensive legal rights regarding your personal data:

- **Right of Access (Art. 15 GDPR):** You have the right to obtain confirmation as to whether personal data concerning you is being processed, and to receive a copy of that data.
- **Right to Rectification (Art. 16 GDPR):** You have the right to request the rectification of inaccurate or incomplete personal data.
- **Right to Erasure / "Right to be Forgotten" (Art. 17 GDPR):** You have the right to demand the deletion of your personal data where statutory conditions apply.
- **Right to Restriction of Processing (Art. 18 GDPR):** You have the right to restrict processing under the conditions set forth in Art. 18 GDPR.
- **Right to Data Portability (Art. 20 GDPR):** You have the right to receive your personal data in a structured, commonly used, and machine-readable format.
- **Right to Object (Art. 21 GDPR):** You have the right to object at any time, on grounds relating to your particular situation, to data processing based on Art. 6(1)(f) GDPR (legitimate interests).
- **Right to Revoke Consent (Art. 7(3) GDPR):** Where processing is based on your consent (Art. 6(1)(a) GDPR), you may revoke that consent at any time with effect for the future (e.g., via our consent settings in the footer).
- **Right to Lodge a Complaint with a Supervisory Authority (Art. 77 GDPR):** If you consider that the processing of personal data relating to you infringes data protection laws, you have the right to lodge a complaint with a supervisory authority. In Austria, the competent supervisory authority is:

**Österreichische Datenschutzbehörde (Austrian Data Protection Authority)**  
Barichgasse 40-42, 1030 Vienna, Austria  
Phone: +43 1 52 152-0  
Email: [dsb@dsb.gv.at](mailto:dsb@dsb.gv.at)  
Website: [https://www.dsb.gv.at/](https://www.dsb.gv.at/)

To exercise any of these rights, please contact us at [hello@nocamerabag.com](mailto:hello@nocamerabag.com).
