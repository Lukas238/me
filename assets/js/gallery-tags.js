/*
 * Shared tag filter for the gallery pages.
 *
 * Tags only FILTER (they never group): clicking toggles a tag, and an item must have every selected tag.
 * Counts follow the current selection and tags that would give no results are dimmed.
 * The selection lives in the URL hash (#tag=a,b) next to other params such as sort= or type=.
 *
 *   const tags = GalleryTags.create({
 *     mount: '#tags',                      // where the tag list is rendered
 *     chipsMount: '#active-filters',       // optional: removable chips for the selection
 *     getItems: () => [['a', 'b'], ...],   // tags of every item currently in scope
 *     groupOf: (tag) => 'parent' | null,   // optional hierarchy (parent--child); a group header selects all its children
 *     labelOf: (tag) => 'Label',           // optional display label
 *     chipLabelOf: (tag) => 'Parent: Label', // optional label for the selection chips (defaults to labelOf)
 *     onChange: (selected) => {}           // called when the selection changes
 *   });
 *   tags.matches(itemTags)  tags.toggle(tag)  tags.select(tag)  tags.clear()  tags.refresh()  tags.syncFromHash()
 */
(function () {
  // A hash without '=' is a plain anchor (#year-2020), not view state
  const params = () => new URLSearchParams(location.hash.includes('=') ? location.hash.slice(1) : '');

  // Hash params shared by the page's controls, so one control doesn't wipe the others
  const GalleryState = {
    get(name) {
      return params().get(name);
    },
    set(name, value) {
      const p = params();
      if (value === null || value === undefined || value === '') p.delete(name);
      else p.set(name, value);
      const hash = p.toString();
      history.replaceState(null, '', location.pathname + location.search + (hash ? '#' + hash : ''));
    }
  };

  const key = (tag) => tag.toLowerCase();
  const isGroupTag = (tag) => tag.startsWith('_');
  const prettify = (text) => text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, ' ');

  function el(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function create(options) {
    const root = typeof options.mount === 'string' ? document.querySelector(options.mount) : options.mount;
    const chipsRoot = options.chipsMount
      ? (typeof options.chipsMount === 'string' ? document.querySelector(options.chipsMount) : options.chipsMount)
      : null;
    const paramName = options.param || 'tag';
    const groupOf = options.groupOf || (() => null);
    const labelOf = options.labelOf || ((tag) => tag);
    const chipLabelOf = options.chipLabelOf || null;
    const onChange = options.onChange || (() => {});

    let selected = [];
    let index = [];        // [{ tag, key, group, total }] in display order
    let itemKeys = [];     // lowercase tag keys of each item in scope

    const matchesKeys = (keys, wanted) => wanted.every(tag => isGroupTag(tag)
      ? keys.some(k => k.startsWith(key(tag).slice(1) + '--'))
      : keys.includes(key(tag)));

    const isSelected = (tag) => selected.some(s => key(s) === key(tag));

    function countWith(tag) {
      const wanted = isSelected(tag) ? selected : [...selected, tag];
      return itemKeys.filter(keys => matchesKeys(keys, wanted)).length;
    }

    function labelFor(tag) {
      if (isGroupTag(tag)) return prettify(tag.slice(1));
      return labelOf(tag);
    }

    // Unique tags of the items in scope, most used first; group headers (_parent) for hierarchical tags
    function buildIndex() {
      itemKeys = options.getItems().map(tags => tags.map(key));

      const seen = new Map();
      options.getItems().forEach(tags => tags.forEach(tag => {
        const k = key(tag);
        if (!seen.has(k)) seen.set(k, { tag, key: k, group: groupOf(tag), total: 0 });
        seen.get(k).total++;
      }));

      index = [...seen.values()].sort((a, b) => b.total - a.total || labelFor(a.tag).localeCompare(labelFor(b.tag)));

      // A selection that no longer exists in this scope (e.g. after switching type) is dropped
      const known = new Set(index.map(entry => entry.key));
      const groups = new Set(index.map(entry => entry.group).filter(Boolean));
      const kept = selected.filter(tag => isGroupTag(tag) ? groups.has(key(tag).slice(1)) : known.has(key(tag)));
      const changed = kept.length !== selected.length;
      selected = kept;
      return changed;
    }

    function chipButton(tag, extraClass) {
      const empty = !isSelected(tag) && countWith(tag) === 0;
      const button = el('button', 'gallery-tag' + (isSelected(tag) ? ' is-active' : '') + (empty ? ' is-empty' : '') + (extraClass ? ' ' + extraClass : ''));
      button.type = 'button';
      button.dataset.tag = tag;
      button.append(labelFor(tag) + ' ');
      button.appendChild(el('span', '', String(countWith(tag))));
      return button;
    }

    function renderPanel() {
      root.className = 'gallery-tags gallery-tags--panel';
      const body = el('div', 'gallery-tags__body');
      const groups = new Map();
      const loose = [];
      index.forEach(entry => {
        if (entry.group) {
          if (!groups.has(entry.group)) groups.set(entry.group, []);
          groups.get(entry.group).push(entry);
        } else {
          loose.push(entry);
        }
      });

      [...groups.keys()].sort().forEach(group => {
        const block = el('div', 'gallery-tags__group');
        block.appendChild(chipButton('_' + group, 'gallery-tag--group'));
        groups.get(group).forEach(entry => block.appendChild(chipButton(entry.tag)));
        body.appendChild(block);
      });

      if (loose.length) {
        const block = el('div', 'gallery-tags__group');
        if (groups.size) block.appendChild(el('span', 'gallery-tags__title', 'Other tags'));
        loose.forEach(entry => block.appendChild(chipButton(entry.tag)));
        body.appendChild(block);
      }

      root.replaceChildren(body);
    }

    function renderChips() {
      if (!chipsRoot) return;
      chipsRoot.className = 'gallery-active-filters';
      chipsRoot.hidden = selected.length === 0;
      const nodes = selected.map(tag => {
        const label = chipLabelOf ? chipLabelOf(tag) : labelFor(tag);
        const chip = el('button', 'gallery-tag is-active', label + ' \u2715');
        chip.type = 'button';
        chip.dataset.remove = tag;
        return chip;
      });
      if (selected.length > 1) {
        const clear = el('button', 'btn btn-link btn-sm p-0 text-muted', 'Clear all');
        clear.type = 'button';
        clear.dataset.clear = '1';
        nodes.push(clear);
      }
      chipsRoot.replaceChildren(...nodes);
    }

    function render() {
      renderPanel();
      renderChips();
    }

    function writeHash() {
      GalleryState.set(paramName, selected.length ? selected.join(',') : null);
    }

    function commit() {
      writeHash();
      render();
      onChange(selected.slice());
    }

    function toggle(tag) {
      selected = isSelected(tag) ? selected.filter(s => key(s) !== key(tag)) : [...selected, tag];
      commit();
    }

    root.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;
      if (button.dataset.tag && !button.classList.contains('is-empty')) toggle(button.dataset.tag);
    });

    if (chipsRoot) {
      chipsRoot.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        if (button.dataset.clear) selected = [];
        else if (button.dataset.remove) selected = selected.filter(s => key(s) !== key(button.dataset.remove));
        else return;
        commit();
      });
    }

    function readHash() {
      const value = GalleryState.get(paramName);
      selected = value ? value.split(',').filter(Boolean) : [];
    }

    readHash();
    if (buildIndex()) writeHash();
    render();

    return {
      get selected() { return selected.slice(); },
      matches(itemTags) {
        return matchesKeys(itemTags.map(key), selected);
      },
      toggle,
      select(tag) {
        if (!isSelected(tag)) toggle(tag);
      },
      clear() {
        selected = [];
        commit();
      },
      // The items in scope changed (type, watched...): rebuild counts and drop tags that no longer exist
      refresh() {
        const changed = buildIndex();
        if (changed) writeHash();
        render();
        if (changed) onChange(selected.slice());
      },
      // The URL changed (back/forward or another control): reread the selection
      syncFromHash() {
        const before = selected.join(',');
        readHash();
        buildIndex();
        render();
        if (selected.join(',') !== before) onChange(selected.slice());
      }
    };
  }

  window.GalleryState = GalleryState;
  window.GalleryTags = { create };
})();
