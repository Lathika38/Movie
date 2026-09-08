import uuid
from datetime import datetime, timezone
from app.core.database import db
from app.schemas.common import UserRole, MovieStatus, CastingStatus, TrackStatus

def seed_database():
    print(" [MovieOS Seeder] Initializing Cinema Database in Firestore...")
    
    # -------------------------------------------------------------
    # 1. USERS FOR ALL 5 ROLES
    # -------------------------------------------------------------
    users = [
        {
            "id": "USR-DIR-001",
            "email": "director@movieos.cinema",
            "name": "Christopher Vance",
            "role": UserRole.DIRECTOR.value,
            "bio": "Visionary feature film director known for large-scale sci-fi and psychological neo-noir thrillers. 3-time Cannes Palme d'Or nominee.",
            "phone": "+1 (310) 555-0192",
            "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            "skills": ["Anamorphic Cinematography", "Complex Blocking", "Actor Subtext Direction", "Practical SFX", "Sound Design Supervision"],
            "languages": ["English", "French"],
            "genres": ["Sci-Fi", "Neo-Noir", "Psychological Thriller"],
            "showreelUrl": "https://vimeo.com/director-vance",
            "achievements": ["Nominee, Best Director - European Film Awards (2024)", "Winner, Sundance Grand Jury Prize (2021)"],
            "availability": "In Production",
            "filmography": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "USR-PROD-001",
            "email": "producer@movieos.cinema",
            "name": "Sarah Jenkins",
            "role": UserRole.PRODUCER.value,
            "bio": "Executive Line Producer overseeing multi-million dollar studio productions, international co-productions, and union talent management.",
            "phone": "+1 (212) 555-0144",
            "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
            "skills": ["PGA Certified", "Tax Rebate Optimization", "Weather Contingency Logistics", "SAG-AFTRA & DGA Guild Compliance"],
            "languages": ["English", "Spanish", "German"],
            "genres": ["Action", "Sci-Fi", "Drama"],
            "showreelUrl": "https://producersguild.org/sarah-jenkins",
            "achievements": ["Produced $120M Global Box Office Hit 'Orbit 9'", "PGA Producer of the Year Nominee (2023)"],
            "availability": "Available",
            "filmography": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "USR-ACT-001",
            "email": "actor@movieos.cinema",
            "name": "Elena Rostova",
            "role": UserRole.ACTOR.value,
            "bio": "Lead dramatic and action actress with classical theater training and extensive stunt fighting experience. Method & Meisner trained.",
            "phone": "+1 (323) 555-0188",
            "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
            "skills": ["Meisner Technique", "Tactical Firearms", "Stage Combat", "Dialects (British RP, Eastern European, US Southern)", "Equestrian"],
            "languages": ["English", "Russian", "Italian"],
            "genres": ["Sci-Fi", "Action", "Psychological Drama"],
            "showreelUrl": "https://showreel.movieos.com/elena-rostova",
            "achievements": ["BAFTA Rising Star Nominee (2025)", "Lead in Venice Critics Week Winner 'The Silence Below'"],
            "availability": "Available",
            "filmography": [
                {
                    "movieId": "MOV-001",
                    "movieTitle": "Aetherium: Chronicles of 2088",
                    "releaseYear": 2026,
                    "characterName": "Commander Vesper Thorne",
                    "roleType": "Lead",
                    "genre": "Sci-Fi Thriller",
                    "directorName": "Christopher Vance",
                    "status": "In Production"
                },
                {
                    "movieId": "MOV-PAST-01",
                    "movieTitle": "The Silence Below",
                    "releaseYear": 2024,
                    "characterName": "Dr. Sarah Lind",
                    "roleType": "Lead",
                    "genre": "Psychological Drama",
                    "directorName": "Marcus Bell",
                    "status": "Released"
                }
            ],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "USR-ACT-002",
            "email": "actor2@movieos.cinema",
            "name": "Marcus Cole",
            "role": UserRole.ACTOR.value,
            "bio": "Charismatic character actor known for intense, morally ambiguous roles and sharp dialogue delivery.",
            "phone": "+1 (310) 555-0133",
            "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
            "skills": ["Method Acting", "Martial Arts (Jiu Jitsu)", "Motion Capture (Mo-Cap)", "Voice Over"],
            "languages": ["English", "German"],
            "genres": ["Sci-Fi", "Crime", "Action"],
            "showreelUrl": "https://showreel.movieos.com/marcus-cole",
            "achievements": ["Supporting Actor of the Year - Indie Spirit Awards"],
            "availability": "Available",
            "filmography": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "USR-MUS-001",
            "email": "music@movieos.cinema",
            "name": "Kaelen Thorne",
            "role": UserRole.MUSIC_DIRECTOR.value,
            "bio": "Multi-instrumentalist and film composer blending dark analog modular synths with symphonic orchestral textures and custom acoustic sound design.",
            "phone": "+44 20 7946 0912",
            "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
            "skills": ["Orchestral Scoring", "Modular Synthesis (Eurorack)", "Dolby Atmos Mixing", "Conducting", "Microtonal Tuning"],
            "languages": ["English", "Swedish"],
            "genres": ["Sci-Fi", "Thriller", "Epic Orchestral"],
            "showreelUrl": "https://soundcloud.com/kaelenthorne-composer",
            "achievements": ["World Soundtrack Award - Discovery of the Year", "Emmy Nominee for Outstanding Music Composition"],
            "availability": "In Studio",
            "filmography": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "USR-ADM-001",
            "email": "admin@movieos.cinema",
            "name": "DEVIL (Studio Chief)",
            "role": UserRole.ADMIN.value,
            "bio": "MovieOS Studio Chief & Systems Administrator managing studio-wide productions, guild compliance, and AI intelligence pipelines.",
            "phone": "+1 (800) 555-0100",
            "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
            "skills": ["Studio Operations", "Data Analytics", "Production Security", "Infrastructure"],
            "languages": ["English"],
            "genres": ["All"],
            "showreelUrl": "",
            "achievements": ["Head of Digital Cinema Infrastructure"],
            "availability": "Available",
            "filmography": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]

    for u in users:
        db.set_document("users", u["id"], u)

    # -------------------------------------------------------------
    # 2. FEATURE MOVIES
    # -------------------------------------------------------------
    movie_1_id = "MOV-001"
    movie_1 = {
        "id": movie_1_id,
        "title": "AETHERIUM: Chronicles of 2088",
        "genre": "Sci-Fi Cyberpunk Thriller",
        "language": "English",
        "logline": "In a rain-drowned Neo-Tokyo governed by predictive neural algorithms, an exiled cyber-investigator uncovers a conspiracy erasing human memory to maintain corporate peace.",
        "synopsis": "Set in 2088, humanity has outsourced conscience to the Aetherium Neural Core. When Commander Vesper Thorne uncovers anomalous memory deletions across government delegates, she becomes the primary target of the very security apparatus she helped construct.",
        "producerId": "USR-PROD-001",
        "producerName": "Sarah Jenkins",
        "directorId": "USR-DIR-001",
        "directorName": "Christopher Vance",
        "musicDirectorId": "USR-MUS-001",
        "musicDirectorName": "Kaelen Thorne",
        "status": MovieStatus.PRODUCTION.value,
        "budget": 45000000.0,
        "spentBudget": 18250000.0,
        "startDate": "2026-06-01",
        "endDate": "2026-11-30",
        "releaseDate": "2027-04-15",
        "posterUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        "targetAudience": "Sci-Fi enthusiasts, cinematic visual connoisseurs, global theatrical audience",
        "productionCompany": "Apex Cinema Group & Vance Pictures",
        "members": [
            {"userId": "USR-PROD-001", "name": "Sarah Jenkins", "role": "PRODUCER", "joinedAt": "2026-05-01T00:00:00Z"},
            {"userId": "USR-DIR-001", "name": "Christopher Vance", "role": "DIRECTOR", "joinedAt": "2026-05-01T00:00:00Z"},
            {"userId": "USR-ACT-001", "name": "Elena Rostova", "role": "ACTOR", "characterName": "Commander Vesper Thorne", "joinedAt": "2026-05-15T00:00:00Z"},
            {"userId": "USR-MUS-001", "name": "Kaelen Thorne", "role": "MUSIC_DIRECTOR", "joinedAt": "2026-05-20T00:00:00Z"}
        ],
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    db.set_document("movies", movie_1_id, movie_1)

    movie_2_id = "MOV-002"
    movie_2 = {
        "id": movie_2_id,
        "title": "Shadows Over Vienna",
        "genre": "Neo-Noir Psychological Mystery",
        "language": "English / German",
        "logline": "A disgraced Cold War archivist in winter Vienna stumbles upon an encoded microfilm containing the final confession of a defected double agent.",
        "synopsis": "Amidst foggy cobblestone streets and baroque concert halls, Arthur Vance races against time to decrypt a 40-year-old dossier before an assassin cleanses all remaining witnesses.",
        "producerId": "USR-PROD-001",
        "producerName": "Sarah Jenkins",
        "directorId": "USR-DIR-001",
        "directorName": "Christopher Vance",
        "musicDirectorId": "USR-MUS-001",
        "musicDirectorName": "Kaelen Thorne",
        "status": MovieStatus.PRE_PRODUCTION.value,
        "budget": 12500000.0,
        "spentBudget": 2100000.0,
        "startDate": "2026-10-15",
        "endDate": "2027-02-28",
        "releaseDate": "2027-09-10",
        "posterUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
        "targetAudience": "Mystery fans, Cannes / Venice festival circuit",
        "productionCompany": "Europa Noir Studio",
        "members": [
            {"userId": "USR-PROD-001", "name": "Sarah Jenkins", "role": "PRODUCER", "joinedAt": "2026-08-01T00:00:00Z"},
            {"userId": "USR-DIR-001", "name": "Christopher Vance", "role": "DIRECTOR", "joinedAt": "2026-08-01T00:00:00Z"}
        ],
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    db.set_document("movies", movie_2_id, movie_2)

    # -------------------------------------------------------------
    # 3. CHARACTERS FOR AETHERIUM
    # -------------------------------------------------------------
    char_1_id = "CHR-001"
    char_1 = {
        "id": char_1_id,
        "movieId": movie_1_id,
        "name": "Commander Vesper Thorne",
        "roleType": "Lead",
        "age": "34",
        "gender": "Female",
        "description": "Ex-Tactical Commander turned clandestine memory recovery agent. Haunted by a synthetic grief chip that won't decommission.",
        "personalityTraits": ["Hyper-Vigilant", "Stoic", "Fiercely Loyal", "Strategically Brilliant"],
        "actorId": "USR-ACT-001",
        "actorName": "Elena Rostova",
        "castingStatus": "CAST",
        "sceneCount": 6,
        "scenesAppearedIn": [1, 2, 3, 4, 6, 8],
        "emotionalArc": "From hardened detachment and algorithmic cynicism to reclaiming raw human empathy and defiance.",
        "costumeNotes": "Reinforced charcoal Kevlar duster with concealed biometric sub-rig."
    }
    db.set_document("characters", char_1_id, char_1)

    char_2_id = "CHR-002"
    char_2 = {
        "id": char_2_id,
        "movieId": movie_1_id,
        "name": "Julian Mercer (Neural Architect)",
        "roleType": "Lead",
        "age": "46",
        "gender": "Male",
        "description": "The visionary engineer who coded the Aetherium Consensus Engine. Outwardly benevolent, terrifyingly uncompromising in his pursuit of universal serenity.",
        "personalityTraits": ["Charismatic", "Coldly Rational", "Philosophical", "Unsettling"],
        "actorId": "USR-ACT-002",
        "actorName": "Marcus Cole",
        "castingStatus": "CAST",
        "sceneCount": 4,
        "scenesAppearedIn": [2, 5, 7, 8],
        "emotionalArc": "Unravels as his perfect mathematical utopia encounters the chaotic beauty of uncontrolled human sacrifice.",
        "costumeNotes": "Minimalist ivory tailored tunic with matte black graphene cuffs."
    }
    db.set_document("characters", char_2_id, char_2)

    char_3_id = "CHR-003"
    char_3 = {
        "id": char_3_id,
        "movieId": movie_1_id,
        "name": "Dr. Kaelen Voss",
        "roleType": "Supporting",
        "age": "52",
        "gender": "Male",
        "description": "Underground neural cyber-surgeon operating in the flooded substructure of Sector 9.",
        "personalityTraits": ["Eccentric", "Skeptical", "Cautious", "Protective"],
        "actorId": None,
        "actorName": None,
        "castingStatus": "UNASSIGNED",
        "sceneCount": 3,
        "scenesAppearedIn": [1, 3, 6],
        "emotionalArc": "Rediscovers his moral courage when Vesper brings him the encrypted memory fragment.",
        "costumeNotes": "Stained surgical apron over weathered thermal bodysuit with augmented optic loupe."
    }
    db.set_document("characters", char_3_id, char_3)

    # -------------------------------------------------------------
    # 4. SCENES FOR AETHERIUM
    # -------------------------------------------------------------
    scenes = [
        {
            "id": "SCN-001",
            "movieId": movie_1_id,
            "sceneNumber": 1,
            "heading": "EXT. SECTOR 9 NEON SUB-LEVEL - NIGHT",
            "setting": "EXT",
            "timeOfDay": "NIGHT",
            "location": "Sector 9 Sub-Level Alleyway",
            "synopsis": "Acid rain cascades down monolithic skyscraper billboards. Vesper Thorne moves through the dense steam of noodle stalls, scanning for surveillance drones before entering Voss's black clinic.",
            "characters": ["Commander Vesper Thorne", "Dr. Kaelen Voss"],
            "dialogueCount": 8,
            "keyDialogueSnippet": "VESPER: If the pulse sweeps this grid before midnight, we are both ghosts.",
            "emotionalTone": "Tense & Atmospheric",
            "props": ["Encrypted Quantum Memory Drive", "Biometric Jammer", "Heavy Rain Hood"],
            "costumes": ["Charcoal Kevlar Duster", "Thermal Wet Weather Boots"],
            "vfxNotes": "Continuous anamorphic lens flares from holographic billboards with real rainfall effects",
            "musicCue": "Low analog drone (Sub 40Hz) with solo muted cello weeping in D Dorian mode",
            "status": "COMPLETED",
            "scheduledDate": "2026-06-15",
            "shootingDurationHours": 4.0,
            "shotListSuggestions": [
                "Wide establishing shot on 28mm Anamorphic with rain cascade foreground",
                "Medium tracking shot following Vesper's boots splashing through neon-reflective puddles",
                "Extreme close-up on Vesper's iris reflecting the flickering hologram"
            ]
        },
        {
            "id": "SCN-002",
            "movieId": movie_1_id,
            "sceneNumber": 2,
            "heading": "INT. AETHERIUM EXECUTIVE SANCTUM - DAY",
            "setting": "INT",
            "timeOfDay": "DAY",
            "location": "Aetherium Tower Apex Floor",
            "synopsis": "Julian Mercer overlooks the smog-shrouded skyline from a pristine white glass boardroom. He learns of the anomaly breach in Sector 9 and orders the eradication protocols.",
            "characters": ["Julian Mercer (Neural Architect)", "Commander Vesper Thorne"],
            "dialogueCount": 14,
            "keyDialogueSnippet": "MERCER: Pain is merely an unoptimized equation. I have given this city peace.",
            "emotionalTone": "Chilling & Authoritative",
            "props": ["Holographic Data Sphere", "Vintage Crystal Glass with Still Water"],
            "costumes": ["Ivory Silk Tunic", "Matte Black Security Uniforms"],
            "vfxNotes": "Volumetric clouds drifting outside 80-foot panoramic smart-glass windows",
            "musicCue": "Pristine acoustic felt piano in C Minor with glassy high-frequency synth pads",
            "status": "COMPLETED",
            "scheduledDate": "2026-06-20",
            "shootingDurationHours": 3.0,
            "shotListSuggestions": [
                "Slow push-in 50mm Master framed symmetrically down the marble conference table",
                "Low angle medium profile of Mercer framing him against the clouds",
                "Reverse angle on security subordinates standing at rigid attention"
            ]
        },
        {
            "id": "SCN-003",
            "movieId": movie_1_id,
            "sceneNumber": 3,
            "heading": "INT. DR. VOSS'S SURGICAL VAULT - NIGHT",
            "setting": "INT",
            "timeOfDay": "NIGHT",
            "location": "Dr. Voss Underground Clinic",
            "synopsis": "Voss hooks Vesper into an archaic neural terminal to extract the encrypted memory fragment. As the data streams, Vesper experiences violent flashbacks of the First Consensus War.",
            "characters": ["Commander Vesper Thorne", "Dr. Kaelen Voss"],
            "dialogueCount": 16,
            "keyDialogueSnippet": "VOSS: Brace yourself. This memory wasn't deleted to protect the city—it was deleted to protect him.",
            "emotionalTone": "Visceral & Suspenseful",
            "props": ["Neural Extraction Needle Rig", "Flickering CRT Oscilloscopes", "Sedative Syringe"],
            "costumes": ["Blood-stained surgical scrubs", "Open neck tactical undershirt"],
            "vfxNotes": "Strobe light flash transitions matching EEG neural spikes on physical monitors",
            "musicCue": "Heartbeat pulse accelerating at 130 BPM with distorted cello harmonics",
            "status": "IN_PROGRESS",
            "scheduledDate": "2026-07-05",
            "shootingDurationHours": 5.0,
            "shotListSuggestions": [
                "Overhead Dutch-angle bird's eye view of the surgical chair",
                "Dutch angle handheld close-up of Voss's trembling fingers on the console",
                "85mm tight closeup on Vesper's dilated pupils during flashback bursts"
            ]
        },
        {
            "id": "SCN-004",
            "movieId": movie_1_id,
            "sceneNumber": 4,
            "heading": "EXT. ROOFTOP SKY-BRIDGE ESCAPE - NIGHT",
            "setting": "EXT",
            "timeOfDay": "NIGHT",
            "location": "Rooftop Sky-Bridge connecting Tower 4 and Tower 5",
            "synopsis": "Security Enforcers ambush Vesper on an exposed suspension bridge 1,000 feet above the metropolis in blinding rain. Vesper executes a precision tactical breach.",
            "characters": ["Commander Vesper Thorne"],
            "dialogueCount": 4,
            "keyDialogueSnippet": "VESPER: You can't execute someone whose mind was never on your server.",
            "emotionalTone": "High Octane & Explosive",
            "props": ["Tactical EMP Pulse Rifle", "Wire Stunt Harness", "Smoke Grenades"],
            "costumes": ["Soaked tactical gear with LED shoulder beacon"],
            "vfxNotes": "Pyrotechnic muzzle flashes and sparks reflecting off wet suspension cables",
            "musicCue": "Massive orchestral brass fanfare paired with 808 sub-bass drops and industrial percussion",
            "status": "PLANNED",
            "scheduledDate": "2026-09-12",
            "shootingDurationHours": 6.0,
            "shotListSuggestions": [
                "Technocrane tracking shot sweeping 360 degrees around the sky-bridge",
                "Dynamic Steadicam chase following Vesper sliding beneath the heavy blast door",
                "High-speed 240fps phantom camera capture of glass explosion"
            ]
        }
    ]

    for sc in scenes:
        db.set_document("scenes", sc["id"], sc)

    # -------------------------------------------------------------
    # 5. CASTING REQUESTS
    # -------------------------------------------------------------
    cast_req_1 = {
        "id": "CR-001",
        "movieId": movie_1_id,
        "movieTitle": "AETHERIUM: Chronicles of 2088",
        "actorId": "USR-ACT-001",
        "actorName": "Elena Rostova",
        "actorEmail": "actor@movieos.cinema",
        "directorId": "USR-DIR-001",
        "directorName": "Christopher Vance",
        "producerId": "USR-PROD-001",
        "characterId": char_1_id,
        "characterName": "Commander Vesper Thorne",
        "characterDescription": "Lead female cyber-investigator with psychological depth and physical stamina.",
        "roleType": "Lead",
        "offeredFee": 3500000.0,
        "shootingDates": "June 15, 2026 - November 20, 2026",
        "locations": "Tokyo Studios & Berlin Soundstage Stage 4",
        "roleRequirements": "Extensive wirework stunt training, Russian accent fluency, underwater sequence.",
        "message": "Elena, you are the definitive Vesper Thorne. Your stillness and depth in 'The Silence Below' proved you can carry this franchise.",
        "status": CastingStatus.ACCEPTED.value,
        "actorResponseNote": "Honored to bring Vesper Thorne to life. Let's make cinema history.",
        "createdAt": "2026-05-10T10:00:00Z",
        "updatedAt": "2026-05-12T14:30:00Z"
    }
    db.set_document("castingRequests", cast_req_1["id"], cast_req_1)

    # -------------------------------------------------------------
    # 6. SCHEDULES & CALL SHEETS
    # -------------------------------------------------------------
    schedules = [
        {
            "id": "SCH-001",
            "movieId": movie_1_id,
            "sceneId": "SCN-001",
            "sceneNumber": 1,
            "title": "Day 1: Sector 9 Neon Alleyway Rain Shoot",
            "shootingDate": "2026-06-15",
            "startTime": "18:00",
            "endTime": "04:00",
            "location": "Pinewood Stage A (Water Tank)",
            "setting": "EXT",
            "charactersNeeded": ["Commander Vesper Thorne", "Dr. Kaelen Voss"],
            "equipmentNeeded": ["ARRI Alexa 35 Anamorphic", "Rain Tower Rig", "20x20 Softbox Silks", "Ronin 2 Gimbal"],
            "propsNeeded": ["Quantum Drive", "Biometric Jammer"],
            "status": "COMPLETED",
            "weatherRiskLevel": "LOW",
            "notes": "Night shoot. Heated tents on standby for cast during water tank resets."
        },
        {
            "id": "SCH-002",
            "movieId": movie_1_id,
            "sceneId": "SCN-002",
            "sceneNumber": 2,
            "title": "Day 5: Aetherium Boardroom Sunlit Dialogue",
            "shootingDate": "2026-06-20",
            "startTime": "07:00",
            "endTime": "16:00",
            "location": "Sony Stage 7 Soundstage",
            "setting": "INT",
            "charactersNeeded": ["Julian Mercer (Neural Architect)", "Commander Vesper Thorne"],
            "equipmentNeeded": ["ARRI Master Anamorphic Primes", "18K HMI Fresnels", "Chapman Hustler Dolly"],
            "propsNeeded": ["Holo Sphere", "Crystal Glasses"],
            "status": "COMPLETED",
            "weatherRiskLevel": "LOW",
            "notes": "Sound recording priority. Verify air conditioning is cycled off during camera takes."
        },
        {
            "id": "SCH-003",
            "movieId": movie_1_id,
            "sceneId": "SCN-004",
            "sceneNumber": 4,
            "title": "Day 24: Exterior Sky-Bridge Stunt Action Climax",
            "shootingDate": "2026-09-12",
            "startTime": "19:00",
            "endTime": "05:00",
            "location": "Tokyo Sky-Tower Observation Bridge",
            "setting": "EXT",
            "charactersNeeded": ["Commander Vesper Thorne"],
            "equipmentNeeded": ["50ft Supertechnocrane", "Stunt Wire Rigs", "High-Speed Phantom 4K", "Industrial Wind Machines"],
            "propsNeeded": ["Tactical EMP Rifle", "Debris Shards"],
            "status": "SCHEDULED",
            "weatherRiskLevel": "HIGH",
            "notes": "EXTERIOR SHOOT — OpenWeather alert flagged potential precipitation. Soundstage Rain Cover B is on standby."
        }
    ]

    for sch in schedules:
        db.set_document("schedules", sch["id"], sch)

    # -------------------------------------------------------------
    # 7. PRODUCTION DEPARTMENTS & EXPENSES
    # -------------------------------------------------------------
    departments = [
        {"id": "DEP-01", "movieId": movie_1_id, "name": "Camera & Grip", "headOfDepartment": "Greig Fraser, ASC", "headContact": "greig@cinematography.com", "teamCount": 24, "budgetAllocated": 6500000.0, "budgetSpent": 3200000.0, "status": "ON_TRACK", "taskSummary": "Custom ARRI anamorphic lens tuning completed."},
        {"id": "DEP-02", "movieId": movie_1_id, "name": "Art & Set Construction", "headOfDepartment": "Nathan Crowley", "headContact": "nathan@artdept.com", "teamCount": 42, "budgetAllocated": 8500000.0, "budgetSpent": 5800000.0, "status": "ON_TRACK", "taskSummary": "Sector 9 Alleyway and Boardroom sets locked."},
        {"id": "DEP-03", "movieId": movie_1_id, "name": "Costume & Wardrobe", "headOfDepartment": "Jacqueline Durran", "headContact": "jacqueline@costumedesign.com", "teamCount": 16, "budgetAllocated": 2200000.0, "budgetSpent": 1400000.0, "status": "ON_TRACK", "taskSummary": "Vesper Kevlar duster multiples built for stunt doubles."},
        {"id": "DEP-04", "movieId": movie_1_id, "name": "Visual Effects (VFX)", "headOfDepartment": "Paul Lambert (DNEG)", "headContact": "paul@dneg.com", "teamCount": 35, "budgetAllocated": 12000000.0, "budgetSpent": 4100000.0, "status": "ON_TRACK", "taskSummary": "On-set LIDAR scans and LED volume backgrounds rendered in Unreal Engine 5.5."},
        {"id": "DEP-05", "movieId": movie_1_id, "name": "Sound & Music Score", "headOfDepartment": "Kaelen Thorne", "headContact": "kaelen@music.com", "teamCount": 8, "budgetAllocated": 1800000.0, "budgetSpent": 750000.0, "status": "ON_TRACK", "taskSummary": "Main theme approved. 6 cue demos in active orchestration."}
    ]

    for dep in departments:
        db.set_document("departments", dep["id"], dep)

    expenses = [
        {"id": "EXP-001", "movieId": movie_1_id, "category": "Production & Camera", "department": "Camera & Grip", "description": "ARRI Alexa 35 4-Camera Package 6-week rental", "amount": 185000.0, "date": "2026-06-01", "vendor": "Panavision Worldwide", "approvedBy": "Sarah Jenkins", "status": "APPROVED"},
        {"id": "EXP-002", "movieId": movie_1_id, "category": "Art, Costume & Makeup", "department": "Art & Set Construction", "description": "Practical Neon Signage & Atmospheric Smoke Systems", "amount": 142000.0, "date": "2026-06-10", "vendor": "SFX Stage FX Ltd", "approvedBy": "Sarah Jenkins", "status": "APPROVED"},
        {"id": "EXP-003", "movieId": movie_1_id, "category": "Post-Production & VFX", "department": "Sound & Music Score", "description": "Abbey Road Studio 1 40-Piece String Section Recording Session", "amount": 95000.0, "date": "2026-06-28", "vendor": "Abbey Road Studios London", "approvedBy": "Sarah Jenkins", "status": "APPROVED"}
    ]

    for exp in expenses:
        db.set_document("expenses", exp["id"], exp)

    # -------------------------------------------------------------
    # 8. MUSIC PROJECT, TRACKS & THEMES
    # -------------------------------------------------------------
    music_proj = {
        "id": "MUS-PROJ-001",
        "movieId": movie_1_id,
        "musicDirectorId": "USR-MUS-001",
        "overview": "Hybrid Electronic-Orchestral Score exploring the loss of biological empathy in a synthesized society.",
        "sonicPalette": "Buchla & Moog Modular Synthesizers, Solo Bowed Hardanger Fiddle, 60-piece Low Brass & Celli",
        "targetDeliveryDate": "2027-01-15",
        "totalCues": 4,
        "approvedCues": 2,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    db.set_document("musicProjects", music_proj["id"], music_proj)

    music_tracks = [
        {
            "id": "TRK-001",
            "movieId": movie_1_id,
            "musicProjectId": "MUS-PROJ-001",
            "title": "Vesper's Echo (Main Theme)",
            "trackType": "THEME",
            "sceneNumber": 1,
            "characterName": "Commander Vesper Thorne",
            "mood": "Haunting, Melancholic, Resilient",
            "bpm": 76,
            "keySignature": "D Dorian",
            "durationSeconds": 245,
            "audioUrl": "https://assets.mixkit.co/music/preview/mixkit-cinematic-mystery-suspense-hum-2852.mp3",
            "waveformPeaks": [0.1, 0.3, 0.5, 0.7, 0.85, 0.9, 0.6, 0.4, 0.7, 0.95, 0.8, 0.5, 0.3, 0.2, 0.1],
            "instrumentsUsed": ["Solo Bowed Cello", "Moog Sub 37", "Granular Vocal Textures", "Orchestral Violins"],
            "notes": "Establishes Vesper's internal conflict. Modulates from felt piano to crushing analog bass.",
            "status": TrackStatus.APPROVED.value,
            "directorFeedback": "Magnificent work, Kaelen. The cello tone in the 2nd minute captures Vesper's grief flawlessly. Approved for Final Cut.",
            "directorRating": 5,
            "submittedAt": "2026-06-18T12:00:00Z",
            "createdAt": "2026-06-15T09:00:00Z",
            "updatedAt": "2026-06-19T10:00:00Z"
        },
        {
            "id": "TRK-002",
            "movieId": movie_1_id,
            "musicProjectId": "MUS-PROJ-001",
            "title": "Sanctum of Silence (Mercer's Motif)",
            "trackType": "THEME",
            "sceneNumber": 2,
            "characterName": "Julian Mercer (Neural Architect)",
            "mood": "Cold, Architectural, Cerebral",
            "bpm": 60,
            "keySignature": "C Minor",
            "durationSeconds": 190,
            "audioUrl": "https://assets.mixkit.co/music/preview/mixkit-atmospheric-space-ambient-2788.mp3",
            "waveformPeaks": [0.2, 0.2, 0.3, 0.4, 0.4, 0.5, 0.5, 0.6, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2],
            "instrumentsUsed": ["Pristine Felt Upright Piano", "Glass Harmonica", "High-frequency Sine Waves"],
            "notes": "Mercer believes in perfect mathematical order. The rhythm is mathematically rigid with zero rubato.",
            "status": TrackStatus.APPROVED.value,
            "directorFeedback": "The stark minimalism against the boardroom glass is chilling. Approved.",
            "directorRating": 5,
            "submittedAt": "2026-06-22T14:00:00Z",
            "createdAt": "2026-06-20T11:00:00Z",
            "updatedAt": "2026-06-23T09:00:00Z"
        },
        {
            "id": "TRK-003",
            "movieId": movie_1_id,
            "musicProjectId": "MUS-PROJ-001",
            "title": "Neural Extraction (Flashback Sequence)",
            "trackType": "BGM",
            "sceneNumber": 3,
            "characterName": None,
            "mood": "Visceral, Tense, Distorted",
            "bpm": 132,
            "keySignature": "F Minor",
            "durationSeconds": 210,
            "audioUrl": "https://assets.mixkit.co/music/preview/mixkit-intense-action-trailer-649.mp3",
            "waveformPeaks": [0.3, 0.6, 0.8, 0.95, 0.9, 0.85, 0.7, 0.9, 1.0, 0.8, 0.6, 0.4, 0.2],
            "instrumentsUsed": ["Distorted Celli", "Eurorack Noise Generators", "Heartbeat Sub Kicks", "Anvil Strikes"],
            "notes": "Crescendo syncs directly with the EEG monitor readout in Scene 3.",
            "status": TrackStatus.SUBMITTED.value,
            "directorFeedback": None,
            "directorRating": None,
            "submittedAt": "2026-07-06T16:00:00Z",
            "createdAt": "2026-07-05T10:00:00Z",
            "updatedAt": "2026-07-06T16:00:00Z"
        }
    ]

    for trk in music_tracks:
        db.set_document("musicTracks", trk["id"], trk)

    # -------------------------------------------------------------
    # 9. NOTIFICATIONS
    # -------------------------------------------------------------
    notifications = [
        {
            "id": "NOT-001",
            "userId": "USR-ACT-001",
            "senderId": "USR-DIR-001",
            "senderName": "Christopher Vance",
            "senderRole": "DIRECTOR",
            "movieId": movie_1_id,
            "movieTitle": "AETHERIUM: Chronicles of 2088",
            "type": "CASTING_OFFER",
            "title": "Official Casting Offer: Commander Vesper Thorne",
            "message": "Director Christopher Vance offered you the Lead role in 'AETHERIUM: Chronicles of 2088'.",
            "actionUrl": "/actor",
            "isRead": True,
            "createdAt": "2026-05-10T10:00:00Z"
        },
        {
            "id": "NOT-002",
            "userId": "USR-DIR-001",
            "senderId": "USR-ACT-001",
            "senderName": "Elena Rostova",
            "senderRole": "ACTOR",
            "movieId": movie_1_id,
            "movieTitle": "AETHERIUM: Chronicles of 2088",
            "type": "CASTING_RESPONSE",
            "title": "Casting Accepted: Elena Rostova is Commander Vesper Thorne!",
            "message": "Elena Rostova accepted your casting offer for Vesper Thorne.",
            "actionUrl": "/director",
            "isRead": True,
            "createdAt": "2026-05-12T14:30:00Z"
        },
        {
            "id": "NOT-003",
            "userId": "USR-DIR-001",
            "senderId": "USR-MUS-001",
            "senderName": "Kaelen Thorne",
            "senderRole": "MUSIC_DIRECTOR",
            "movieId": movie_1_id,
            "movieTitle": "AETHERIUM: Chronicles of 2088",
            "type": "MUSIC_SUBMISSION",
            "title": "New Cue Submitted: 'Neural Extraction (Flashback Sequence)'",
            "message": "Music Director Kaelen Thorne submitted Scene 3 score for your directorial review.",
            "actionUrl": "/director",
            "isRead": False,
            "createdAt": "2026-07-06T16:00:00Z"
        },
        {
            "id": "NOT-004",
            "userId": "USR-PROD-001",
            "senderId": "SYSTEM",
            "senderName": "MovieOS Weather Engine",
            "senderRole": "SYSTEM",
            "movieId": movie_1_id,
            "movieTitle": "AETHERIUM: Chronicles of 2088",
            "type": "RISK_ALERT",
            "title": "Schedule Risk Alert: High Precipitation on Day 24 Exterior Shoot",
            "message": "OpenWeather flagged 75% rain probability for Sky-Bridge shoot. Rain cover soundstage recommended.",
            "actionUrl": "/producer",
            "isRead": False,
            "createdAt": "2026-08-15T08:00:00Z"
        }
    ]

    for notif in notifications:
        db.set_document("notifications", notif["id"], notif)

    print(" [MovieOS Seeder] Database seeding complete! 2 Movies, 6 Users, 4 Scenes, 3 Characters, 3 Tracks, Schedules & Notifications created.")

if __name__ == "__main__":
    seed_database()
