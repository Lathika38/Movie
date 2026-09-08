import pytest
from app.agents.role_agents import role_agent_orchestrator
from app.agents.gemini_service import gemini_service

def test_director_ai_agent_casting_and_locations():
    movie = {
        "id": "test-movie-101",
        "title": "Nadhiyin Oram",
        "genre": "Coastal Thriller",
        "budget": 2500000.0,
        "logline": "An environmental documentary filmmaker uncovering illegal coastal dredging during monsoon storm."
    }
    scenes = [
        {"id": "s1", "sceneNumber": 1, "heading": "EXT. NADUKAVERI RIVERBANK - DAWN", "location": "Nadukaveri Riverbank", "setting": "EXT", "timeOfDay": "DAWN", "emotionalTone": "Atmospheric"},
        {"id": "s2", "sceneNumber": 2, "heading": "INT. KAVIN HOUSE - NIGHT", "location": "Kavin House", "setting": "INT", "timeOfDay": "NIGHT", "emotionalTone": "Intense dialogue"}
    ]
    characters = [
        {"id": "c1", "name": "Kavin", "roleType": "Lead", "description": "Aspiring filmmaker"},
        {"id": "c2", "name": "Nila", "roleType": "Lead", "description": "Local activist"},
        {"id": "c3", "name": "Dredging Boss", "roleType": "Supporting", "description": "Ruthless industrialist"}
    ]

    res = role_agent_orchestrator.run_director_agent(
        movie=movie,
        scenes=scenes,
        characters=characters,
        prompt="Analyze casting requirements and shooting places for Nadhiyin Oram"
    )

    assert res["agentRole"] == "DIRECTOR"
    assert "structuredInsights" in res
    insights = res["structuredInsights"]
    assert "castingSuggestions" in insights
    assert len(insights["castingSuggestions"]) >= 3
    
    # Check Hero, Heroine, Villain archetypes
    archetypes = [item["roleArchetype"] for item in insights["castingSuggestions"]]
    assert any("HERO" in a for a in archetypes)
    assert any("HEROINE" in a for a in archetypes)
    assert any("VILLAIN" in a for a in archetypes)

    # Check Location Suggestions
    assert "locationSuggestions" in insights
    assert len(insights["locationSuggestions"]) > 0

def test_producer_ai_agent_realtime_market_rates():
    movie = {
        "id": "test-movie-101",
        "title": "Nadhiyin Oram",
        "budget": 2000000.0,
        "spentBudget": 350000.0
    }
    schedules = [{"id": "sch1", "title": "Exterior Riverbank Shoot", "setting": "EXT", "location": "Chennai Coast"}]
    departments = [{"id": "d1", "name": "Camera", "budgetAllocated": 300000.0, "budgetSpent": 120000.0}]
    scenes = [
        {"sceneNumber": 1, "heading": "EXT. RIVERBANK - DAWN", "location": "Riverbank", "setting": "EXT", "vfxNotes": "High rain wind", "characters": ["Kavin", "Nila"]},
        {"sceneNumber": 2, "heading": "INT. HOUSE - NIGHT", "location": "Kavin House", "setting": "INT", "vfxNotes": "Standard", "characters": ["Kavin"]}
    ]

    res = role_agent_orchestrator.run_producer_agent(
        movie=movie,
        budget_data=None,
        schedules=schedules,
        departments=departments,
        weather_data={"location": "Chennai", "condition": "Rain", "rainProbability": 70, "productionRisk": "HIGH"},
        prompt="Calculate real time market rate scene budget breakdown",
        scenes=scenes
    )

    assert res["agentRole"] == "PRODUCER"
    insights = res["structuredInsights"]
    assert "sceneBudgetBreakdown" in insights
    assert len(insights["sceneBudgetBreakdown"]) == 2
    assert "marketRateRatesTable" in insights
    assert "leadActorDayRate" in insights["marketRateRatesTable"]

def test_music_director_ai_agent_web_audio_synthesis():
    movie = {
        "id": "test-movie-101",
        "title": "Nadhiyin Oram",
        "genre": "Coastal Thriller"
    }
    scene = {
        "sceneNumber": 18,
        "heading": "EXT. STORM CLIMAX - NIGHT",
        "emotionalTone": "Tense & Urgent"
    }

    res = role_agent_orchestrator.run_music_agent(
        movie=movie,
        scene=scene,
        character=None,
        prompt="Suggest melody, rhythm, and instruments for storm sequence"
    )

    assert res["agentRole"] == "MUSIC_DIRECTOR"
    insights = res["structuredInsights"]
    assert "melodySuggestion" in insights
    assert "rhythmSuggestion" in insights
    assert "instrumentationSuggestion" in insights
    assert "webAudioParams" in insights
    web_audio = insights["webAudioParams"]
    assert "scale" in web_audio
    assert "bpm" in web_audio
    assert "notes" in web_audio

def test_actor_ai_acting_coach_system():
    character = {
        "id": "c1",
        "name": "Kavin",
        "roleType": "Lead",
        "description": "Aspiring environmental documentary filmmaker uncovering illegal coastal dredging",
        "emotionalArc": "From naive idealistic artist to fiercely determined environmental defender"
    }
    scene = {
        "id": "s18",
        "sceneNumber": 18,
        "heading": "EXT. MONSOON DREDGING SITE - NIGHT",
        "emotionalTone": "High-Stakes Confrontation",
        "keyDialogueSnippet": "You cannot dredge this coast while the village sleeps.",
        "fullScriptText": "EXT. MONSOON DREDGING SITE - NIGHT\n\nKavin stands in mud before the diesel barge.\n\nKAVIN\nYou cannot dredge this coast while the village sleeps."
    }

    res = role_agent_orchestrator.run_actor_agent(
        character=character,
        scene=scene,
        movie_title="Nadhiyin Oram",
        prompt="Dissect unspoken subtext, vocal cadence, and physical tension points",
        context_type="SUBTEXT_ANALYSIS"
    )

    assert res["agentRole"] == "ACTOR"
    assert "structuredInsights" in res
    insights = res["structuredInsights"]
    
    # Check Stanislavski & Meisner Coaching fields
    assert "actingMethod" in insights
    assert "superObjective" in insights
    assert "sceneObjective" in insights
    assert "unspokenSubtext" in insights
    assert "vocalCadence" in insights
    assert "physicalityAndTension" in insights
    assert "rehearsalDrills" in insights
    assert len(insights["rehearsalDrills"]) >= 3
