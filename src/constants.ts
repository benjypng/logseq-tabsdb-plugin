export const PAGE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/></svg>`

export const BLOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>`

export const PIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v6l-2 4v2h10v-2l-2 -4v-6"/><path d="M12 16l0 5"/><path d="M8 4l8 0"/></svg>`

export const GRAPHS_KEY = 'graphs'

export const STATE_KEY = 'tabsState'

export const SETTING_LAYOUT_KEY = 'tabLayout'

export const BAR_SEL = '.left-sidebar-inner .sidebar-contents-container'

export const LEFT_CONTAINER_SEL = '#left-container'

export const SCROLL_SEL = '#main-content-container'

export const STYLE = `
      .sidebar-contents-container { display: flex; flex-direction: column; }
      .sidebar-contents-container .recent { order: 2; }
      #ls-tabs-section { order: 1; }
      #ls-tabs-section .ls-tabs-list {
        display: flex; flex-direction: column; gap: 1px;
        user-select: none;
      }

      #left-container { display: flex; flex-direction: column; }
      #head { order: 1; }
      #ls-tabs-bar { order: 2; }
      #main-container { order: 3; }
      #ls-tabs-bar.ls-tabs-horizontal {
        display: flex; align-items: stretch; gap: 4px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--ls-border-color, rgba(0, 0, 0, 0.07));
        background: var(--ls-secondary-background-color, transparent);
        user-select: none;
      }
      #ls-tabs-bar.ls-tabs-horizontal .ls-tabs-list {
        display: flex; flex-direction: row; align-items: stretch;
        gap: 1px; flex: 1 1 auto; min-width: 0;
        overflow-x: auto; overflow-y: hidden;
      }
      #ls-tabs-bar.ls-tabs-horizontal .ls-tab {
        flex: 0 1 auto; min-width: 80px; max-width: 200px;
      }
      #ls-tabs-bar.ls-tabs-horizontal .ls-tab.active {
        background: var(--ls-tertiary-background-color);
      }
      #ls-tabs-bar.ls-tabs-horizontal .ls-tab-new {
        flex-shrink: 0; align-self: center;
      }

      .ls-tabs-root .ls-tab {
        display: flex; align-items: center; gap: 6px;
        padding: 4px 8px; border-radius: 4px;
        color: var(--ls-primary-text-color);
        cursor: pointer;
        opacity: 0.55;
        transition: opacity 0.1s ease;
      }
      .ls-tabs-root .ls-tab .ls-tab-icon {
        flex-shrink: 0; display: inline-flex; align-items: center;
        opacity: 0.7;
      }
      .ls-tabs-root .ls-tab .page-title {
        flex: 1; min-width: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .ls-tabs-root .ls-tab .ls-tab-actions {
        flex-shrink: 0; margin-left: auto;
        display: inline-flex; align-items: center; gap: 2px;
      }
      .ls-tabs-root .ls-tab:hover { opacity: 0.85; }
      .ls-tabs-root .ls-tab.active { opacity: 1; }
      .ls-tabs-root .ls-tab-close,
      .ls-tabs-root .ls-tab-pin {
        opacity: 0; padding: 0 4px; border-radius: 3px;
        display: inline-flex; align-items: center;
      }
      .ls-tabs-root .ls-tab:hover .ls-tab-close,
      .ls-tabs-root .ls-tab:hover .ls-tab-pin { opacity: 0.5; }
      .ls-tabs-root .ls-tab.pinned .ls-tab-pin { opacity: 0.85; }
      .ls-tabs-root .ls-tab-close:hover,
      .ls-tabs-root .ls-tab-pin:hover {
        opacity: 1 !important; background: var(--ls-quaternary-background-color);
      }
      .ls-tabs-root .ls-tab-new {
        cursor: pointer; opacity: 0.6;
        font-size: 16px; line-height: 1; padding: 0 4px;
      }
      .ls-tabs-root .ls-tab-new:hover { opacity: 1; }
      .ls-tabs-root .ls-tab.dragging { opacity: 0.3; }

      #ls-tabs-section .ls-tab.drop-before {
        box-shadow: inset 0 2px 0 0 var(--ls-link-text-color, #2563eb);
      }
      #ls-tabs-section .ls-tab.drop-after {
        box-shadow: inset 0 -2px 0 0 var(--ls-link-text-color, #2563eb);
      }

      #ls-tabs-bar .ls-tab.drop-before {
        box-shadow: inset 2px 0 0 0 var(--ls-link-text-color, #2563eb);
      }
      #ls-tabs-bar .ls-tab.drop-after {
        box-shadow: inset -2px 0 0 0 var(--ls-link-text-color, #2563eb);
      }
`
