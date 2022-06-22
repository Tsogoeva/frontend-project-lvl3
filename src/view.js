import onChange from 'on-change';
import { renderData, renderModal } from './renders.js';

export default (elements, state, i18nInstance) => onChange(state, (_path, value) => {
  const { feedback, field, form } = elements;

  switch (value) {
    case 'failed':
      field.classList.add('is-invalid');
      feedback.textContent = i18nInstance.t(`errors.${state.message}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    case 'received':
      field.classList.remove('is-invalid');
      feedback.textContent = i18nInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      form.reset();
      field.focus();
      renderData(state, elements, i18nInstance);
      break;

    case 'updating':
      renderData(state, elements, i18nInstance);
      break;

    case 'preview':
      renderModal(state.previewPost, elements);
      break;

    default:
      break;
  }
});
