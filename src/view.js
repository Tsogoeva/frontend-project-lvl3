import onChange from 'on-change';
import { renderData, renderModal } from './renders.js';

export default (elements, state, i18nInstance) => onChange(state, (_path, value) => {
  const {
    feedback,
    field,
    form,
    submit,
  } = elements;

  switch (value) {
    case 'receiving':
      submit.disabled = true;
      break;

    case 'failed':
      submit.disabled = false;
      field.classList.add('is-invalid');
      feedback.textContent = i18nInstance.t(`errors.${state.message}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    case 'received':
      submit.disabled = false;
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

    case null:
      break;

    default:
      throw new Error(`Unknown process: ${value}`);
  }
});
