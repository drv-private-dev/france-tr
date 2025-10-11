// js/modules/apiProviders.js
/**
 * Конфигурация AI провайдеров.
 * Включаем 5 провайдеров согласно ТЗ.
 *
 * NOTE: requestFormat обозначает как форматировать тело запроса.
 * Для каждого провайдера ниже дано краткое пояснение.
 */

export const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI (gpt-3.5/gpt-4)',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-3.5-turbo',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    requestFormat: 'openai',
    keyInstructions: 'Получите ключ: https://platform.openai.com/account/api-keys',
    isFree: true
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    endpoint: 'https://api-inference.huggingface.co/models/',
    defaultModel: 'gpt2',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    requestFormat: 'huggingface', // POST to /models/{model} with {inputs: "..."}
    keyInstructions: 'Получите ключ: https://huggingface.co/settings/tokens',
    isFree: true
  },
  {
    id: 'cohere',
    name: 'Cohere',
    endpoint: 'https://api.cohere.ai/generate',
    defaultModel: 'command-xlarge-nightly',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    requestFormat: 'cohere', // JSON { model, prompt, max_tokens, ... }
    keyInstructions: 'Получите ключ: https://dashboard.cohere.ai/api-keys',
    isFree: true
  },
  {
    id: 'togetherai',
    name: 'TogetherAI',
    endpoint: 'https://api.together.ai/inference',
    defaultModel: 'gpt-j', // пример
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    requestFormat: 'generic',
    keyInstructions: 'Получите ключ на сайте TogetherAI',
    isFree: true
  },
  {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.ai/v1/models/',
    defaultModel: 'groq-1',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    requestFormat: 'generic',
    keyInstructions: 'Получите ключ на сайте Groq (если доступно)',
    isFree: true
  }
];
