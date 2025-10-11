// js/modules/storageModule.js
/**
 * Работа с sessionStorage:
 * - api ключи: ai_api_key_${providerId}
 * - параметры: ai_param1, ai_param2, ai_param3
 * - generated prompt: ai_generated_prompt
 */

/* API Keys */
export function saveApiKey(providerId, apiKey) {
  if (!providerId || !apiKey) return;
  sessionStorage.setItem(`ai_api_key_${providerId}`, apiKey);
}

export function getApiKey(providerId) {
  return sessionStorage.getItem(`ai_api_key_${providerId}`) || null;
}

export function hasApiKey(providerId) {
  return !!getApiKey(providerId);
}

export function clearApiKey(providerId) {
  sessionStorage.removeItem(`ai_api_key_${providerId}`);
}

export function clearAllKeys() {
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith('ai_api_key_')) sessionStorage.removeItem(k);
  });
}

/* Params */
export function saveParams(p1, p2, p3) {
  sessionStorage.setItem('ai_param1', p1 || '');
  sessionStorage.setItem('ai_param2', JSON.stringify(p2 || []));
  sessionStorage.setItem('ai_param3', String(p3 || 0));
}

export function getParams() {
  const p1 = sessionStorage.getItem('ai_param1') || '';
  const p2 = JSON.parse(sessionStorage.getItem('ai_param2') || '[]');
  const p3 = Number(sessionStorage.getItem('ai_param3') || 0);
  return { param1: p1, param2: p2, param3: p3 };
}

export function clearParams() {
  sessionStorage.removeItem('ai_param1');
  sessionStorage.removeItem('ai_param2');
  sessionStorage.removeItem('ai_param3');
}

/* Prompt */
export function saveGeneratedPrompt(prompt) {
  sessionStorage.setItem('ai_generated_prompt', prompt || '');
}

export function getGeneratedPrompt() {
  return sessionStorage.getItem('ai_generated_prompt') || '';
}

export function clearGeneratedPrompt() {
  sessionStorage.removeItem('ai_generated_prompt');
}
