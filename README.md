# logseq-tabsdb-plugin
![Version](https://img.shields.io/github/v/release/benjypng/logseq-tabsdb-plugin?style=flat-square&color=0969da) ![Downloads](https://img.shields.io/github/downloads/benjypng/logseq-tabsdb-plugin/total?style=flat-square&color=orange) ![License](https://img.shields.io/github/license/benjypng/logseq-tabsdb-plugin?style=flat-square)

> Browser-style tabs for Logseq DB. Keep multiple pages and blocks open at once, switch between them instantly, and stop losing your place.

---

## ✨ Features
* **Tabbed Navigation:** A vertical Tabs section in the left sidebar (between Favorites and Recent) that lets you keep multiple pages and blocks open simultaneously.
* **Pages and Blocks:** Both page references and block references can live in tabs, with distinct icons so you can tell them apart at a glance.
* **Cmd/Ctrl-Click to Open in New Tab:** Hold `Cmd` (macOS) or `Ctrl` (Windows/Linux) and click any page or block reference to open it in a fresh tab instead of replacing the current one.
* **Per-Graph Persistence:** Tabs are stored per graph, so switching between vaults doesn't mix your open tabs together.
* **Minimalist Active State:** Inactive tabs are dimmed; the active one sits at full opacity. No loud highlights, no extra borders — it stays out of your way.

### Why Tabs vs Right Sidebar
Logseq's right sidebar is great for reference material, but it's not designed for switching between several "primary" pages you're actively working on.

* **Tabs (this plugin):** Each tab is a top-level page or block view. Click to swap your main editor focus. Behaves like a browser — open, close, switch, persist.
* **Right Sidebar (built-in):** Stacks blocks/pages alongside your main editor for side-by-side reference. Best for things you want to read *while* editing something else.

## 📸 Screenshots / Demo
TBA.

## ⚙️ Installation
1.  Open Logseq.
2.  Go to the **Marketplace** (Plugins > Marketplace).
3.  Search for **logseq-tabsdb**.
4.  Click **Install**.

## 🛠 Usage & Settings
#### Opening Tabs
1. Click the `+` icon in the **Tabs** section header in the left sidebar — this opens the search palette so you can pick any page to load into a new tab.
2. `Cmd/Ctrl + click` any page reference (`[[Page]]`) or block reference to open it in a new tab.
3. Plain navigation (regular click) replaces the active tab — same as standard Logseq behavior.

#### Switching and Closing
1.  Click any tab to activate it.
2.  Hover a tab to reveal the `×` close button on the right.
3.  Closing the active tab falls back to the next tab in the list.

#### Per-Graph State
1.  Tab state is stored under `settings.graphs[<graphName>].tabsState`.
2.  Switching graphs (via the graph selector) automatically loads that graph's tab set.
3.  The currently displayed page is always reconciled into the tab list on load and on graph switch.

## ☕️ Support
If you enjoy this plugin, please consider supporting the development.

<div align="center">
  <a href="https://github.com/sponsors/yourusername"><img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="Sponsor on Github" /></a>&nbsp;<a href="https://www.buymeacoffee.com/yourusername"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" /></a>
</div>

## 🤝 Contributing
Issues are welcome. If you find a bug, please open an issue. Pull requests are not accepted at the moment as I am not able to commit to reviewing them in a timely fashion.
