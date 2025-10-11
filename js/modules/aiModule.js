// js/modules/aiModule.js
/**
 * Основной AI-модуль: формирование запроса, отправка, парсинг ответа.
 *
 * Внимание: реальные fetch-запросы. Настройка для нескольких провайдеров.
 * Таймаут: 30 секунд.
 */

import { AI_PROVIDERS } from "./apiProviders.js";
import {
  setAiResponse,
  setAiStatus,
  setAiError,
  setGeneratedPrompt
} from "./variables.js";
import { getApiKey } from "./storageModule.js";

/** Вспомогательный таймаутный fetch */
function fetchWithTimeout(url, opts = {}, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeout);

    fetch(url, opts)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Генерация промпта из параметров (по ТЗ)
 * @param {string} param1
 * @param {Array<string>} param2Array
 * @param {number} param3
 * @returns {string}
 */
export function generatePromptFromParams(param1, param2Array, param3) {
  if ((!param1 || param1.trim() === '') && (!param2Array || param2Array.length === 0) && (!param3 || param3 === 0)) {
    return '';
  }

  const subject = param1 && param1.trim() !== '' ? param1.trim() : '[объект]';
  const properties = (param2Array && param2Array.length > 0) ? param2Array.join(', ') : '[свойства]';
  const count = param3 || 0;

  const prompt = `Дай параметры генерации для ${subject} который имеет следующие свойства "${properties}" и имеет ${count} [единица измерения]`;
  // сохраняем текущее значение в состоянии (чтобы UI мог взять)
  setGeneratedPrompt(prompt);
  return prompt;
}

/**
 * Форматирует тело запроса в зависимости от провайдера
 * @param {string} prompt
 * @param {object} provider
 * @returns {{url:string, opts: object}}
 */
function formatRequest(prompt, provider) {
  const apiKey = getApiKey(provider.id);
  if (!apiKey) throw new Error('No API key');

  const headers = new Headers();
  headers.set(provider.authHeader, `${provider.authPrefix}${apiKey}`);
  // Accept and Content-Type default
  headers.set('Accept', 'application/json');

  // Format per provider
  if (provider.requestFormat === 'openai') {
    headers.set('Content-Type', 'application/json');
    const body = {
      model: provider.defaultModel,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    };
    return { url: provider.endpoint, opts: { method: 'POST', headers, body: JSON.stringify(body) } };
  }

  if (provider.requestFormat === 'huggingface') {
    // For HF we POST to /models/{model} with {inputs: "..."}
    headers.set('Content-Type', 'application/json');
    const url = provider.endpoint + provider.defaultModel;
    const body = { inputs: prompt };
    return { url, opts: { method: 'POST', headers, body: JSON.stringify(body) } };
  }

  if (provider.requestFormat === 'cohere') {
    headers.set('Content-Type', 'application/json');
    const body = {
      model: provider.defaultModel,
      prompt,
      max_tokens: 800,
      temperature: 0.7
    };
    return { url: provider.endpoint, opts: { method: 'POST', headers, body: JSON.stringify(body) } };
  }

  // generic fallback
  headers.set('Content-Type', 'application/json');
  return { url: provider.endpoint, opts: { method: 'POST', headers, body: JSON.stringify({ prompt }) } };
}

/**
 * Парсинг ответов от провайдеров в текст (универсальный)
 * @param {Response} response
 * @param {object} provider
 * @returns {Promise<string>}
 */
async function parseResponse(response, provider) {
  // Try parse JSON
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    // Try extract message
    let text = `HTTP ${response.status}`;
    try {
      const json = await response.json();
      if (json.error) text = json.error.message || JSON.stringify(json);
      else text = JSON.stringify(json);
    } catch (e) {
      text = await response.text();
    }
    throw new Error(text);
  }

  if (contentType.includes('application/json')) {
    const json = await response.json();
    // OpenAI style
    if (provider.requestFormat === 'openai') {
      if (json.choices && Array.isArray(json.choices) && json.choices[0].message) {
        return json.choices[0].message.content;
      }
      if (json.choices && Array.isArray(json.choices) && json.choices[0].text) {
        return json.choices[0].text;
      }
      return JSON.stringify(json);
    }

    // HuggingFace returns array or object
    if (provider.requestFormat === 'huggingface') {
      // often returns [{generated_text: "..."}] or object
      if (Array.isArray(json) && json[0] && (json[0].generated_text || json[0].summary_text)) {
        return json[0].generated_text || json[0].summary_text;
      }
      if (json.generated_text) return json.generated_text;
      return JSON.stringify(json);
    }

    // Cohere: { generations: [{ text: "..." }] }
    if (provider.requestFormat === 'cohere') {
      if (json.generations && json.generations[0] && json.generations[0].text) {
        return json.generations[0].text;
      }
      return JSON.stringify(json);
    }

    // Generic fallback
    return JSON.stringify(json);
  }

  // If not JSON, try text
  return await response.text();
}

/**
 * Отправляет промпт выбранному провайдеру.
 * @param {string} prompt
 * @param {string} providerId
 * @returns {Promise<string>}
 */
export async function sendPromptToAI(prompt, providerId) {
  // Validate prompt length
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('Prompt is empty');
  }
  if (prompt.length > 4000) {
    throw new Error('Prompt exceeds 4000 characters');
  }

  const provider = AI_PROVIDERS.find(p => p.id === providerId);
  if (!provider) throw new Error('Unknown provider');

  setAiStatus('loading');
  setAiError(null);

  let formatted;
  try {
    formatted = formatRequest(prompt, provider);
  } catch (err) {
    setAiStatus('error');
    setAiError(err);
    throw err;
  }

  try {
    const resp = await fetchWithTimeout(formatted.url, formatted.opts, 30000);
    const parsed = await parseResponse(resp, provider);
    setAiStatus('success');
    setAiResponse(parsed);
    return parsed;
  } catch (err) {
    // Map common HTTP statuses
    const message = (err && err.message) ? err.message.toString() : 'Unknown error';
    let friendly = message;
    if (message.includes('401') || message.includes('403')) friendly = 'Неверный API ключ или доступ запрещен';
    if (message.includes('429')) friendly = 'Превышен лимит запросов';
    if (message === 'Timeout') friendly = 'Превышено время ожидания (30s)';
    if (message.toLowerCase().includes('network')) friendly = 'Проблема с соединением';

    setAiStatus('error');
    setAiError(friendly);
    throw new Error(friendly);
  }
}
