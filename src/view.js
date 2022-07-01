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
      submit.setAttribute('disabled', '');
      field.setAttribute('readonly', '');
      feedback.textContent = i18nInstance.t('loading');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;

    case 'failed':
      submit.removeAttribute('disabled');
      field.removeAttribute('readonly');
      field.classList.add('is-invalid');
      feedback.textContent = i18nInstance.t(`errors.${state.message}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    case 'received':
      submit.removeAttribute('disabled');
      field.removeAttribute('readonly');
      field.classList.remove('is-invalid');
      feedback.textContent = i18nInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      form.reset();
      field.focus();
      renderData(state, elements, i18nInstance);
      break;

    case 'updating':
      field.classList.remove('is-invalid');
      feedback.textContent = i18nInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
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
