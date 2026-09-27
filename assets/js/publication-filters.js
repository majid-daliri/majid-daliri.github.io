const publicationFilters = document.querySelector('[data-publication-filters]');

if (publicationFilters) {
  const buttons = [...publicationFilters.querySelectorAll('[data-publication-filter]')];
  const sections = [...document.querySelectorAll('[data-publication-section]')];
  const status = document.querySelector('[data-publication-status]');

  function filterPublications(selected) {
    let count = 0;
    sections.forEach((section) => {
      section.hidden = selected.dataset.publicationFilter !== 'all'
        && section.dataset.publicationSection !== selected.dataset.publicationFilter;
      if (!section.hidden) count += section.querySelectorAll('.publication').length;
    });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
    status.textContent = `${selected.textContent.trim()}: ${count} ${count === 1 ? 'publication' : 'publications'}.`;
  }

  buttons.forEach((button) => button.addEventListener('click', () => filterPublications(button)));
  function revealLinkedSection(hash) {
    const section = sections.find((candidate) => `#${candidate.id}` === hash);
    if (!section) return;
    filterPublications(buttons.find((button) => button.dataset.publicationFilter === section.dataset.publicationSection));
    return section;
  }

  // Reveal a linked year before the browser follows its anchor, even when
  // the same hash is visited again after choosing a different year filter.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) {
      revealLinkedSection(url.hash);
    }
  });
  window.addEventListener('hashchange', () => revealLinkedSection(location.hash)?.scrollIntoView());
  filterPublications(buttons[0]);
  revealLinkedSection(location.hash);
  publicationFilters.hidden = false;
}
