import onChange from 'on-change';
import renderData from './renders.js';

export default (elements, state, i18nInstance) => onChange(state, (path, value) => {
  const currentFeedback = elements.feedback;
  switch (value) {
    case 'failed':
      elements.field.classList.add('is-invalid');
      currentFeedback.textContent = i18nInstance.t(`errors.${state.message}`);
      currentFeedback.classList.remove('text-success');
      currentFeedback.classList.add('text-danger');
      break;

    case 'received':
      elements.field.classList.remove('is-invalid');
      currentFeedback.textContent = i18nInstance.t('success');
      currentFeedback.classList.remove('text-danger');
      currentFeedback.classList.add('text-success');
      elements.form.reset();
      elements.field.focus();
      renderData(state, elements, i18nInstance);
      break;

    case 'updating':
      renderData(state, elements, i18nInstance);
      break;

    default:
      break;
  }
});
