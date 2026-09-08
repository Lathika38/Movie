import sys
sys.path.insert(0, ".")
from app.agents.gemini_service import gemini_service

sample = """
CAST OF CHARACTERS
KAVIN — Age 24: Aspiring documentary filmmaker.
NILA — Age 23: Marine biology graduate.
ARUN — Age 52: Fisherman.
MEERA — Age 47: Tailor.

1. EXT. NADUKAVERI RIVERBANK – DAWN
Mist floats above the river. KAVIN records birds with DSLR.

2. INT. KAVIN FAMILY HOUSE – MORNING
MEERA stitches uniforms while tea boils.

18. EXT. NADUKAVERI RIVERBANK – NIGHT
A severe storm bends palm trees. Kavin insists on filming.

24. EXT. MANGROVE WETLAND – MORNING
Nila guides school children through the protected mangrove pathway.
"""

res = gemini_service._extract_deterministic_screenplay_breakdown(sample, "Nadhiyin Oram", "Drama")
print(f"SUCCESS: Extracted {len(res['scenes'])} scenes and {len(res['characters'])} characters!")
for s in res['scenes']:
    print(f" Scene {s['sceneNumber']}: {s['heading']} | Loc: {s['location']} | Time: {s['timeOfDay']} | Tone: {s['emotionalTone']}")
