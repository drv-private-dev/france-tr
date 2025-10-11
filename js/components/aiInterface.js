// js/components/aiInterface.js
/**
 * Главное модальное окно AI Interface.
 * Создаёт UI, работает с параметрами, генерирует промпт, вызывает aiModule.sendPromptToAI.
 *
 * Примечание: этот файл подключается в index.html как <script type="module" src="./js/components/aiInterface.js">
 */

import { openAuthModal } from './authModal.js';
import { AI_PROVIDERS } from '../modules/apiProviders.js';
import { getApiKey, saveParams, getParams, saveGeneratedPrompt, getGeneratedPrompt, clearParams, clearGeneratedPrompt } from '../modules/storageModule.js';
import { generatePromptFromParams, sendPromptToAI } from '../modules/aiModule.js';
import { setAiResponse, setAiStatus, setAiError, setParam1, setParam2, setParam3, setSelectedProvider } from '../modules/variables.js';

const i18n = {
  ua: {
    title: 'AI Асистент',
    providerBadge: 'Провайдер',
    settings: '⚙ Налаштування',
    paramBlockTitle: 'Параметри генерації промпта',
    param1Label: 'Параметр 1',
    param1Placeholder: 'Введіть значення',
    param2Label: 'Параметр 2',
    param3Label: 'Параметр 3',
    resetParams: 'Скинути параметри',
    promptPlaceholder: 'Промпт генерується автоматично. Можна правити вручну.',
    send: 'Відправити',
    sending: '⏳ Обробка запиту...',
    success: '✅ Відповідь отримано',
    error: '❌ Помилка:',
    copy: 'Копіювати відповідь',
    newRequest: 'Новий запит',
    close: 'Закрити'
  },
  ru: {
    title: 'AI Ассистент',
    providerBadge: 'Провайдер',
    settings: '⚙ Настройки',
    paramBlockTitle: 'Параметры генерации промпта',
    param1Label: 'Параметр 1',
    param1Placeholder: 'Введите значение',
    param2Label: 'Параметр 2',
    param3Label: 'Параметр 3',
    resetParams: 'Сбросить параметры',
    promptPlaceholder: 'Промпт генерируется автоматически. Можно править вручную.',
    send: 'Отправить',
    sending: '⏳ Обработка запроса...',
    success: '✅ Ответ получен',
    error: '❌ Ошибка:',
    copy: 'Копировать ответ',
    newRequest: 'Новый запрос',
    close: 'Закрыть'
  },
  en: {
    title: 'AI Assistant',
    providerBadge: 'Provider',
    settings: '⚙ Settings',
    paramBlockTitle: 'Prompt generation parameters',
    param1Label: 'Parameter 1',
    param1Placeholder: 'Enter value',
    param2Label: 'Parameter 2',
    param3Label: 'Parameter 3',
    resetParams: 'Reset parameters',
    promptPlaceholder: 'Prompt is generated automatically. Editable.',
    send: 'Send',
    sending: '⏳ Processing...',
    success: '✅ Answer received',
    error: '❌ Error:',
    copy: 'Copy answer',
    newRequest: 'New request',
    close: 'Close'
  },
  fr: {
    title: "Assistant IA",
    providerBadge: "Fournisseur",
    settings: "⚙ Paramètres",
    paramBlockTitle: "Paramètres de génération du prompt",
    param1Label: "Paramètre 1",
    param1Placeholder: "Entrez la valeur",
    param2Label: "Paramètre 2",
    param3Label: "Paramètre 3",
    resetParams: "Réinitialiser les paramètres",
    promptPlaceholder: "Le prompt est généré automatiquement. Modifiable.",
    send: "Envoyer",
    sending: "⏳ Traitement...",
    success: "✅ Réponse reçue",
    error: "❌ Erreur:",
    copy: "Copier la réponse",
    newRequest: "Nouvelle requête",
    close: "Fermer"
  }
};

function getLang() {
  return document.body.getAttribute('data-theme') || 'ua';
}

function createEl(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.class) el.className = opts.class;
  if (opts.text) el.textContent = opts.text;
  if (opts.html) el.innerHTML = opts.html;
  if (opts.attrs) {
    Object.keys(opts.attrs).forEach(k => el.setAttribute(k, opts.attrs[k]));
  }
  return el;
}

/** Open AI Interface - main entry */
function openAIInterface() {
  const lang = getLang();
  const L = i18n[lang];

  // Overlay and modal
  const overlay = createEl('div', { class: 'ai-overlay' });
  const modal = createEl('div', { class: 'ai-modal', attrs: { role: 'dialog', 'aria-modal': 'true' } });

  // Header
  const header = createEl('div', { class: 'ai-modal-header' });
  const title = createEl('h2', { text: L.title });
  const providerBadge = createEl('span', { class: 'ai-provider-badge' });
  providerBadge.textContent = `${L.providerBadge}: `;
  const providerSelect = createEl('select', { class: 'ai-provider-select' });
  AI_PROVIDERS.forEach(p => {
    const opt = createEl('option');
    opt.value = p.id;
    opt.textContent = p.name;
    providerSelect.appendChild(opt);
  });

  // Prefill provider from session (if any)
  const savedKeyProvider = AI_PROVIDERS.find(p => !!getApiKey(p.id));
  if (savedKeyProvider) {
    providerSelect.value = savedKeyProvider.id;
    setSelectedProvider(savedKeyProvider.id);
  }

  const settingsBtn = createEl('button', { class: 'ai-settings-btn', text: L.settings });
  const closeBtn = createEl('button', { class: 'ai-modal-close', text: '✕', attrs: { 'aria-label': L.close } });

  header.appendChild(title);
  header.appendChild(providerBadge);
  header.appendChild(providerSelect);
  header.appendChild(settingsBtn);
  header.appendChild(closeBtn);

  // Body
  const body = createEl('div', { class: 'ai-modal-body' });

  // Params block
  const paramsBlock = createEl('fieldset', { class: 'ai-params' });
  const legend = createEl('legend', { text: L.paramBlockTitle });
  paramsBlock.appendChild(legend);

  // Param 1
  const p1Label = createEl('label', { text: L.param1Label });
  p1Label.setAttribute('for', 'ai-param1');
  const p1Input = createEl('input', { attrs: { id: 'ai-param1', type: 'text', placeholder: L.param1Placeholder } });

  // Param 2 (checkboxes)
  const p2Label = createEl('label', { text: L.param2Label });
  const p2Wrap = createEl('div', { class: 'ai-param2-wrap' });
  const options = ['Опция 1', 'Опция 2', 'Опция 3', 'Опция 4', 'Опция 5'];
  options.forEach((optText, idx) => {
    const cbId = `ai-p2-${idx}`;
    const cbLabel = createEl('label', { class: 'ai-checkbox-label' });
    const cb = createEl('input', { attrs: { type: 'checkbox', id: cbId, value: optText } });
    cbLabel.appendChild(cb);
    cbLabel.appendChild(document.createTextNode(' ' + optText));
    p2Wrap.appendChild(cbLabel);
  });

  // Param 3 (number)
  const p3Label = createEl('label', { text: L.param3Label });
  p3Label.setAttribute('for', 'ai-param3');
  const p3Input = createEl('input', { attrs: { id: 'ai-param3', type: 'number', min: '0', max: '100', placeholder: '0' } });

  // Reset button
  const resetBtn = createEl('button', { class: 'ai-reset-btn', text: L.resetParams });

  paramsBlock.appendChild(p1Label);
  paramsBlock.appendChild(p1Input);
  paramsBlock.appendChild(p2Label);
  paramsBlock.appendChild(p2Wrap);
  paramsBlock.appendChild(p3Label);
  paramsBlock.appendChild(p3Input);
  paramsBlock.appendChild(resetBtn);

  // Prompt textarea
  const promptLabel = createEl('label', { text: 'Prompt' });
  const promptArea = createEl('textarea', { class: 'ai-prompt-area', attrs: { placeholder: L.promptPlaceholder, rows: 5 } });

  // Controls (send)
  const controls = createEl('div', { class: 'ai-controls' });
  const sendBtn = createEl('button', { class: 'ai-send-btn', text: L.send });
  const statusBadge = createEl('div', { class: 'ai-status-badge' });

  controls.appendChild(sendBtn);
  controls.appendChild(statusBadge);

  // Response block
  const responseBlock = createEl('div', { class: 'ai-response-block', attrs: { 'aria-live': 'polite' } });
  const responsePre = createEl('pre', { class: 'ai-response-text' });
  const responseActions = createEl('div', { class: 'ai-response-actions' });
  const copyBtn = createEl('button', { class: 'ai-copy-btn', text: L.copy });
  const newReqBtn = createEl('button', { class: 'ai-new-btn', text: L.newRequest });
  responseActions.appendChild(copyBtn);
  responseActions.appendChild(newReqBtn);
  responseBlock.appendChild(responsePre);
  responseBlock.appendChild(responseActions);

  body.appendChild(paramsBlock);
  body.appendChild(promptLabel);
  body.appendChild(promptArea);
  body.appendChild(controls);
  body.appendChild(responseBlock);

  // Footer
  const footer = createEl('div', { class: 'ai-modal-footer' });
  footer.appendChild(createEl('p', { text: '' }));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Apply theme colors from body[data-theme]
  overlay.classList.add(`theme-${getLang()}`);

  // Load saved params
  const saved = getParams();
  if (saved) {
    if (saved.param1) p1Input.value = saved.param1;
    if (Array.isArray(saved.param2) && saved.param2.length > 0) {
      saved.param2.forEach(val => {
        const cb = Array.from(p2Wrap.querySelectorAll('input[type=checkbox]')).find(x => x.value === val);
        if (cb) cb.checked = true;
      });
    }
    if (saved.param3) p3Input.value = saved.param3;
  }

  // Prompt saved
  const savedPrompt = getGeneratedPrompt();
  if (savedPrompt) promptArea.value = savedPrompt;

  // Helper: read current params into variables and storage
  function readAndSaveParams() {
    const v1 = p1Input.value.trim();
    const v2 = Array.from(p2Wrap.querySelectorAll('input[type=checkbox]')).filter(x => x.checked).map(x => x.value);
    const v3 = Number(p3Input.value) || 0;
    setParam1(v1);
    setParam2(v2);
    setParam3(v3);
    saveParams(v1, v2, v3);
    const gen = generatePromptFromParams(v1, v2, v3);
    promptArea.value = gen;
    saveGeneratedPrompt(gen);
    return { v1, v2, v3, gen };
  }

  // Wire events: on change regenerate
  [p1Input, p3Input].forEach(inp => {
    inp.addEventListener('input', debounce(readAndSaveParams, 300));
  });

  // p2 checkboxes
  p2Wrap.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => readAndSaveParams());
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    p1Input.value = '';
    p2Wrap.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    p3Input.value = '';
    readAndSaveParams();
    promptArea.value = '';
    clearParams();
    clearGeneratedPrompt();
  });

  // Manual edit: if user types in textarea, do not persist those edits to sessionStorage (per spec)
  promptArea.addEventListener('input', () => {
    // Manual edits are local only: reflect in setGeneratedPrompt but don't overwrite param-driven logic persistence
    setAiStatus('idle');
    setAiError(null);
    // keep generatedPrompt in memory but do not call saveGeneratedPrompt (spec: manual changes not saved)
  });

  // Settings button -> open auth modal
  settingsBtn.addEventListener('click', () => {
    openAuthModal({ onSaved: (providerId) => {
      providerSelect.value = providerId;
      setSelectedProvider(providerId);
    }});
  });

  // If no API key for selected provider, prompt to open auth modal on send
  sendBtn.addEventListener('click', async () => {
    const provId = providerSelect.value;
    if (!getApiKey(provId)) {
      // open auth modal
      openAuthModal({ onSaved: (providerId) => {
        providerSelect.value = providerId;
        setSelectedProvider(providerId);
      }});
      return;
    }

    // Validate prompt
    const prompt = promptArea.value.trim();
    if (!prompt) {
      alert('Prompt is empty');
      return;
    }
    if (prompt.length > 4000) {
      alert('Prompt exceeds 4000 characters');
      return;
    }

    // Disable send button
    sendBtn.disabled = true;
    statusBadge.textContent = i18n[getLang()].sending;

    try {
      setAiStatus('loading');
      const result = await sendPromptToAI(prompt, provId);
      setAiResponse(result);
      responsePre.textContent = result;
      responseBlock.style.display = 'block';
      statusBadge.textContent = i18n[getLang()].success;
    } catch (err) {
      statusBadge.textContent = i18n[getLang()].error + ' ' + (err.message || err);
      setAiError(err);
    } finally {
      sendBtn.disabled = false;
    }
  });

  // Copy answer
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(responsePre.textContent);
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => { copyBtn.textContent = i18n[getLang()].copy; }, 1500);
    } catch (e) {
      alert('Could not copy to clipboard');
    }
  });

  // New request
  newReqBtn.addEventListener('click', () => {
    responsePre.textContent = '';
    responseBlock.style.display = 'none';
    setAiResponse(null);
    setAiStatus('idle');
  });

  // Close / overlay click / ESC
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  // Focus trap basic
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElems = modal.querySelectorAll(focusable);
  if (focusableElems.length) focusableElems[0].focus();

  function onKey(e) {
    if (e.key === 'Escape') {
      close();
    }
  }

  function close() {
    document.removeEventListener('keydown', onKey);
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
  }

  // Debounce utility for input
  function debounce(fn, wait = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
}

/* Initialize: bind to #openAiBtn */
const openBtn = document.getElementById('openAiBtn');
if (openBtn) {
  openBtn.addEventListener('click', () => {
    // If no API key at all, open auth modal first
    const anyKey = AI_PROVIDERS.some(p => !!getApiKey(p.id));
    if (!anyKey) {
      openAuthModal({ onSaved: (providerId) => {
        // open interface after saving key
        setSelectedProvider(providerId);
        openAIInterface();
      }});
      return;
    }
    openAIInterface();
  });
}
