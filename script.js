// ================================================
// LABO-DOC — Document Management System v1.0.0
// Labo Nedjma — 2026
// ================================================

// ===== DATA STORE =====
let documents = JSON.parse(localStorage.getItem('labodoc_docs') || 'null') || [
  {
    id: 'doc_decision_001',
    name: 'Décision d\'Affectation',
    category: 'Administratif',
    description: 'Décision de transfert ou d\'affectation d\'un employé',
    icon: 'fa-file-signature',
    pdfUrl: './forms/decision_affectation.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_entree_001',
    name: "Bon d'Entrée",
    category: 'Administratif',
    description: "Formulaire de demande et bon d'entrée pour le personnel",
    icon: 'fa-sign-in-alt',
    pdfUrl: './forms/bon_entree.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_decharge_001',
    name: 'Décharge de Matériel',
    category: 'Administratif',
    description: 'Formulaire de décharge de matériel remis au personnel',
    icon: 'fa-box-open',
    pdfUrl: './forms/decharge.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_sortie_001',
    name: 'Bon de Sortie',
    category: 'Administratif',
    description: 'Demande de sortie temporaire du personnel',
    icon: 'fa-door-open',
    pdfUrl: './forms/bon_sortie.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_explic_001',
    name: 'Demande d\'explication',
    category: 'Administratif',
    description: 'Demande de justification suite à une infraction constatée',
    icon: 'fa-exclamation-triangle',
    pdfUrl: './forms/demande_explication.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_absence_001',
    name: 'Demande d\'absence',
    category: 'Ressources Humaines',
    description: 'Demande d\'autorisation d\'absence ou de congé',
    icon: 'fa-calendar-minus',
    pdfUrl: './forms/demande_absence.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_commande_001',
    name: 'Bon de Commande',
    category: 'MGX',
    description: 'Structure des Moyens Généraux (MGX) - Achat et gestion des stocks',
    icon: 'fa-shopping-cart',
    pdfUrl: './forms/bon_commande.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_mission_001',
    name: 'Ordre de Missions',
    category: 'HSE',
    description: 'Ordre de mission pour transport médical ou autre',
    icon: 'fa-ambulance',
    pdfUrl: './forms/ordre_mission.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_besoins_001',
    name: 'Etat de Besoins',
    category: 'MGX',
    description: 'Demande d\'état des besoins pour le service',
    icon: 'fa-clipboard-list',
    pdfUrl: './forms/etat_besoins.html',
    printCount: 0,
    createdAt: '2026-05-09'
  },
  {
    id: 'doc_conge_001',
    name: 'Demande de Congé',
    category: 'Ressources Humaines',
    description: 'Demande de congé (annuel, récupération, spécial, sans solde)',
    icon: 'fa-plane-departure',
    pdfUrl: './forms/demande_conge.html',
    printCount: 0,
    createdAt: '2026-05-09'
  }
];

let categories = JSON.parse(localStorage.getItem('labodoc_cats') || 'null') || [
  { id:'cat1', name:'Administratif', color:'#0056b3' },
  { id:'cat2', name:'Ressources Humaines', color:'#10b981' },
  { id:'cat4', name:'MGX', color:'#f59e0b' },
  { id:'cat6', name:'HSE', color:'#0ea5e9' }
];

// Ensure only standard categories exist
categories = categories.filter(c => ['Administratif', 'Ressources Humaines', 'MGX', 'HSE'].includes(c.name));

// Patch to update old cached Logistique category to MGX
categories.forEach(c => {
  if (c.name === 'Logistique') c.name = 'MGX';
});
localStorage.setItem('labodoc_cats', JSON.stringify(categories));

let printHistory = JSON.parse(localStorage.getItem('labodoc_history') || '[]');
let settings = JSON.parse(localStorage.getItem('labodoc_settings') || '{}');
let currentDocId = null;
let deleteDocId = null;
let activeCategory = 'all';
let historyDisplayLimit = 20;

// ===== SAVE DATA =====
function saveData() {
  localStorage.setItem('labodoc_docs', JSON.stringify(documents));
  localStorage.setItem('labodoc_cats', JSON.stringify(categories));
  localStorage.setItem('labodoc_history', JSON.stringify(printHistory));
  localStorage.setItem('labodoc_settings', JSON.stringify(settings));
}

// Automatically sync state if printed from another tab
window.addEventListener('storage', (e) => {
  let updated = false;
  if (e.key === 'labodoc_history') {
    printHistory = JSON.parse(e.newValue || '[]');
    updated = true;
  }
  if (e.key === 'labodoc_docs') {
    documents = JSON.parse(e.newValue || '[]');
    updated = true;
  }
  if (updated) {
    renderDashboard();
    renderHistoryTable();
  }
});

// ===== SPLASH SCREEN =====
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splashScreen');
  const fill = document.getElementById('splashBarFill');
  const pct = document.getElementById('splashPct');
  const status = document.getElementById('splashStatus');
  const app = document.getElementById('appWrapper');
  const msgs = ['Initialisation...', 'Chargement des documents...', 'Mise en place de l\'interface...', 'Système prêt !'];
  let p = 0;

  const interval = setInterval(() => {
    p += 2;
    if (p > 100) p = 100;
    fill.style.width = p + '%';
    pct.textContent = p + '%';
    if (p === 25) status.textContent = msgs[1];
    if (p === 60) status.textContent = msgs[2];
    if (p === 95) status.textContent = msgs[3];
    if (p >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        splash.classList.add('fade-out');
        app.classList.remove('hidden');
        setTimeout(() => splash.remove(), 500);
        initApp();
      }, 400);
    }
  }, 20);

  // Theme init
  const saved = localStorage.getItem('labodoc-theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    const icon = document.querySelector('#themeToggle i');
    if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
  }
});

// ===== INIT APP =====
function initApp() {
  renderDashboard();
  renderDocsGrid();
  renderHistoryTable();
  renderSettings();
  loadSettings();
  body_isAdmin(); // simulated admin
}

// Simulate admin (in real app, use Firebase Auth)
function body_isAdmin() {
  document.body.classList.add('is-admin');
}

// ===== NAVIGATION =====
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1));
  if (target) target.classList.add('active');
  const link = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (link) link.classList.add('active');
  if (page === 'dashboard') renderDashboard();
  if (page === 'documents') renderDocsGrid();
  if (page === 'history') {
    renderHistoryTable();
    populateCategorySelect('filterCategory', '', 'Toutes Catégories');
  }
  if (page === 'settings') renderSettings();
  if (page === 'developer') { /* Any specific dev page logic */ }
  if (page === 'contact') { /* Contact page logic */ }
  closeMobileNav();
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}
function closeMobileNav() {
  document.getElementById('navLinks').classList.remove('mobile-open');
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.querySelector('#themeToggle i');
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('labodoc-theme', 'light');
    icon.classList.remove('fa-sun'); icon.classList.add('fa-moon');
  } else {
    html.classList.add('dark');
    localStorage.setItem('labodoc-theme', 'dark');
    icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  // Stats
  document.getElementById('statTotalDocs').textContent = documents.length;

  const now = new Date();
  const todayStr = now.toDateString();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const todayPrints = printHistory.filter(h => {
    const d = new Date(h.printedAt);
    return d.toDateString() === todayStr;
  }).reduce((sum, h) => sum + (h.copies || 1), 0);
  
  document.getElementById('statTodayPrints').textContent = todayPrints;

  const monthPrints = printHistory.filter(h => {
    const d = new Date(h.printedAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce((sum, h) => sum + (h.copies || 1), 0);
  
  document.getElementById('statMonthPrints').textContent = monthPrints;

  const topDoc = [...documents].sort((a, b) => (b.printCount || 0) - (a.printCount || 0))[0];
  const topEl = document.getElementById('statTopDoc');
  if (topDoc && (topDoc.printCount || 0) > 0) {
    topEl.textContent = topDoc.name;
    topEl.title = topDoc.name;
  } else {
    topEl.textContent = '—';
  }

  // Quick Access (4 random documents)
  const shuffledDocs = [...documents].sort(() => 0.5 - Math.random());
  const quick = shuffledDocs.slice(0, 4);
  const quickGrid = document.getElementById('quickGrid');
  if (quick.length === 0) {
    quickGrid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Aucun document disponible</p></div>';
  } else {
    quickGrid.innerHTML = quick.map(d => `
      <div class="quick-card" onclick="openActionModal('${d.id}')">
        <div class="quick-card-icon"><i class="fas ${d.icon}"></i></div>
        <div class="quick-card-name">${d.name}</div>
        <div class="quick-card-cat ${getCategoryClass(d.category)}">${d.category}</div>
        <div class="doc-card-desc" style="font-size:0.75rem; margin-top:5px; opacity:0.8">${d.description || ''}</div>
      </div>
    `).join('');
  }

  // Recent prints (Dashboard limit to 3)
  const recent = [...printHistory].reverse().slice(0, 3);
  const recentList = document.getElementById('recentList');
  const moreBtnContainer = document.getElementById('recentMoreContainer');

  if (printHistory.length === 0) {
    recentList.innerHTML = '<div class="empty-state"><i class="fas fa-print"></i><p>Aucune impression récente</p></div>';
    moreBtnContainer.style.display = 'none';
  } else {
    recentList.innerHTML = recent.map(h => `
      <div class="recent-item">
        <div class="recent-icon"><i class="fas fa-print"></i></div>
        <div class="recent-info">
          <div class="recent-name">${h.docName}</div>
          <div class="recent-meta">${h.category} — ${h.copies} copie(s)</div>
        </div>
        <div class="recent-time">${formatDateTime(h.printedAt)}</div>
      </div>
    `).join('');
    
    // Show 'Voir Plus' if more than 3
    moreBtnContainer.style.display = printHistory.length > 3 ? 'flex' : 'none';
  }
}

function openRecentModal() {
  const modalBody = document.getElementById('recentModalBody');
  const fullRecent = [...printHistory].reverse().slice(0, 15); // Show last 15 in modal
  
  modalBody.innerHTML = fullRecent.map(h => `
    <div class="recent-item" style="border-radius: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); display: flex; align-items: center;">
      <div class="recent-icon" style="background: rgba(37,99,235,0.1); color: var(--blue);"><i class="fas fa-history"></i></div>
      <div class="recent-info" style="flex: 1;">
        <div class="recent-name" style="font-weight: 700;">${h.docName}</div>
        <div class="recent-meta">${h.category} — <span style="color: var(--green);">${h.copies} copie(s)</span></div>
      </div>
      <div style="text-align: right;">
        <div class="recent-time" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 4px;">${formatDateTime(h.printedAt)}</div>
        ${h.savedUrl ? `<button class="btn-ghost btn-sm" onclick="window.open('${h.savedUrl}', '_blank')" style="padding: 4px 8px; font-size: 0.7rem;"><i class="fas fa-eye"></i> Voir Copie</button>` : ''}
      </div>
    </div>
  `).join('');
  
  document.getElementById('recentModal').classList.add('show');
}

function closeRecentModal() {
  document.getElementById('recentModal').classList.remove('show');
}

// ===== DOCUMENTS GRID =====
function renderDocsGrid(filterCat = activeCategory, search = '') {
  const grid = document.getElementById('docsGrid');
  let filtered = documents;
  if (filterCat !== 'all') filtered = filtered.filter(d => d.category === filterCat);
  const q = search.toLowerCase();
  if (q) filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-docs"><i class="fas fa-search"></i><p>Aucun document trouvé</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(d => {
    return `
      <div class="doc-card">
        <div class="doc-card-top">
          <div class="doc-card-icon"><i class="fas ${d.icon}"></i></div>
          <div class="doc-card-name">${d.name}</div>
          <div class="doc-card-cat ${getCategoryClass(d.category)}">${d.category}</div>
          <div class="doc-card-desc">${d.description || ''}</div>
        </div>
        <div class="doc-card-bottom">
          <button class="btn-preview" style="flex:1" onclick="openActionModal('${d.id}')"><i class="fas fa-eye"></i> Ouvrir Document</button>
        </div>
      </div>
    `;
  }).join('');

  renderCategoryTabs();
}

function renderCategoryTabs() {
  const tabs = document.getElementById('catTabs');
  const usedCats = [...new Set(documents.map(d => d.category))];
  tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}" onclick="filterByCategory('all', this)">Tous (${documents.length})</button>`;
  usedCats.forEach(cat => {
    const count = documents.filter(d => d.category === cat).length;
    tabs.innerHTML += `<button class="cat-tab ${activeCategory === cat ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">${cat} (${count})</button>`;
  });
}

function filterByCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDocsGrid(cat, document.getElementById('docSearch').value);
}

function filterDocs() {
  renderDocsGrid(activeCategory, document.getElementById('docSearch').value);
}

// ===== PRINT MODAL =====
function openActionModal(docId) {
  currentDocId = docId;
  const doc = documents.find(d => d.id === docId);
  if (!doc) return;
  document.getElementById('actionModalTitle').textContent = doc.name;
  document.getElementById('actionModal').classList.add('show');
}

function closeActionModal() {
  document.getElementById('actionModal').classList.remove('show');
}

function proceedToEditing() {
  const doc = documents.find(d => d.id === currentDocId);
  closeActionModal();
  if (doc) {
    if (doc.pdfUrl) {
      // Pass the docId to the form so it knows which document is being printed
      const urlWithDocId = doc.pdfUrl + (doc.pdfUrl.includes('?') ? '&' : '?') + '_docId=' + doc.id;
      saveData(); // Ensure documents are in localStorage
      window.open(urlWithDocId, '_blank');
    } else {
      openPrintModal(currentDocId);
    }
  }
}

function openPrintModal(docId) {
  currentDocId = docId;
  const doc = documents.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById('printModalTitle').textContent = doc.name;
  document.getElementById('pdfDocTitle').textContent = doc.name;

  const frame = document.getElementById('pdfFrame');
  const placeholder = document.getElementById('pdfPlaceholder');

  if (doc.pdfUrl) {
    frame.src = doc.pdfUrl;
    frame.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    frame.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  // Load default settings
  const s = getSettings();
  document.getElementById('printCopies').value = s.copies || 1;
  document.getElementById('printFormat').value = s.paperSize || 'A4';
  document.getElementById('printOrientation').value = s.orientation || 'portrait';

  document.getElementById('printModal').classList.add('show');
}

function openDocDirect(docId) {
  const doc = documents.find(d => d.id === docId);
  if (doc && doc.pdfUrl) {
    window.open(doc.pdfUrl, '_blank');
  } else if (doc) {
    openPrintModal(docId);
  }
}

function closePrintModal() {
  document.getElementById('printModal').classList.remove('show');
  document.getElementById('pdfFrame').src = '';
  currentDocId = null;
}

function executePrint() {
  if (!currentDocId) return;
  const doc = documents.find(d => d.id === currentDocId);
  if (!doc) return;

  const copies = parseInt(document.getElementById('printCopies').value) || 1;
  const format = document.getElementById('printFormat').value;
  const orientation = document.getElementById('printOrientation').value;

  let finalUrl = doc.pdfUrl || '';

  if (doc.pdfUrl) {
    // Collect data from iframe fields
    const frame = document.getElementById('pdfFrame');
    try {
      const iDoc = frame.contentDocument || frame.contentWindow.document;
      const params = new URLSearchParams();
      const inputs = iDoc.querySelectorAll('input, select, textarea');
      inputs.forEach(el => {
        if (el.id && el.value && el.type !== 'button' && el.type !== 'submit') {
          params.set(el.id, el.value);
        }
      });
      params.set('print', '1');
      if ([...params].length > 1) finalUrl += '?' + params.toString();
    } catch(e) { /* iframe not accessible */ }
  }

  // Record in history
  printHistory.push({
    id: 'h' + Date.now(),
    docId: doc.id,
    docName: doc.name,
    category: doc.category,
    copies, format, orientation,
    savedUrl: finalUrl,
    printedAt: new Date().toISOString()
  });
  doc.printCount = (doc.printCount || 0) + copies;
  saveData();
  
  // Refresh UI
  renderDashboard();
  renderHistoryTable();
  
  if (doc.pdfUrl) {
    const printWin = window.open(finalUrl, '_blank');
    if (printWin) {
      printWin.addEventListener('load', () => {
        try { printWin.print(); } catch(e) {}
      });
    }
  } else {
    window.print();
  }

  showToast(`✅ Document enregistré et ouvert pour impression`, 'success');
  closePrintModal();
}



// ===== ADD / EDIT DOCUMENT =====
function openAddDocModal() {
  document.getElementById('addDocTitle').textContent = 'Ajouter un Document';
  document.getElementById('docName').value = '';
  document.getElementById('docDescription').value = '';
  document.getElementById('docPdfUrl').value = '';
  document.getElementById('docIcon').value = 'fa-file-alt';
  document.getElementById('editDocId').value = '';
  populateCategorySelect('docCategory');
  document.getElementById('addDocModal').classList.add('show');
}

function openEditDocModal(docId) {
  const doc = documents.find(d => d.id === docId);
  if (!doc) return;
  document.getElementById('addDocTitle').textContent = 'Modifier le Document';
  document.getElementById('docName').value = doc.name;
  document.getElementById('docDescription').value = doc.description || '';
  document.getElementById('docPdfUrl').value = doc.pdfUrl || '';
  document.getElementById('docIcon').value = doc.icon || 'fa-file-alt';
  document.getElementById('editDocId').value = doc.id;
  populateCategorySelect('docCategory', doc.category);
  document.getElementById('addDocModal').classList.add('show');
}

function closeAddDocModal() {
  document.getElementById('addDocModal').classList.remove('show');
}

function saveDocument() {
  const name = document.getElementById('docName').value.trim();
  const category = document.getElementById('docCategory').value;
  if (!name || !category) { showToast('⚠️ Nom et catégorie obligatoires', 'error'); return; }

  const editId = document.getElementById('editDocId').value;
  const docData = {
    name,
    category,
    description: document.getElementById('docDescription').value.trim(),
    pdfUrl: document.getElementById('docPdfUrl').value.trim(),
    icon: document.getElementById('docIcon').value
  };

  if (editId) {
    const idx = documents.findIndex(d => d.id === editId);
    if (idx !== -1) documents[idx] = { ...documents[idx], ...docData };
    showToast('✅ Document modifié avec succès', 'success');
  } else {
    documents.push({ id: 'doc' + Date.now(), printCount: 0, createdAt: new Date().toISOString().split('T')[0], ...docData });
    showToast('✅ Document ajouté avec succès', 'success');
  }

  saveData();
  closeAddDocModal();
  renderDocsGrid();
  renderDashboard();
}

// ===== DELETE =====
function openDeleteModal(docId) {
  deleteDocId = docId;
  const doc = documents.find(d => d.id === docId);
  document.getElementById('deleteDocName').textContent = doc ? doc.name : 'ce document';
  document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  deleteDocId = null;
}

function confirmDelete() {
  if (!deleteDocId) return;
  documents = documents.filter(d => d.id !== deleteDocId);
  saveData();
  closeDeleteModal();
  renderDocsGrid();
  renderDashboard();
  showToast('🗑️ Document supprimé', 'success');
}

// ===== HISTORY =====
function renderHistoryTable(filtered = null, append = false) {
  const allData = filtered !== null ? filtered : [...printHistory].reverse();
  const dataToDisplay = allData.slice(0, historyDisplayLimit);
  const body = document.getElementById('historyBody');
  const moreBtnContainer = document.getElementById('historyMoreContainer');

  const totalCountEl = document.getElementById('historyTotalCount');
  if (totalCountEl) totalCountEl.textContent = allData.length;

  if (allData.length === 0) {
    body.innerHTML = '<tr><td colspan="7" class="empty-row"><i class="fas fa-inbox"></i> Aucune impression enregistrée</td></tr>';
    if(moreBtnContainer) moreBtnContainer.style.display = 'none';
    return;
  }

  body.innerHTML = dataToDisplay.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${h.docName}</strong></td>
      <td>${h.category || '—'}</td>
      <td>${h.copies}</td>
      <td>${formatDateTime(h.printedAt)}</td>
      <td><span class="badge-ok">✓ Imprimé</span></td>
      <td>
        ${h.savedUrl ? `<button class="btn-ghost btn-sm" onclick="window.open('${h.savedUrl}', '_blank')" style="padding: 5px 10px; font-size: 0.75rem;"><i class="fas fa-eye"></i> Voir</button>` : '<span style="color:var(--text2);font-size:0.75rem;">—</span>'}
      </td>
    </tr>
  `).join('');

  if(moreBtnContainer) {
    moreBtnContainer.style.display = allData.length > historyDisplayLimit ? 'flex' : 'none';
  }
}

function loadMoreHistory() {
  historyDisplayLimit += 20;
  const date = document.getElementById('filterDate').value;
  const cat = document.getElementById('filterCategory').value;
  if(date || cat) {
    let data = [...printHistory].reverse();
    if (date) data = data.filter(h => h.printedAt.startsWith(date));
    if (cat) data = data.filter(h => h.category === cat);
    renderHistoryTable(data, true);
  } else {
    renderHistoryTable(null, true);
  }
}

function filterHistory() {
  historyDisplayLimit = 20;
  const date = document.getElementById('filterDate').value;
  const cat = document.getElementById('filterCategory').value;
  let data = [...printHistory].reverse();
  if (date) data = data.filter(h => h.printedAt.startsWith(date));
  if (cat) data = data.filter(h => h.category === cat);
  renderHistoryTable(data);
}

function clearHistoryFilter() {
  historyDisplayLimit = 20;
  document.getElementById('filterDate').value = '';
  document.getElementById('filterCategory').value = '';
  renderHistoryTable();
}

function exportHistory() {
  let csv = '\uFEFF#;Document;Catégorie;Copies;Date;Format\n';
  [...printHistory].reverse().forEach((h, i) => {
    csv += `${i+1};${h.docName};${h.category};${h.copies};${formatDateTime(h.printedAt)};${h.format||'A4'}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Labo-Doc_Historique_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Historique exporté', 'success');
}

function clearHistory() {
  document.getElementById('clearHistoryModal').classList.add('show');
}

function closeClearHistoryModal() {
  document.getElementById('clearHistoryModal').classList.remove('show');
}

function executeClearHistory() {
  printHistory = [];
  saveData();
  renderHistoryTable();
  renderDashboard();
  closeClearHistoryModal();
  showToast('🗑️ Historique supprimé', 'success');
}

// ===== SETTINGS =====
function renderSettings() {
  // Categories management
  const list = document.getElementById('catManageList');
  if (list) {
    list.innerHTML = categories.map(c => `
      <div class="cat-item">
        <div class="cat-dot" style="background:${c.color}"></div>
        <span class="cat-item-name">${c.name}</span>
        <button class="cat-del-btn" onclick="deleteCategory('${c.id}')"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
  }
}

function loadSettings() {
  const s = getSettings();
  const pSize = document.getElementById('setPaperSize');
  const orient = document.getElementById('setOrientation');
  const copies = document.getElementById('setCopies');
  if (pSize) pSize.value = s.paperSize || 'A4';
  if (orient) orient.value = s.orientation || 'portrait';
  if (copies) copies.value = s.copies || 1;
}

function saveSettings() {
  settings = {
    paperSize: document.getElementById('setPaperSize')?.value || 'A4',
    orientation: document.getElementById('setOrientation')?.value || 'portrait',
    copies: parseInt(document.getElementById('setCopies')?.value) || 1
  };
  saveData();
  showToast('✅ Paramètres sauvegardés', 'success');
}

function getSettings() {
  return JSON.parse(localStorage.getItem('labodoc_settings') || '{}');
}

function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const color = document.getElementById('newCatColor').value;
  if (!name) { showToast('⚠️ Entrez un nom de catégorie', 'error'); return; }
  if (categories.find(c => c.name === name)) { showToast('⚠️ Catégorie déjà existante', 'error'); return; }
  categories.push({ id: 'cat' + Date.now(), name, color });
  document.getElementById('newCatName').value = '';
  saveData();
  renderSettings();
  renderCategoryTabs();
  populateCategorySelect('docCategory');
  showToast(`✅ Catégorie "${name}" ajoutée`, 'success');
}

function deleteCategory(catId) {
  categories = categories.filter(c => c.id !== catId);
  saveData();
  renderSettings();
  renderCategoryTabs();
  showToast('🗑️ Catégorie supprimée', 'success');
}

// ===== HELPERS =====
function getCategoryClass(cat) {
  if (!cat) return '';
  const c = cat.toLowerCase();
  if (c.includes('admin')) return 'admin';
  if (c.includes('ressources') || c.includes('rh')) return 'rh';
  if (c.includes('mgx')) return 'mgx';
  if (c.includes('hse')) return 'hse';
  return '';
}

function populateCategorySelect(selectId, selected = '', firstOptionText = 'Sélectionner...') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  
  let finalFirstOptionText = firstOptionText;
  if (selectId === 'filterCategory') {
    finalFirstOptionText += ` (${printHistory.length})`;
  }
  
  sel.innerHTML = `<option value="">${finalFirstOptionText}</option>`;
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    let label = c.name;
    if (selectId === 'filterCategory') {
      const count = printHistory.filter(h => h.category === c.name).length;
      label += ` (${count})`;
    }
    opt.textContent = label;
    if (c.name === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR');
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
    document.getElementById('pdfFrame').src = '';
    currentDocId = null;
  }
});


function clearSystemCache() {
  document.getElementById('cacheModal').classList.add('show');
}

function closeCacheModal() {
  document.getElementById('cacheModal').classList.remove('show');
}

function executeCacheClean() {
  localStorage.removeItem('labodoc_docs'); 
  localStorage.removeItem('labodoc_history');
  closeCacheModal();
  showToast('🔄 Système réinitialisé. Version v1.0.0 active.', 'success');
  setTimeout(() => location.reload(), 1500);
}

// Load last update date on init
window.addEventListener('DOMContentLoaded', () => {
  const savedDate = localStorage.getItem('labodoc_last_update');
  if (savedDate && document.getElementById('lastUpdateDate')) {
    document.getElementById('lastUpdateDate').textContent = savedDate;
  }
});



// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker enregistré: ', reg.scope))
      .catch(err => console.log('Échec Service Worker: ', err));
  });
}
