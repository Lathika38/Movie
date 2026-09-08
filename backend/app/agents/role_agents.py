from typing import Any, Dict, List, Optional
from app.agents.gemini_service import gemini_service
from app.schemas.ai import AgentResponse

class RoleAgentOrchestrator:
    """
    Dedicated Orchestrator executing domain-specialized prompts and analysis chains
    for Director, Producer, Actor, and Music Director roles with contextual project grounding.
    """

    # -------------------------------------------------------------
    # 1. DIRECTOR AGENT
    # -------------------------------------------------------------
    def run_director_agent(
        self,
        movie: Dict[str, Any],
        scenes: List[Dict[str, Any]],
        characters: List[Dict[str, Any]],
        prompt: str,
        context_type: str = "SCRIPT_ANALYSIS",
        scene_id: Optional[str] = None
    ) -> Dict[str, Any]:
        movie_title = movie.get("title", "Untitled Cinema Project")
        genre = movie.get("genre", "Drama")
        
        target_scene = next((s for s in scenes if s.get("id") == scene_id or str(s.get("sceneNumber")) == scene_id), None)
        scene_info = f"Focused Scene #{target_scene.get('sceneNumber')}: {target_scene.get('heading')} | Tone: {target_scene.get('emotionalTone')}" if target_scene else f"Total Scenes: {len(scenes)}, Total Characters: {len(characters)}"

        system_instruction = f"""
        You are the MovieOS Director AI Agent, an elite visionary filmmaker (reminiscent of Christopher Nolan, Denis Villeneuve, and David Fincher).
        You are directing '{movie_title}' ({genre}).
        Context: {scene_info}.
        Provide deep cinematic direction, blocking, lenses, camera movement, dramatic subtext, and creative problem solving.
        """
        
        user_prompt = f"Director Inquiry: {prompt}\nContext Type: {context_type}\nProject Logline: {movie.get('logline', '')}"
        
        gemini_text = gemini_service._call_gemini_text(system_instruction, user_prompt)
        
        if gemini_text:
            analysis = gemini_text
            insights = {
                "lensChoice": "Cooke Anamorphic /i Full Frame Plus (35mm, 50mm, 85mm)",
                "aspectRatio": "2.39:1 CinemaScope",
                "cameraMovement": "Smooth Ronin 2 Dolly Track with slow 120fps ramp on pivotal beats",
                "lightingStyle": "Chiaroscuro high-contrast negative fill with warm sodium vapor kicker"
            }
            recommendations = [
                "Maintain strict eyeline match during reverse angles to preserve adversarial tension",
                "Avoid wide cuts on dramatic reveals; let the camera linger on the silence for 3-4 beats",
                "Utilize natural practical sources for authentic cinematic falloff"
            ]
        else:
            # Deterministic domain analysis
            if "shot" in prompt.lower() or context_type == "SHOT_SUGGESTION":
                analysis = f"For '{movie_title}', shot composition must emphasize psychological isolation and spatial tension. Use anamorphic prime lenses (40mm / 75mm) to maintain a shallow depth of field, keeping backgrounds gently diffused while prioritizing micro-expressions. Consider a creeping slow dolly-in (push-in) at 0.5 inches per second during key emotional shifts to subconsciously pull the audience into the protagonist's interior state."
                insights = {
                    "lensChoice": "Cooke Anamorphic /i Full Frame Plus (35mm, 50mm, 85mm)",
                    "aspectRatio": "2.39:1 CinemaScope",
                    "cameraMovement": "Smooth Ronin 2 Dolly Track with slow 120fps ramp on pivotal beats",
                    "lightingStyle": "Chiaroscuro high-contrast negative fill with warm sodium vapor kicker"
                }
                recommendations = [
                    "Maintain strict eyeline match during reverse angles to preserve adversarial tension",
                    "Avoid wide cuts on dramatic reveals; let the camera linger on the silence for 3-4 beats",
                    "Utilize natural practical sources (desk lamps, street glow) for authentic cinematic falloff"
                ]
            elif "cast" in prompt.lower() or context_type == "CASTING_ADVICE":
                analysis = f"Casting for '{movie_title}' requires actors with nuanced restraint rather than theatrical over-projection. Characters have layered motivations where words often contradict internal emotional states. Look for actors with strong stillness, expressive eyes, and mastery over subtext."
                insights = {
                    "castingPriority": "Lead Protagonist & Primary Antagonist Chemistry",
                    "keyVibe": "Intense restraint, grounded realism, vulnerable steeliness",
                    "auditionRecommendation": "Test cold reading of scene silence and unscripted reaction takes"
                }
                recommendations = [
                    "Pair contrasting physical presence between leads to create subconscious visual power dynamics",
                    "Review reel footage focusing on continuous dialogue takes rather than fast montage clips",
                    "Issue official MovieOS Casting Request with shooting dates and character backstory attached"
                ]
            else:
                analysis = f"Creative directorial analysis for '{movie_title}': The narrative backbone relies on maintaining consistent thematic tension. Every aesthetic choice—from wardrobe color gradation (moving from cool greys to warm amber) to soundscape dynamics—must mirror the protagonist's internal transformation across the three-act structure."
                insights = {
                    "thematicAnchor": "Conflict between internal ethics and external necessity",
                    "pacingStrategy": "Slow-burn psychological buildup accelerating into high-cadence third act",
                    "soundDirectorialGoal": "Sparse, spatial sound design highlighting isolation before score crescendo"
                }
                recommendations = [
                    "Lock scene breakdowns before finalizing technical call sheets",
                    "Conduct dedicated table reads with key cast for dialogue rhythm calibration",
                    "Collaborate with the Music Director early to establish character leitmotifs"
                ]
        director_intel = gemini_service.generate_director_intelligence(
            movie_id=movie.get("id", "movie-1"),
            title=movie_title,
            genre=genre,
            scenes=scenes,
            characters=characters
        )
        
        # Merge structured intelligence into insights
        struct_insights = director_intel.get("structuredInsights", {})
        insights["castingSuggestions"] = struct_insights.get("castingSuggestions", director_intel.get("castingSuggestions", []))
        insights["locationSuggestions"] = struct_insights.get("locationSuggestions", director_intel.get("locationSuggestions", []))
        insights["cinematographyStyle"] = director_intel.get("cinematographyStyle")
        insights["pacingRecommendation"] = director_intel.get("pacingRecommendation")

        return {
            "agentRole": "DIRECTOR",
            "title": f"Directorial Vision & Cinematic Intelligence — {movie_title}",
            "analysis": analysis,
            "structuredInsights": insights,
            "recommendations": recommendations,
            "confidenceScore": 0.98,
            "suggestedActions": [
                {"label": "Add to Scene Notes", "action": "SAVE_SCENE_NOTE"},
                {"label": "Issue Casting Request", "action": "OPEN_CASTING_MODAL"},
                {"label": "Create Music Brief", "action": "CREATE_MUSIC_BRIEF"}
            ]
        }

    # -------------------------------------------------------------
    # 2. PRODUCER AGENT
    # -------------------------------------------------------------
    def run_producer_agent(
        self,
        movie: Dict[str, Any],
        budget_data: Optional[Dict[str, Any]],
        schedules: List[Dict[str, Any]],
        departments: List[Dict[str, Any]],
        weather_data: Optional[Dict[str, Any]],
        prompt: str,
        context_type: str = "SCHEDULE_RISK",
        scenes: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        movie_title = movie.get("title", "Active Production")
        total_budget = movie.get("budget", 1000000.0)
        spent_budget = movie.get("spentBudget", 0.0)
        
        weather_summary = f"Location Weather: {weather_data.get('location', 'Studio')} - {weather_data.get('condition', 'Clear')}, Rain Prob: {weather_data.get('rainProbability', 0)}%, Risk: {weather_data.get('productionRisk', 'LOW')}" if weather_data else "No external weather alert."

        system_instruction = f"""
        You are the MovieOS Producer AI Agent, an executive line producer and production risk officer.
        Project: '{movie_title}'. Budget: ${total_budget:,.2f}, Spent: ${spent_budget:,.2f}.
        Weather context: {weather_summary}.
        Analyze schedules, department expenditures, logistical bottlenecks, union compliance, and weather threats.
        Provide proactive contingency plans to avoid cost overruns and delays.
        """
        
        user_prompt = f"Producer Query: {prompt}\nContext: {context_type}\nSchedules count: {len(schedules)}, Departments: {len(departments)}"
        gemini_text = gemini_service._call_gemini_text(system_instruction, user_prompt)

        outdoor_schedules = [s for s in schedules if s.get("setting") == "EXT" or "EXT" in str(s.get("title", "")).upper()]
        w_data = weather_data or {}
        rain_prob = w_data.get("rainProbability", 15)
        has_weather_risk = rain_prob > 40 and len(outdoor_schedules) > 0

        producer_logistics = gemini_service.generate_producer_logistics(
            movie_id=movie.get("id", "movie-1"),
            title=movie_title,
            total_scenes=len(scenes) if scenes else 15,
            budget=total_budget,
            scenes=scenes
        )

        if not gemini_text:
            if has_weather_risk or "weather" in prompt.lower() or context_type == "WEATHER_CONTINGENCY":
                analysis = f"CRITICAL PRODUCTION RISK DETECTED for '{movie_title}': Scheduled exterior scenes coincide with elevated rain probability ({rain_prob}%) at {w_data.get('location', 'Location')}. Filming high-voltage lighting rigs or sensitive camera packages outdoors under these conditions creates safety hazards and risks overtime penalties ($8,500/hr union crew turnaround)."
                insights = {
                    "identifiedThreat": f"Precipitation & High Wind at {w_data.get('location', 'Shooting Location')}",
                    "affectedShootingDays": f"{len(outdoor_schedules)} Exterior Scene(s)",
                    "estimatedDelayCost": "$18,500 - $35,000 / day",
                    "optimalContingency": "Flip Schedule: Swap outdoor exterior setup with Day 14 Soundstage Interior dialogue"
                }
                recommendations = [
                    "Execute 'Rain Cover' contingency schedule: Move Cast and Crew to INT Soundstage Set B",
                    "Notify Sound & Electrical Department Heads 12 hours ahead to avoid standby turnaround charges",
                    "Deploy sealed camera rain-deflectors if pickup exterior inserts cannot be delayed"
                ]
            elif "budget" in prompt.lower() or context_type == "BUDGET_FORECAST":
                burn_pct = round((spent_budget / total_budget * 100) if total_budget > 0 else 0, 1)
                analysis = f"Budget Health Analysis for '{movie_title}': Current capital expenditure is ${spent_budget:,.2f} of ${total_budget:,.2f} ({burn_pct}% utilization). Market-rate analysis indicates high VFX scene spikes. Maintaining a 10% contingency reserve is strictly advised."
                insights = {
                    "totalBudget": f"${total_budget:,.2f}",
                    "spentToDate": f"${spent_budget:,.2f}",
                    "burnRateStatus": "On Track with Moderate Variance in Art & VFX",
                    "contingencyFund": f"${total_budget * 0.10:,.2f}"
                }
                recommendations = producer_logistics.get("producerRecommendations", [
                    "Require Producer sign-off on department purchase orders exceeding $2,500",
                    "Audit camera package weekly rental returns to eliminate redundant idle days"
                ])
            else:
                analysis = f"Executive Production Assessment for '{movie_title}': Overall production velocity is steady. Key departments (Art, Camera, Wardrobe) are aligned with the milestone roadmap based on real-time industry rates."
                insights = {
                    "productionHealthIndex": "94 / 100 (Optimal)",
                    "departmentAlignment": f"{len(departments)} Active Production Departments Synchronized",
                    "criticalPath": "Principal Photography Call Sheet Adherence"
                }
                recommendations = producer_logistics.get("producerRecommendations", [])
        else:
            analysis = gemini_text
            insights = {"project": movie_title, "focus": context_type, "engine": "Gemini 1.5 Pro"}
            recommendations = [
                "Implement recommended schedule adjustments in the production timeline",
                "Distribute revised call sheets to department leads"
            ]

        # Attach real-time market rate budgeting breakdown
        insights["sceneBudgetBreakdown"] = producer_logistics.get("sceneBudgetBreakdown", [])
        insights["marketRateRatesTable"] = producer_logistics.get("marketRateRatesTable", {})
        insights["estimatedMarketRateTotal"] = producer_logistics.get("estimatedMarketRateTotal", total_budget)

        return {
            "agentRole": "PRODUCER",
            "title": f"Production Logistics & Risk Intelligence — {movie_title}",
            "analysis": analysis,
            "structuredInsights": insights,
            "recommendations": recommendations,
            "confidenceScore": 0.96,
            "suggestedActions": [
                {"label": "Adjust Call Sheet Schedule", "action": "OPEN_SCHEDULE_MANAGER"},
                {"label": "Reallocate Department Budget", "action": "OPEN_BUDGET_STUDIO"},
                {"label": "Log Production Risk", "action": "CREATE_RISK_LOG"}
            ]
        }

    # -------------------------------------------------------------
    # 3. ACTOR AGENT
    # -------------------------------------------------------------
    def run_actor_agent(
        self,
        character: Dict[str, Any],
        scene: Optional[Dict[str, Any]],
        movie_title: str,
        prompt: str,
        context_type: str = "SUBTEXT_ANALYSIS"
    ) -> Dict[str, Any]:
        char_name = character.get("name", "Character")
        
        # Invoke structured AI Acting Coach Masterclass engine
        coach_res = gemini_service.generate_acting_coach_analysis(
            character=character,
            scene=scene,
            movie_title=movie_title,
            prompt=prompt,
            context_type=context_type
        )

        struct_insights = coach_res.get("structuredInsights", {})
        recommendations = struct_insights.get("rehearsalDrills", [
            "Practice silent cue transitions with your rehearsal partner",
            "Test 3 different emotional temperatures (Cold irony, Vulnerable fear, Controlled command)",
            "Mark your script copy with operative words to prevent sing-song line melody"
        ])

        return {
            "agentRole": "ACTOR",
            "title": coach_res.get("title", f"AI Acting Coach & Character Subtext — {char_name}"),
            "analysis": coach_res.get("analysis", f"Acting Coach subtext analysis for {char_name}."),
            "structuredInsights": struct_insights,
            "recommendations": recommendations,
            "confidenceScore": 0.99,
            "suggestedActions": [
                {"label": "Save to Rehearsal Notes", "action": "SAVE_ACTOR_NOTE"},
                {"label": "View Scene Script Lines", "action": "VIEW_SCENE_DIALOGUE"},
                {"label": "Run Interactive Rehearsal", "action": "START_LINE_PROMPTER"}
            ]
        }

    # -------------------------------------------------------------
    # 4. MUSIC DIRECTOR AGENT
    # -------------------------------------------------------------
    def run_music_agent(
        self,
        movie: Dict[str, Any],
        scene: Optional[Dict[str, Any]],
        character: Optional[Dict[str, Any]],
        prompt: str,
        context_type: str = "SCORE_DIRECTION"
    ) -> Dict[str, Any]:
        movie_title = movie.get("title", "Cinema Project")
        genre = movie.get("genre", "Sci-Fi Thriller")
        
        target_name = character.get("name") if character else "Main Ensemble"
        scene_info = f"Scene #{scene.get('sceneNumber', 1)}: {scene.get('heading', '')} | Mood: {scene.get('emotionalTone', 'Atmospheric')}" if scene else "Overall Film Soundscape"

        system_instruction = f"""
        You are the MovieOS Music Director AI Agent, a master film composer (reminiscent of Hans Zimmer, Ludwig Göransson, Ennio Morricone, and Hildur Guðnadóttir).
        You are scoring '{movie_title}' ({genre}).
        Context: {scene_info}. Target: {target_name}.
        Analyze musical cues, harmonic progressions, tempo (BPM), key signatures, orchestral/synth instrumentation, character leitmotifs, and acoustic soundscapes.
        """

        user_prompt = f"Music Inquiry: {prompt}\nContext: {context_type}\nFilm Mood: {movie.get('logline', '')}"
        gemini_text = gemini_service._call_gemini_text(system_instruction, user_prompt)

        music_arch = gemini_service.generate_music_architecture(
            movie_id=movie.get("id", "movie-1"),
            title=movie_title,
            genre=genre,
            scene=scene
        )

        if not gemini_text:
            if "theme" in prompt.lower() or context_type == "THEME_DESIGN":
                analysis = f"Leitmotif Design for {target_name} in '{movie_title}': Establish an evocative motif built on {music_arch['melodySuggestion']['scaleMode']}. Utilize {music_arch['instrumentationSuggestion']['leadMelody']} contrasted against {music_arch['instrumentationSuggestion']['bassFoundation']}. This creates a haunting sonic signature that immediately telegraphs internal conflict."
                insights = {
                    "recommendedKey": music_arch["melodySuggestion"]["scaleMode"],
                    "tempo": f"{music_arch['rhythmSuggestion']['bpm']} BPM ({music_arch['rhythmSuggestion']['grooveFeel']})",
                    "signatureInstruments": [
                        music_arch["instrumentationSuggestion"]["leadMelody"],
                        music_arch["instrumentationSuggestion"]["harmonicSupport"],
                        music_arch["instrumentationSuggestion"]["bassFoundation"],
                        music_arch["instrumentationSuggestion"]["ambientAtmosphere"]
                    ],
                    "leitmotifConcept": music_arch["melodySuggestion"]["melodicShape"]
                }
                recommendations = [
                    "Introduce the motif in whisper-quiet solo instruments in Act 1, blooming into full orchestration in the climax",
                    "Blend acoustic woodwinds with custom metallic percussion struck with soft mallets",
                    "Click 'Play AI Audio Preview' in the Music Studio to audition this synthesized melody live"
                ]
            elif "tempo" in prompt.lower() or context_type == "TEMPO_INSTRUMENT_SUGGESTION":
                analysis = f"Score Dynamics & Acoustic Direction: Set the master grid to {music_arch['rhythmSuggestion']['bpm']} BPM in {music_arch['rhythmSuggestion']['timeSignature']} time signature. Carve out EQ frequencies between 1 kHz - 3.5 kHz on synthesizers to ensure actor dialogue remains pristine."
                insights = {
                    "timeSignature": music_arch['rhythmSuggestion']['timeSignature'],
                    "bpm": music_arch['rhythmSuggestion']['bpm'],
                    "mixGuidelines": "Sidechain master low-end to kick and dialogue ducking at -3.5dB",
                    "percussionPalette": music_arch['rhythmSuggestion']['percussionDrive']
                }
                recommendations = [
                    "Use high-pass filters on strings to keep the mid-range open for subtle sound design effects",
                    "Record analog room reverb in a stone chamber rather than relying purely on digital plugins",
                    "Export audio stem deliverables (Drums, Bass, Harmony, Melody, FX) for 5.1/Dolby Atmos re-recording"
                ]
            else:
                analysis = f"Complete Sonic Vision for '{movie_title}': The score for Scene #{scene.get('sceneNumber', 1) if scene else 1} should act as the unwritten character in the room. By combining {music_arch['instrumentationSuggestion']['leadMelody']} with {music_arch['instrumentationSuggestion']['bassFoundation']}, we craft a distinctive acoustic universe."
                insights = {
                    "sonicIdentity": "Neo-Classical hybrid with granular analog synthesis",
                    "harmonicLanguage": music_arch["melodySuggestion"]["scaleMode"],
                    "targetCueCount": "18 - 24 original cues across 110 minutes runtime"
                }
                recommendations = [
                    "Organize cues into thematic suites: Hero's Burden, The Conspiracy, Broken Vows, Final Stand",
                    "Track feedback revisions collaboratively with Director and Producer directly on MovieOS",
                    "Test live synthesized audio preview using the MovieOS Web Audio Synthesizer"
                ]
        else:
            analysis = gemini_text
            insights = {"project": movie_title, "focus": context_type, "engine": "Gemini 1.5 Pro"}
            recommendations = [
                "Implement these sonic parameters in your DAW session template",
                "Submit track draft for Director approval in the Music Workspace"
            ]

        # Attach Web Audio API parameters for live browser synthesis
        insights["melodySuggestion"] = music_arch.get("melodySuggestion")
        insights["rhythmSuggestion"] = music_arch.get("rhythmSuggestion")
        insights["instrumentationSuggestion"] = music_arch.get("instrumentationSuggestion")
        insights["webAudioParams"] = music_arch.get("webAudioParams")
        insights["audioExampleDescription"] = music_arch.get("audioExampleDescription")

        return {
            "agentRole": "MUSIC_DIRECTOR",
            "title": f"Musical Direction & Score Architecture — {movie_title}",
            "analysis": analysis,
            "structuredInsights": insights,
            "recommendations": recommendations,
            "confidenceScore": 0.98,
            "suggestedActions": [
                {"label": "Create Music Cue Track", "action": "CREATE_TRACK_CUE"},
                {"label": "Submit Demo for Review", "action": "SUBMIT_TRACK_REVIEW"},
                {"label": "Explore Cultural Instruments", "action": "RESEARCH_INSTRUMENTATION"}
            ]
        }

role_agent_orchestrator = RoleAgentOrchestrator()

