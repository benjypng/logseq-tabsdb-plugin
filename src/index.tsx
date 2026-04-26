import '@logseq/libs'
import { State, Tab } from './types'
import {
  BAR_SEL,
  BLOCK_ICON,
  GRAPHS_KEY,
  PAGE_ICON,
  SCROLL_SEL,
  STATE_KEY,
  STYLE,
} from './constants'
import {
  createRef,
  createSerialQueue,
  reconcileInitial,
  reconcileRoute,
  removeTab,
  setActive,
  updateTab,
  validate,
} from './libs'

const main = async () => {
  logseq.UI.showMsg('logseq-tabsdb-plugin loaded')

  logseq.provideStyle(STYLE)

  const emptyState = (): State => ({ tabs: [], active: -1 })

  const loadState = (graph: string): State => {
    const graphs = (logseq.settings?.[GRAPHS_KEY] as any) || {}
    return (graphs[graph]?.[STATE_KEY] as State) || emptyState()
  }

  const initialGraph =
    (await logseq.App.getCurrentGraph())?.name || '__default__'

  const currentGraphRef = createRef(initialGraph)
  const stateRef = createRef<State>(loadState(initialGraph))
  const expectedSelfNavRef = createRef<string | null>(null)
  const openAsNewTabRef = createRef(false)

  const transaction = createSerialQueue()

  const persist = async (nextState: State): Promise<void> => {
    const graphs = { ...((logseq.settings?.[GRAPHS_KEY] as any) || {}) }
    const graph = currentGraphRef.get()
    graphs[graph] = {
      ...(graphs[graph] || {}),
      [STATE_KEY]: nextState,
    }
    logseq.updateSettings({ [GRAPHS_KEY]: graphs })
  }

  const commit = async (nextState: State) => {
    if (nextState === stateRef.get()) return
    validate(nextState)
    await persist(nextState)
    stateRef.set(nextState)
    render()
  }

  const escapeHtml = (input: string) =>
    input.replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]!,
    )

  const getScrollElement = () =>
    (top!.document.querySelector(SCROLL_SEL) as HTMLElement) || null

  const snapshotActive = async (): Promise<State> => {
    const state = stateRef.get()
    if (state.active < 0) return state
    const tab = state.tabs[state.active]
    if (!tab) return state
    const element = getScrollElement()
    const scroll = element ? element.scrollTop : tab.scroll
    const cursor = await logseq.Editor.getEditingCursorPosition().catch(
      () => tab.cursor,
    )
    return updateTab(state, state.active, { scroll, cursor })
  }

  const restoreActive = () => {
    const state = stateRef.get()
    const tab = state.tabs[state.active]
    if (!tab) return
    setTimeout(() => {
      const element = getScrollElement()
      if (element) element.scrollTop = tab.scroll || 0
    }, 50)
  }

  const render = () => {
    const state = stateRef.get()
    const html = `
        <div id="ls-tabs-section" class="sidebar-content-group is-expand">
          <div class="sidebar-content-group-inner">
            <div class="hd items-center non-collapsable">
              <span class="a"><a class="wrap-th"><strong class="flex-1">Tabs</strong></a></span>
              <span class="b"><a class="ls-tab-new" title="New tab" data-on-click="newTabModel">+</a></span>
            </div>
            <div class="bd">
              <div class="ls-tabs-list">
                ${state.tabs
                  .map(
                    (tab, index) => `
                  <div class="ls-tab ${index === state.active ? 'active' : ''}" data-on-click="activateTabModel" data-idx="${index}">
                    <span class="ls-tab-icon">${tab.isBlock ? BLOCK_ICON : PAGE_ICON}</span>
                    <span class="page-title">${escapeHtml(tab.fullTitle || tab.title || '')}</span>
                    <span class="ls-tab-close" data-on-click="closeTabModel" data-idx="${index}">×</span>
                  </div>`,
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `
    logseq.provideUI({
      key: 'ls-tabs-section',
      path: BAR_SEL,
      template: html,
      replace: true,
    } as any)
  }

  const navigate = async (name: string) => {
    expectedSelfNavRef.set(name)
    logseq.App.pushState('page', { name })
  }

  const activateTab = (index: number) =>
    transaction(async () => {
      const state = stateRef.get()
      if (index === state.active || !state.tabs[index]) return
      const targetName = state.tabs[index].name
      const snapshotted = await snapshotActive()
      await commit(setActive(snapshotted, index))
      await navigate(targetName)
      restoreActive()
    })

  const closeTab = (index: number) =>
    transaction(async () => {
      const state = stateRef.get()
      const wasActive = state.active === index
      const nextState = removeTab(state, index)
      await commit(nextState)
      const nextActiveTab = nextState.tabs[nextState.active]
      if (wasActive && nextActiveTab) await navigate(nextActiveTab.name)
    })

  top!.document.addEventListener(
    'click',
    (event) => {
      if (!(event.metaKey || event.ctrlKey)) return
      const target = event.target as HTMLElement
      const ref = target.closest(
        'a.page-ref, a.block-ref, .page-ref a, .block-ref a, a[data-ref]',
      )
      if (!ref) return
      openAsNewTabRef.set(true)
      setTimeout(() => openAsNewTabRef.set(false), 2000)
    },
    true,
  )

  logseq.provideModel({
    activateTabModel(event: any) {
      const index = parseInt(event.dataset.idx, 10)
      if (!isNaN(index)) activateTab(index)
    },
    closeTabModel(event: any) {
      const index = parseInt(event.dataset.idx, 10)
      if (!isNaN(index)) closeTab(index)
    },
    async newTabModel() {
      openAsNewTabRef.set(true)
      setTimeout(() => openAsNewTabRef.set(false), 30000)
      await logseq.App.invokeExternalCommand('logseq.go/search')
    },
  })

  const tabFromEntity = (entity: any): Tab | null => {
    if (!entity) return null
    const isBlock = !!(entity.page || entity.parent) && !!entity.uuid
    if (isBlock) {
      const snippet = (entity.content || '').split('\n')[0].slice(0, 60).trim()
      return {
        name: entity.uuid,
        fullTitle: snippet || `Block ${entity.uuid.slice(0, 8)}`,
        title: snippet,
        isBlock: true,
        scroll: 0,
      }
    }
    if (entity.name) {
      return {
        name: entity.name,
        fullTitle: entity.fullTitle,
        title: entity.title,
        scroll: 0,
      }
    }
    return null
  }

  const handleRouteChange = async () => {
    const entity = await logseq.Editor.getCurrentPage()
    const incomingTab = tabFromEntity(entity)
    if (!incomingTab) return

    if (incomingTab.name === expectedSelfNavRef.get()) {
      expectedSelfNavRef.set(null)
      return
    }
    expectedSelfNavRef.set(null)

    const snapshotted = await snapshotActive()
    const nextState = reconcileRoute(
      snapshotted,
      incomingTab,
      openAsNewTabRef.get(),
    )
    openAsNewTabRef.set(false)
    await commit(nextState)
  }

  logseq.App.onRouteChanged(() => transaction(handleRouteChange))

  const reconcileCurrentPage = async () => {
    const initialTab = tabFromEntity(await logseq.Editor.getCurrentPage())
    if (!initialTab) return
    await commit(reconcileInitial(stateRef.get(), initialTab))
  }

  logseq.App.onCurrentGraphChanged(() =>
    transaction(async () => {
      const nextGraph =
        (await logseq.App.getCurrentGraph())?.name || '__default__'
      if (nextGraph === currentGraphRef.get()) return
      currentGraphRef.set(nextGraph)
      const loadedState = loadState(nextGraph)
      validate(loadedState)
      stateRef.set(loadedState)
      await reconcileCurrentPage()
      render()
    }),
  )

  await transaction(async () => {
    await reconcileCurrentPage()
    render()
  })
}

logseq.ready(main).catch(console.error)
