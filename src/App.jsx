/*
 * Ukraine Conflict Monitor v4 — Bridgital Impact Design
 */
// Load Bridgital fonts
if(typeof document!=="undefined"&&!document.getElementById("bridgital-fonts")){
  const l=document.createElement("link");l.id="bridgital-fonts";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";

// ── SRA DATA Feb 2026 (68 risks) ─────────────────────────────
const SRA_V = "April 2026";
// [id, nom, likelihood, impact, score, trend, perc(0/1), oblast_diff, section, sub]
const SR = [
  ["1.1.1","Aerial bombardments / airstrikes","High","High",9,"STABLE",1,"Sumy:HIGH|Chernihiv:MED|Kyiv City:MED|Kyiv Oblast:MED","1—CONFLICT","1.1 Hostilities"],
  ["1.1.2","Indirect artillery fire","Very High","Critical",16,"WORSENED",0,"Sumy North:VHIGH|Sumy City:MED|Chernihiv:LOW|Kyiv:LOW","1—CONFLICT","1.1 Hostilities"],
  ["1.1.3","Drone attacks (FPV / Shahed)","Very High","High",12,"WORSENED",1,"Sumy:VHIGH|Chernihiv:HIGH|Kyiv City:HIGH|Kyiv Oblast:HIGH","1—CONFLICT","1.1 Hostilities"],
  ["1.1.4","Active combat / crossfire","Medium","Critical",8,"STABLE",0,"Sumy North:MED|Others:LOW","1—CONFLICT","1.1 Hostilities"],
  ["1.2.1","Landmines","High","Critical",12,"STABLE",0,"Sumy:HIGH|Chernihiv:MED|Kyiv City:LOW|Kyiv Oblast:MED","1—CONFLICT","1.2 Explosive Hazards"],
  ["1.2.2","Unexploded ordnance (UXO/ERW)","High","Critical",12,"STABLE",0,"Sumy:HIGH|Chernihiv:HIGH|Kyiv City:LOW|Kyiv Oblast:MED","1—CONFLICT","1.2 Explosive Hazards"],
  ["1.2.3","Explosive remnants of war (ERW)","High","High",9,"STABLE",0,"Sumy:HIGH|Chernihiv:MED|Kyiv City:LOW|Kyiv Oblast:MED","1—CONFLICT","1.2 Explosive Hazards"],
  ["1.3.1","Targeted attacks against civilians","High","High",9,"STABLE",1,"Sumy:HIGH|Chernihiv:MED|Kyiv City:MED|Kyiv Oblast:LOW","1—CONFLICT","1.3 Intentional Violence"],
  ["1.3.2","Indiscriminate armed violence","High","High",9,"STABLE",0,"Sumy:HIGH|Chernihiv:MED|Kyiv City:MED|Kyiv Oblast:LOW","1—CONFLICT","1.3 Intentional Violence"],
  ["1.3.3","Presence of armed groups","High","Medium",6,"STABLE",0,"Sumy:VHIGH|Chernihiv:HIGH|Kyiv City:HIGH|Kyiv Oblast:MED","1—CONFLICT","1.3 Intentional Violence"],
  ["1.4.1","Arrest / detention","Medium","High",6,"STABLE",1,"Sumy:MED|Others:LOW","1—CONFLICT","1.4 Detention"],
  ["1.4.2","Coercive interrogation","Low","High",3,"STABLE",1,"Sumy:LOW|Others:LOW","1—CONFLICT","1.4 Detention"],
  ["1.4.3","Hostile checkpoints","High","Medium",6,"STABLE",1,"Sumy:HIGH|Chernihiv:MED|Kyiv City:MED|Kyiv Oblast:LOW","1—CONFLICT","1.4 Detention"],
  ["1.5.1","Civilian infrastructure struck","High","High",9,"STABLE",0,"Sumy:HIGH|Chernihiv:MED|Kyiv City:MED|Kyiv Oblast:LOW","1—CONFLICT","1.5 Collateral Damage"],
  ["1.5.2","Damage to premises","Medium","Critical",8,"STABLE",1,"Sumy:MED|Others:LOW","1—CONFLICT","1.5 Collateral Damage"],
  ["2.1.1","Petty theft","High","Low",3,"STABLE",0,"Sumy:MED|Kyiv City:HIGH|Others:MED","2—CRIME","2.1 Opportunistic"],
  ["2.1.2","Pickpocketing / bag snatching","Medium","Low",2,"STABLE",0,"Kyiv City:MED|Others:LOW","2—CRIME","2.1 Opportunistic"],
  ["2.1.3","Theft of personal effects","Medium","Low",2,"STABLE",0,"Kyiv City:MED|Others:LOW","2—CRIME","2.1 Opportunistic"],
  ["2.2.1","Break-in (offices / guesthouses)","Medium","Medium",4,"STABLE",0,"Sumy:MED|Kyiv City:MED|Others:LOW","2—CRIME","2.2 Assets"],
  ["2.2.2","Vehicle theft","Medium","High",6,"STABLE",1,"Sumy:MED|Kyiv City:MED|Kyiv Oblast:MED","2—CRIME","2.2 Assets"],
  ["2.2.3","Fuel theft","Medium","Medium",4,"IMPROVED",0,"Sumy:MED|Others:LOW","2—CRIME","2.2 Assets"],
  ["2.3.1","Physical assault","Medium","High",6,"STABLE",0,"Kyiv City:MED|Others:LOW","2—CRIME","2.3 Violent Crime"],
  ["2.3.2","Carjacking","Low","High",3,"STABLE",0,"All:LOW","2—CRIME","2.3 Violent Crime"],
  ["2.3.3","Extortion","Medium","Medium",4,"STABLE",0,"Sumy:MED|Others:LOW","2—CRIME","2.3 Violent Crime"],
  ["2.4.1","Highway banditry","Low","Medium",2,"STABLE",0,"All:LOW","2—CRIME","2.4 Organised Crime"],
  ["2.4.2","Diversion of humanitarian aid","High","High",9,"STABLE",1,"Kyiv City:HIGH|Others:MED","2—CRIME","2.4 Organised Crime"],
  ["2.5.1","Internal fraud / misappropriation","Medium","High",6,"STABLE",1,"All:MED","2—CRIME","2.5 Fraud"],
  ["2.5.2","Local corruption","Medium","Medium",4,"IMPROVED",0,"Sumy:LOW|Others:MED","2—CRIME","2.5 Fraud"],
  ["2.6.1","Phishing / spear-phishing","High","High",9,"STABLE",0,"All:HIGH (non-geographic)","2—CRIME","2.6 Cybercrime"],
  ["2.6.2","Data theft / breach","Medium","Critical",8,"STABLE",1,"All:MED/Critical","2—CRIME","2.6 Cybercrime"],
  ["3.1.1","Road traffic accident","High","Critical",12,"STABLE",0,"Sumy:HIGH|Chernihiv:HIGH|Kyiv City:MED|Kyiv Oblast:HIGH","3—OPERATIONAL","3.1 Mobility"],
  ["3.1.2","Poor road conditions (weather)","High","High",9,"WORSENED",0,"Sumy:HIGH|Chernihiv:HIGH|Kyiv Oblast:HIGH|Kyiv City:MED","3—OPERATIONAL","3.1 Mobility"],
  ["3.2.1","Impassable routes / blocked access","High","High",9,"WORSENED",0,"Sumy:HIGH|Chernihiv:MED|Kyiv City:LOW|Kyiv Oblast:MED","3—OPERATIONAL","3.2 Logistics"],
  ["3.2.2","Fuel shortage","Low","Medium",2,"STABLE",0,"Sumy:MED|Others:LOW","3—OPERATIONAL","3.2 Logistics"],
  ["3.2.3","Critical operational delays","High","High",9,"STABLE",0,"Sumy:HIGH|Others:MED","3—OPERATIONAL","3.2 Logistics"],
  ["3.3.1","Telecom network loss","Medium","High",6,"STABLE",0,"Sumy North:HIGH|Others:LOW","3—OPERATIONAL","3.3 Communication"],
  ["3.3.2","Electronic jamming (GPS / radio)","High","High",9,"STABLE",0,"Sumy:HIGH|Others:LOW","3—OPERATIONAL","3.3 Communication"],
  ["3.4.1","Inadequate physical security of sites","Low","High",3,"STABLE",0,"Site-by-site","3—OPERATIONAL","3.4 Facility"],
  ["3.4.2","Fire","Medium","High",6,"STABLE",0,"Sumy:MED|Others:LOW","3—OPERATIONAL","3.4 Facility"],
  ["3.5.1","Failed / refused authorisations","Medium","High",6,"STABLE",1,"Sumy:MED-HIGH|Others:LOW","3—OPERATIONAL","3.5 Administrative"],
  ["3.5.2","Legal conflicts / legal status","Low","High",3,"STABLE",1,"All:LOW","3—OPERATIONAL","3.5 Administrative"],
  ["4.1.1","Extreme cold (-15°C and below)","Very High","High",12,"SEASONAL",0,"Sumy:VHIGH|Chernihiv:VHIGH|Kyiv:HIGH","4—ENVIRONMENT","4.1 Extreme Weather"],
  ["4.1.2","Snow / ice / snow-covered roads","High","High",9,"SEASONAL",0,"Sumy:HIGH|Chernihiv:HIGH|Kyiv Oblast:HIGH|Kyiv City:MED","4—ENVIRONMENT","4.1 Extreme Weather"],
  ["4.2.1","Flooding","Low","Medium",2,"STABLE",0,"Seasonal — reassess spring 2026","4—ENVIRONMENT","4.2 Natural Hazards"],
  ["4.2.2","Structural collapse (damaged buildings)","Medium","High",6,"STABLE",0,"Sumy:MED|Chernihiv:MED|Kyiv:LOW","4—ENVIRONMENT","4.2 Natural Hazards"],
  ["4.3.1","Pollution (air, soil, industrial)","Medium","Medium",4,"STABLE",0,"Sumy:MED|Others:LOW","4—ENVIRONMENT","4.3 Environmental Health"],
  ["4.3.2","Unsafe water / water contamination","High","High",9,"STABLE",0,"Sumy:HIGH|Others:MED","4—ENVIRONMENT","4.3 Environmental Health"],
  ["5.1.1","Injuries (conflict / mobility)","High","Critical",12,"STABLE",0,"Sumy:HIGH|Others:MED","5—HEALTH","5.1 Physical Health"],
  ["5.1.2","Illness (infections, flu)","Medium","Medium",4,"STABLE",0,"All:MED","5—HEALTH","5.1 Physical Health"],
  ["5.1.3","Limited access to medical care","Medium","High",6,"STABLE",0,"Sumy:HIGH|Others:MED","5—HEALTH","5.1 Physical Health"],
  ["5.2.1","Chronic stress / anxiety","Very High","High",12,"STABLE",1,"All:VHIGH (Sumy most acute)","5—HEALTH","5.2 Mental Health"],
  ["5.2.2","Burnout / professional exhaustion","Very High","High",12,"STABLE",0,"All:VHIGH","5—HEALTH","5.2 Mental Health"],
  ["5.2.3","Secondary trauma (PTSD)","High","High",9,"STABLE",0,"Sumy:HIGH|Others:MED","5—HEALTH","5.2 Mental Health"],
  ["5.3.1","Operational fatigue","Very High","High",12,"STABLE",0,"All:VHIGH","5—HEALTH","5.3 Behavioural"],
  ["5.3.2","Non-compliance with security SOPs","High","Critical",12,"STABLE",0,"All:HIGH","5—HEALTH","5.3 Behavioural"],
  ["5.4.1","Interpersonal conflicts / team tensions","High","Medium",6,"STABLE",0,"All:HIGH","5—HEALTH","5.4 Internal Social"],
  ["5.4.2","Domestic violence (local staff)","High","Medium",6,"STABLE",0,"All:HIGH","5—HEALTH","5.4 Internal Social"],
  ["6.1.1","Local hostility","Medium","High",6,"STABLE",1,"Sumy:MED-HIGH|Kyiv City:MED|Others:LOW","6—SOCIOPOLITICAL","6.1 Community Acceptance"],
  ["6.1.2","General distrust of NGOs","High","High",9,"STABLE",1,"All:HIGH","6—SOCIOPOLITICAL","6.1 Community Acceptance"],
  ["6.1.3","Disinformation targeting humanitarian actors","Very High","High",12,"WORSENED",1,"All:VHIGH (amplified in Sumy)","6—SOCIOPOLITICAL","6.1 Community Acceptance"],
  ["6.2.1","Demonstrations (mobilisation, aid)","Medium","Medium",4,"STABLE",0,"Sumy:MED|Kyiv City:MED|Others:LOW","6—SOCIOPOLITICAL","6.2 Civil Unrest"],
  ["6.2.2","Riots / serious disorder","Low","High",3,"STABLE",0,"All:LOW","6—SOCIOPOLITICAL","6.2 Civil Unrest"],
  ["6.3.1","Poor perception of neutrality","Very High","Critical",16,"STABLE",1,"All:VHIGH/Critical — Sumy + Kyiv most acute","6—SOCIOPOLITICAL","6.3 Reputational"],
  ["6.3.2","Accusations of bias (pro-Russian/pro-Ukrainian)","High","Critical",12,"STABLE",1,"All:HIGH/Critical","6—SOCIOPOLITICAL","6.3 Reputational"],
  ["6.3.3","Social media impact on perception","Very High","High",12,"WORSENED",1,"All:VHIGH (non-geographic)","6—SOCIOPOLITICAL","6.3 Reputational"],
  ["6.3.4","Data / beneficiary confidentiality crisis","Medium","Critical",8,"STABLE",1,"All:MED/Critical","6—SOCIOPOLITICAL","6.3 Reputational"],
  ["6.4.1","Military restrictions / curfew","High","High",9,"STABLE",1,"Sumy:HIGH|Others:MED","6—SOCIOPOLITICAL","6.4 Regulatory"],
  ["6.4.2","Denial of humanitarian access","High","Critical",12,"WORSENED",1,"Sumy:HIGH→VHIGH|Chernihiv:MED|Kyiv:LOW","6—SOCIOPOLITICAL","6.4 Regulatory"],
];
const SRA_DATA = SR.map(r => ({id:r[0],nom:r[1],l:r[2],i:r[3],score:r[4],trend:r[5],perc:!!r[6],od:r[7],section:r[8],sub:r[9]}));

// Front-line overrides: national SRA underestimates risk at the front
// These reflect actual risk in each oblast for key conflict risks
const OBL_OVR = {
  "1.1.2":{"Sumy":16,"Chernihiv":4,"Kyiv City":2,"Kyiv Oblast":2},
  "1.1.3":{"Sumy":16,"Chernihiv":12,"Kyiv City":12,"Kyiv Oblast":12},
  "1.1.1":{"Sumy":12,"Chernihiv":6,"Kyiv City":6,"Kyiv Oblast":6},
  "1.2.1":{"Sumy":16,"Chernihiv":8,"Kyiv City":2,"Kyiv Oblast":6},
  "1.2.2":{"Sumy":16,"Chernihiv":12,"Kyiv City":2,"Kyiv Oblast":6},
  "3.1.1":{"Sumy":16,"Chernihiv":12,"Kyiv City":6,"Kyiv Oblast":12},
  "3.2.1":{"Sumy":16,"Chernihiv":6,"Kyiv City":2,"Kyiv Oblast":6},
  "5.2.1":{"Sumy":16,"Chernihiv":12,"Kyiv City":12,"Kyiv Oblast":12},
  "5.3.1":{"Sumy":16,"Chernihiv":12,"Kyiv City":12,"Kyiv Oblast":12},
  "6.4.2":{"Sumy":16,"Chernihiv":6,"Kyiv City":2,"Kyiv Oblast":4},
};

// Trigger recommendations [id] → {recs, mits, context}
const TRECS = {
  "1.1.2":{recs:["Suspend non-essential movements in Sumy North border raions","Revise minimum safe distance from contact line (current guidance: 15 km)","Require dual convoy approval for all northern Sumy missions"],mits:["Pre-mission artillery activity check via Sumy OVA monitoring","Mandatory shelter identification for all northern route segments","Restrict movement window to low-activity periods (06:00–14:00)"]},
  "1.1.3":{recs:["Update Drone Management Plan within 14 days","Suspend vehicle movement during active drone alert periods","Equip all Sumy/Chernihiv convoys with RF detection capability"],mits:["Revise safe-window schedules to avoid drone-active periods","Driver training: FPV visual detection and immediate action drills","High-visibility non-military vehicle identification on all convoys"]},
  "1.3.1":{recs:["Report double-tap attack pattern to humanitarian security network","Coordinate movement windows with local emergency services"],mits:["Strict no-return-to-strike-site protocol (minimum 30 min wait)","Pre-notification of ambulance/convoy routes to local AFU units"]},
  "6.1.3":{recs:["Activate 24/7 social media monitoring (Ukrainian Telegram / Twitter/X)","Prepare rapid response communications kit — Ukrainian-language statements ready within 2h"],mits:["Proactive neutrality briefings with local AFU commanders","Designate crisis communications focal point in Kyiv HQ"]},
  "6.4.2":{recs:["Escalate all access denials to senior management and HQ within 24h","Document each denial systematically: date, location, unit, stated justification"],mits:["Strengthen liaison with Sumy Regional Military Administration","Pre-clear all missions in contested raions 48h in advance"]},
  "default":{recs:["Review mission parameters for affected risk category","Brief all field teams on observed escalation pattern"],mits:["Increase monitoring frequency for this risk type","Update security briefings to reflect newly observed incidents"]},
};

// SRA justifications for key risks
const SRA_J = {
  "1.1.2":{tj:"Ongoing Russian offensive on Sumy (2025): artillery range now reaches previously unaffected areas. Front line advanced south-west since Oct 2025.",j:"Risk almost exclusive to Sumy oblast north. Districts of Seredyna-Buda, Shalyhyne, Yunakivka directly exposed. Sumy city (~40 km from front): MEDIUM. Chernihiv/Kyiv: LOW."},
  "1.1.3":{tj:"Continuous technological escalation: FPV swarms (Sumy), long-range Shaheds (Kyiv, Chernihiv). Frequency and sophistication rising steadily since Dec 2022.",j:"FPV drones: very high risk for convoys in Sumy zone. Shahed: nightly strikes on Kyiv and Chernihiv. [PERCEPTION]: any vehicle hit = immediate narrative crisis."},
  "6.1.3":{tj:"Escalation since Oct 2025: pro-Russian AND pro-Ukrainian disinformation campaigns intensified. Ukrainian social media very active.",j:"[PERCEPTION CRITICAL]: disinformation can trigger physical incidents against staff. Any announcement of activity on Russian side = disinformation wave."},
  "6.4.2":{tj:"Impact raised to Critical Feb 2026: Sumy offensive created new blocked access zones. Populations in need unreached = Critical mission impact.",j:"Documented access denial incidents in militarised Sumy zones. [PERCEPTION DIRECT]: access denial = signal of relationship deterioration with local military."},
};

// ── VERIFIED INCIDENTS ────────────────────────────────────────
const VER = [
  {id:"2026-01-V01",date_exacte:"17/01/2026",mois:1,annee:2026,oblast:"Sumy",raion:"Multiple Raions",hromada:"Multiple",risk_id:"1.1.2",cible:"Residential (civilian)",morts:0,blesses:5,severite:"CRITICAL",icrc:"RELEVANT",description:"100+ shelling attacks across 41 settlements. 5 civilians wounded.",source:"ZMINA — 18/01/2026",statut:"VERIFIED"},
  {id:"2026-01-V02",date_exacte:"21/01/2026",mois:1,annee:2026,oblast:"Sumy",raion:"Shostka Raion",hromada:"Shostka",risk_id:"1.1.3",cible:"Civilian vehicle",morts:2,blesses:1,severite:"CRITICAL",icrc:"CRITICAL",description:"FPV drone strike on civilian vehicle near Shostka. Two occupants killed.",source:"ZMINA — 21/01/2026",statut:"VERIFIED"},
  {id:"2026-02-V01",date_exacte:"21/02/2026",mois:2,annee:2026,oblast:"Sumy",raion:"Seredyna-Buda Raion",hromada:"Znob-Novhorodske",risk_id:"1.3.1",cible:"Medical personnel",morts:4,blesses:1,humanitaires:true,enfants:true,severite:"CRITICAL",icrc:"CRITICAL",description:"Double-tap drone strike on ambulance. Paramedic and minor killed. Three other medical personnel killed.",source:"ZMINA — 22/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V02",date_exacte:"13/02/2026",mois:2,annee:2026,oblast:"Sumy",raion:"Multiple Raions",hromada:"Multiple",risk_id:"1.1.2",cible:"Residential (civilian)",morts:1,blesses:3,severite:"CRITICAL",icrc:"RELEVANT",description:"50+ attacks on 21 settlements. One civilian killed, three wounded.",source:"ZMINA — 14/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V03",date_exacte:"21/02/2026",mois:2,annee:2026,oblast:"Sumy",raion:"Sumy Raion",hromada:"Sumy district",risk_id:"1.1.3",cible:"Residential (civilian)",morts:0,blesses:3,enfants:true,severite:"HIGH",icrc:"RELEVANT",description:"Combined airstrike and drone attack. Two children among three wounded.",source:"ZMINA — 21/02/2026",statut:"VERIFIED"},
  {id:"2026-01-V03",date_exacte:"25/01/2026",mois:1,annee:2026,oblast:"Sumy",raion:"Krasnopilska Raion",hromada:"Krasnopillia",risk_id:"1.3.1",cible:"Evacuation convoy",morts:2,blesses:0,severite:"CRITICAL",icrc:"CRITICAL",description:"Drone strike on civilian couple evacuating border village. Both killed.",source:"ZMINA — 25/01/2026",statut:"VERIFIED"},
  {id:"2026-02-V06",date_exacte:"12/02/2026",mois:2,annee:2026,oblast:"Chernihiv",raion:"Semenivskyi",hromada:"Semenivka",risk_id:"1.1.2",cible:"Residential (civilian)",morts:0,blesses:0,severite:"MEDIUM",icrc:"RELEVANT",description:"Combined mortar, artillery and FPV attacks on 6 border villages.",source:"Chernihiv OVA — 12/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V07",date_exacte:"05/02/2026",mois:2,annee:2026,oblast:"Chernihiv",raion:"Novhorod-Siverskyi",hromada:"Novhorod-Siverskyi",risk_id:"1.1.3",cible:"Industrial/agricultural site",morts:0,blesses:0,severite:"MEDIUM",icrc:"RELEVANT",description:"Geran-2 Shahed drones struck food processing enterprise.",source:"Chernihiv OVA — 05/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V10",date_exacte:"20/02/2026",mois:2,annee:2026,oblast:"Chernihiv",raion:"Multiple border raions",hromada:"Multiple",risk_id:"1.1.2",cible:"Telecom infrastructure",morts:0,blesses:2,severite:"HIGH",icrc:"RELEVANT",description:"245 total strikes. Telecom facility hit. Two workers wounded.",source:"Chernihiv OVA — 20/02/2026",statut:"VERIFIED"},
  {id:"2026-01-V04",date_exacte:"08/01/2026",mois:1,annee:2026,oblast:"Kyiv City",raion:"Multiple districts",hromada:"Multiple",risk_id:"1.1.1",cible:"Energy infrastructure",morts:4,blesses:25,severite:"CRITICAL",icrc:"CRITICAL",description:"Mass attack: 242 drones and missiles. 6,000 buildings without heat. 4 killed, 25 wounded.",source:"Kyiv City MDA — 08/01/2026",statut:"VERIFIED"},
  {id:"2026-02-V12",date_exacte:"03/02/2026",mois:2,annee:2026,oblast:"Kyiv City",raion:"Left bank",hromada:"Left bank",risk_id:"1.1.1",cible:"Energy infrastructure",morts:0,blesses:6,severite:"CRITICAL",icrc:"CRITICAL",description:"Mass attack as energy ceasefire ends. 1,100 buildings without heat, 6 wounded.",source:"Kyiv City MDA — 03/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V14",date_exacte:"22/02/2026",mois:2,annee:2026,oblast:"Kyiv City",raion:"Multiple",hromada:"Multiple",risk_id:"1.1.1",cible:"Energy infrastructure",morts:0,blesses:2,severite:"CRITICAL",icrc:"CRITICAL",description:"50 cruise missiles + 297 drones. Water infrastructure and railway targeted.",source:"Kyiv City MDA — 22/02/2026",statut:"VERIFIED"},
  {id:"2026-02-V16",date_exacte:"22/02/2026",mois:2,annee:2026,oblast:"Kyiv Oblast",raion:"Fastiv Raion",hromada:"Fastiv",risk_id:"1.1.1",cible:"Residential (civilian)",morts:1,blesses:17,enfants:true,severite:"CRITICAL",icrc:"RELEVANT",description:"Apartment building partial collapse. 1 killed, 17 wounded including 4 children.",source:"Kyiv Oblast OVA — 22/02/2026",statut:"VERIFIED"},
  {id:"2026-01-V07",date_exacte:"15/01/2026",mois:1,annee:2026,oblast:"Kyiv City",raion:"Kyiv NGOs",hromada:"Kyiv",risk_id:"2.6.1",cible:"IT/Cyber",morts:0,blesses:0,humanitaires:true,severite:"HIGH",icrc:"RELEVANT",description:"UAC-0050/UAC-0006 phishing campaigns targeting humanitarian NGOs. +70% YoY.",source:"CERT-UA — 15/01/2026",statut:"VERIFIED"},
  {id:"2026-01-V08",date_exacte:"09/01/2026",mois:1,annee:2026,oblast:"Kyiv City",raion:"City-wide",hromada:"City-wide",risk_id:"4.1.1",cible:"Water/WASH infrastructure",morts:0,blesses:0,severite:"CRITICAL",icrc:"CRITICAL",description:"Combined cold snap (-18C) and energy strikes. Millions without heat or water.",source:"Kyiv City MDA — 09/01/2026",statut:"VERIFIED"},
];

// ── DEMO GENERATOR ────────────────────────────────────────────
function mul32(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const GEO={"Sumy":[{r:"Sumy Raion",h:["Sumy","Bilopillia"]},{r:"Shostka Raion",h:["Shostka","Seredyna-Buda"]},{r:"Krasnopilska",h:["Krasnopillia"]}],"Chernihiv":[{r:"Chernihiv Raion",h:["Chernihiv"]},{r:"Snovsk Raion",h:["Snovsk","Semenivka","Novhorod-Siverskyi"]}],"Kyiv Oblast":[{r:"Bucha Raion",h:["Bucha","Irpin"]},{r:"Fastiv Raion",h:["Fastiv"]}],"Kyiv City":[{r:"Shevchenkivskyi",h:["Shevchenkivskyi"]},{r:"Pecherskyi",h:["Pecherskyi"]}]};
const RIDS=["1.1.1","1.1.2","1.1.3","1.1.4","1.2.1","1.2.2","1.2.3","1.3.1","1.3.2","1.5.1","2.1.1","2.4.2","2.6.1","3.1.1","3.2.1","3.3.1","3.3.2","4.1.1","4.1.2","4.3.2","5.1.1","6.1.3","6.4.1","6.4.2"];
const CIBS=["Residential (civilian)","Energy infrastructure","Water/WASH infrastructure","Transport infrastructure","Telecom infrastructure","Health facility","Civilian vehicle","Humanitarian personnel","Medical personnel","Industrial/agricultural site","Military target","Public space","IT/Cyber","Administrative building","Market / commercial area","Unknown","Education facility","Evacuation convoy"];
const PHS=[
  {sy:2022,sm:2,ey:2022,em:4,pm:62,oW:[0.35,0.25,0.25,0.15],rW:[0.18,0.22,0.08,0.15,0.02,0.02,0.01,0.08,0.08,0.05,0,0,0,0.02,0.01,0.01,0.01,0.02,0,0.01,0.02,0,0.01,0.01],cW:[0.28,0.08,0.04,0.08,0.02,0.07,0.04,0.07,0.03,0.04,0.02,0.03,0.02,0.01,0.01,0.01,0.02,0.04,0.01],sW:[0.50,0.30,0.15,0.05],iW:[0.55,0.35,0.10],cm:2.0},
  {sy:2022,sm:5,ey:2022,em:9,pm:34,oW:[0.50,0.08,0.18,0.24],rW:[0.10,0.25,0.12,0.05,0.08,0.12,0.05,0.05,0.06,0.04,0.01,0.01,0,0.02,0.01,0,0,0,0,0.01,0.01,0,0.01,0.01],cW:[0.25,0.06,0.04,0.10,0.02,0.05,0.04,0.07,0.02,0.08,0.04,0.06,0,0.02,0.01,0.01,0.02,0.01,0.02],sW:[0.25,0.40,0.25,0.10],iW:[0.35,0.45,0.20],cm:1.0},
  {sy:2022,sm:10,ey:2023,em:3,pm:28,oW:[0.38,0.30,0.20,0.12],rW:[0.20,0.18,0.14,0.02,0.03,0.07,0.02,0.04,0.05,0.10,0.01,0.01,0.01,0.01,0.02,0.02,0.01,0.03,0.01,0.02,0.01,0,0.01,0.01],cW:[0.16,0.22,0.09,0.07,0.08,0.05,0.04,0.05,0.02,0.04,0.02,0.03,0,0.03,0.01,0.01,0.02,0.03,0.02],sW:[0.38,0.35,0.20,0.07],iW:[0.42,0.40,0.18],cm:1.2},
  {sy:2023,sm:4,ey:2024,em:12,pm:14,oW:[0.45,0.20,0.15,0.20],rW:[0.10,0.22,0.20,0.02,0.04,0.08,0.03,0.05,0.04,0.06,0.01,0.01,0.03,0.02,0.03,0.02,0.02,0.01,0.01,0.01,0.01,0.01,0.02,0.01],cW:[0.20,0.12,0.05,0.08,0.05,0.07,0.09,0.03,0.04,0.06,0.02,0.05,0.02,0.03,0.01,0.01,0.02,0.02,0.02],sW:[0.22,0.38,0.28,0.12],iW:[0.28,0.48,0.24],cm:0.7},
  {sy:2025,sm:1,ey:2025,em:12,pm:16,oW:[0.38,0.28,0.18,0.16],rW:[0.12,0.14,0.28,0.01,0.03,0.06,0.02,0.06,0.04,0.08,0.01,0.01,0.05,0.01,0.02,0.02,0.02,0.01,0,0.01,0.01,0.01,0.02,0.01],cW:[0.16,0.16,0.06,0.06,0.07,0.07,0.09,0.03,0.05,0.05,0.02,0.04,0.04,0.04,0.01,0.01,0.02,0.02,0.01],sW:[0.28,0.38,0.24,0.10],iW:[0.32,0.45,0.23],cm:0.8},
];
const OBLS=["Sumy","Kyiv City","Kyiv Oblast","Chernihiv"];
function wP(a,w,r){let rv=r(),c=0;for(let i=0;i<Math.min(a.length,w.length);i++){c+=w[i]||0;if(rv<c)return a[i];}return a[0];}
function genD(){
  const rng=mul32(0xDEAD),out=[],sS=["CRITICAL","HIGH","MEDIUM","LOW"],sI=["CRITICAL","RELEVANT","NON-RELEVANT"];let n=1;
  for(const ph of PHS){let y=ph.sy,m=ph.sm;
    while(y<ph.ey||(y===ph.ey&&m<=ph.em)){
      const cnt=Math.max(4,Math.floor(ph.pm+(rng()-0.5)*ph.pm*0.4));
      for(let i=0;i<cnt;i++){
        const ob=wP(OBLS,ph.oW,rng);const g=GEO[ob];const ro=g[Math.floor(rng()*g.length)];const h=ro.h[Math.floor(rng()*ro.h.length)];
        const ri=Math.floor(wP(RIDS.map((_,j)=>j),ph.rW,rng));const rid=RIDS[ri]||"1.1.2";
        const ci=wP(CIBS,ph.cW,rng);const sv=wP(sS,ph.sW,rng);const ic=wP(sI,ph.iW,rng);
        const dy=Math.floor(rng()*28)+1;
        const bm=sv==="CRITICAL"?Math.floor(rng()*6*ph.cm):sv==="HIGH"?Math.floor(rng()*3):0;
        const bb=sv==="CRITICAL"?Math.floor(rng()*12*ph.cm):sv==="HIGH"?Math.floor(rng()*6):Math.floor(rng()*2);
        out.push({id:`${y}-${String(m).padStart(2,"0")}-D${String(n++).padStart(3,"0")}`,date_exacte:`${String(dy).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`,mois:m,annee:y,oblast:ob,raion:ro.r,hromada:h,risk_id:rid,risk_nom:SRA_DATA.find(r=>r.id===rid)?.nom||rid,cible:ci,morts:Math.max(0,bm),blesses:Math.max(0,bb),humanitaires:rng()<0.12,enfants:rng()<0.15,severite:sv,icrc:ic,description:`${SRA_DATA.find(r=>r.id===rid)?.nom||rid} in ${h}`,source:`Oblast OVA — ${String(dy).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`,statut:"DEMO"});
      }
      m++;if(m>12){m=1;y++;}
    }
  }
  return out;
}
const BASE=[...genD(),...VER];

// ── NATIONAL EXTRAPOLATION (ACLED-based) ──────────────────────
// ACLED Ukraine 2022-2025: 4 monitored oblasts ≈ 15% of national events
// Donetsk ~38% | Kharkiv ~13% | Zaporizhzhia ~11% | Kherson ~9% | Luhansk ~7% | Mykolaiv ~3% | Dnipro ~4%
const NAT_GEO={
  "Donetsk":[{r:"Pokrovsk Raion",h:["Pokrovsk","Avdiivka","Toretsk"]},{r:"Bakhmut Raion",h:["Chasiv Yar","Kramatorsk"]},{r:"Mariupol Raion",h:["Mariupol"]}],
  "Kharkiv":[{r:"Kharkiv Raion",h:["Kharkiv","Izium"]},{r:"Kupiansk Raion",h:["Kupiansk","Vovchansk"]}],
  "Zaporizhzhia":[{r:"Melitopol Raion",h:["Orikhiv","Polohy"]},{r:"Zaporizhzhia Raion",h:["Zaporizhzhia"]}],
  "Kherson":[{r:"Kherson Raion",h:["Kherson","Beryslav"]},{r:"Henichesk Raion",h:["Henichesk"]}],
  "Luhansk":[{r:"Sievierodonetsk Raion",h:["Rubizhne","Lysychansk"]},{r:"Starobilsk Raion",h:["Starobilsk"]}],
  "Mykolaiv":[{r:"Mykolaiv Raion",h:["Mykolaiv","Voznesensk"]}],
  "Dnipropetrovsk":[{r:"Nikopol Raion",h:["Nikopol","Marhanets"]},{r:"Dnipro Raion",h:["Dnipro"]}],
};
// ACLED share per oblast (of the 85% not in our 4 monitored zones)
const NAT_SHARE={"Donetsk":0.448,"Kharkiv":0.153,"Zaporizhzhia":0.129,"Kherson":0.106,"Luhansk":0.082,"Mykolaiv":0.035,"Dnipropetrovsk":0.047};
const NAT_OBLS=Object.keys(NAT_GEO);

function genNatD(){
  const rng=mul32(0xFEED),out=[],sS=["CRITICAL","HIGH","MEDIUM","LOW"];
  // Total 4-zone incidents × (85/15) to get national other-oblasts total
  const natTarget=Math.round(BASE.length*(85/15));
  let n=1;
  for(const ph of PHS){
    let y=ph.sy,m=ph.sm;
    while(y<ph.ey||(y===ph.ey&&m<=ph.em)){
      const monthBase=Math.max(2,Math.floor(ph.pm*(85/15)+(rng()-0.5)*ph.pm*0.3));
      for(let i=0;i<monthBase;i++){
        // Pick oblast weighted by ACLED share
        let rv=rng(),cum=0,ob=NAT_OBLS[0];
        for(const [o,w] of Object.entries(NAT_SHARE)){cum+=w;if(rv<cum){ob=o;break;}}
        const g=NAT_GEO[ob];const ro=g[Math.floor(rng()*g.length)];const h=ro.h[Math.floor(rng()*ro.h.length)];
        const ri=Math.floor(wP(RIDS.map((_,j)=>j),ph.rW,rng));const rid=RIDS[ri]||"1.1.2";
        const ci=wP(CIBS,ph.cW,rng);
        // Front-line oblasts skew more CRITICAL
        const frontW=ob==="Donetsk"||ob==="Luhansk"?[0.55,0.30,0.10,0.05]:[0.35,0.40,0.20,0.05];
        const sv=wP(sS,frontW,rng);
        const dy=Math.floor(rng()*28)+1;
        const bm=sv==="CRITICAL"?Math.floor(rng()*8*ph.cm):sv==="HIGH"?Math.floor(rng()*3):0;
        const bb=sv==="CRITICAL"?Math.floor(rng()*15*ph.cm):sv==="HIGH"?Math.floor(rng()*7):Math.floor(rng()*2);
        out.push({id:`NAT-${y}-${String(m).padStart(2,"0")}-${String(n++).padStart(4,"0")}`,date_exacte:`${String(dy).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`,mois:m,annee:y,oblast:ob,raion:ro.r,hromada:h,risk_id:rid,risk_nom:SRA_DATA.find(r=>r.id===rid)?.nom||rid,cible:ci,morts:Math.max(0,bm),blesses:Math.max(0,bb),humanitaires:rng()<0.08,enfants:rng()<0.12,severite:sv,icrc:"NON-RELEVANT",description:`${rid} in ${h} (national zone)`,source:`${ob} OVA — ${String(dy).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`,statut:"DEMO",national:true});
      }
      m++;if(m>12){m=1;y++;}
    }
  }
  return out;
}
const NAT_DEMO=genNatD();
// Combined national dataset (ICRC zones + extrapolated national)
const ALL_NATIONAL=[...BASE,...NAT_DEMO];


const OC={"Sumy":"#c0392b","Kyiv City":"#1A6B65","Kyiv Oblast":"#2A8F87","Chernihiv":"#C9A84C"};
const SC={CRITICAL:"#c0392b",HIGH:"#d4621a",MEDIUM:"#b8860b",LOW:"#4A6361"};
const IC={CRITICAL:"#f43f5e",RELEVANT:"#fb923c","NON-RELEVANT":"#475569"};
const TC={WORSENED:"#c0392b",IMPROVED:"#2A8F87",STABLE:"#4A6361",SEASONAL:"#C9A84C"};
const TI={WORSENED:"↑ WORSENED",IMPROVED:"↓ IMPROVED",STABLE:"→ STABLE",SEASONAL:"⟳ SEASONAL"};
const MN=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmy=(m,y)=>`${MN[m]} ${y}`;
const PP=["#f43f5e","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa","#f472b6","#94a3b8","#0ea5e9","#d946ef","#84cc16","#22d3ee","#475569"];
const CC=c=>c>=13?"#c0392b":c>=9?"#d4621a":c>=6?"#b8860b":"#4A6361";

const METHODS=[
  {id:"official",label:"Official SRA only",desc:"Pure SRA score (L×I matrix). Incident data flags divergence only — no fusion. Recommended for official reporting and SRA reviews."},
  {id:"c70",label:"Composite 70/30",desc:"70% SRA + 30% incident signal. Signal = weighted frequency (CRITICAL×4, HIGH×3, MEDIUM×2, LOW×1) normalised to 0–16 scale. Recommended default."},
  {id:"c50",label:"Composite 50/50",desc:"50% SRA + 50% incident signal. Equal weight to formal analysis and field data. Use when incident database is dense and comprehensive."},
  {id:"dyn",label:"Dynamic 65/35",desc:"65% SRA + 35% incident signal. Incidents in last 30 days weighted ×1.5 for recency. Most responsive to rapid escalation. Use during active crisis."},
];

function calcC(base,sig,hasS,method){
  if(!hasS||method==="official")return base;
  if(method==="c70")return parseFloat((0.70*base+0.30*sig).toFixed(1));
  if(method==="c50")return parseFloat((0.50*base+0.50*sig).toFixed(1));
  if(method==="dyn")return parseFloat((0.65*base+0.35*sig).toFixed(1));
  return base;
}

function computeRM(data,ps,pe,priorK,method,focusObl,activeOblF){
  const SW={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};
  const pStart=ps.y*100+ps.m, pEnd=pe.y*100+pe.m;

  // Global aggregates (for composite score & overall signal)
  const cur={},curW={},prior={};
  data.forEach(inc=>{
    const d=inc.annee*100+inc.mois;
    if(d>=pStart&&d<=pEnd){cur[inc.risk_id]=(cur[inc.risk_id]||0)+1;curW[inc.risk_id]=(curW[inc.risk_id]||0)+(SW[inc.severite]||1);}
    if(d>=priorK.s&&d<=priorK.e){prior[inc.risk_id]=(prior[inc.risk_id]||0)+1;}
  });
  const maxW=Math.max(1,...Object.values(curW));

  // Per-oblast aggregates for trigger breakdown
  const oblasts=activeOblF||OBLS;
  const byObl={};  // byObl[oblast][risk_id] = {cnt, critCnt, priorCnt}
  oblasts.forEach(o=>{
    byObl[o]={};
    SRA_DATA.forEach(r=>{ byObl[o][r.id]={cnt:0,critCnt:0,priorCnt:0,wt:0}; });
    data.forEach(inc=>{
      if(inc.oblast!==o)return;
      const d=inc.annee*100+inc.mois;
      if(d>=pStart&&d<=pEnd){
        byObl[o][inc.risk_id].cnt++;
        byObl[o][inc.risk_id].wt+=(SW[inc.severite]||1);
        if(inc.severite==="CRITICAL") byObl[o][inc.risk_id].critCnt++;
      }
      if(d>=priorK.s&&d<=priorK.e) byObl[o][inc.risk_id].priorCnt++;
    });
  });

  return SRA_DATA.map(r=>{
    const cnt=cur[r.id]||0,wt=curW[r.id]||0,priorCnt=prior[r.id]||0;
    const sig=parseFloat(((wt/maxW)*16).toFixed(1));
    const hasS=cnt>0;
    const oblSc=focusObl&&OBL_OVR[r.id]?.[focusObl]?OBL_OVR[r.id][focusObl]:r.score;
    const base=focusObl?oblSc:r.score;
    const comp=calcC(base,sig,hasS,method);
    const div=parseFloat((comp-r.score).toFixed(1));
    const iTrend=priorCnt>0?Math.round(((cnt-priorCnt)/priorCnt)*100):null;
    const critCnt=data.filter(i=>{const d=i.annee*100+i.mois;return i.risk_id===r.id&&d>=pStart&&d<=pEnd&&i.severite==="CRITICAL";}).length;

    // Per-oblast trigger evaluation
    const oblTriggers=oblasts.map(o=>{
      const od=byObl[o]?.[r.id]||{cnt:0,critCnt:0,priorCnt:0,wt:0};
      const oblScore=OBL_OVR[r.id]?.[o]||r.score;
      const oblSig=parseFloat(((od.wt/Math.max(1,maxW))*16).toFixed(1));
      const oblComp=calcC(oblScore,oblSig,od.cnt>0,method);
      const oblDiv=parseFloat((oblComp-r.score).toFixed(1));
      const oblITrend=od.priorCnt>0?Math.round(((od.cnt-od.priorCnt)/od.priorCnt)*100):null;
      const tA=r.trend!=="WORSENED"&&method!=="official"&&oblDiv>=1.5&&od.cnt>=2;
      const tD=r.score>=9&&((oblITrend!==null&&oblITrend>=30&&od.cnt>=3)||(od.critCnt>=2));
      return{oblast:o,cnt:od.cnt,critCnt:od.critCnt,priorCnt:od.priorCnt,oblScore,oblComp,oblDiv,oblITrend,typeA:tA,typeD:tD,active:tA||tD};
    }).filter(o=>o.active);

    // Global triggers (fallback if no per-oblast data)
    const typeA=r.trend!=="WORSENED"&&method!=="official"&&div>=1.5&&cnt>=2;
    const typeD=r.score>=9&&((iTrend!==null&&iTrend>=30&&cnt>=3)||(critCnt>=2));
    const hasOblTrigger=oblTriggers.length>0;

    return{...r,cnt,wt,priorCnt,sig,comp,div,iTrend,critCnt,hasS,
      typeA:typeA||oblTriggers.some(o=>o.typeA),
      typeD:typeD||oblTriggers.some(o=>o.typeD),
      oblSc,base,oblTriggers};
  });
}

// ── TOP RISK CHART COMPONENT ──────────────────────────────────
const TCOLS=["#f43f5e","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa"];
function TopRiskChart({filt,rkC}){
  const top6=useMemo(()=>rkC.slice(0,6).map(r=>r.id),[rkC]);
  const chartData=useMemo(()=>{
    const byMonth={};
    filt.forEach(i=>{
      if(!top6.includes(i.risk_id))return;
      const k=`${i.annee}-${String(i.mois).padStart(2,"0")}`;
      if(!byMonth[k])byMonth[k]={k,lbl:`${MN[i.mois]} ${i.annee}`};
      byMonth[k][i.risk_id]=(byMonth[k][i.risk_id]||0)+1;
    });
    return Object.values(byMonth).sort((a,b)=>a.k.localeCompare(b.k));
  },[filt,top6]);
  return(<div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
      {top6.map((id,i)=>{
        const nom=SRA_DATA.find(r=>r.id===id)?.nom||id;
        return(<div key={id} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:10,height:3,borderRadius:2,background:TCOLS[i],flexShrink:0}}/>
          <span style={{color:"#64748b",fontSize:9}}><span style={{color:TCOLS[i],fontWeight:700}}>{id}</span> — {nom.length>32?nom.slice(0,30)+"…":nom}</span>
        </div>);
      })}
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{top:4,right:16,bottom:4,left:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A6B6533"/>
        <XAxis dataKey="lbl" tick={{fill:"#4A6361",fontSize:9}} interval={3}/>
        <YAxis tick={{fill:"#4A6361",fontSize:9}} allowDecimals={false}/>
        <Tooltip contentStyle={{background:"#124E49",border:"1px solid #1A6B65",fontSize:10,borderRadius:6}}
          formatter={(v,name)=>[`${v} incidents`,`${name} — ${SRA_DATA.find(r=>r.id===name)?.nom||name}`]}/>
        <Brush dataKey="lbl" height={13} stroke="#124E49" fill="#0d1e1d"/>
        {top6.map((id,i)=>(<Line key={id} type="monotone" dataKey={id} stroke={TCOLS[i]} strokeWidth={2} dot={false} connectNulls/>))}
      </LineChart>
    </ResponsiveContainer>
    <div style={{color:"#334155",fontSize:9,marginTop:5}}>Each line = monthly incident count per risk type · Gaps = no incident that month · Use brush to zoom</div>
  </div>);
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function App(){
  const [sraReview,setSraReview]=useState({});
  const [sraApplied,setSraApplied]=useState({});
  const [natData,setNatData]=useState(null);
  const [data,setData]=useState(BASE);
  // Load real data from pipeline JSON if available
  useEffect(()=>{
    fetch('/security_data.json')
      .then(r=>{ if(!r.ok) throw new Error('No pipeline data yet'); return r.json(); })
      .then(d=>{
        if(d.incidents && Array.isArray(d.incidents) && d.incidents.length>0){
          const pipelineIds = new Set(d.incidents.map(i=>i.id));
          const existing = BASE.filter(i=>!pipelineIds.has(i.id));
          setData([...existing, ...d.incidents]);
        }
        if(d.sra_updates && Array.isArray(d.sra_updates) && d.sra_updates.length>0){
          const reviewMap={};
          d.sra_updates.forEach(u=>{
            reviewMap[u.risk_id]={
              natScore: u.suggested_score||0,
              reason: u.justification||`Pipeline suggestion — trend: ${u.trend}`,
              oblScores: u.suggested_oblast_scores||{}
            };
          });
          setSraReview(reviewMap);
        }
      })
      .catch(()=>{ console.log('Using existing data'); });

    // Load national summary
    fetch('/national_summary.json')
      .then(r=>{ if(!r.ok) throw new Error(); return r.json(); })
      .then(d=>{ if(d.ukraine_totals) setNatData(d); })
      .catch(()=>{});
  },[]);
  const [tab,setTab]=useState("overview");
  const fileRef=useRef(null);
  const [ps,setPs]=useState({y:2025,m:12});
  const [pe,setPe]=useState({y:2026,m:3});
  const [oblF,setOblF]=useState([...OBLS]);
  const [sevF,setSevF]=useState(["CRITICAL","HIGH","MEDIUM","LOW"]);
  const [icrcF,setIcrcF]=useState(["CRITICAL","RELEVANT","NON-RELEVANT"]);
  const [statF,setStatF]=useState(["VERIFIED","DEMO"]);
  const [srtC,setSrtC]=useState("date_exacte");
  const [srtD,setSrtD]=useState("desc");
  const [pg,setPg]=useState(0);
  const [srch,setSrch]=useState("");
  const [addM,setAddM]=useState(false);
  const [descM,setDescM]=useState(null);
  const [riskM,setRiskM]=useState(null);
  const [toast,setToast]=useState(null);
  const [rmF,setRmF]=useState("ALL");
  const [rmSrt,setRmSrt]=useState("comp");
  const [rmGap,setRmGap]=useState(0);
  const [rmSec,setRmSec]=useState("ALL");
  const [method,setMethod]=useState("c70");
  const [focObl,setFocObl]=useState(null);
  const [newI,setNewI]=useState({date_exacte:"",mois:1,annee:2026,oblast:"Sumy",raion:"",hromada:"",risk_id:"1.1.2",cible:"Residential (civilian)",morts:0,blesses:0,severite:"HIGH",icrc:"RELEVANT",description:"",source:""});
  const PGS=25;

  const showT=useCallback((msg,tp="ok")=>{setToast({msg,tp});setTimeout(()=>setToast(null),4000);},[]);

  const prior=useMemo(()=>{
    const dur=(pe.y-ps.y)*12+(pe.m-ps.m)+1;
    let eY=ps.y,eM=ps.m-1;if(eM<=0){eM+=12;eY--;}
    let sY=eY,sM=eM-dur+1;while(sM<=0){sM+=12;sY--;}
    return{s:sY*100+sM,e:eY*100+eM,sl:fmy(sM,sY),el:fmy(eM,eY),cnt:data.filter(i=>{const d=i.annee*100+i.mois;return d>=sY*100+sM&&d<=eY*100+eM&&oblF.includes(i.oblast);}).length};
  },[data,ps,pe,oblF]);

  const filt=useMemo(()=>data.filter(i=>{
    const d=i.annee*100+i.mois;
    return d>=ps.y*100+ps.m&&d<=pe.y*100+pe.m&&oblF.includes(i.oblast)&&sevF.includes(i.severite)&&icrcF.includes(i.icrc)&&statF.includes(i.statut);
  }),[data,ps,pe,oblF,sevF,icrcF,statF]);

  const rm=useMemo(()=>computeRM(data,ps,pe,prior,method,focObl,oblF),[data,ps,pe,prior,method,focObl,oblF]);
  const alerts=useMemo(()=>rm.filter(r=>r.typeA||r.typeD),[rm]);
  const trigD=useMemo(()=>rm.filter(r=>r.typeD),[rm]);
  const trigA=useMemo(()=>rm.filter(r=>r.typeA),[rm]);

  const rmRows=useMemo(()=>{
    let rows=[...rm];
    if(rmSec!=="ALL")rows=rows.filter(r=>r.section===rmSec);
    if(rmF==="ALERTS")rows=rows.filter(r=>r.typeA||r.typeD);
    else if(rmF==="HIGH")rows=rows.filter(r=>r.score>=9);
    else if(rmF==="OBS")rows=rows.filter(r=>r.hasS);
    if(rmGap>0)rows=rows.filter(r=>focObl&&OBL_OVR[r.id]?.[focObl]?(OBL_OVR[r.id][focObl]-r.score)>=rmGap:false);
    if(rmSrt==="comp")rows.sort((a,b)=>b.comp-a.comp);
    else if(rmSrt==="sra")rows.sort((a,b)=>b.score-a.score);
    else if(rmSrt==="div")rows.sort((a,b)=>b.div-a.div);
    else if(rmSrt==="cnt")rows.sort((a,b)=>b.cnt-a.cnt);
    return rows;
  },[rm,rmF,rmGap,rmSec,rmSrt,focObl]);

  const kpi=useMemo(()=>{
    const tot=filt.length,mo=filt.reduce((s,i)=>s+i.morts,0),bl=filt.reduce((s,i)=>s+i.blesses,0),cr=filt.filter(i=>i.icrc==="CRITICAL").length;
    const ob={},rk={};filt.forEach(i=>{ob[i.oblast]=(ob[i.oblast]||0)+1;rk[i.risk_id]=(rk[i.risk_id]||0)+1;});
    const tO=Object.entries(ob).sort((a,b)=>b[1]-a[1])[0];
    const tR=Object.entries(rk).sort((a,b)=>b[1]-a[1])[0];
    return{tot,mo,bl,cr,tO,tRd:tR?SRA_DATA.find(r=>r.id===tR[0]):null,pc:prior.cnt>0?Math.round(((tot-prior.cnt)/prior.cnt)*100):null};
  },[filt,prior]);

  // National extrapolation KPI (ACLED-based: 4 zones ≈ 15% of Ukraine)
  const natKpi=useMemo(()=>{
    const pStart=ps.y*100+ps.m, pEnd=pe.y*100+pe.m;
    const natFilt=ALL_NATIONAL.filter(i=>{const d=i.annee*100+i.mois;return d>=pStart&&d<=pEnd;});
    const byObl={};
    natFilt.forEach(i=>{byObl[i.oblast]=(byObl[i.oblast]||0)+1;});
    const top=Object.entries(byObl).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return{
      total:natFilt.length,
      killed:natFilt.reduce((s,i)=>s+i.morts,0),
      wounded:natFilt.reduce((s,i)=>s+i.blesses,0),
      top4share:filt.length>0?((filt.length/Math.max(1,natFilt.length))*100).toFixed(1):null,
      topObl:top,
    };
  },[ALL_NATIONAL,ps,pe,filt]);

  const tl=useMemo(()=>{const m={};filt.forEach(i=>{const k=`${i.annee}-${String(i.mois).padStart(2,"0")}`;if(!m[k])m[k]={k,lbl:fmy(i.mois,i.annee),Sumy:0,"Kyiv City":0,"Kyiv Oblast":0,Chernihiv:0};m[k][i.oblast]=(m[k][i.oblast]||0)+1;});return Object.values(m).sort((a,b)=>a.k.localeCompare(b.k));},[filt]);
  const rkC=useMemo(()=>{const m={};filt.forEach(i=>{if(!m[i.risk_id])m[i.risk_id]={id:i.risk_id,nom:SRA_DATA.find(r=>r.id===i.risk_id)?.nom||i.risk_id,cnt:0,ms:"LOW"};m[i.risk_id].cnt++;const sv={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};if(sv[i.severite]>sv[m[i.risk_id].ms])m[i.risk_id].ms=i.severite;});return Object.values(m).sort((a,b)=>b.cnt-a.cnt).map(r=>({...r,pct:((r.cnt/(filt.length||1))*100).toFixed(1)}));},[filt]);
  const cib=useMemo(()=>{const m={};filt.forEach(i=>{m[i.cible]=(m[i.cible]||0)+1;});const s=Object.entries(m).sort((a,b)=>b[1]-a[1]),tot=filt.length||1;const top=s.slice(0,11).map(([n,v])=>({name:n.length>20?n.slice(0,18)+"…":n,full:n,value:v,pct:((v/tot)*100).toFixed(1)}));if(s.length>11)top.push({name:"Other",full:"Other",value:s.slice(11).reduce((a,e)=>a+e[1],0),pct:(s.slice(11).reduce((a,e)=>a+e[1],0)/tot*100).toFixed(1)});return top;},[filt]);
  const cas=useMemo(()=>{const m={};filt.forEach(i=>{const k=`${i.annee}-${String(i.mois).padStart(2,"0")}`;if(!m[k])m[k]={k,lbl:fmy(i.mois,i.annee),killed:0,wounded:0};m[k].killed+=i.morts;m[k].wounded+=i.blesses;});return Object.values(m).sort((a,b)=>a.k.localeCompare(b.k));},[filt]);
  const hms=useMemo(()=>{const m=[];let y=2022,mo=2;while(y<2026||(y===2026&&mo<=3)){m.push({y,mo,k:`${y}-${String(mo).padStart(2,"0")}`});mo++;if(mo>12){mo=1;y++;}}return m;},[]);
  const hm=useMemo(()=>{const m={};filt.forEach(i=>{const k=`${i.annee}-${String(i.mois).padStart(2,"0")}_${i.oblast}`;m[k]=(m[k]||0)+1;});return{map:m,max:Math.max(1,...Object.values(m))};},[filt]);
  const hmC=(v,mx)=>!v?"transparent":v/mx<0.15?"#fecaca":v/mx<0.35?"#f87171":v/mx<0.60?"#ef4444":v/mx<0.80?"#b91c1c":"#7f1d1d";
  const hmT=(v,mx)=>!v?"#1e293b":v/mx<0.35?"#7f1d1d":"#fff";
  const oSt=useMemo(()=>{const m={};filt.forEach(i=>{if(!m[i.oblast])m[i.oblast]={t:0,mo:0,bl:0,cr:0};m[i.oblast].t++;m[i.oblast].mo+=i.morts;m[i.oblast].bl+=i.blesses;if(i.icrc==="CRITICAL")m[i.oblast].cr++;});return m;},[filt]);

  const tblD=useMemo(()=>{
    let d=[...filt];
    if(srch.trim()){const s=srch.toLowerCase();d=d.filter(i=>(i.risk_id||"").toLowerCase().includes(s)||(i.oblast||"").toLowerCase().includes(s)||(i.hromada||"").toLowerCase().includes(s)||(i.cible||"").toLowerCase().includes(s)||(i.description||"").toLowerCase().includes(s));}
    const fn={date_exacte:i=>i.annee*10000+i.mois*100,morts:i=>i.morts,blesses:i=>i.blesses,severite:i=>({CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[i.severite])}[srtC]||(i=>i[srtC]||"");
    d.sort((a,b)=>{const av=fn(a),bv=fn(b);return av<bv?(srtD==="asc"?-1:1):av>bv?(srtD==="asc"?1:-1):0;});
    return d;
  },[filt,srch,srtC,srtD]);
  const pgD=useMemo(()=>tblD.slice(pg*PGS,(pg+1)*PGS),[tblD,pg]);
  const totP=Math.ceil(tblD.length/PGS);
  const doS=c=>{if(srtC===c)setSrtD(d=>d==="asc"?"desc":"asc");else{setSrtC(c);setSrtD("desc");}setPg(0);};
  const reset=()=>{setPs({y:2022,m:2});setPe({y:2026,m:3});setOblF([...OBLS]);setSevF(["CRITICAL","HIGH","MEDIUM","LOW"]);setIcrcF(["CRITICAL","RELEVANT","NON-RELEVANT"]);setStatF(["VERIFIED","DEMO"]);setSrch("");setPg(0);};
  const preset=n=>{const now={y:2026,m:3};let sm=now.m-n,sy=now.y;while(sm<=0){sm+=12;sy--;}setPs({y:sy,m:sm});setPe(now);setPg(0);};
  const impF=useCallback((e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const imp=JSON.parse(ev.target.result);if(!Array.isArray(imp))throw new Error("Must be array");const ex=new Set(data.map(i=>i.id));const nw=imp.filter(i=>i.id&&!ex.has(i.id));nw.length?setData(p=>[...p,...nw]):showT("No new incidents","warn");if(nw.length)showT(`+${nw.length} imported`);}catch(err){showT(`Error: ${err.message}`,"err");}e.target.value="";};r.readAsText(f);},[data,showT]);
  const expCSV=()=>{const h=["id","date_exacte","oblast","hromada","risk_id","cible","morts","blesses","severite","icrc","statut"];const rows=[h.join(","),...filt.map(i=>h.map(k=>i[k]||"").join(","))];const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/csv"}));a.download=`UA_Security_${new Date().toISOString().slice(0,10)}.csv`;a.click();showT("CSV exported");};
  const addI=()=>{setData(p=>[...p,{...newI,id:`${newI.annee}-M${Date.now().toString().slice(-5)}`,risk_nom:SRA_DATA.find(r=>r.id===newI.risk_id)?.nom||newI.risk_id,humanitaires:false,enfants:false,statut:"VERIFIED"}]);setAddM(false);showT("Incident added");};

  // Style helpers
  // ── BRIDGITAL BRAND PALETTE ──
  const BR={
    tealDark:"#124E49",teal:"#1A6B65",tealLight:"#2A8F87",tealPale:"#E8F4F3",
    gold:"#C9A84C",charcoal:"#1C2B2A",mid:"#4A6361",white:"#FAFAF8",grey:"#F2F4F3",text:"#2C3E3D",
    // Functional severity (kept for safety/ops readability)
    critical:"#c0392b",high:"#d4621a",medium:"#b8860b",low:"#4A6361",
  };
  const S={
    wrap:{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:BR.charcoal,minHeight:"100vh",color:BR.white},
    hdr:{background:`linear-gradient(135deg,${BR.tealDark} 0%,#0d2e2b 100%)`,borderBottom:`1px solid ${BR.teal}44`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:60},
    tabs:{background:"#0f1e1d",borderBottom:`1px solid ${BR.teal}33`,padding:"0 22px",display:"flex",position:"sticky",top:90,zIndex:55,overflowX:"auto"},
    tab:(a,w)=>({padding:"12px 20px",color:a?BR.white:w?BR.gold:`${BR.white}66`,background:"transparent",border:"none",borderBottom:a?`2px solid ${BR.gold}`:"2px solid transparent",cursor:"pointer",fontSize:12,fontWeight:a?600:400,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.04em",textTransform:"uppercase"}),
    fbar:{background:"#0f1e1d",borderBottom:`1px solid ${BR.teal}33`,padding:"8px 22px",position:"sticky",top:136,zIndex:50},
    btn:(a,c)=>({padding:"4px 10px",background:a?c+"22":"transparent",border:`1px solid ${a?c:BR.teal+"44"}`,color:a?c:`${BR.white}55`,borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:a?600:400,letterSpacing:"0.03em"}),
    card:{background:"#1A3E3A",border:`1px solid ${BR.teal}66`,borderRadius:8,padding:"13px 15px"},
    sec:{background:"#0f1e1d",border:`1px solid ${BR.teal}33`,borderRadius:8,padding:"16px"},
    st:{color:BR.gold,fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6},
    inp:{background:BR.charcoal,border:`1px solid ${BR.teal}55`,color:BR.white,borderRadius:4,padding:"5px 8px",fontSize:11,fontFamily:"'DM Sans',sans-serif",width:"100%",boxSizing:"border-box"},
  };
  // Section title with gold line (Bridgital label pattern)
  const SBar=({v,max=16,c=BR.critical,h=5})=>(<div style={{background:`${BR.teal}22`,borderRadius:2,height:h,flex:1,minWidth:30}}><div style={{background:c,width:`${Math.min(100,(v/max)*100)}%`,height:"100%",borderRadius:2}}/></div>);
  // Severity colors using Bridgital-adapted palette
  const CCb=c=>c>=13?BR.critical:c>=9?BR.high:c>=6?BR.medium:BR.low;

  const TDEF=[
    {id:"overview",ico:"◉",lbl:"Overview"},
    {id:"analytics",ico:"◎",lbl:"Analytics"},
    {id:"sra",ico:"◇",lbl:"SRA Matrix"},
    {id:"triggers",ico:"⚑",lbl:`Triggers${alerts.length>0?` (${alerts.length})`:""}`,warn:alerts.length>0},
    {id:"review",ico:"✎",lbl:`SRA Review${Object.keys(sraReview).length>0?` (${Object.keys(sraReview).length})`:""}`,warn:Object.keys(sraReview).length>0},
    {id:"exec",ico:"◆",lbl:"Executive Brief"},
    {id:"log",ico:"▤",lbl:"Incident Log"},
  ];

  return(<div style={S.wrap}>
    <div style={S.hdr}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{background:BR.gold,color:BR.charcoal,fontWeight:900,fontSize:10,letterSpacing:"0.15em",padding:"3px 8px",borderRadius:3,fontFamily:"'DM Sans',sans-serif"}}>BRIDGITAL</div><div style={{width:28,height:28,borderRadius:"50%",background:BR.teal,border:`2px solid ${BR.gold}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:BR.gold,fontSize:11,fontWeight:900,fontFamily:"'DM Sans',sans-serif"}}>B</span></div></div>
        <div>
          <div style={{color:BR.white,fontSize:15,fontWeight:300,fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.04em"}}>Ukraine Conflict Monitor</div>
          <div style={{color:`${BR.white}66`,fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.06em"}}>Humanitarian Security Tracking System · SRA {SRA_V}</div>
        </div>
      </div>
      <div style={{color:alerts.length>0?BR.gold:`${BR.white}44`,fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>{alerts.length>0?`⚑ ${alerts.length} active trigger${alerts.length>1?"s":""}  `:""}{data.length.toLocaleString()} records · <span style={{color:`${BR.white}33`}}>4 oblasts monitored</span></div>
    </div>

    {/* NATIONAL KPI BANNER */}
    <div style={{background:"#0d1e1d",borderBottom:"1px solid #1e293b",padding:"5px 22px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{color:BR.gold,fontSize:9,letterSpacing:"0.1em",fontWeight:700,flexShrink:0}}>🇺🇦 NATIONAL {natData?"REAL DATA":"EST."}</div>
      <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{color:"#E8F4F3",fontSize:10}}>Total incidents: <span style={{color:BR.white,fontWeight:700}}>{natData?natData.ukraine_totals.total_incidents.toLocaleString():natKpi.total.toLocaleString()}</span></span>
        <span style={{color:"#E8F4F3",fontSize:10}}>Killed: <span style={{color:"#f87171",fontWeight:700}}>{natData?natData.ukraine_totals.killed.toLocaleString():natKpi.killed.toLocaleString()}</span></span>
        <span style={{color:"#E8F4F3",fontSize:10}}>Wounded: <span style={{color:"#fb923c",fontWeight:700}}>{natData?natData.ukraine_totals.wounded.toLocaleString():natKpi.wounded.toLocaleString()}</span></span>
        {natData?(<div style={{display:"flex",gap:6,alignItems:"center"}}>
          {Object.entries(natData.by_oblast).filter(([,v])=>v.incidents>0).sort((a,b)=>b[1].incidents-a[1].incidents).slice(0,5).map(([o,v])=>(<span key={o} style={{fontSize:9,color:"#E8F4F3"}}>{o}: <span style={{color:BR.white,fontWeight:600}}>{v.incidents.toLocaleString()}</span></span>))}
        </div>):(<>
          <span style={{color:"#E8F4F3",fontSize:10}}>4-zone share: <span style={{color:BR.gold,fontWeight:700}}>{natKpi.top4share}%</span></span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {natKpi.topObl.map(([o,v])=>(<span key={o} style={{fontSize:9,color:"#E8F4F3"}}>{o}: <span style={{color:BR.white,fontWeight:600}}>{v.toLocaleString()}</span></span>))}
          </div>
        </>)}
      </div>
      <div style={{marginLeft:"auto",color:`${BR.white}55`,fontSize:9}}>{natData?`Source: ${natData.source_note} · As of ${natData.data_as_of}`:"ACLED-based extrapolation · 4 zones ≈ 15% of Ukraine events · Demo data"}</div>
    </div>

    <div style={S.tabs}>{TDEF.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={S.tab(tab===t.id,t.warn&&tab!==t.id)}>{t.ico} {t.lbl}</button>))}</div>

    <div style={S.fbar}>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
        <div style={{display:"flex",gap:3}}>{[["1M",1],["3M",3],["6M",6],["1Y",12],["2Y",24],["ALL",999]].map(([l,n])=>{const active=n===999?(ps.y===2022&&ps.m===2):(()=>{const now={y:2026,m:3};let sm=now.m-n,sy=now.y;while(sm<=0){sm+=12;sy--;}return ps.y===sy&&ps.m===sm&&pe.y===now.y&&pe.m===now.m;})();return(<button key={l} onClick={()=>n===999?reset():preset(n)} style={{...S.btn(active,BR.gold),fontSize:11}}>{l}</button>);})}</div>
        <div style={{width:1,height:15,background:"#1e293b"}}/>
        {OBLS.map(o=>(<button key={o} onClick={()=>{setOblF(p=>p.includes(o)?p.filter(x=>x!==o):[...p,o]);setPg(0);}} style={S.btn(oblF.includes(o),OC[o])}>{o}</button>))}
        <button onClick={()=>setStatF(p=>p.includes("DEMO")?["VERIFIED"]:["VERIFIED","DEMO"])} style={{...S.btn(statF.includes("DEMO"),"#22c55e"),marginLeft:3}}>{statF.includes("DEMO")?"ALL DATA":"VERIFIED ONLY"}</button>
        <button onClick={reset} style={{...S.btn(false,"#f43f5e"),color:"#f43f5e",border:"1px solid #f43f5e44",marginLeft:"auto"}}>↺ Reset</button>
      </div>
      <div style={{marginTop:4,color:"#E8F4F3",fontSize:10}}>{fmy(ps.m,ps.y)} → {fmy(pe.m,pe.y)} · <span style={{color:"#94a3b8",fontWeight:700}}>{filt.length}</span> incidents{kpi.pc!==null&&<span style={{color:kpi.pc>0?"#f43f5e":"#34d399",marginLeft:8}}>{kpi.pc>0?"▲":"▼"}{Math.abs(kpi.pc)}% vs {prior.sl}–{prior.el}</span>}</div>
    </div>

    {/* OVERVIEW */}
    {tab==="overview"&&(<div style={{padding:"16px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:14}}>
        {[{l:"INCIDENTS",v:kpi.tot,c:"#e2e8f0"},{l:"KILLED",v:kpi.mo,c:"#f43f5e"},{l:"WOUNDED",v:kpi.bl,c:"#fb923c"},{l:"CRITICAL",v:kpi.cr,c:"#f43f5e"},{l:"MOST AFFECTED",v:kpi.tO?kpi.tO[0]:"-",c:kpi.tO?OC[kpi.tO[0]]:"#64748b",sm:1,sb:kpi.tO?`${kpi.tO[1]} incidents`:null},{l:"DOMINANT TYPE",v:kpi.tRd?kpi.tRd.id:"-",c:"#fbbf24",sm:1,sb:kpi.tRd?.nom}].map((k,i)=>(
          <div key={i} style={S.card}><div style={{color:"#C9A84C",fontSize:9,letterSpacing:"0.12em",marginBottom:6,fontWeight:700}}>{k.l}</div><div style={{color:k.c,fontSize:k.sm?16:26,fontWeight:900,lineHeight:1}}>{k.v}</div>{k.sb&&<div style={{color:"#E8F4F3",fontSize:10,marginTop:4,lineHeight:1.3}}>{k.sb}</div>}</div>
        ))}
      </div>
      <div style={{...S.sec,marginBottom:12}}>
        <div style={S.st}>Monthly Incident Timeline — by Oblast</div>
        <ResponsiveContainer width="100%" height={200}><AreaChart data={tl} margin={{top:2,right:14,bottom:2,left:0}}>
          <defs>{Object.entries(OC).map(([k,c])=>(<linearGradient key={k} id={`g${k.replace(/\s/g,"_")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.5}/><stop offset="95%" stopColor={c} stopOpacity={0.02}/></linearGradient>))}</defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A6B6533"/><XAxis dataKey="lbl" tick={{fill:"#4A6361",fontSize:9}} interval={3}/><YAxis tick={{fill:"#4A6361",fontSize:9}}/><Tooltip contentStyle={{background:"#124E49",border:"1px solid #1A6B65",fontSize:10,borderRadius:6}}/><Legend wrapperStyle={{fontSize:10}}/>
          {OBLS.map(o=>(<Area key={o} type="monotone" dataKey={o} stackId="1" stroke={OC[o]} fill={`url(#g${o.replace(/\s/g,"_")})`} strokeWidth={1.5}/>))}
          <Brush dataKey="lbl" height={13} stroke="#124E49" fill="#0d1e1d"/>
        </AreaChart></ResponsiveContainer>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={S.sec}>
          <div style={S.st}>Top 10 Incident Types</div>
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",left:0,top:2,width:170,display:"flex",flexDirection:"column",pointerEvents:"none",zIndex:1}}>
              {rkC.slice(0,10).map(r=>(<div key={r.id} style={{height:24,display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:1,background:SC[r.ms],flexShrink:0}}/><span style={{fontSize:9,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.id} — {r.nom}</span></div>))}
            </div>
            <ResponsiveContainer width="100%" height={245}><BarChart data={rkC.slice(0,10)} layout="vertical" margin={{top:0,right:40,bottom:0,left:170}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A6B6533" horizontal={false}/><XAxis type="number" tick={{fill:"#4A6361",fontSize:9}}/><YAxis dataKey="id" type="category" tick={false} width={0}/>
              <Tooltip contentStyle={{background:"#124E49",border:"1px solid #1A6B65",fontSize:10}} formatter={(v,n,p)=>[`${v} (${p.payload.pct}%)`,p.payload.nom]}/>
              <Bar dataKey="cnt" radius={[0,3,3,0]}>{rkC.slice(0,10).map((r,i)=>(<Cell key={i} fill={SC[r.ms]} fillOpacity={0.8}/>))}</Bar>
            </BarChart></ResponsiveContainer>
          </div>
        </div>
        <div style={S.sec}>
          <div style={S.st}>Target Categories</div>
          <ResponsiveContainer width="100%" height={245}><PieChart>
            <Pie data={cib} cx="40%" cy="50%" innerRadius={42} outerRadius={80} paddingAngle={2} dataKey="value">{cib.map((_,i)=>(<Cell key={i} fill={PP[i%PP.length]}/>))}</Pie>
            <Tooltip contentStyle={{background:"#124E49",border:"1px solid #1A6B65",fontSize:10}} formatter={(v,n,p)=>[`${v} (${p.payload?.pct}%)`,p.payload?.full||n]}/>
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize:9,width:"54%"}} formatter={(v,e)=><span style={{color:"#64748b"}}>{v} ({e.payload?.pct}%)</span>}/>
          </PieChart></ResponsiveContainer>
        </div>
      </div>
    </div>)}

    {/* ANALYTICS */}
    {tab==="analytics"&&(<div style={{padding:"16px 22px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={S.sec}><div style={S.st}>Casualties Over Time</div>
          <ResponsiveContainer width="100%" height={200}><LineChart data={cas} margin={{top:2,right:14,bottom:2,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A6B6533"/><XAxis dataKey="lbl" tick={{fill:"#4A6361",fontSize:9}} interval={4}/><YAxis yAxisId="l" tick={{fill:"#4A6361",fontSize:9}}/><YAxis yAxisId="r" orientation="right" tick={{fill:"#4A6361",fontSize:9}}/><Tooltip contentStyle={{background:"#124E49",border:"1px solid #1A6B65",fontSize:10}}/><Legend wrapperStyle={{fontSize:10}}/>
            <Line yAxisId="l" type="monotone" dataKey="killed" stroke="#f43f5e" strokeWidth={2} dot={false}/><Line yAxisId="r" type="monotone" dataKey="wounded" stroke="#fb923c" strokeWidth={2} dot={false}/>
          </LineChart></ResponsiveContainer>
        </div>
        <div style={S.sec}><div style={S.st}>Oblast Breakdown</div>
          {OBLS.map(o=>{const d=oSt[o]||{t:0,mo:0,bl:0,cr:0};const pct=filt.length>0?Math.round(d.t/filt.length*100):0;return(<div key={o} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:OC[o],fontWeight:700,fontSize:12}}>{o}</span><span style={{color:"#e2e8f0",fontWeight:700}}>{d.t} <span style={{color:"#475569",fontSize:10,fontWeight:400}}>incidents</span></span></div>
            <div style={{background:"#0d1e1d",borderRadius:2,height:4,marginBottom:4}}><div style={{background:OC[o],width:`${pct}%`,height:"100%",borderRadius:2}}/></div>
            <div style={{display:"flex",gap:10,fontSize:10}}><span style={{color:"#f43f5e"}}>K:{d.mo}</span><span style={{color:"#fb923c"}}>W:{d.bl}</span><span style={{color:"#f43f5e"}}>Crit:{d.cr}</span></div>
          </div>);})}
        </div>
      </div>
      <div style={S.sec}>
        <div style={S.st}>Intensity Heatmap — Oblast × Month</div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          {[["0","#1e293b"],["1–5","#fecaca"],["6–12","#f87171"],["13–20","#ef4444"],["21–30","#b91c1c"],["30+","#7f1d1d"]].map(([l,c])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:11,height:11,background:c,borderRadius:2,border:"1px solid #1e293b"}}/><span style={{color:"#475569",fontSize:9}}>{l}</span></div>))}
          <span style={{color:"#334155",fontSize:9,marginLeft:8}}>Hover cell for details.</span>
        </div>
        <div style={{overflowX:"auto"}}><table style={{borderCollapse:"separate",borderSpacing:2,fontSize:9}}>
          <thead><tr><th style={{color:"#334155",padding:"2px 5px",textAlign:"left",minWidth:65}}>Oblast</th>
            {hms.filter((_,i)=>i%3===0).map(({y,mo,k})=>(<th key={k} style={{color:"#334155",padding:"1px 2px",textAlign:"center",minWidth:18,fontSize:8}}>{MN[mo]}<br/>{y.toString().slice(2)}</th>))}
          </tr></thead>
          <tbody>{OBLS.map(o=>(<tr key={o}>
            <td style={{color:OC[o],padding:"1px 5px",fontWeight:700,fontSize:9,whiteSpace:"nowrap"}}>{o==="Kyiv Oblast"?"Kyiv Obl.":o==="Kyiv City"?"Kyiv City":o}</td>
            {hms.filter((_,i)=>i%3===0).map(({y,mo,k})=>{const v=hm.map[`${k}_${o}`]||0;return(<td key={k} title={`${o} ${MN[mo]} ${y}: ${v}`} style={{background:hmC(v,hm.max),borderRadius:2,textAlign:"center",color:hmT(v,hm.max),minWidth:18,height:15,fontSize:8,fontWeight:700}}>{v||"·"}</td>);})}
          </tr>))}</tbody>
        </table></div>
      </div>
      <div style={{...S.sec,marginTop:12}}>
        <div style={S.st}>Top 6 Incident Types — Monthly Evolution</div>
        <TopRiskChart filt={filt} rkC={rkC}/>
      </div>
    </div>)}

    {/* SRA MATRIX */}
    {tab==="sra"&&(<div style={{padding:"16px 22px 80px"}}>
      <div style={{...S.sec,marginBottom:12}}>
        <div style={S.st}>Score Calculation Method</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {METHODS.map(m=>(<div key={m.id} onClick={()=>setMethod(m.id)} style={{background:method===m.id?"#1a3560":"#060d1a",border:`1px solid ${method===m.id?"#3b82f6":"#1e293b"}`,borderRadius:6,padding:"9px 11px",cursor:"pointer"}}>
            <div style={{color:method===m.id?"#60a5fa":"#94a3b8",fontWeight:700,fontSize:11,marginBottom:3}}>{m.label}</div>
            <div style={{color:"#475569",fontSize:10,lineHeight:1.4}}>{m.desc}</div>
          </div>))}
        </div>
        <div style={{background:"#0d1e1d",borderRadius:5,padding:"8px 12px",fontSize:10,color:"#475569"}}>
          <span style={{color:"#60a5fa",fontFamily:"monospace"}}>
            {method==="official"&&"Composite = SRA_Score (L×I) · Divergence flagged only"}
            {method==="c70"&&"Composite = 0.70 × SRA_Score + 0.30 × Signal_Incidents · Signal = Σ(sev_weight × count) / max_weighted × 16"}
            {method==="c50"&&"Composite = 0.50 × SRA_Score + 0.50 × Signal_Incidents · Signal normalised 0–16"}
            {method==="dyn"&&"Composite = 0.65 × SRA_Score + 0.35 × Signal · Recent incidents (≤30 days) boosted ×1.5"}
          </span>
          <span style={{marginLeft:12}}>Severity weights: CRITICAL=4 · HIGH=3 · MEDIUM=2 · LOW=1</span>
        </div>
        <div style={{background:"#1a0a0a",border:"1px solid #f43f5e22",borderRadius:5,padding:"9px 12px",marginTop:8}}>
          <div style={{color:"#f43f5e",fontSize:9,fontWeight:600,marginBottom:3}}>⚑ NATIONAL vs FRONT-LINE CONTEXT</div>
          <div style={{color:"#94a3b8",fontSize:10,lineHeight:1.5}}>The SRA national score represents an average across all monitored oblasts. At the front line (Sumy North, border Chernihiv), key conflict risks are significantly higher. Use the <strong style={{color:"#60a5fa"}}>Oblast Focus</strong> below to view override scores where available — these reflect the real local risk exposure.</div>
          <div style={{display:"flex",gap:5,marginTop:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:"#475569",fontSize:9}}>Focus:</span>
            {[null,...OBLS].map(o=>(<button key={o||"nat"} onClick={()=>setFocObl(o)} style={{...S.btn(focObl===o,o?OC[o]:"#64748b"),fontSize:9}}>{o||"National"}</button>))}
          </div>
          {focObl&&<div style={{color:"#fb923c",fontSize:9,marginTop:4}}>Showing <strong>{focObl}</strong> — front-line overrides applied where available. Items without specific overrides retain national score.</div>}
        </div>
      </div>

      <div style={{...S.sec,marginBottom:12}}>
        <div style={S.st}>SRA Score System — L×I Matrix (UNDSS SRMM Framework)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div>
            <div style={{color:"#475569",fontSize:10,marginBottom:7,fontWeight:600}}>SCORE CALCULATION: Likelihood × Impact</div>
            <div style={{display:"grid",gridTemplateColumns:"auto auto auto auto auto",gap:2,fontSize:9,textAlign:"center",marginBottom:8}}>
              <div/>
              {["L=1 Low","L=2 Med","L=3 High","L=4 V.High"].map(h=>(<div key={h} style={{color:"#475569",padding:"2px 3px",fontSize:8}}>{h}</div>))}
              {[["I=1 Low",1],["I=2 Med",2],["I=3 High",3],["I=4 Crit",4]].map(([il,iv])=>(
                [<div key={il} style={{color:"#475569",padding:"2px 4px",textAlign:"right",fontSize:8}}>{il}</div>,
                ...[1,2,3,4].map(lv=>{const sc=lv*iv;return(<div key={`${lv}${iv}`} style={{background:CC(sc)+"22",border:`1px solid ${CC(sc)}44`,borderRadius:3,padding:"2px 5px",color:CC(sc),fontWeight:700}}>{sc}</div>);})]
              ))}
            </div>
            <div style={{color:"#334155",fontSize:9,lineHeight:1.5}}>Score = Likelihood (1–4) × Impact (1–4). Max = 16. The national SRA calibrates risk across all 4 oblasts — it is the analytical consensus, not the worst-case local reading.</div>
          </div>
          <div>
            <div style={{color:"#475569",fontSize:10,marginBottom:7,fontWeight:600}}>SCORE BANDS & RESPONSE LEVEL</div>
            {[["12–16","Critical","Very High/Critical L × Critical/High I. Immediate action required. Possible mission suspension.","#f43f5e"],["9–11","High","High L and/or High I. Active mitigation measures mandatory. Senior management aware.","#fb923c"],["6–8","Medium","Moderate risk. Standard SOPs apply. Monitoring and periodic review.","#fbbf24"],["1–5","Low","Background risk. General awareness and basic protocols sufficient.","#64748b"]].map(([r,l,d,c])=>(<div key={l} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}><div style={{background:c+"22",border:`1px solid ${c}44`,borderRadius:3,padding:"2px 7px",color:c,fontWeight:700,fontSize:10,flexShrink:0,minWidth:38,textAlign:"center"}}>{r}</div><div><div style={{color:c,fontSize:10,fontWeight:700,marginBottom:1}}>{l}</div><div style={{color:"#475569",fontSize:9,lineHeight:1.4}}>{d}</div></div></div>))}
          </div>
        </div>
      </div>

      <div style={S.sec}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,flexWrap:"wrap",gap:7}}>
          <div style={{...S.st,marginBottom:0}}>RISK MATRIX — {rmRows.length} risks{focObl?` · ${focObl} view`:""}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {[["ALL","All"],["ALERTS","Alerts"],["HIGH","≥9"],["OBS","Observed"]].map(([v,l])=>(<button key={v} onClick={()=>setRmF(v)} style={S.btn(rmF===v,"#60a5fa")}>{l}</button>))}
            {focObl&&(<>
              <div style={{width:1,height:13,background:"#1e293b"}}/>
              <span style={{color:"#334155",fontSize:9}}>Écart local vs national:</span>
              {[[0,"Tous"],[2,"≥+2"],[4,"≥+4"],[6,"≥+6"]].map(([v,l])=>(<button key={v} onClick={()=>setRmGap(v)} style={S.btn(rmGap===v,"#f43f5e")}>{l}</button>))}
            </>)}
            <div style={{width:1,height:13,background:"#1e293b"}}/>
            {[["comp","Composite"],["sra","SRA"],["div","Δ Div"],["cnt","Obs"]].map(([v,l])=>(<button key={v} onClick={()=>setRmSrt(v)} style={S.btn(rmSrt===v,"#a78bfa")}>{l}↓</button>))}
          </div>
        </div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:9}}>
          {["ALL","1—CONFLICT","2—CRIME","3—OPERATIONAL","4—ENVIRONMENT","5—HEALTH","6—SOCIOPOLITICAL"].map(s=>(<button key={s} onClick={()=>setRmSec(s)} style={{...S.btn(rmSec===s,"#334155"),fontSize:9,padding:"2px 7px"}}>{s==="ALL"?"All":s.split("—")[1]}</button>))}
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{borderBottom:"2px solid #1e293b"}}>
            {[["ID",55],["Risk",180],["SRA (Nat.)",70],["L×I",85],["Oblast",80],["Obs.",60],["Composite",80],["Δ",62],["Trend",92],["",28]].map(([h,w])=>(<th key={h} style={{padding:"5px 7px",textAlign:"left",color:"#334155",fontSize:9,width:w,whiteSpace:"nowrap"}}>{h}</th>))}
          </tr></thead>
          <tbody>{rmRows.map(r=>{
            const bg=r.typeD?"#2d0a0a":r.typeA?"#1a0f05":"transparent";
            return(<tr key={r.id} style={{borderBottom:"1px solid #0a1628",background:bg,cursor:"pointer"}}
              onClick={()=>setRiskM(r)}
              onMouseEnter={e=>e.currentTarget.style.background=r.typeD?"#3d1010":r.typeA?"#251507":"#0f1f3d"}
              onMouseLeave={e=>e.currentTarget.style.background=bg}>
              <td style={{padding:"5px 7px"}}>
                <div style={{display:"flex",gap:3,alignItems:"center"}}>
                  {r.typeD&&<span style={{color:"#f43f5e",fontSize:9,fontWeight:700}}>D</span>}
                  {r.typeA&&!r.typeD&&<span style={{color:"#fb923c",fontSize:9,fontWeight:700}}>A</span>}
                  <span style={{color:"#475569",fontSize:10}}>{r.id}</span>
                </div>
              </td>
              <td style={{padding:"5px 7px",color:"#94a3b8",fontSize:10,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.nom}{r.perc&&<span style={{color:"#a78bfa",marginLeft:3,fontSize:9}}>⊕</span>}</td>
              <td style={{padding:"5px 7px"}}><div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{color:CC(r.score),fontWeight:700,fontSize:13,width:18}}>{r.score}</span><SBar v={r.score} c={CC(r.score)}/></div></td>
              <td style={{padding:"5px 7px",fontSize:9,color:"#64748b",whiteSpace:"nowrap"}}>{r.l}<span style={{color:"#334155",margin:"0 3px"}}>×</span><span style={{color:r.i==="Critical"?"#f43f5e":"#fb923c"}}>{r.i}</span></td>
              <td style={{padding:"5px 7px"}}>
                {focObl&&OBL_OVR[r.id]?.[focObl]?(
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    <span style={{color:CC(r.oblSc),fontWeight:700,fontSize:12,width:18}}>{r.oblSc}</span>
                    {r.oblSc>r.score&&<span style={{color:"#f43f5e",fontSize:8,fontWeight:700}}>▲+{r.oblSc-r.score}</span>}
                    {r.oblSc<r.score&&<span style={{color:"#34d399",fontSize:8}}>▼{r.oblSc-r.score}</span>}
                  </div>
                ):<span style={{color:"#1e293b",fontSize:9}}>—</span>}
              </td>
              <td style={{padding:"5px 7px",textAlign:"center"}}>{r.cnt>0?<span style={{color:"#60a5fa",fontWeight:700}}>{r.cnt}</span>:<span style={{color:"#1e3a5f"}}>—</span>}</td>
              <td style={{padding:"5px 7px"}}><div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{color:CC(r.comp),fontWeight:700,fontSize:13,width:24}}>{r.comp}</span><SBar v={r.comp} c={CC(r.comp)}/></div></td>
              <td style={{padding:"5px 7px",textAlign:"center"}}>{r.div>0?<span style={{color:"#f43f5e",fontWeight:700}}>▲+{r.div}</span>:r.div<0?<span style={{color:"#34d399"}}>▼{r.div}</span>:<span style={{color:"#1e293b"}}>—</span>}</td>
              <td style={{padding:"5px 7px"}}><span style={{background:TC[r.trend]+"22",color:TC[r.trend],fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:3,whiteSpace:"nowrap"}}>{TI[r.trend]}</span></td>
              <td style={{padding:"5px 7px",color:"#334155",fontSize:11}}>›</td>
            </tr>);
          })}</tbody>
        </table></div>
        <div style={{marginTop:7,color:"#334155",fontSize:9}}>Click row for detail · <strong style={{color:"#475569"}}>SRA (Nat.)</strong> = Ukraine-wide L×I score · <strong style={{color:"#475569"}}>Oblast</strong> = front-line override (where available) · A = Type A trigger · D = Type D trigger · ⊕ = perception risk</div>
      </div>
    </div>)}

    {/* TRIGGERS */}
    {tab==="triggers"&&(<div style={{padding:"16px 22px 80px"}}>
      <div style={{...S.sec,marginBottom:12}}>
        <div style={S.st}>Understanding Triggers — Purpose and Logic</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div>
            <div style={{color:"#e2e8f0",fontSize:12,fontWeight:700,marginBottom:7}}>Why triggers exist</div>
            <div style={{color:"#94a3b8",fontSize:11,lineHeight:1.6}}>
              The SRA is updated every 3–6 months through structured human analysis. Between revisions, incident data may reveal that a risk is escalating <em>before</em> the next formal review. Triggers automatically compare <strong style={{color:"#e2e8f0"}}>observed incident patterns</strong> against the <strong style={{color:"#e2e8f0"}}>current SRA baseline</strong> to surface these early warning situations.
            </div>
            <div style={{color:"#94a3b8",fontSize:11,lineHeight:1.6,marginTop:7}}>
              Triggers do <strong style={{color:"#f43f5e"}}>not</strong> modify the SRA or replace analytical judgment. They flag situations that warrant closer attention — each trigger should be reviewed by a security analyst before any action is taken.
            </div>
            <div style={{color:"#94a3b8",fontSize:11,lineHeight:1.6,marginTop:7}}>
              The <strong style={{color:"#fbbf24"}}>scoring method</strong> selected in the SRA Matrix affects when Type A triggers fire. Type D triggers are independent of the scoring method (based on raw incident counts only).
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{background:"#1a0f05",border:"1px solid #fb923c33",borderLeft:"3px solid #fb923c",borderRadius:6,padding:"11px 13px"}}>
              <div style={{color:"#fb923c",fontSize:11,fontWeight:700,marginBottom:4}}>⬦ TYPE A — Trend Divergence</div>
              <div style={{color:"#94a3b8",fontSize:10,lineHeight:1.5}}><strong style={{color:"#e2e8f0"}}>Condition:</strong> SRA trend is STABLE or IMPROVED, but the composite score diverges ≥ +1.5 from the SRA baseline, with at least 2 incidents observed in the period.<br/><strong style={{color:"#e2e8f0"}}>Meaning:</strong> Field data is running ahead of the formal assessment. The situation may be deteriorating faster than the SRA reflects. Increase monitoring and flag for next review cycle.</div>
            </div>
            <div style={{background:"#2d0a0a",border:"1px solid #f43f5e33",borderLeft:"3px solid #f43f5e",borderRadius:6,padding:"11px 13px"}}>
              <div style={{color:"#f43f5e",fontSize:11,fontWeight:700,marginBottom:4}}>⬥ TYPE D — Formal SRA Review Recommended</div>
              <div style={{color:"#94a3b8",fontSize:10,lineHeight:1.5}}><strong style={{color:"#e2e8f0"}}>Condition:</strong> Risk score ≥ 9 AND either: (a) incident frequency increased ≥ 30% vs prior period with ≥ 3 observations, or (b) ≥ 2 CRITICAL-severity incidents recorded in the period.<br/><strong style={{color:"#e2e8f0"}}>Meaning:</strong> Evidence threshold met for an out-of-cycle SRA review. The formal risk assessment may be out of date for this specific risk.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:12}}>
        {[{l:"TYPE A TRIGGERS",v:trigA.length,c:"#fb923c",d:"SRA stable but escalating"},{l:"TYPE D TRIGGERS",v:trigD.length,c:"#f43f5e",d:"Formal review recommended"},{l:"RISKS WITH DATA",v:rm.filter(r=>r.hasS).length,c:"#60a5fa",d:"Risk IDs observed in period"},{l:"SRA VERSION",v:SRA_V.split(" ")[0],c:"#94a3b8",d:`Last review: ${SRA_V}`}].map(k=>(<div key={k.l} style={S.card}><div style={{color:"#334155",fontSize:9,letterSpacing:"0.08em",marginBottom:4}}>{k.l}</div><div style={{color:k.c,fontSize:20,fontWeight:900,lineHeight:1}}>{k.v}</div><div style={{color:"#475569",fontSize:9,marginTop:2}}>{k.d}</div></div>))}
      </div>
      <div style={{...S.sec,marginBottom:12,padding:"10px 14px"}}>
        <div style={S.st}>TRIGGERS BY OBLAST — current period</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {oblF.map(o=>{
            const oblD=alerts.filter(r=>r.oblTriggers?.some(ot=>ot.typeD&&ot.oblast===o)).length;
            const oblA=alerts.filter(r=>r.oblTriggers?.some(ot=>ot.typeA&&!r.oblTriggers.some(x=>x.typeD&&x.oblast===o)&&ot.oblast===o)).length;
            return(<div key={o} style={{background:"#0d1e1d",border:`1px solid ${OC[o]}33`,borderLeft:`3px solid ${OC[o]}`,borderRadius:6,padding:"8px 10px"}}>
              <div style={{color:OC[o],fontWeight:700,fontSize:12,marginBottom:5}}>{o}</div>
              <div style={{display:"flex",gap:10}}>
                <div><div style={{color:"#f43f5e",fontSize:16,fontWeight:900,lineHeight:1}}>{oblD}</div><div style={{color:"#475569",fontSize:9}}>Type D</div></div>
                <div><div style={{color:"#fb923c",fontSize:16,fontWeight:900,lineHeight:1}}>{oblA}</div><div style={{color:"#475569",fontSize:9}}>Type A</div></div>
                {oblD===0&&oblA===0&&<div style={{color:"#1e3a5f",fontSize:10,alignSelf:"center"}}>No triggers</div>}
              </div>
            </div>);
          })}
        </div>
      </div>

      {trigD.length>0&&(<div style={{marginBottom:12}}>
        <div style={{color:"#f43f5e",fontSize:10,fontWeight:700,letterSpacing:"0.08em",marginBottom:9}}>⬥ TYPE D — FORMAL SRA REVIEW RECOMMENDED ({trigD.length})</div>
        {trigD.map(r=>{const rec=TRECS[r.id]||TRECS["default"];const jus=SRA_J[r.id];return(<div key={r.id} style={{background:"#0c1408",border:"1px solid #f43f5e44",borderLeft:"3px solid #f43f5e",borderRadius:8,padding:"15px 17px",marginBottom:11}}>
          <div style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:11,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{background:"#f43f5e22",color:"#f43f5e",border:"1px solid #f43f5e44",borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700}}>⬥ TYPE D · {r.id}</span>
                <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{r.nom}</span>
                <span style={{background:TC[r.trend]+"22",color:TC[r.trend],fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:3}}>{TI[r.trend]}</span>
                {r.perc&&<span style={{background:"#3b0764",color:"#a78bfa",fontSize:9,padding:"2px 6px",borderRadius:3}}>⊕ PERCEPTION</span>}
              </div>
              <div style={{display:"flex",gap:14,fontSize:10,color:"#94a3b8",flexWrap:"wrap"}}>
                <span>SRA: <span style={{color:"#e2e8f0",fontWeight:700}}>{r.score}/16</span></span>
                <span>Composite: <span style={{color:CC(r.comp),fontWeight:700}}>{r.comp}</span></span>
                <span>Observed: <span style={{color:"#60a5fa",fontWeight:700}}>{r.cnt}</span></span>
                {r.critCnt>0&&<span>Critical incidents: <span style={{color:"#f43f5e",fontWeight:700}}>{r.critCnt}</span></span>}
                {r.iTrend!==null&&<span>Trend: <span style={{color:r.iTrend>0?"#f43f5e":"#34d399",fontWeight:700}}>{r.iTrend>0?"+":""}{r.iTrend}%</span> vs prior period</span>}
                {focObl&&r.oblSc>r.score&&<span>{focObl}: <span style={{color:"#f43f5e",fontWeight:700}}>{r.oblSc}/16</span> (nat: {r.score})</span>}
              </div>
            </div>
          </div>
          <div style={{marginBottom:11}}>
            <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:5}}>SITUATION ANALYSIS</div>
            <div style={{background:"#0d1e1d",borderRadius:5,padding:"9px 11px",color:"#94a3b8",fontSize:11,lineHeight:1.6,marginBottom:8}}>
              {r.incTrend!==null&&r.incTrend>=30&&<span>Incident frequency has increased by <strong style={{color:"#f43f5e"}}>{r.incTrend>0?"+":""}{r.incTrend}%</strong> compared to the prior equivalent period ({prior.sl}–{prior.el}), with <strong style={{color:"#60a5fa"}}>{r.cnt} total observations</strong> across all oblasts. </span>}
              {r.critCnt>=2&&<span><strong style={{color:"#f43f5e"}}>{r.critCnt} CRITICAL-severity incidents</strong> have been documented in this period — meeting the evidence threshold for a formal out-of-cycle review. </span>}
              {r.div>0&&method!=="official"&&<span>The composite score (<strong style={{color:CC(r.comp)}}>{r.comp}</strong>) diverges by <strong style={{color:"#fb923c"}}>+{r.div} points</strong> above the SRA baseline. </span>}
              {jus&&<span style={{color:"#64748b"}}>{jus.tj}</span>}
            </div>
            {r.oblTriggers&&r.oblTriggers.length>0&&(<div style={{marginBottom:11}}>
              <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:6}}>TRIGGER BY OBLAST</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {r.oblTriggers.map(ot=>(<div key={ot.oblast} style={{background:ot.typeD?"#2d0a0a":"#1a0f05",border:`1px solid ${ot.typeD?"#f43f5e44":"#fb923c44"}`,borderLeft:`3px solid ${ot.typeD?"#f43f5e":"#fb923c"}`,borderRadius:5,padding:"7px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{color:OC[ot.oblast]||"#94a3b8",fontWeight:700,fontSize:11,minWidth:90}}>{ot.oblast}</span>
                    {ot.typeD&&<span style={{background:"#f43f5e22",color:"#f43f5e",border:"1px solid #f43f5e44",borderRadius:3,padding:"1px 6px",fontSize:9,fontWeight:700}}>⬥ TYPE D</span>}
                    {ot.typeA&&<span style={{background:"#fb923c22",color:"#fb923c",border:"1px solid #fb923c44",borderRadius:3,padding:"1px 6px",fontSize:9,fontWeight:700}}>⬦ TYPE A</span>}
                    <span style={{color:"#475569",fontSize:10}}>
                      {ot.cnt} obs · {ot.critCnt} CRIT
                      {ot.oblITrend!==null&&<span style={{color:ot.oblITrend>0?"#f43f5e":"#34d399",marginLeft:6}}>{ot.oblITrend>0?"+":""}{ot.oblITrend}% vs prior</span>}
                    </span>
                    {OBL_OVR[r.id]?.[ot.oblast]&&<span style={{color:"#64748b",fontSize:10}}>
                      SRA local: <span style={{color:CC(ot.oblScore),fontWeight:700}}>{ot.oblScore}/16</span>
                      {ot.oblScore>r.score&&<span style={{color:"#f43f5e",marginLeft:4}}>▲+{ot.oblScore-r.score} vs national</span>}
                    </span>}
                  </div>
                  {ot.typeA&&!ot.typeD&&<div style={{color:"#64748b",fontSize:9,marginTop:4}}>Composite <strong style={{color:CC(ot.oblComp)}}>{ot.oblComp}</strong> diverges <strong style={{color:"#fb923c"}}>+{ot.oblDiv}</strong> above national SRA baseline of {r.score}</div>}
                </div>))}
              </div>
            </div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{color:"#f43f5e",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:5}}>RECOMMENDATIONS</div>
              {rec.recs.map((rx,i)=>(<div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#f43f5e",fontSize:10,flexShrink:0}}>{i+1}.</span><span style={{color:"#94a3b8",fontSize:10,lineHeight:1.5}}>{rx}</span></div>))}
            </div>
            <div>
              <div style={{color:"#fb923c",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:5}}>MITIGATION MEASURES</div>
              {rec.mits.map((mx,i)=>(<div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#fb923c",fontSize:10,flexShrink:0}}>→</span><span style={{color:"#94a3b8",fontSize:10,lineHeight:1.5}}>{mx}</span></div>))}
            </div>
          </div>
        </div>);})}
      </div>)}

      {trigA.filter(r=>!r.typeD).length>0&&(<div style={{marginBottom:12}}>
        <div style={{color:"#fb923c",fontSize:10,fontWeight:700,letterSpacing:"0.08em",marginBottom:9}}>⬦ TYPE A — TREND DIVERGENCE ({trigA.filter(r=>!r.typeD).length})</div>
        {trigA.filter(r=>!r.typeD).map(r=>{const rec=TRECS[r.id]||TRECS["default"];return(<div key={r.id} style={{background:"#0e0c08",border:"1px solid #fb923c44",borderLeft:"3px solid #fb923c",borderRadius:8,padding:"13px 15px",marginBottom:9}}>
          <div style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:9,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{background:"#fb923c22",color:"#fb923c",border:"1px solid #fb923c44",borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700}}>⬦ TYPE A · {r.id}</span>
                <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{r.nom}</span>
                <span style={{background:TC[r.trend]+"22",color:TC[r.trend],fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:3}}>{TI[r.trend]}</span>
              </div>
              <div style={{display:"flex",gap:14,fontSize:10,color:"#94a3b8",flexWrap:"wrap"}}>
                <span>SRA: <span style={{color:"#e2e8f0",fontWeight:700}}>{r.score}</span></span>
                <span>Composite: <span style={{color:CC(r.comp),fontWeight:700}}>{r.comp}</span></span>
                <span>Divergence: <span style={{color:"#fb923c",fontWeight:700}}>+{r.div}</span></span>
                <span>Observed: <span style={{color:"#60a5fa",fontWeight:700}}>{r.cnt}</span> incidents</span>
              </div>
            </div>
          </div>
          <div style={{background:"#0d1e1d",borderRadius:5,padding:"8px 10px",color:"#94a3b8",fontSize:10,lineHeight:1.5,marginBottom:9}}>
            SRA formally rates <strong style={{color:"#e2e8f0"}}>{r.nom}</strong> as <strong style={{color:TC[r.trend]}}>{r.trend}</strong>, but incident data for {fmy(ps.m,ps.y)}–{fmy(pe.m,pe.y)} generates a composite score of <strong style={{color:CC(r.comp)}}>{r.comp}</strong> — a divergence of <strong style={{color:"#fb923c"}}>+{r.div}</strong> above the baseline ({r.score}). Field data is running ahead of the formal assessment. Increased monitoring recommended; flag for next SRA revision.
          </div>
          {r.oblTriggers&&r.oblTriggers.filter(ot=>ot.typeA).length>0&&(<div style={{marginBottom:9}}>
            <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:5}}>TRIGGER BY OBLAST</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {r.oblTriggers.filter(ot=>ot.typeA).map(ot=>(<div key={ot.oblast} style={{background:"#1a0f05",border:`1px solid ${OC[ot.oblast]||"#fb923c"}44`,borderLeft:`3px solid ${OC[ot.oblast]||"#fb923c"}`,borderRadius:5,padding:"6px 10px",minWidth:160}}>
                <div style={{color:OC[ot.oblast]||"#94a3b8",fontWeight:700,fontSize:11,marginBottom:3}}>{ot.oblast}</div>
                <div style={{color:"#475569",fontSize:10}}>
                  {ot.cnt} obs · Δ <span style={{color:"#fb923c",fontWeight:700}}>+{ot.oblDiv}</span>
                  {ot.oblITrend!==null&&<span style={{color:ot.oblITrend>0?"#f43f5e":"#34d399",marginLeft:6}}>{ot.oblITrend>0?"+":""}{ot.oblITrend}%</span>}
                </div>
                {OBL_OVR[r.id]?.[ot.oblast]&&<div style={{color:"#64748b",fontSize:9,marginTop:2}}>Local score: <span style={{color:CC(ot.oblScore),fontWeight:700}}>{ot.oblScore}/16</span>{ot.oblScore>r.score&&<span style={{color:"#f43f5e"}}> ▲+{ot.oblScore-r.score}</span>}</div>}
              </div>))}
            </div>
          </div>)}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div>
              <div style={{color:"#fb923c",fontSize:9,fontWeight:600,marginBottom:4}}>RECOMMENDATIONS</div>
              {rec.recs.slice(0,2).map((rx,i)=>(<div key={i} style={{color:"#94a3b8",fontSize:10,marginBottom:4}}>• {rx}</div>))}
            </div>
            <div>
              <div style={{color:"#fbbf24",fontSize:9,fontWeight:600,marginBottom:4}}>MITIGATION MEASURES</div>
              {rec.mits.slice(0,2).map((mx,i)=>(<div key={i} style={{color:"#94a3b8",fontSize:10,marginBottom:4}}>→ {mx}</div>))}
            </div>
          </div>
        </div>);})}
      </div>)}

      {alerts.length===0&&(<div style={{...S.sec,textAlign:"center",padding:36}}><div style={{color:"#334155",fontSize:14,marginBottom:7}}>✓ No triggers active</div><div style={{color:"#475569",fontSize:11}}>No divergence detected between SRA baseline and current incident data for the selected period and oblasts.</div></div>)}
    </div>)}

    {tab==="review"&&(<div style={{padding:"16px 22px 80px"}}>
      {/* HEADER */}
      <div style={{...S.sec,marginBottom:12}}>
        <div style={S.st}>SRA Review Panel — Pipeline Suggestions vs Current Scores</div>
        <div style={{color:"#E8F4F3",fontSize:11,lineHeight:1.6,marginBottom:10}}>
          This panel shows score changes suggested by the automated pipeline. <strong style={{color:BR.gold}}>No change is applied automatically</strong> — each suggestion must be reviewed and manually approved. Applied changes affect the dashboard only and do not modify the official SRA document.
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>{
            // Load demo suggestions for testing
            const demo={
              "1.1.3":{natScore:14,reason:"Significant increase in FPV drone incidents across all 4 oblasts — frequency up 40% vs prior period.",oblScores:{"Sumy":16,"Chernihiv":14,"Kyiv City":12,"Kyiv Oblast":12}},
              "6.4.2":{natScore:13,reason:"Access denial incidents in Sumy border raions increased. New military zones established Feb-Mar 2026.",oblScores:{"Sumy":16,"Chernihiv":6,"Kyiv City":2,"Kyiv Oblast":4}},
              "6.1.3":{natScore:13,reason:"Disinformation campaigns targeting ICRC intensified on Ukrainian social media (Telegram, Twitter/X).",oblScores:{"Sumy":16,"Chernihiv":12,"Kyiv City":12,"Kyiv Oblast":10}},
            };
            setSraReview(demo);
          }} style={{...S.btn(false,BR.gold),color:BR.gold,border:`1px solid ${BR.gold}`}}>⟳ Load Demo Suggestions</button>
          <button onClick={()=>setSraReview({})} style={{...S.btn(false,"#c0392b"),color:"#c0392b",border:"1px solid #c0392b44"}}>✕ Clear All Suggestions</button>
          {Object.keys(sraApplied).length>0&&<span style={{color:"#2A8F87",fontSize:10,alignSelf:"center"}}>{Object.keys(sraApplied).length} change(s) applied to dashboard</span>}
        </div>
      </div>

      {Object.keys(sraReview).length===0&&(<div style={{...S.sec,textAlign:"center",padding:40}}>
        <div style={{color:BR.gold,fontSize:13,marginBottom:8}}>No pipeline suggestions loaded</div>
        <div style={{color:"#E8F4F3",fontSize:11}}>Run the N8n pipeline to generate SRA update suggestions, or click "Load Demo Suggestions" to preview the interface.</div>
      </div>)}

      {Object.keys(sraReview).length>0&&(<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
          {[
            {l:"SUGGESTIONS PENDING",v:Object.keys(sraReview).filter(id=>!sraApplied[id]).length,c:BR.gold},
            {l:"CHANGES APPLIED",v:Object.keys(sraApplied).length,c:"#2A8F87"},
            {l:"RISKS REVIEWED",v:Object.keys(sraReview).length,c:"#E8F4F3"},
          ].map(k=>(<div key={k.l} style={S.card}>
            <div style={{color:BR.gold,fontSize:9,letterSpacing:"0.12em",marginBottom:4}}>{k.l}</div>
            <div style={{color:k.c,fontSize:24,fontWeight:900}}>{k.v}</div>
          </div>))}
        </div>

        {/* NATIONAL SCORES */}
        <div style={{...S.sec,marginBottom:10}}>
          <div style={S.st}>National Score Suggestions</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`2px solid ${BR.teal}33`}}>
              {[["ID",55],["Risk",200],["Current National",110],["Suggested",90],["Δ",55],["Justification",null],["Action",80]].map(([h,w])=>(
                <th key={h} style={{padding:"6px 8px",textAlign:"left",color:BR.gold,fontSize:9,letterSpacing:"0.1em",width:w||"auto"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{Object.entries(sraReview).map(([id,s])=>{
              const r=SRA_DATA.find(x=>x.id===id);
              if(!r)return null;
              const current=sraApplied[id]?.natScore||r.score;
              const suggested=s.natScore;
              const delta=suggested-current;
              const applied=!!sraApplied[id];
              return(<tr key={id} style={{borderBottom:`1px solid ${BR.teal}22`,background:applied?"#0d2e1a":delta>0?"#1a0a05":"transparent"}}>
                <td style={{padding:"6px 8px",color:BR.teal,fontWeight:700,fontSize:10}}>{id}</td>
                <td style={{padding:"6px 8px",color:"#E8F4F3",fontSize:10}}>{r.nom}</td>
                <td style={{padding:"6px 8px"}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{color:CC(current),fontWeight:900,fontSize:14}}>{current}</span>
                    <div style={{background:`${BR.teal}22`,borderRadius:2,height:5,width:50}}><div style={{background:CC(current),width:`${(current/16)*100}%`,height:"100%",borderRadius:2}}/></div>
                  </div>
                </td>
                <td style={{padding:"6px 8px"}}>
                  <span style={{color:CC(suggested),fontWeight:900,fontSize:14}}>{suggested}</span>
                </td>
                <td style={{padding:"6px 8px"}}>
                  {delta>0&&<span style={{color:"#f87171",fontWeight:700}}>▲+{delta}</span>}
                  {delta<0&&<span style={{color:"#2A8F87",fontWeight:700}}>▼{delta}</span>}
                  {delta===0&&<span style={{color:"#4A6361"}}>—</span>}
                </td>
                <td style={{padding:"6px 8px",color:"#E8F4F3",fontSize:9,lineHeight:1.4}}>{s.reason}</td>
                <td style={{padding:"6px 8px"}}>
                  {!applied
                    ?<button onClick={()=>setSraApplied(p=>({...p,[id]:{natScore:s.natScore,oblScores:s.oblScores}}))}
                        style={{...S.btn(true,BR.gold),fontSize:9,padding:"3px 8px"}}>✓ Apply</button>
                    :<button onClick={()=>setSraApplied(p=>{const n={...p};delete n[id];return n;})}
                        style={{...S.btn(true,"#2A8F87"),fontSize:9,padding:"3px 8px"}}>↩ Revert</button>
                  }
                </td>
              </tr>);
            })}</tbody>
          </table></div>
        </div>

        {/* OBLAST SCORES */}
        <div style={S.sec}>
          <div style={S.st}>Oblast-Level Score Suggestions</div>
          {Object.entries(sraReview).map(([id,s])=>{
            const r=SRA_DATA.find(x=>x.id===id);
            if(!r||!s.oblScores)return null;
            const applied=!!sraApplied[id];
            return(<div key={id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${BR.teal}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{color:BR.gold,fontWeight:700,fontSize:11}}>{id}</span>
                <span style={{color:"#E8F4F3",fontSize:11}}>{r.nom}</span>
                {applied&&<span style={{background:"#0d2e1a",color:"#2A8F87",fontSize:9,padding:"2px 7px",borderRadius:3,border:"1px solid #2A8F8744"}}>✓ Applied</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {OBLS.map(o=>{
                  const current=sraApplied[id]?.oblScores?.[o]||OBL_OVR[id]?.[o]||r.score;
                  const suggested=s.oblScores[o]||r.score;
                  const delta=suggested-current;
                  return(<div key={o} style={{background:delta>0?"#1a0a05":"#0f1e1d",border:`1px solid ${OC[o]}33`,borderLeft:`3px solid ${OC[o]}`,borderRadius:6,padding:"8px 10px"}}>
                    <div style={{color:OC[o],fontWeight:700,fontSize:10,marginBottom:6}}>{o}</div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div>
                        <div style={{color:"#E8F4F3",fontSize:8,marginBottom:2}}>Current</div>
                        <div style={{color:CC(current),fontWeight:900,fontSize:16}}>{current}</div>
                      </div>
                      <div style={{color:"#4A6361",fontSize:14}}>→</div>
                      <div>
                        <div style={{color:"#E8F4F3",fontSize:8,marginBottom:2}}>Suggested</div>
                        <div style={{color:CC(suggested),fontWeight:900,fontSize:16}}>{suggested}</div>
                      </div>
                      {delta!==0&&<div style={{color:delta>0?"#f87171":"#2A8F87",fontSize:10,fontWeight:700,alignSelf:"flex-end"}}>
                        {delta>0?`▲+${delta}`:`▼${delta}`}
                      </div>}
                    </div>
                  </div>);
                })}
              </div>
            </div>);
          })}
          <div style={{color:"#4A6361",fontSize:9,marginTop:8}}>
            Apply changes in the National table above to activate oblast overrides. Changes affect dashboard only — not the official SRA document.
          </div>
        </div>
      </div>)}
    </div>)}

    {/* EXECUTIVE BRIEF */}
    {tab==="exec"&&(<div style={{padding:"22px",maxWidth:800,margin:"0 auto"}}>
      <div style={{background:"#124E49",border:"1px solid #1A6B65",borderRadius:8,padding:26}}>
        <div style={{borderBottom:"2px solid #f43f5e",paddingBottom:12,marginBottom:18}}>
          <div style={{color:"#f43f5e",fontSize:9,letterSpacing:"0.2em",fontWeight:600,marginBottom:4}}>INTERNAL — RESTRICTED CIRCULATION</div>
          <div style={{color:"#e2e8f0",fontSize:18,fontWeight:900,marginBottom:3}}>Ukraine Conflict Monitor</div>
          <div style={{color:"#94a3b8",fontSize:11}}>Security Situation Brief — {fmy(ps.m,ps.y)} to {fmy(pe.m,pe.y)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:18}}>
          {[{l:"Incidents",v:kpi.tot,c:"#e2e8f0"},{l:"Killed",v:kpi.mo,c:"#f43f5e"},{l:"Wounded",v:kpi.bl,c:"#fb923c"},{l:"Critical",v:kpi.cr,c:"#f43f5e"}].map(k=>(<div key={k.l} style={{background:"#0d1e1d",borderRadius:5,padding:"11px",textAlign:"center"}}><div style={{color:k.c,fontSize:24,fontWeight:900}}>{k.v}</div><div style={{color:"#475569",fontSize:10,marginTop:2}}>{k.l}</div></div>))}
        </div>
        <div style={{background:"#0d1e1d",borderRadius:5,padding:"9px 12px",marginBottom:14}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,marginBottom:5}}>PERIOD COMPARISON</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><div style={{color:"#475569",fontSize:9}}>Current period</div><div style={{color:"#e2e8f0",fontWeight:700,fontSize:11}}>{fmy(ps.m,ps.y)} – {fmy(pe.m,pe.y)}</div><div style={{color:"#94a3b8",fontSize:11}}>{kpi.tot} incidents</div></div>
            <div><div style={{color:"#475569",fontSize:9}}>Prior equivalent</div><div style={{color:"#e2e8f0",fontWeight:700,fontSize:11}}>{prior.sl} – {prior.el}</div><div style={{color:"#94a3b8",fontSize:11}}>{prior.cnt} incidents</div></div>
            <div style={{textAlign:"center"}}><div style={{color:kpi.pc>0?"#f43f5e":"#34d399",fontSize:19,fontWeight:900}}>{kpi.pc!==null?(kpi.pc>0?"+":"")+kpi.pc+"%":"N/A"}</div><div style={{color:"#475569",fontSize:9}}>change in volume</div></div>
          </div>
        </div>
        {alerts.length>0&&(<div style={{background:"#1a0a0a",border:"1px solid #f43f5e22",borderRadius:5,padding:"9px 12px",marginBottom:14}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,marginBottom:5}}>SRA TRIGGERS — {alerts.length} ACTIVE</div>
          {trigD.length>0&&<div style={{color:"#f43f5e",fontSize:11,marginBottom:3}}>⬥ TYPE D (review required): {trigD.map(r=>r.id).join(", ")}</div>}
          {trigA.filter(r=>!r.typeD).length>0&&<div style={{color:"#fb923c",fontSize:11}}>⬦ TYPE A (divergence): {trigA.filter(r=>!r.typeD).map(r=>r.id).join(", ")}</div>}
        </div>)}
        <div style={{marginBottom:14}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:9}}>OBLAST BREAKDOWN</div>
          {OBLS.map(o=>{const d=oSt[o]||{t:0,mo:0,bl:0,cr:0};const pct=filt.length>0?Math.round(d.t/filt.length*100):0;return(<div key={o} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><div style={{color:OC[o],width:75,fontSize:11,fontWeight:700,flexShrink:0}}>{o}</div><div style={{flex:1,background:"#0d1e1d",borderRadius:2,height:4}}><div style={{background:OC[o],width:`${pct}%`,height:"100%",borderRadius:2}}/></div><div style={{color:"#e2e8f0",width:28,textAlign:"right",fontSize:12,fontWeight:700}}>{d.t}</div><div style={{color:"#475569",fontSize:10,width:85,flexShrink:0}}>K:{d.mo} W:{d.bl} C:{d.cr}</div></div>);})}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.08em",marginBottom:9}}>TOP 5 INCIDENT TYPES</div>
          {rkC.slice(0,5).map((r,i)=>(<div key={r.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><span style={{color:"#334155",width:14,fontSize:9}}>{i+1}.</span><span style={{color:SC[r.ms],width:48,fontSize:9,fontWeight:600}}>{r.id}</span><span style={{color:"#94a3b8",flex:1,fontSize:10}}>{r.nom}</span><span style={{color:"#e2e8f0",fontWeight:700,fontSize:12}}>{r.cnt}</span><span style={{color:"#475569",fontSize:9,width:32,textAlign:"right"}}>{r.pct}%</span></div>))}
        </div>
        <div style={{paddingTop:12,borderTop:"1px solid #1e293b",display:"flex",justifyContent:"space-between",fontSize:9,color:"#334155"}}>
          <span>Generated: {new Date().toLocaleDateString("en-GB")} · Ukraine Conflict Monitor v4</span>
          <span>SRA: {SRA_V} · {data.filter(i=>i.statut==="VERIFIED").length} VERIFIED + {data.filter(i=>i.statut==="DEMO").length} DEMO</span>
        </div>
      </div>
    </div>)}

    {/* INCIDENT LOG */}
    {tab==="log"&&(<div style={{padding:"16px 22px 80px"}}>
      <div style={S.sec}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <div style={S.st}>{tblD.length} incidents</div>
          <input value={srch} onChange={e=>{setSrch(e.target.value);setPg(0);}} placeholder="🔍 Search..." style={{...S.inp,width:190}}/>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{borderBottom:"1px solid #1e293b"}}>
            {[["date_exacte","Date"],["oblast","Oblast"],["hromada","Location"],["risk_id","Risk"],["cible","Target"],["morts","K"],["blesses","W"],["severite","Sev"],["icrc","Rel."],["statut","Status"],["x",""]].map(([c,l])=>(<th key={c} onClick={()=>c!=="x"&&doS(c)} style={{padding:"6px 7px",textAlign:"left",color:srtC===c?"#e2e8f0":"#334155",cursor:c!=="x"?"pointer":"default",fontSize:9,letterSpacing:"0.06em",userSelect:"none"}}>{l}{srtC===c?(srtD==="asc"?"↑":"↓"):""}</th>))}
          </tr></thead>
          <tbody>{pgD.map(inc=>(<tr key={inc.id} style={{borderBottom:"1px solid #0a1628",background:inc.icrc==="CRITICAL"?"#2d0a0a":inc.icrc==="RELEVANT"?"#180f05":"transparent"}}>
            <td style={{padding:"4px 7px",whiteSpace:"nowrap",color:"#64748b"}}>{inc.date_exacte}</td>
            <td style={{padding:"4px 7px",color:OC[inc.oblast],fontWeight:700,fontSize:10}}>{inc.oblast}</td>
            <td style={{padding:"4px 7px",color:"#94a3b8",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inc.hromada}</td>
            <td style={{padding:"4px 7px",color:"#475569",fontSize:10}}>{inc.risk_id}</td>
            <td style={{padding:"4px 7px",color:"#94a3b8",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:10}}>{inc.cible}</td>
            <td style={{padding:"4px 7px",color:"#f43f5e",fontWeight:700,textAlign:"center"}}>{inc.morts||""}</td>
            <td style={{padding:"4px 7px",color:"#fb923c",textAlign:"center"}}>{inc.blesses||""}</td>
            <td style={{padding:"4px 7px"}}><span style={{background:SC[inc.severite]+"22",color:SC[inc.severite],borderRadius:3,padding:"1px 5px",fontSize:9,fontWeight:700}}>{inc.severite}</span></td>
            <td style={{padding:"4px 7px",color:IC[inc.icrc]||"#475569",fontSize:9}}>{inc.icrc}</td>
            <td style={{padding:"4px 7px"}}><span style={{color:inc.statut==="VERIFIED"?"#22c55e":"#334155",fontSize:9}}>{inc.statut}</span></td>
            <td style={{padding:"4px 7px"}}><button onClick={()=>setDescM(inc)} style={{background:"#1e293b",border:"none",color:"#64748b",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:10}}>ℹ</button></td>
          </tr>))}</tbody>
        </table></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:9}}>
          <div style={{color:"#334155",fontSize:10}}>Page {pg+1}/{totP} — {tblD.length} results</div>
          <div style={{display:"flex",gap:3}}>{[["«",()=>setPg(0)],["‹",()=>setPg(p=>Math.max(0,p-1))],["›",()=>setPg(p=>Math.min(totP-1,p+1))],["»",()=>setPg(totP-1)]].map(([l,fn],i)=>(<button key={i} onClick={fn} style={{padding:"5px 12px",background:BR.teal,border:`1px solid ${BR.gold}`,color:BR.white,borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:700}}>{l}</button>))}</div>
        </div>
      </div>
    </div>)}

    {/* BOTTOM BAR */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a1628",borderTop:"1px solid #1e293b",padding:"7px 22px",display:"flex",gap:7,alignItems:"center",zIndex:60}}>
      <button onClick={expCSV} style={{padding:"6px 11px",background:"#f43f5e22",border:"1px solid #f43f5e44",color:"#f43f5e",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700}}>↓ Export CSV</button>
      <button onClick={()=>setAddM(true)} style={{padding:"6px 11px",background:"#22c55e22",border:"1px solid #22c55e44",color:"#22c55e",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700}}>+ Add Incident</button>
      <button onClick={()=>fileRef.current?.click()} style={{padding:"6px 11px",background:"#3b82f622",border:"1px solid #3b82f644",color:"#60a5fa",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700}}>↑ Import (.json)</button>
      <input ref={fileRef} type="file" accept=".json" onChange={impF} style={{display:"none"}}/>
      <div style={{marginLeft:"auto",color:"#334155",fontSize:10}}>{data.filter(i=>i.statut==="VERIFIED").length} VERIFIED · {data.filter(i=>i.statut==="DEMO").length} DEMO · SRA {SRA_V}</div>
    </div>

    {/* RISK DETAIL MODAL */}
    {riskM&&(<div onClick={()=>setRiskM(null)} style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1f3d",border:`1px solid ${riskM.typeD?"#f43f5e":riskM.typeA?"#fb923c":"#1e3a5f"}`,borderRadius:10,padding:22,maxWidth:560,width:"90%",maxHeight:"80vh",overflowY:"auto",position:"relative"}}>
        <button onClick={()=>setRiskM(null)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>
        <div style={{color:"#475569",fontSize:10,marginBottom:5}}>{riskM.section} › {riskM.sub}</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:10}}>
          <span style={{color:CC(riskM.score),background:CC(riskM.score)+"22",padding:"2px 7px",borderRadius:3,fontSize:12,fontWeight:700,flexShrink:0}}>{riskM.id}</span>
          <span style={{color:"#e2e8f0",fontSize:15,fontWeight:700,flex:1}}>{riskM.nom}</span>
          {riskM.perc&&<span style={{color:"#a78bfa",background:"#3b0764",padding:"2px 6px",borderRadius:3,fontSize:9,flexShrink:0}}>⊕ PERCEPTION</span>}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {riskM.typeD&&<span style={{background:"#2d0a0a",color:"#f43f5e",border:"1px solid #f43f5e44",borderRadius:4,padding:"2px 8px",fontSize:9,fontWeight:700}}>⬥ TYPE D — REVIEW RECOMMENDED</span>}
          {riskM.typeA&&<span style={{background:"#1a0f05",color:"#fb923c",border:"1px solid #fb923c44",borderRadius:4,padding:"2px 8px",fontSize:9,fontWeight:700}}>⬦ TYPE A — DIVERGENCE</span>}
          <span style={{background:TC[riskM.trend]+"22",color:TC[riskM.trend],borderRadius:4,padding:"2px 8px",fontSize:9,fontWeight:700}}>{TI[riskM.trend]}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:11}}>
          {[{l:"SRA Score",v:riskM.score,c:CC(riskM.score)},{l:"Likelihood",v:riskM.l,c:"#94a3b8"},{l:"Impact",v:riskM.i,c:riskM.i==="Critical"?"#f43f5e":"#fb923c"},{l:"Composite",v:riskM.comp,c:CC(riskM.comp)}].map(k=>(<div key={k.l} style={{background:"#0d1e1d",borderRadius:5,padding:"7px",textAlign:"center"}}><div style={{color:k.c,fontSize:17,fontWeight:900}}>{k.v}</div><div style={{color:"#334155",fontSize:9}}>{k.l}</div></div>))}
        </div>
        {focObl&&OBL_OVR[riskM.id]?.[focObl]&&(<div style={{background:"#1a0a0a",borderRadius:5,padding:"7px 10px",marginBottom:9,fontSize:10}}>
          <span style={{color:"#f43f5e",fontWeight:700}}>{focObl} score: {riskM.oblSc}/16</span>
          <span style={{color:"#475569",marginLeft:8}}>(+{riskM.oblSc-riskM.score} vs national — front-line override)</span>
        </div>)}
        {riskM.hasS&&(<div style={{background:"#0d1e1d",borderRadius:5,padding:"7px 10px",marginBottom:9,fontSize:10}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,marginBottom:3}}>INCIDENT DATA (CURRENT PERIOD)</div>
          <div style={{display:"flex",gap:14,color:"#94a3b8",flexWrap:"wrap"}}>
            <span>Observed: <span style={{color:"#60a5fa",fontWeight:700}}>{riskM.cnt}</span></span>
            <span>Critical: <span style={{color:"#f43f5e",fontWeight:700}}>{riskM.critCnt}</span></span>
            <span>Signal: <span style={{color:"#60a5fa",fontWeight:700}}>{riskM.sig}/16</span></span>
            <span>Δ divergence: <span style={{color:riskM.div>0?"#fb923c":"#34d399",fontWeight:700}}>{riskM.div>0?"+":""}{riskM.div}</span></span>
          </div>
        </div>)}
        <div style={{marginBottom:8}}>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,marginBottom:3}}>OBLAST DIFFERENTIAL (SRA)</div>
          <div style={{background:"#0d1e1d",borderRadius:5,padding:"7px 10px",color:"#475569",fontSize:10,lineHeight:1.5}}>{riskM.od}</div>
        </div>
        {SRA_J[riskM.id]&&(<div>
          <div style={{color:"#334155",fontSize:9,fontWeight:600,marginBottom:3}}>SRA JUSTIFICATION</div>
          <div style={{background:"#0d1e1d",borderRadius:5,padding:"7px 10px",color:"#94a3b8",fontSize:10,lineHeight:1.6}}>{SRA_J[riskM.id].j}</div>
        </div>)}
      </div>
    </div>)}

    {/* INCIDENT MODAL */}
    {descM&&(<div onClick={()=>setDescM(null)} style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#124E49",border:"1px solid #1A6B65",borderRadius:10,padding:22,maxWidth:500,width:"90%",position:"relative"}}>
        <button onClick={()=>setDescM(null)} style={{position:"absolute",top:9,right:9,background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>
        <div style={{color:"#f43f5e",fontSize:9,marginBottom:3}}>{descM.id}</div>
        <div style={{color:"#e2e8f0",fontSize:13,fontWeight:700,marginBottom:10}}>{descM.date_exacte} — {descM.oblast} / {descM.hromada}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10,fontSize:11}}>
          {[["Risk",descM.risk_id],["Target",descM.cible],["Killed",descM.morts],["Wounded",descM.blesses],["Severity",descM.severite],["Status",descM.statut]].map(([k,v])=>(<div key={k}><span style={{color:"#334155"}}>{k}: </span><span style={{color:"#e2e8f0",fontWeight:600}}>{v}</span></div>))}
        </div>
        <div style={{background:"#0d1e1d",borderRadius:5,padding:"9px",color:"#94a3b8",fontSize:11,lineHeight:1.6,marginBottom:9}}>{descM.description}</div>
        <div style={{color:"#334155",fontSize:10,marginBottom:9}}>Source: {descM.source}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <span style={{background:SC[descM.severite]+"22",color:SC[descM.severite],borderRadius:3,padding:"2px 6px",fontSize:9,fontWeight:700}}>{descM.severite}</span>
          {descM.humanitaires&&<span style={{background:"#1e3a5f",color:"#60a5fa",borderRadius:3,padding:"2px 6px",fontSize:9}}>HUM. WORKERS</span>}
          {descM.enfants&&<span style={{background:"#3b0764",color:"#a78bfa",borderRadius:3,padding:"2px 6px",fontSize:9}}>CHILDREN</span>}
          {SRA_DATA.find(r=>r.id===descM.risk_id)&&(<button onClick={()=>{const sr=rm.find(x=>x.id===descM.risk_id);if(sr){setDescM(null);setRiskM(sr);}}} style={{background:"#1e293b",border:"1px solid #1e3a5f",color:"#64748b",borderRadius:3,padding:"2px 6px",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>View SRA risk →</button>)}
        </div>
      </div>
    </div>)}

    {/* ADD INCIDENT MODAL */}
    {addM&&(<div onClick={()=>setAddM(false)} style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1f3d",border:"1px solid #22c55e44",borderRadius:10,padding:22,maxWidth:540,width:"90%",maxHeight:"78vh",overflowY:"auto"}}>
        <div style={{color:"#22c55e",fontSize:12,fontWeight:700,marginBottom:14}}>+ Add Verified Incident</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,fontSize:11}}>
          {[["Date (DD/MM/YYYY)","date_exacte","t"],["Month","mois","n"],["Year","annee","n"],["Oblast","oblast","so"],["Raion","raion","t"],["Hromada","hromada","t"],["Risk Type","risk_id","sr"],["Target","cible","sc"],["Killed","morts","n"],["Wounded","blesses","n"],["Severity","severite","ss"],["Relevance","icrc","si"],["Source","source","t"]].map(([l,f,tp])=>(
            <div key={f}><div style={{color:"#334155",fontSize:9,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
              {(tp==="t"||tp==="n")?(<input type={tp==="n"?"number":"text"} value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:tp==="n"?parseInt(e.target.value)||0:e.target.value}))} style={S.inp}/>):
              tp==="so"?(<select value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:e.target.value}))} style={S.inp}>{OBLS.map(o=>(<option key={o}>{o}</option>))}</select>):
              tp==="sr"?(<select value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:e.target.value}))} style={S.inp}>{SRA_DATA.map(r=>(<option key={r.id} value={r.id}>{r.id} — {r.nom}</option>))}</select>):
              tp==="sc"?(<select value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:e.target.value}))} style={S.inp}>{CIBS.map(c=>(<option key={c}>{c}</option>))}</select>):
              tp==="ss"?(<select value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:e.target.value}))} style={S.inp}>{["CRITICAL","HIGH","MEDIUM","LOW"].map(s=>(<option key={s}>{s}</option>))}</select>):
              (<select value={newI[f]} onChange={e=>setNewI(p=>({...p,[f]:e.target.value}))} style={S.inp}>{["CRITICAL","RELEVANT","NON-RELEVANT"].map(s=>(<option key={s}>{s}</option>))}</select>)}
            </div>
          ))}
        </div>
        <div style={{marginTop:7}}><div style={{color:"#334155",fontSize:9,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>Description</div><textarea value={newI.description} onChange={e=>setNewI(p=>({...p,description:e.target.value}))} rows={3} style={{...S.inp,resize:"vertical"}}/></div>
        <div style={{display:"flex",gap:9,marginTop:12}}>
          <button onClick={addI} style={{flex:1,padding:8,background:"#22c55e22",border:"1px solid #22c55e",color:"#22c55e",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700}}>✓ Add Incident</button>
          <button onClick={()=>setAddM(false)} style={{flex:1,padding:8,background:"#0d1e1d",border:"1px solid #1e3a5f",color:"#475569",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Cancel</button>
        </div>
      </div>
    </div>)}

    {/* TOAST */}
    {toast&&(<div style={{position:"fixed",bottom:60,right:18,background:toast.tp==="err"?"#2d0a0a":toast.tp==="warn"?"#1c1505":"#0f2a1a",border:`1px solid ${toast.tp==="err"?"#f43f5e":toast.tp==="warn"?"#fbbf24":"#22c55e"}`,color:toast.tp==="err"?"#f43f5e":toast.tp==="warn"?"#fbbf24":"#22c55e",borderRadius:6,padding:"9px 16px",fontSize:11,fontFamily:"inherit",zIndex:200,maxWidth:320}}>{toast.msg}</div>)}
  </div>);
}

