// js/components/authModal.js
/**
 * Модальное окно авторизации: ввод API ключа + выбор провайдера.
 * Динамически создаёт DOM, взаимодействует с storageModule.
 *
 * API:
 *   openAuthModal({ onSaved: (providerId) => {} })
 */

import { AI_PROVIDERS } from "../modules/apiProviders.js";
import { saveApiKey, getApiKey } from "../modules/storageModule.js";
import { setSelectedProvider } from "../modules/variables.js";

const i18n = {
  ua: {
    title: "Налаштування AI провайдера",
    providerLabel: "Виберіть провайдера",
    apiKeyLabel: "API ключ",
    show: "Показати",
    hide: "Сховати",
    save: "Зберегти і продовжити",
    cancel: "Скасувати",
    keyTooShort: "Ключ має містити мінімум 20 символів"
  },
  ru: {
    title: "Настройка AI провайдера",
    providerLabel: "Выберите провайдера",
    apiKeyLabel: "API ключ",
    show: "Показать",
    hide: "Скрыть",
    save: "Сохранить и продолжить",
    cancel: "Отмена",
    keyTooShort: "Ключ должен быть не менее 20 символов"
  },
  en: {
    title: "AI Provider setup",
    providerLabel: "Choose provider",
    apiKeyLabel: "API key",
    show: "Show",
    hide: "Hide",
    save: "Save and continue",
    cancel: "Cancel",
    keyTooShort: "API key must be at least 20 characters"
  },
  fr: {
    title: "Paramètres du fournisseur AI",
    providerLabel: "Choisir un fournisseur",
    apiKeyLabel: "Clé API",
    show: "Afficher",
    hide: "Cacher",
    save: "Enregistrer et continuer",
    cancel: "Annuler",
    keyTooShort: "La clé doit contenir au moins 20 caractères"
  }
};

function getLang() {
  return document.body.getAttribute('data-theme') || 'ua';
}

/**
 * Открывает auth modal.
 * @param {Object} opts
 * @param {Function} opts.onSaved - callback(providerId) после сохранения
 */
export function openAuthModal({ onSaved } = {}) {
  const lang = getLang();

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'ai-overlay';
  overlay.tabIndex = -1;

  // Modal container
  const modal = document.createElement('div');
  modal.className = 'ai-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  // Header
  const header = document.createElement('div');
  header.className = 'ai-modal-header';
  header.innerHTML = `<h2>${i18n[lang].title}</h2><button class="ai-modal-close" aria-label="close">✕</button>`;

  // Body
  const body = document.createElement('div');
  body.className = 'ai-modal-body';

  // Provider selector
  const provLabel = document.createElement('label');
  provLabel.textContent = i18n[lang].providerLabel;
  const select = document.createElement('select');
  AI_PROVIDERS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name}`;
    select.appendChild(opt);
  });

  // API key input
  const keyLabel = document.createElement('label');
  keyLabel.textContent = i18n[lang].apiKeyLabel;
  const keyWrap = document.createElement('div');
  keyWrap.className = 'ai-key-wrap';
  const keyInput = document.createElement('input');
  keyInput.type = 'password';
  keyInput.placeholder = '••••••••••••••••••';
  keyInput.className = 'ai-key-input';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'ai-key-toggle';
  toggleBtn.textContent = i18n[lang].show;

  keyWrap.appendChild(keyInput);
  keyWrap.appendChild(toggleBtn);

  // Instructions (link to provider docs)
  const instr = document.createElement('p');
  instr.className = 'ai-instr';
  const currentProvider = AI_PROVIDERS[0];
  instr.innerHTML = `Инструкции: <a target="_blank" rel="noopener noreferrer" href="${currentProvider.keyInstructions || '#'}">${currentProvider.keyInstructions || 'Получить ключ'}</a>`;

  // Buttons
  const footer = document.createElement('div');
  footer.className = 'ai-modal-footer';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'ai-save-btn';
  saveBtn.textContent = i18n[lang].save;
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'ai-cancel-btn';
  cancelBtn.textContent = i18n[lang].cancel;

  footer.appendChild(saveBtn);
  footer.appendChild(cancelBtn);

  // Assemble
  body.appendChild(provLabel);
  body.appendChild(select);
  body.appendChild(keyLabel);
  body.appendChild(keyWrap);
  body.appendChild(instr);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Populate if key exists
  const initialSelected = select.value;
  const existing = getApiKey(initialSelected);
  if (existing) keyInput.value = existing;

  // Update instructions when changing provider
  select.addEventListener('change', () => {
    const p = AI_PROVIDERS.find(x => x.id === select.value);
    instr.innerHTML = `Инструкции: <a target="_blank" rel="noopener noreferrer" href="${p.keyInstructions || '#'}">${p.keyInstructions || 'Получить ключ'}</a>`;
    // load existing key for that provider
    const ex = getApiKey(select.value);
    keyInput.value = ex || '';
  });

  // Toggle show/hide key
  toggleBtn.addEventListener('click', () => {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      toggleBtn.textContent = i18n[lang].hide;
    } else {
      keyInput.type = 'password';
      toggleBtn.textContent = i18n[lang].show;
    }
  });

  // Save handler
  saveBtn.addEventListener('click', () => {
    const v = keyInput.value.trim();
    if (!v || v.length < 20) {
      alert(i18n[lang].keyTooShort);
      return;
    }
    const providerId = select.value;
    saveApiKey(providerId, v);
    setSelectedProvider(providerId);
    close();
    if (typeof onSaved === 'function') onSaved(providerId);
  });

  // Cancel/close
  cancelBtn.addEventListener('click', close);
  header.querySelector('.ai-modal-close').addEventListener('click', close);

  // Close on overlay click outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // ESC key
  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKey);

  // Focus trap basic (keep focus inside modal)
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const firstFocusable = modal.querySelectorAll(focusable)[0];
  const focusableElems = modal.querySelectorAll(focusable);
  const lastFocusable = focusableElems[focusableElems.length - 1];

  modal.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // focus first
  setTimeout(() => {
    keyInput.focus();
  }, 0);

  function close() {
    document.removeEventListener('keydown', onKey);
    document.body.removeChild(overlay);
  }

  return {
    close
  };
}
