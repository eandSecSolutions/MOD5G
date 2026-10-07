/* TRANSLATOR: edit values only. Keep keys and punctuation that belongs to JavaScript.
   All visible presentation words live in content/en.js and content/ar.js.
   Brand names and technical abbreviations can remain unchanged. */
window.MOD_COPY = window.MOD_COPY || {};
window.MOD_COPY.en = {
 projectLabel:'EXECUTIVE PRESENTATION',projectShort:'MOD PoC over 5G Pulse Network',
 review:'Shell design preview', themeName:'Ivory & Gold',themeCaption:'Daylight edition', dayCaption:'Daylight operations', nightCaption:'Night operations', toDark:'Switch to night view', toLight:'Switch to day view', scrollLeft:'Scroll navigation left', scrollRight:'Scroll navigation right', sceneUnavailable:'This scene could not load. Check that the complete ZIP was extracted.',
 railTitles:['Opening','Approach','Security','Overview','Push-to-talk','Caller details','Dispatch','Drones','AI / 360°','Body camera','Land border','Coastal border','Sites','Timeline','Closing'],
 sections:'Sections',chapters:'Chapters',pauseMotion:'Pause motion',resumeMotion:'Resume motion',focus:'Hide controls',fullscreen:'Full screen',exitFullscreen:'Exit full screen',help:'Presentation guide',close:'Close',showControls:'Show controls',
 explore:'View approach',replay:'Replay scene',previous:'Previous slide',next:'Next slide',choose:'Choose slide',progress:'Presentation progress',home:'Opening',
 openingTop:'MOD PoC',openingBottom:'over 5G Pulse Network',
 openingSubtitle:'Connecting critical sites and field operations.',
 reservedSubtitle:'Slide reserved for our next design iterations.',
 reservedNotice:"All fifteen slides are available, including the cinematic land and coastal border incidents. The implementation schedule preserves the historical reference dates.",
 helpIntro:'Choose a section from the top navigation, then select a slide. Use the controls to switch language, day/night view, motion and full screen.',
 previewNote:'Use the keyboard shortcuts below to navigate the presentation.',
 pearl:'Ivory',gold:'Metallic gold',ink:'Charcoal',mineral:'Warm stone',
 unavailableFullscreen:'Full screen is unavailable here. Open index.html in a browser window.',
 motionPaused:'Motion paused',motionPlaying:'Motion resumed',
 groups:['Overview','Use cases','Deployment','Closing'],
 titles:['Opening','Approach plan','Security aspects','Use cases','Push-to-talk & video calls','Call verification & caller details','Dispatcher & resource monitoring','Drone operations','AI & 360° camera streaming','Body-worn camera','Land border','Coastal border tactical operations','Critical 5G sites','Implementation plan','Thank you'],
 shortcuts:[['← / →','Previous / next (reversed in Arabic)'],['Space / Page Down','Next slide'],['Page Up','Previous slide'],['Home / End','First / last slide'],['G','Open chapters'],['L','Switch language'],['T','Switch day / night'],['F','Full screen'],['H','Focus view'],['M','Pause / resume motion'],['Esc','Close a panel or leave focus view']],
 sourcePage:'Reference page',reserved:'Planned'
};

/* Slide 02 / reference page 3. Keep these words together for translator review. */
window.MOD_COPY.en.approach={implementation:'Implementation approach',imageAlt:'Faceless dark navy fabric figures in UAE desert camouflage supporting field deployment.',imageCaption:'Field deployment · DC on Wheels',
 eyebrow:'DEPLOYMENT APPROACH',title:'Approach plan',subtitle:'Two cores. One Pulse network. Four stages to demonstrate the PoC.',
 diagramTitle:'Dual-core environment',diagramNote:'Conceptual connectivity',replay:'Replay sequence',stepLabel:'Select a stage',
 core1:'CORE 01',core2:'CORE 02',pulseCore:'Pulse core',customerCore:'Second core',pulseLocation:'Located at Pulse datacentre',customerLocation:'Located at customer location',voice:'Voice use cases',other:'Push-to-talk & other use cases',network:'Pulse 5G',networkSmall:'NETWORK',ran:'Selected RAN sites',ranSmall:'Radio access integration',mahawi:'Mahawi Camp',mobileDC:'DC on Wheels',demo:'Use-case demonstration',categories:['Voice','Push-to-talk','Video','Drone','Camera'],
 stages:[
 {title:'Mobilize',detail:'Relocate the DC on Wheels to Mahawi Camp.',focus:'Bring the data centre to the site',note:'Mobilize the DC on Wheels to Mahawi Camp.'},
 {title:'Connect',detail:'Establish the link between Pulse core and the DC on Wheels at Mahawi Camp.',focus:'Establish the Pulse core link',note:'Connect Pulse core to the mobile data centre at Mahawi Camp.'},
 {title:'Integrate',detail:'Integrate the selected RAN sites with Pulse 5G.',focus:'Integrate the selected radio sites',note:'Bring the selected RAN sites onto the Pulse 5G network.'},
 {title:'Demonstrate',detail:'Demonstrate voice, push-to-talk, video, drone and camera use cases over the 5G Pulse network.',focus:'Demonstrate the planned use cases',note:'Voice, push-to-talk, video, drone and camera use cases over Pulse 5G.'}
 ]
};

/* Slide 03 — reference page 4. Translator: all security wording is below. */
window.MOD_COPY.en.security={
  "eyebrow": "PROTECTING THE PULSE ENVIRONMENT",
  "title": "Security, in layers.",
  "subtitle": "",
  "select": "Explore a security layer",
  "replay": "Play all layers",
  "concept": "Conceptual security visualization",
  "core": "5G PULSE",
  "layer": "SECURITY LAYER",
  "scope": "Coverage",
  "status": "Explore each layer",
  "items": [
    {
      "name": "PAM",
      "short": "Privileged access",
      "subtitle": "Sectona Privileged Access Management",
      "headline": "Control privileged access.",
      "points": [
        "Secure privileged accounts",
        "Password & access management",
        "Session monitoring & recording",
        "Auditing of privileged activity"
      ],
      "scope": [
        "Routers",
        "Servers",
        "Switches",
        "Operating systems",
        "Portals"
      ],
      "flow": [
        "Privileged user",
        "Managed session",
        "Resources"
      ]
    },
    {
      "name": "Firewalls",
      "short": "Network protection",
      "subtitle": "Network & perimeter security",
      "headline": "Protect the network boundary.",
      "points": [
        "Filter inbound & outbound traffic",
        "Enforce predefined access rules",
        "Block unauthorized access",
        "Prevent malicious network traffic"
      ],
      "scope": [
        "External network",
        "Firewall",
        "Internal network"
      ],
      "flow": [
        "External network",
        "Traffic filtering",
        "Internal network"
      ]
    },
    {
      "name": "Log360 / SIEM",
      "short": "Security monitoring",
      "subtitle": "Security log management",
      "headline": "Bring security events into view.",
      "points": [
        "Centralized device log management",
        "Security event visibility",
        "Support audit requirements",
        "Support compliance requirements"
      ],
      "scope": [
        "Devices",
        "Logs",
        "SIEM"
      ],
      "flow": [
        "Devices",
        "Centralized logs",
        "SIEM"
      ]
    },
    {
      "name": "SMS",
      "short": "Key management",
      "subtitle": "Secure key management",
      "headline": "Protect transport communications.",
      "points": [
        "Centralized cryptographic key management",
        "Protect Layer 1 transport infrastructure",
        "Secure transport communications",
        "Protection against classical & quantum cyber threats"
      ],
      "scope": [
        "Transport network",
        "Key management",
        "Protected transport"
      ],
      "flow": [
        "Transport network",
        "Key management",
        "Protected transport"
      ]
    },
    {
      "name": "Active Directory",
      "short": "Identity & policy",
      "subtitle": "Identity & policy management",
      "headline": "Centralize identity and policy.",
      "points": [
        "Centralized user management",
        "Computer / device management",
        "Authentication & access control",
        "Central security policy management"
      ],
      "scope": [
        "Users",
        "Computers",
        "Security policies"
      ],
      "flow": [
        "Users & devices",
        "Active Directory",
        "Security policies"
      ]
    }
  ]
};

/* Slide 04 — use-case overview, source page 5. All displayed wording. */
window.MOD_COPY.en.usecases={
  "eyebrow": "CONNECTED FIELD OPERATIONS",
  "title": "Six capabilities. One Pulse network.",
  "subtitle": "Explore the use cases planned for the MOD proof of concept.",
  "select": "Explore a use case",
  "replay": "Play overview",
  "concept": "Illustrative preview",
  "network": "5G PULSE",
  "dashboard": "GINA DASHBOARD",
  "link": "Connected operations",
  "items": [
    {
      "title": "Push-to-talk & video",
      "short": "Communicate",
      "detail": "Push-to-talk and video calls over the 5G Pulse network.",
      "signal": "Voice + video"
    },
    {
      "title": "Caller verification",
      "short": "Verify",
      "detail": "Call verification and caller details in the GINA dashboard.",
      "signal": "Caller identity"
    },
    {
      "title": "Dispatch & resources",
      "short": "Coordinate",
      "detail": "Real-time dispatch and resource monitoring from tactical avail systems.",
      "signal": "Resource visibility"
    },
    {
      "title": "Drone operations",
      "short": "Observe",
      "detail": "Assign a drone to specific flight coordinates and stream live video in the GINA dashboard.",
      "signal": "Flight + live video"
    },
    {
      "title": "AI & 360° cameras",
      "short": "Understand",
      "detail": "AI and 360° camera streaming from the GINA dashboard.",
      "signal": "360° visibility"
    },
    {
      "title": "Body-worn camera",
      "short": "Connect the field",
      "detail": "Body-worn camera video calls and live streaming from the GINA dashboard.",
      "signal": "Field video"
    }
  ]
};




window.MOD_COPY.en.ptt={
  "eyebrow": "CAPABILITY 01",
  "title": "Push-to-talk & video call",
  "subtitle": "Mission-critical communication over the 5G Pulse network",
  "field": "Field user",
  "command": "GINA / Command center",
  "network": "5G Pulse",
  "voice": "Push-to-talk",
  "video": "Video call",
  "demo": "Illustrative simulation",
  "hold": "Hold to talk",
  "release": "Release for reply",
  "startVideo": "Start video call",
  "endVideo": "End video call",
  "replay": "Play story",
  "replayActive": "Restart story",
  "note": "Visual demonstration only. No microphone or camera access.",
  "path": "How it works over 5G Pulse",
  "states": {
    "ready": "Ready for field communication",
    "transmit": "Field user transmitting",
    "reply": "Command center responding",
    "connecting": "Establishing video session",
    "video": "Video call active"
  },
  "captions": {
    "ready": "Press and hold to send a simulated voice message.",
    "transmit": "The field voice signal travels through the secure network path.",
    "reply": "The command response returns to the field user.",
    "connecting": "The same connection path carries the video session.",
    "video": "Field and command share a live video conversation in this simulation."
  },
  "steps": [
    [
      "PTT / video device",
      "Field user"
    ],
    [
      "5G RAN",
      "5G access network"
    ],
    [
      "Pulse 5G core",
      "Core network"
    ],
    [
      "Secure voice & video",
      "Encrypted communication"
    ],
    [
      "GINA platform",
      "Live communication"
    ],
    [
      "Command center",
      "Operational user"
    ]
  ],
  "outcomes": [
    "Instant push-to-talk communication",
    "Real-time video call",
    "Secure 5G connectivity",
    "Field-to-command communication"
  ]
};



window.MOD_COPY.en.comms={
  "field": "Field user",
  "secure": "Secure communication",
  "network": "5G Pulse network",
  "command": "Command center",
  "device": "Field PTT device",
  "console": "Command console",
  "concept": "Concept interface",
  "simulation": "Simulated video call",
  "encrypted": "Encrypted voice",
  "ready": "Ready",
  "tx": "Transmitting",
  "rx": "Receiving",
  "connecting": "Connecting video",
  "video": "Video connected",
  "incoming": "Incoming field message",
  "responding": "Command response",
  "fieldMessage": "Field transmission received",
  "replyMessage": "Response returning to field",
  "standby": "Waiting for field communication"
};
window.MOD_COPY.en.caller={
  "eyebrow": "CAPABILITY 02",
  "title": "Call verification & caller details",
  "subtitle": "Call information to the GINA dashboard over 5G Pulse",
  "demo": "Illustrative sequence",
  "field": "Field user",
  "incoming": "Calling command",
  "network": "5G Pulse network",
  "record": "Caller information",
  "checking": "Verifying caller",
  "verified": "Verified",
  "pending": "Awaiting caller details",
  "dashboard": "GINA dashboard",
  "operator": "Command center operator",
  "example": "Illustrative details, not a live GINA interface",
  "replay": "Play sequence",
  "next": "Next step",
  "call": "Initiate call",
  "path": "How it works over 5G Pulse",
  "fields": [
    [
      "Caller",
      "Field user"
    ],
    [
      "Connection",
      "5G Pulse"
    ],
    [
      "Communication",
      "Voice call"
    ]
  ],
  "steps": [
    [
      "Caller",
      "Field user initiates call"
    ],
    [
      "5G RAN",
      "5G access network"
    ],
    [
      "Pulse 5G core",
      "Core network"
    ],
    [
      "Call verification & information",
      "Caller identity verification"
    ],
    [
      "GINA dashboard",
      "Caller details to GINA"
    ],
    [
      "Operator",
      "Command center operator"
    ]
  ],
  "captions": [
    "The field user initiates the call.",
    "The call reaches the 5G access network.",
    "The Pulse core carries the call information.",
    "The caller identity is verified.",
    "Caller details appear on the GINA dashboard.",
    "The operator receives the verified caller information."
  ],
  "outcomes": [
    "Real-time call verification",
    "Caller details to GINA",
    "Secure 5G connectivity",
    "Enhanced situational awareness"
  ]
};













window.MOD_COPY.en.reservedNotice="All fifteen slides are available, including the cinematic land and coastal border incidents. The implementation schedule preserves the historical reference dates.";
window.MOD_COPY.en.previewNote="Use the keyboard shortcuts below to navigate the presentation.";
