import '@logseq/libs'

import {
  BAR_SEL,
  BLOCK_ICON,
  GRAPHS_KEY,
  LEFT_CONTAINER_SEL,
  PAGE_ICON,
  PIN_ICON,
  SCROLL_SEL,
  SETTING_LAYOUT_KEY,
  STATE_KEY,
  STYLE,
} from './constants'
import {
  createRef,
  createSerialQueue,
  moveTab,
  reconcileInitial,
  reconcileRoute,
  removeTab,
  setActive,
  togglePin,
  updateTab,
  validate,
} from './libs'
import { State, Tab } from './types'

const main = async () => {
  logseq.UI.showMsg('logseq-tabsdb-plugin loaded')

  logseq.provideStyle(STYLE)

  logseq.useSettingsSchema([
    {
      key: SETTING_LAYOUT_KEY,
      type: 'enum',
      default: 'vertical',
      title: 'Tab layout',
      description:
        'Where to show tabs: a vertical list in the left sidebar, or a horizontal bar across the top (between the header and main content).',
      enumChoices: ['vertical', 'horizontal'],
      enumPicker: 'radio',
    },
  ])

  const getLayout = (): 'vertical' | 'horizontal' =>
    logseq.settings?.[SETTING_LAYOUT_KEY] === 'horizontal'
      ? 'horizontal'
      : 'vertical'

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
  const dragSourceIndexRef = createRef<number | null>(null)

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

  const tabItemHtml = (tab: Tab, index: number, active: number) => `
                  <div class="ls-tab ${index === active ? 'active' : ''} ${tab.pinned ? 'pinned' : ''}" draggable="true" data-on-click="activateTabModel" data-idx="${index}">
                    <span class="ls-tab-icon" draggable="false">${tab.isBlock ? BLOCK_ICON : PAGE_ICON}</span>
                    <span class="page-title" draggable="false">${escapeHtml(tab.fullTitle || tab.title || '')}</span>
                    <span class="ls-tab-actions" draggable="false">
                      <span class="ls-tab-pin" draggable="false" title="${tab.pinned ? 'Unpin tab' : 'Pin tab'}" data-on-click="togglePinModel" data-idx="${index}">${PIN_ICON}</span>
                      <span class="ls-tab-close" draggable="false" title="Close tab" data-on-click="closeTabModel" data-idx="${index}">×</span>
                    </span>
                  </div>`

  const renderVertical = (state: State) => `
        <div id="ls-tabs-section" class="ls-tabs-root sidebar-content-group is-expand">
          <div class="sidebar-content-group-inner">
            <div class="hd items-center non-collapsable">
              <span class="a"><a class="wrap-th"><strong class="flex-1">Tabs</strong></a></span>
              <span class="b"><a class="ls-tab-new" title="New tab" data-on-click="newTabModel">+</a></span>
            </div>
            <div class="bd">
              <div class="ls-tabs-list">
                ${state.tabs.map((tab, index) => tabItemHtml(tab, index, state.active)).join('')}
              </div>
            </div>
          </div>
        </div>
      `

  const renderHorizontal = (state: State) => `
        <div id="ls-tabs-bar" class="ls-tabs-root ls-tabs-horizontal">
          <div class="ls-tabs-list">
            ${state.tabs.map((tab, index) => tabItemHtml(tab, index, state.active)).join('')}
          </div>
          <a class="ls-tab-new" title="New tab" data-on-click="newTabModel">+</a>
        </div>
      `

  const placeHorizontalBar = () => {
    const doc = top!.document
    const inner = doc.getElementById('ls-tabs-bar')
    const wrapper = inner?.closest('[data-injected-ui]') as HTMLElement | null
    const main = doc.getElementById('main-container')
    if (!wrapper || !main || !main.parentElement) return
    if (wrapper.nextElementSibling !== main)
      main.parentElement.insertBefore(wrapper, main)
    updateLeftOffset()
  }

  const updateLeftOffset = () => {
    const doc = top!.document
    const inner = doc.getElementById('ls-tabs-bar')
    if (!inner) return
    const main = doc.getElementById('main-container')
    const sidebar = doc.getElementById('left-sidebar')
    const open = !!main?.classList.contains('is-left-sidebar-open')
    const width = open && sidebar ? sidebar.offsetWidth : 0
    inner.style.setProperty('--ls-tabs-left-offset', `${width}px`)
  }

  const scheduleHorizontalPlacement = () => {
    let tries = 0
    const tick = () => {
      if (getLayout() !== 'horizontal') return
      if (top!.document.getElementById('ls-tabs-bar')) {
        placeHorizontalBar()
        return
      }
      if (tries++ < 30) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const render = () => {
    const state = stateRef.get()
    if (getLayout() === 'horizontal') {
      logseq.provideUI({
        key: 'ls-tabs-section',
        path: BAR_SEL,
        template: '',
        replace: true,
      } as any)
      logseq.provideUI({
        key: 'ls-tabs-bar',
        path: LEFT_CONTAINER_SEL,
        template: renderHorizontal(state),
        replace: true,
      } as any)
      scheduleHorizontalPlacement()
    } else {
      logseq.provideUI({
        key: 'ls-tabs-bar',
        path: LEFT_CONTAINER_SEL,
        template: '',
        replace: true,
      } as any)
      logseq.provideUI({
        key: 'ls-tabs-section',
        path: BAR_SEL,
        template: renderVertical(state),
        replace: true,
      } as any)
    }
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

  const togglePinTab = (index: number) =>
    transaction(async () => {
      await commit(togglePin(stateRef.get(), index))
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

  const findTabElement = (
    eventTarget: EventTarget | null,
  ): HTMLElement | null =>
    (eventTarget as HTMLElement | null)?.closest?.(
      '.ls-tabs-root .ls-tab',
    ) as HTMLElement | null

  const clearDropIndicators = () => {
    const indicated = top!.document.querySelectorAll(
      '.ls-tabs-root .ls-tab.drop-before, .ls-tabs-root .ls-tab.drop-after',
    )
    indicated.forEach((element) => {
      element.classList.remove('drop-before')
      element.classList.remove('drop-after')
    })
  }

  const computeInsertIndex = (
    tabElement: HTMLElement,
    event: DragEvent,
  ): number => {
    const targetIndex = parseInt(tabElement.dataset.idx || '', 10)
    if (isNaN(targetIndex)) return -1
    const rect = tabElement.getBoundingClientRect()
    const isAfter =
      getLayout() === 'horizontal'
        ? event.clientX > rect.left + rect.width / 2
        : event.clientY > rect.top + rect.height / 2
    return isAfter ? targetIndex + 1 : targetIndex
  }

  top!.document.addEventListener('dragstart', (event) => {
    const tabElement = findTabElement(event.target)
    if (!tabElement) return
    const sourceIndex = parseInt(tabElement.dataset.idx || '', 10)
    if (isNaN(sourceIndex)) return
    dragSourceIndexRef.set(sourceIndex)
    tabElement.classList.add('dragging')
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(sourceIndex))
    }
  })

  const wouldCrossPinnedBoundary = (
    sourceIndex: number,
    insertIndex: number,
  ): boolean => {
    const tabs = stateRef.get().tabs
    const movedTab = tabs[sourceIndex]
    if (!movedTab) return false
    const pinnedCount = tabs.filter((tab) => tab.pinned).length
    if (movedTab.pinned && insertIndex > pinnedCount) return true
    if (!movedTab.pinned && insertIndex < pinnedCount) return true
    return false
  }

  top!.document.addEventListener('dragover', (event) => {
    if (dragSourceIndexRef.get() === null) return
    const tabElement = findTabElement(event.target)
    if (!tabElement) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    const insertIndex = computeInsertIndex(tabElement, event)
    const sourceIndex = dragSourceIndexRef.get()!
    clearDropIndicators()
    if (insertIndex === sourceIndex || insertIndex === sourceIndex + 1) return
    if (wouldCrossPinnedBoundary(sourceIndex, insertIndex)) return
    const targetIndex = parseInt(tabElement.dataset.idx || '', 10)
    tabElement.classList.add(
      insertIndex > targetIndex ? 'drop-after' : 'drop-before',
    )
  })

  top!.document.addEventListener('dragleave', (event) => {
    const tabElement = findTabElement(event.target)
    if (!tabElement) return
    const related = event.relatedTarget as HTMLElement | null
    if (related && tabElement.contains(related)) return
    tabElement.classList.remove('drop-before')
    tabElement.classList.remove('drop-after')
  })

  top!.document.addEventListener('drop', (event) => {
    const sourceIndex = dragSourceIndexRef.get()
    if (sourceIndex === null) return
    const tabElement = findTabElement(event.target)
    if (!tabElement) return
    event.preventDefault()
    const insertIndex = computeInsertIndex(tabElement, event)
    clearDropIndicators()
    dragSourceIndexRef.set(null)
    if (insertIndex < 0) return
    transaction(async () => {
      const nextState = moveTab(stateRef.get(), sourceIndex, insertIndex)
      await commit(nextState)
    })
  })

  top!.document.addEventListener('dragend', () => {
    dragSourceIndexRef.set(null)
    clearDropIndicators()
    const dragging = top!.document.querySelectorAll(
      '.ls-tabs-root .ls-tab.dragging',
    )
    dragging.forEach((element) => element.classList.remove('dragging'))
  })

  const tooltip = top!.document.createElement('div')
  tooltip.className = 'ls-tab-tooltip'
  top!.document.body.appendChild(tooltip)

  const showTabTooltip = (tabElement: HTMLElement) => {
    const title =
      tabElement.querySelector('.page-title')?.textContent?.trim() || ''
    if (!title) return
    tooltip.textContent = title
    const rect = tabElement.getBoundingClientRect()
    const left = Math.min(rect.left, top!.window.innerWidth - 360 - 8)
    tooltip.style.left = `${Math.max(8, left)}px`
    tooltip.style.top = `${rect.bottom + 4}px`
    tooltip.classList.add('visible')
  }

  top!.document.addEventListener('mouseover', (event) => {
    const tabElement = findTabElement(event.target)
    if (tabElement) showTabTooltip(tabElement)
  })

  top!.document.addEventListener('mouseout', (event) => {
    const tabElement = findTabElement(event.target)
    if (!tabElement) return
    const related = event.relatedTarget as HTMLElement | null
    if (related && tabElement.contains(related)) return
    tooltip.classList.remove('visible')
  })

  const openNewTab = async () => {
    openAsNewTabRef.set(true)
    setTimeout(() => openAsNewTabRef.set(false), 30000)
    await logseq.App.invokeExternalCommand('logseq.go/search')
  }

  logseq.provideModel({
    activateTabModel(event: any) {
      const index = parseInt(event.dataset.idx, 10)
      if (!isNaN(index)) activateTab(index)
    },
    closeTabModel(event: any) {
      const index = parseInt(event.dataset.idx, 10)
      if (!isNaN(index)) closeTab(index)
    },
    togglePinModel(event: any) {
      const index = parseInt(event.dataset.idx, 10)
      if (!isNaN(index)) togglePinTab(index)
    },
    async newTabModel() {
      await openNewTab()
    },
  })

  logseq.App.registerCommandPalette(
    {
      key: 'logseq-tabsdb-plugin-new-tab',
      label: 'logseq-tabsdb-plugin: New Tab',
      keybinding: {
        mode: 'global',
        binding: 'mod+t',
      },
    },
    async () => {
      await openNewTab()
    },
  )

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
    render()
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

  logseq.onSettingsChanged((next: any, prev: any) => {
    if (next?.[SETTING_LAYOUT_KEY] !== prev?.[SETTING_LAYOUT_KEY]) render()
  })

  const leftContainer = top!.document.querySelector(LEFT_CONTAINER_SEL)
  if (leftContainer) {
    new MutationObserver(() => {
      if (getLayout() === 'horizontal') placeHorizontalBar()
    }).observe(leftContainer, { childList: true })
  }

  const mainContainer = top!.document.getElementById('main-container')
  if (mainContainer) {
    new MutationObserver(() => {
      if (getLayout() === 'horizontal') updateLeftOffset()
    }).observe(mainContainer, { attributes: true, attributeFilter: ['class'] })
  }

  const leftSidebar = top!.document.getElementById('left-sidebar')
  if (leftSidebar) {
    new ResizeObserver(() => {
      if (getLayout() === 'horizontal') updateLeftOffset()
    }).observe(leftSidebar)
  }

  await transaction(async () => {
    await reconcileCurrentPage()
    render()
  })
}

logseq.ready(main).catch(console.error)
