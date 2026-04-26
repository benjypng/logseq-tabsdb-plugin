export const PAGE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/></svg>`

export const BLOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>`

export const GRAPHS_KEY = 'graphs'

export const STATE_KEY = 'tabsState'

export const BAR_SEL = '.left-sidebar-inner .sidebar-contents-container'

export const SCROLL_SEL = '#main-content-container'

export const STYLE = `
      .sidebar-contents-container { display: flex; flex-direction: column; }
      .sidebar-contents-container .recent { order: 2; }
      #ls-tabs-section { order: 1; }
      #ls-tabs-section .ls-tabs-list {
        display: flex; flex-direction: column; gap: 1px;
        user-select: none;
      }
      #ls-tabs-section .ls-tab {
        display: flex; align-items: center; gap: 6px;
        padding: 4px 8px; border-radius: 4px;
        color: var(--ls-primary-text-color);
        cursor: pointer;
        opacity: 0.55;
        transition: opacity 0.1s ease;
      }
      #ls-tabs-section .ls-tab .ls-tab-icon {
        flex-shrink: 0; display: inline-flex; align-items: center;
        opacity: 0.7;
      }
      #ls-tabs-section .ls-tab .page-title {
        flex: 1; min-width: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      #ls-tabs-section .ls-tab .ls-tab-close { flex-shrink: 0; margin-left: auto; }
      #ls-tabs-section .ls-tab:hover { opacity: 0.85; }
      #ls-tabs-section .ls-tab.active { opacity: 1; }
      #ls-tabs-section .ls-tab-close {
        opacity: 0; padding: 0 4px; border-radius: 3px;
      }
      #ls-tabs-section .ls-tab:hover .ls-tab-close { opacity: 0.5; }
      #ls-tabs-section .ls-tab-close:hover {
        opacity: 1 !important; background: var(--ls-quaternary-background-color);
      }
      #ls-tabs-section .ls-tab-new {
        cursor: pointer; opacity: 0.6;
        font-size: 16px; line-height: 1; padding: 0 4px;
      }
      #ls-tabs-section .ls-tab-new:hover { opacity: 1; }
`
