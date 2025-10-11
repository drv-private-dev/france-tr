// js/modules/variables.js
/**
 * Модуль переменных состояния (простейшая "хранилка").
 * Экспортируемые переменные и функции для обновления.
 */

export let aiResponse = null;      // Текст ответа от AI
export let aiStatus = 'idle';      // 'idle' | 'loading' | 'success' | 'error'
export let aiError = null;         // Объект/текст ошибки
export let selectedProvider = null; // provider id
export let param1 = '';            // строка
export let param2 = [];            // массив выбранных опций
export let param3 = 0;             // число
export let generatedPrompt = '';   // сгенерированный промпт

export function setAiResponse(value) { aiResponse = value; }
export function setAiStatus(status) { aiStatus = status; }
export function setAiError(error) { aiError = error; }
export function setSelectedProvider(provider) { selectedProvider = provider; }
export function setParam1(value) { param1 = value; }
export function setParam2(value) { param2 = value; }
export function setParam3(value) { param3 = value; }
export function setGeneratedPrompt(value) { generatedPrompt = value; }
