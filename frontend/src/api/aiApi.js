import { api } from './client';

export const aiApi = {
  runDirectorAi: async (movieId, prompt, sceneId = null, characterId = null, contextType = 'SCRIPT_ANALYSIS') => {
    const res = await api.post('/ai/director', {
      movieId,
      prompt,
      sceneId,
      characterId,
      contextType
    });
    return res?.data?.structuredInsights ? res.data : (res?.data || res);
  },
  runProducerAi: async (movieId, prompt, includeWeatherAnalysis = true, contextType = 'SCHEDULE_RISK') => {
    const res = await api.post('/ai/producer', {
      movieId,
      prompt,
      includeWeatherAnalysis,
      contextType
    });
    return res?.data?.structuredInsights ? res.data : (res?.data || res);
  },
  runActorAi: async (movieId, characterId, prompt, sceneId = null, contextType = 'SUBTEXT_ANALYSIS') => {
    const res = await api.post('/ai/actor', {
      movieId,
      characterId,
      sceneId,
      prompt,
      contextType
    });
    return res?.data?.structuredInsights ? res.data : (res?.data || res);
  },
  runMusicAi: async (movieId, prompt, sceneNumber = null, characterName = null, contextType = 'SCORE_DIRECTION') => {
    const res = await api.post('/ai/music', {
      movieId,
      prompt,
      sceneNumber,
      characterName,
      contextType
    });
    return res?.data?.structuredInsights ? res.data : (res?.data || res);
  }
};
