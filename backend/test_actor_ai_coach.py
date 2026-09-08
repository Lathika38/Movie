import pytest
import sys
sys.path.append('d:/movieOS Agent/backend')
from app.agents.role_agents import role_agent_orchestrator
from app.agents.gemini_service import gemini_service

def test_acting_coach_subtext_analysis():
    character = {
        "id": "chr-puli-01",
        "name": "Puli (The Exile)",
        "roleType": "HERO (Protagonist)",
        "description": "Fierce warrior exiled from tribal highlands",
        "emotionalArc": "Grief-stricken warrior rediscovering ancient destiny"
    }
    scene = {
        "id": "scene-01",
        "sceneNumber": 1,
        "heading": "EXT. HIGH MOUNTAIN RIDGE - DAWN",
        "emotionalTone": "Mythic & Solemn",
        "keyDialogueSnippet": "The land remembers what the empire tried to burn.",
        "fullScriptText": "EXT. HIGH MOUNTAIN RIDGE - DAWN\n\nPuli watches the twin suns rise over ancient stone ruins.\n\nPULI\nThe land remembers what the empire tried to burn."
    }

    res = gemini_service.generate_acting_coach_analysis(
        character=character,
        scene=scene,
        movie_title="Puli",
        prompt="Dissect subtext and inner monologue",
        context_type="SUBTEXT_ANALYSIS"
    )

    assert "structuredInsights" in res
    insights = res["structuredInsights"]
    assert "superObjective" in insights
    assert "sceneObjective" in insights
    assert "unspokenSubtext" in insights
    assert "innerMonologue" in insights
    assert "vocalCadence" in insights
    assert "physicalityAndTension" in insights
    assert "rehearsalDrills" in insights

def test_actor_agent_orchestrator_integration():
    character = {
        "id": "chr-dorangi-02",
        "name": "Dorangi (The Oracle)",
        "roleType": "HEROINE (Female Lead)",
        "description": "Strategic rebel leader spiritually bound to ancient relics",
        "emotionalArc": "From cautious oracle to empowered leader"
    }
    scene = {
        "id": "scene-04",
        "sceneNumber": 4,
        "heading": "INT. CITADEL SUNKEN TEMPLE - NIGHT",
        "emotionalTone": "Secret & Tense",
        "keyDialogueSnippet": "Touch the stone only when the sky turns ultraviolet.",
        "fullScriptText": "INT. CITADEL SUNKEN TEMPLE - NIGHT\n\nDorangi guards the glowing altar.\n\nDORANGI\nTouch the stone only when the sky turns ultraviolet."
    }

    res = role_agent_orchestrator.run_actor_agent(
        character=character,
        scene=scene,
        movie_title="Puli",
        prompt="Give me vocal cadence (WPM) and psychological gesture",
        context_type="LINE_REHEARSAL"
    )

    assert res["agentRole"] == "ACTOR"
    assert "structuredInsights" in res
    insights = res["structuredInsights"]
    assert "vocalCadence" in insights
    assert "tempoWpm" in insights["vocalCadence"]
    assert "operativeWords" in insights["vocalCadence"]
    assert "physicalityAndTension" in insights
    assert "psychologicalGesture" in insights["physicalityAndTension"]
