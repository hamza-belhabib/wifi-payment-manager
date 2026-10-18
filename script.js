/**
 * ==============================================================================
 * 📶 GESTION WI-FI — APPLICATION DE GESTION RÉSIDENTIELLE (VANILLA JAVASCRIPT)
 * ==============================================================================
 * Structure :
 * - loadData() : Chargement depuis localStorage
 * - saveData() : Sauvegarde permanente dans localStorage
 * - calculateTotal() : Somme de tous les paiements et statistiques globales
 * - calculateProgress() : Calcul du pourcentage de l'objectif (max 100%)
 * - updateDashboard() : Mise à jour de l'accueil, de la jauge et des compteurs
 * - addPayment() : Enregistrement d'un paiement
 * - editApartment() : Modification des données d'un appartement
 * - deleteApartment() : Suppression d'un appartement
 * - renderApartments() : Affichage des cartes sous forme de maisonnettes 🏠
 * ==============================================================================
 */

// Clé de stockage dans localStorage
const STORAGE_KEY = 'wifi_building_data_v1';

// Données initiales conformes aux spécifications
const DEFAULT_BUILDING_DATA = {
    settings: {
        targetAmount: 400,
        pricePerPerson: 20,
        currentMonth: "Octobre 2026",
        currency: "DH"
    },
    floors: [
        {
            id: "tag-1",
            name: "TAG 1",
            apartments: [
                {
                    id: "tag-1-apt-1",
                    name: "Appartement 1",
                    residents: 4,
                    requiredAmount: 50,
                    paidAmount: 50,
                    status: "paid",
                    paymentDate: "18/10/2026",
                    notes: "Paiement en espèces"
                },
                {
                    id: "tag-1-apt-2",
                    name: "Appartement 2",
                    residents: 3,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                },
                {
                    id: "tag-1-apt-3",
                    name: "Appartement 3",
                    residents: 5,
                    requiredAmount: 50,
                    paidAmount: 30,
                    status: "partial",
                    paymentDate: "18/10/2026",
                    notes: "Acompte de 30 DH reçu"
                }
            ]
        },
        {
            id: "tag-2",
            name: "TAG 2",
            apartments: [
                {
                    id: "tag-2-apt-1",
                    name: "Appartement 1",
                    residents: 2,
                    requiredAmount: 50,
                    paidAmount: 50,
                    status: "paid",
                    paymentDate: "16/10/2026",
                    notes: "Virement bancaire"
                },
                {
                    id: "tag-2-apt-2",
                    name: "Appartement 2",
                    residents: 4,
                    requiredAmount: 50,
                    paidAmount: 50,
                    status: "paid",
                    paymentDate: "17/10/2026",
                    notes: "Paiement complet"
                },
                {
                    id: "tag-2-apt-3",
                    name: "Appartement 3",
                    residents: 3,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                },
                {
                    id: "tag-2-apt-4",
                    name: "Appartement 4",
                    residents: 1,
                    requiredAmount: 50,
                    paidAmount: 20,
                    status: "partial",
                    paymentDate: "15/10/2026",
                    notes: "Reste 30 DH à régler"
                }
            ]
        },
        {
            id: "tag-3",
            name: "TAG 3",
            apartments: [
                {
                    id: "tag-3-apt-1",
                    name: "Appartement 1",
                    residents: 4,
                    requiredAmount: 50,
                    paidAmount: 50,
                    status: "paid",
                    paymentDate: "14/10/2026",
                    notes: ""
                },
                {
                    id: "tag-3-apt-2",
                    name: "Appartement 2",
                    residents: 3,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                },
                {
                    id: "tag-3-apt-3",
                    name: "Appartement 3",
                    residents: 2,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                },
                {
                    id: "tag-3-apt-4",
                    name: "Appartement 4",
                    residents: 5,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                }
            ]
        },
        {
            id: "le-toit",
            name: "LE TOIT",
            apartments: [
                {
                    id: "le-toit-apt-1",
                    name: "Appartement 1",
                    residents: 2,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                },
                {
                    id: "le-toit-apt-2",
                    name: "Appartement 2",
                    residents: 2,
                    requiredAmount: 50,
                    paidAmount: 0,
                    status: "unpaid",
                    paymentDate: "",
                    notes: ""
                }
            ]
        }
    ]
};

// État global de l'application
let appData = null;
let currentFloorId = null;
let currentApartmentId = null;
let navigationHistory = ['dashboard'];

// ==============================================================================
// 1. GESTION DU STOCKAGE LOCAL (LocalStorage)
// ==============================================================================

/**
 * Charge les données depuis le localStorage ou initialise les valeurs par défaut
 */
function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            appData = JSON.parse(stored);
            // S'assurer que le terme "Le toit" est bien respecté partout
            if (appData && appData.floors) {
                appData.floors.forEach(f => {
                    if (f.id === 'surface' || f.name.toLowerCase().includes('surface')) {
                        f.id = 'le-toit';
                        f.name = 'LE TOIT';
                    }
                });
            }
            if (appData && appData.settings && (!appData.settings.pricePerPerson || isNaN(appData.settings.pricePerPerson))) {
                appData.settings.pricePerPerson = 20;
            }
        } else {
            // Initialisation avec la structure officielle
            appData = JSON.parse(JSON.stringify(DEFAULT_BUILDING_DATA));
            saveData();
        }
    } catch (e) {
        console.error("Erreur lors de la lecture du localStorage :", e);
        appData = JSON.parse(JSON.stringify(DEFAULT_BUILDING_DATA));
    }
}

/**
 * Sauvegarde permanente de toutes les données dans le localStorage
 */
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.error("Erreur lors de la sauvegarde dans le localStorage :", e);
        showToast("Erreur de sauvegarde locale !");
    }
}

// ==============================================================================
// 2. CALCULS & LOGIQUE MÉTIER
// ==============================================================================

/**
 * Détermine automatiquement le statut de paiement
 * - Payé = 0 -> Non payé
 * - Payé > 0 et < demandé -> Paiement partiel
 * - Payé >= demandé -> Payé
 */
function computeStatus(paid, required) {
    const p = parseFloat(paid) || 0;
    const r = parseFloat(required) || 0;

    if (p <= 0) {
        return 'unpaid'; // 🔴 Non payé
    }
    if (r > 0 && p < r) {
        return 'partial'; // 🟠 Paiement partiel
    }
    return 'paid'; // 🟢 Payé
}

/**
 * Calcule les totaux globaux de l'immeuble
 */
function calculateTotal() {
    let totalCollected = 0;
    let totalResidents = 0;
    let totalApartments = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;

    if (appData && appData.floors) {
        appData.floors.forEach(floor => {
            if (floor.apartments) {
                floor.apartments.forEach(apt => {
                    totalApartments++;
                    totalResidents += (parseInt(apt.residents, 10) || 0);
                    const paid = parseFloat(apt.paidAmount) || 0;
                    totalCollected += paid;

                    const status = computeStatus(paid, apt.requiredAmount);
                    if (status === 'paid') countPaid++;
                    else if (status === 'partial') countPartial++;
                    else countUnpaid++;
                });
            }
        });
    }

    const target = (appData && appData.settings && appData.settings.targetAmount) ? appData.settings.targetAmount : 400;
    const remaining = Math.max(0, target - totalCollected);
    const excess = totalCollected > target ? (totalCollected - target) : 0;

    return {
        totalCollected,
        target,
        remaining,
        excess,
        totalResidents,
        totalApartments,
        countPaid,
        countPartial,
        countUnpaid
    };
}

/**
 * Calcule le pourcentage de progression (ne dépasse jamais 100% pour la barre)
 */
function calculateProgress(collected, target) {
    if (!target || target <= 0) return { percent: 0, barWidth: 0, isExcess: false };
    const exactPercent = Math.round((collected / target) * 100);
    const barWidth = Math.min(100, Math.max(0, exactPercent));
    return {
        percent: exactPercent,
        barWidth: barWidth,
        isExcess: collected > target
    };
}

// ==============================================================================
// 3. MISE À JOUR DU TABLEAU DE BORD (Accueil)
// ==============================================================================

/**
 * Met à jour tous les éléments visuels du tableau de bord
 */
function updateDashboard() {
    const stats = calculateTotal();
    const progress = calculateProgress(stats.totalCollected, stats.target);

    // 1. Carte Objectif
    const goalAmountEl = document.getElementById('dash-goal-amount');
    const collectedAmountEl = document.getElementById('dash-collected-amount');
    const percentEl = document.getElementById('dash-progress-percent');
    const statusTextEl = document.getElementById('dash-progress-status');
    const fillEl = document.getElementById('dash-progress-fill');
    const alertEl = document.getElementById('dash-goal-alert');
    const alertTextEl = document.getElementById('dash-goal-alert-text');

    if (goalAmountEl) goalAmountEl.textContent = stats.target;
    if (collectedAmountEl) collectedAmountEl.textContent = stats.totalCollected;
    if (percentEl) percentEl.textContent = `${progress.percent}%`;

    // Texte sous la jauge : reste ou excédent
    if (statusTextEl) {
        if (progress.isExcess) {
            statusTextEl.textContent = `Excédent : +${stats.excess} DH`;
            statusTextEl.className = 'progress-status-text text-success';
        } else if (stats.remaining === 0) {
            statusTextEl.textContent = `Objectif 100% atteint ! 🎉`;
            statusTextEl.className = 'progress-status-text text-success';
        } else {
            statusTextEl.textContent = `${stats.remaining} DH restant`;
            statusTextEl.className = 'progress-status-text';
        }
    }

    // Largeur de la barre de progression (max 100%)
    if (fillEl) {
        fillEl.style.width = `${progress.barWidth}%`;
        fillEl.setAttribute('aria-valuenow', progress.barWidth);
    }

    // Alerte en cas de dépassement ou d'objectif atteint
    if (alertEl && alertTextEl) {
        if (progress.isExcess) {
            alertEl.classList.remove('hidden');
            alertTextEl.innerHTML = `🌟 <strong>Félicitations !</strong> Objectif dépassé : <strong>${stats.totalCollected} DH</strong> collectés sur <strong>${stats.target} DH</strong> (+${stats.excess} DH).`;
        } else if (stats.totalCollected === stats.target && stats.target > 0) {
            alertEl.classList.remove('hidden');
            alertTextEl.innerHTML = `✅ <strong>Objectif atteint !</strong> La totalité des <strong>${stats.target} DH</strong> pour le Wi-Fi a été collectée.`;
        } else {
            alertEl.classList.add('hidden');
        }
    }

    // 2. Statistiques globales
    const totalAptsEl = document.getElementById('dash-total-apts');
    const totalResidentsEl = document.getElementById('dash-total-residents');
    const statCollectedEl = document.getElementById('dash-stat-collected');
    const statRemainingEl = document.getElementById('dash-stat-remaining');

    if (totalAptsEl) totalAptsEl.textContent = stats.totalApartments;
    if (totalResidentsEl) totalResidentsEl.textContent = stats.totalResidents;
    if (statCollectedEl) statCollectedEl.textContent = stats.totalCollected;
    if (statRemainingEl) statRemainingEl.textContent = stats.remaining;

    // 3. Répartition des statuts
    const countPaidEl = document.getElementById('dash-count-paid');
    const countPartialEl = document.getElementById('dash-count-partial');
    const countUnpaidEl = document.getElementById('dash-count-unpaid');
    const statusTotalRatio = document.getElementById('dash-status-total-ratio');

    if (countPaidEl) countPaidEl.textContent = stats.countPaid;
    if (countPartialEl) countPartialEl.textContent = stats.countPartial;
    if (countUnpaidEl) countUnpaidEl.textContent = stats.countUnpaid;
    if (statusTotalRatio) statusTotalRatio.textContent = `${stats.totalApartments} appartements au total`;

    // 4. Badge du mois
    const monthLabelEl = document.getElementById('current-month-label');
    if (monthLabelEl && appData.settings) {
        monthLabelEl.textContent = appData.settings.currentMonth || "Octobre 2026";
    }

    // 5. Tarif de cotisation par personne
    const rate = (appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    const rateAmountEl = document.getElementById('dash-rate-amount');
    const settingRateInput = document.getElementById('setting-rate-input');
    const rateModalInput = document.getElementById('rate-modal-input');
    if (rateAmountEl) rateAmountEl.textContent = rate;
    if (settingRateInput) settingRateInput.value = rate;
    if (rateModalInput && !document.getElementById('modal-rate-backdrop').classList.contains('active')) {
        rateModalInput.value = rate;
    }

    // 6. Rendu des cartes d'étages
    renderFloors();
}

/**
 * Rendu dynamique des 4 grandes cartes d'étages sur l'accueil
 */
function renderFloors() {
    const container = document.getElementById('floors-container');
    if (!container || !appData || !appData.floors) return;

    container.innerHTML = '';

    appData.floors.forEach(floor => {
        const aptsCount = floor.apartments ? floor.apartments.length : 0;
        let floorCollected = 0;
        let floorPaidCount = 0;

        if (floor.apartments) {
            floor.apartments.forEach(a => {
                floorCollected += (parseFloat(a.paidAmount) || 0);
                if (computeStatus(a.paidAmount, a.requiredAmount) === 'paid') {
                    floorPaidCount++;
                }
            });
        }

        const card = document.createElement('div');
        card.className = 'floor-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.onclick = () => openFloor(floor.id);
        card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') openFloor(floor.id); };

        card.innerHTML = `
            <div class="floor-card-top">
                <div class="floor-card-icon">🏠</div>
                <span class="floor-card-badge">${floorPaidCount}/${aptsCount} payé${floorPaidCount > 1 ? 's' : ''}</span>
            </div>
            <div>
                <h4 class="floor-card-name">${escapeHTML(floor.name)}</h4>
                <p class="floor-card-count">${aptsCount} appartement${aptsCount > 1 ? 's' : ''}</p>
            </div>
            <div class="floor-card-footer">
                <span class="floor-card-amount">💰 ${floorCollected} DH</span>
                <span class="floor-card-action">Voir →</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==============================================================================
// 4. RENDU DES APPARTEMENTS (Vue Étage)
// ==============================================================================

/**
 * Affiche la vue d'un étage spécifique et rend ses appartements
 */
function openFloor(floorId) {
    currentFloorId = floorId;
    const floor = appData.floors.find(f => f.id === floorId);
    if (!floor) return;

    // Titre et stats de l'en-tête d'étage
    const titleEl = document.getElementById('current-floor-title');
    const statsEl = document.getElementById('current-floor-stats');
    if (titleEl) titleEl.textContent = floor.name;

    const aptCount = floor.apartments ? floor.apartments.length : 0;
    if (statsEl) statsEl.textContent = `${aptCount} appartement${aptCount > 1 ? 's' : ''}`;

    // Rendu de la bannière de résumé de l'étage
    const bannerEl = document.getElementById('current-floor-banner');
    if (bannerEl) {
        let floorCollected = 0;
        let floorRequired = 0;
        let floorResidents = 0;

        if (floor.apartments) {
            floor.apartments.forEach(a => {
                floorCollected += (parseFloat(a.paidAmount) || 0);
                floorRequired += (parseFloat(a.requiredAmount) || 0);
                floorResidents += (parseInt(a.residents, 10) || 0);
            });
        }

        bannerEl.innerHTML = `
            <div class="floor-stat-item">
                <span class="floor-stat-num">${aptCount}</span>
                <span class="floor-stat-lbl">Appartements</span>
            </div>
            <div class="floor-stat-item">
                <span class="floor-stat-num">${floorResidents}</span>
                <span class="floor-stat-lbl">Personnes</span>
            </div>
            <div class="floor-stat-item">
                <span class="floor-stat-num text-success">${floorCollected} DH</span>
                <span class="floor-stat-lbl">Collecté</span>
            </div>
            <div class="floor-stat-item">
                <span class="floor-stat-num text-danger">${Math.max(0, floorRequired - floorCollected)} DH</span>
                <span class="floor-stat-lbl">Reste</span>
            </div>
        `;
    }

    // Mise à jour des boutons de navigation entre étages
    const prevBtn = document.getElementById('btn-floor-prev');
    const nextBtn = document.getElementById('btn-floor-next');
    if (appData && appData.floors && appData.floors.length > 0) {
        const idx = appData.floors.findIndex(f => f.id === floorId);
        if (idx >= 0) {
            const prevIdx = (idx - 1 + appData.floors.length) % appData.floors.length;
            const nextIdx = (idx + 1) % appData.floors.length;
            if (prevBtn) prevBtn.setAttribute('title', `← ${appData.floors[prevIdx].name}`);
            if (nextBtn) nextBtn.setAttribute('title', `${appData.floors[nextIdx].name} →`);
        }
    }

    renderApartments(floorId);
    showView('floor');
}

/**
 * Navigation vers l'étage précédent (ex: TAG 2 -> TAG 1)
 */
function goToPrevFloor() {
    if (!appData || !appData.floors || appData.floors.length === 0) return;
    const currentIndex = appData.floors.findIndex(f => f.id === currentFloorId);
    const validIndex = currentIndex >= 0 ? currentIndex : 0;
    const prevIndex = (validIndex - 1 + appData.floors.length) % appData.floors.length;
    openFloor(appData.floors[prevIndex].id);
}

/**
 * Navigation vers l'étage suivant (ex: TAG 2 -> TAG 3)
 */
function goToNextFloor() {
    if (!appData || !appData.floors || appData.floors.length === 0) return;
    const currentIndex = appData.floors.findIndex(f => f.id === currentFloorId);
    const validIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (validIndex + 1) % appData.floors.length;
    openFloor(appData.floors[nextIndex].id);
}

/**
 * Génère les cartes d'appartements pour un étage donné (style maisonnette 🏠)
 */
function renderApartments(floorId) {
    const container = document.getElementById('apartments-container');
    if (!container) return;

    const floor = appData.floors.find(f => f.id === floorId);
    if (!floor || !floor.apartments) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:30px;">Aucun appartement dans cette section.</p>';
        return;
    }

    container.innerHTML = '';

    floor.apartments.forEach(apt => {
        const paid = parseFloat(apt.paidAmount) || 0;
        const required = parseFloat(apt.requiredAmount) || 0;
        const status = computeStatus(paid, required);
        const remaining = Math.max(0, required - paid);

        // Configuration du badge selon le statut
        let badgeHtml = '';
        let borderClass = '';
        let amountDisplayHtml = '';

        if (status === 'paid') {
            badgeHtml = `<span class="badge-status badge-paid">🟢 Payé</span>`;
            borderClass = 'status-border-paid';
            amountDisplayHtml = `
                <div class="amount-main text-success">${paid} DH</div>
                <span class="amount-remaining-pill pill-paid">Réglé</span>
            `;
        } else if (status === 'partial') {
            badgeHtml = `<span class="badge-status badge-partial">🟠 Partiel</span>`;
            borderClass = 'status-border-partial';
            amountDisplayHtml = `
                <div>
                    <span class="amount-main text-warning">${paid}</span>
                    <span class="amount-requested-sub">/ ${required} DH</span>
                </div>
                <span class="amount-remaining-pill pill-remaining">Reste ${remaining} DH</span>
            `;
        } else {
            badgeHtml = `<span class="badge-status badge-unpaid">🔴 Non payé</span>`;
            borderClass = 'status-border-unpaid';
            amountDisplayHtml = `
                <div>
                    <span class="amount-main text-danger">0</span>
                    <span class="amount-requested-sub">/ ${required} DH</span>
                </div>
                <span class="amount-remaining-pill pill-remaining">Reste ${required} DH</span>
            `;
        }

        const card = document.createElement('div');
        card.className = `apartment-card ${borderClass}`;
        card.onclick = (e) => {
            // Si on clique sur un bouton intérieur spécifique, ne pas ouvrir 2 fois
            if (e.target.closest('.btn-card-pay')) {
                e.stopPropagation();
                openPaymentModal(apt.id);
            } else {
                openApartmentDetails(apt.id);
            }
        };

        card.innerHTML = `
            <div class="apartment-card-roof"></div>
            <div class="apartment-card-body">
                <div class="apartment-header-row">
                    <span class="apartment-house-icon">🏠</span>
                    ${badgeHtml}
                </div>

                <div>
                    <h3 class="apartment-name">${escapeHTML(apt.name)}</h3>
                    <span class="apartment-residents">👥 ${apt.residents || 0} personne${(apt.residents > 1) ? 's' : ''}</span>
                </div>

                <div class="apartment-amount-box">
                    ${amountDisplayHtml}
                </div>

                <div class="apartment-card-actions">
                    <button class="btn-card-action btn-card-pay" type="button" onclick="event.stopPropagation(); openPaymentModal('${apt.id}')">
                        <span>💰 Payer</span>
                    </button>
                    <button class="btn-card-action btn-card-details" type="button" onclick="event.stopPropagation(); openApartmentDetails('${apt.id}')">
                        <span>Détails</span>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==============================================================================
// 5. MODALES & DÉTAILS D'UN APPARTEMENT
// ==============================================================================

/**
 * Recherche un appartement par ID à travers tous les étages
 */
function findApartmentById(aptId) {
    if (!appData || !appData.floors) return null;
    for (const floor of appData.floors) {
        if (floor.apartments) {
            const found = floor.apartments.find(a => a.id === aptId);
            if (found) {
                return { apartment: found, floor: floor };
            }
        }
    }
    return null;
}

/**
 * Ouvre la boîte détaillée d'un appartement
 */
function openApartmentDetails(aptId) {
    const data = findApartmentById(aptId);
    if (!data) return;

    currentApartmentId = aptId;
    currentFloorId = data.floor.id;
    const apt = data.apartment;
    const paid = parseFloat(apt.paidAmount) || 0;
    const required = parseFloat(apt.requiredAmount) || 0;
    const remaining = Math.max(0, required - paid);
    const status = computeStatus(paid, required);

    // Mettre à jour les champs de la modale
    document.getElementById('modal-details-floor').textContent = data.floor.name;
    document.getElementById('modal-details-title').textContent = apt.name;
    document.getElementById('modal-details-residents').textContent = apt.residents || 0;
    document.getElementById('modal-details-required').textContent = required;
    document.getElementById('modal-details-paid').textContent = paid;
    document.getElementById('modal-details-remaining').textContent = remaining;
    document.getElementById('modal-details-date').textContent = apt.paymentDate || 'Aucun paiement';
    
    const notesEl = document.getElementById('modal-details-notes');
    if (notesEl) {
        notesEl.textContent = apt.notes && apt.notes.trim() ? apt.notes : 'Aucune remarque';
    }

    const badgeEl = document.getElementById('modal-details-status-badge');
    if (badgeEl) {
        if (status === 'paid') {
            badgeEl.textContent = '🟢 Payé';
            badgeEl.className = 'roof-badge'
        } else if (status === 'partial') {
            badgeEl.textContent = '🟠 Paiement partiel';
            badgeEl.className = 'roof-badge'
        } else {
            badgeEl.textContent = '🔴 Non payé';
            badgeEl.className = 'roof-badge'
        }
    }

    document.getElementById('modal-details-backdrop').classList.add('active');
}

function closeDetailsModal(event) {
    if (!event || event.target.id === 'modal-details-backdrop' || event.target.classList.contains('modal-close')) {
        document.getElementById('modal-details-backdrop').classList.remove('active');
    }
}

// Actions depuis la modale de détails
function openPaymentFromDetails() {
    const aptId = currentApartmentId;
    document.getElementById('modal-details-backdrop').classList.remove('active');
    setTimeout(() => openPaymentModal(aptId), 150);
}

function openEditFromDetails() {
    const aptId = currentApartmentId;
    document.getElementById('modal-details-backdrop').classList.remove('active');
    setTimeout(() => openEditModal(aptId), 150);
}

function deleteApartmentFromDetails() {
    const aptId = currentApartmentId;
    document.getElementById('modal-details-backdrop').classList.remove('active');
    setTimeout(() => deleteApartment(aptId), 150);
}

// ==============================================================================
// 6. SYSTÈME DE PAIEMENT
// ==============================================================================

/**
 * Ouvre la modale pour enregistrer un paiement
 */
function openPaymentModal(aptId) {
    const data = findApartmentById(aptId);
    if (!data) return;

    currentApartmentId = aptId;
    const apt = data.apartment;
    const paid = parseFloat(apt.paidAmount) || 0;
    const required = parseFloat(apt.requiredAmount) || 0;
    const remaining = Math.max(0, required - paid);

    document.getElementById('payment-modal-floor-apt').textContent = `${data.floor.name} — ${apt.name}`;
    document.getElementById('payment-box-required').textContent = `${required} DH`;
    document.getElementById('payment-box-current-paid').textContent = `${paid} DH`;
    document.getElementById('payment-box-current-remaining').textContent = `${remaining} DH`;

    const amountInput = document.getElementById('payment-input-amount');
    amountInput.value = remaining > 0 ? remaining : (paid || 50);

    // Date par défaut : date actuelle au format YYYY-MM-DD pour l'input type="date"
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('payment-input-date');
    dateInput.value = `${yyyy}-${mm}-${dd}`;

    const notesInput = document.getElementById('payment-input-notes');
    notesInput.value = apt.notes || '';

    document.getElementById('modal-payment-backdrop').classList.add('active');
}

function closePaymentModal(event) {
    if (!event || event.target.id === 'modal-payment-backdrop' || event.target.classList.contains('modal-close') || event.type === 'button') {
        document.getElementById('modal-payment-backdrop').classList.remove('active');
    }
}

/**
 * Boutons de remplissage rapide dans la modale de paiement
 */
function setQuickPaymentAmount(val) {
    const input = document.getElementById('payment-input-amount');
    if (!input) return;

    if (val === 'full') {
        const data = findApartmentById(currentApartmentId);
        if (data) {
            input.value = data.apartment.requiredAmount || 50;
        }
    } else {
        input.value = val;
    }
}

/**
 * Traitement de la soumission du formulaire de paiement
 */
function handlePaymentSubmit(event) {
    event.preventDefault();
    const amountVal = parseFloat(document.getElementById('payment-input-amount').value) || 0;
    const rawDate = document.getElementById('payment-input-date').value;
    const notesVal = document.getElementById('payment-input-notes').value.trim();

    // Formater la date en JJ/MM/AAAA
    let formattedDate = '';
    if (rawDate) {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    } else {
        const now = new Date();
        formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    }

    addPayment(currentApartmentId, amountVal, formattedDate, notesVal);
    closePaymentModal();
}

/**
 * Enregistre un paiement pour un appartement
 */
function addPayment(apartmentId, amount, date, notes) {
    const data = findApartmentById(apartmentId);
    if (!data) return;

    const apt = data.apartment;
    apt.paidAmount = parseFloat(amount) || 0;
    apt.paymentDate = (apt.paidAmount > 0) ? (date || new Date().toLocaleDateString('fr-FR')) : '';
    apt.status = computeStatus(apt.paidAmount, apt.requiredAmount);
    if (notes !== undefined) apt.notes = notes;

    saveData();
    updateDashboard();

    if (currentFloorId) {
        renderApartments(currentFloorId);
    }
    renderGlobalList();

    showToast(`Paiement de ${apt.paidAmount} DH enregistré pour ${apt.name} !`);
}

// ==============================================================================
// 7. MODIFICATION D'UN APPARTEMENT & FORMATAGE INTELLIGENT
// ==============================================================================

/**
 * Formate automatiquement le nom pour garantir qu'il commence par "Appartement "
 * Ex: "1" -> "Appartement 1", "Appartement 1" -> "Appartement 1", "A" -> "Appartement A"
 */
function formatApartmentName(val) {
    if (!val) return '';
    let trimmed = val.trim();
    if (!trimmed) return '';

    // Si l'utilisateur a déjà écrit "Appartement" ou "appartement"
    if (/^appartement\b/i.test(trimmed)) {
        return trimmed.replace(/^appartement\s*/i, 'Appartement ');
    }

    // Si l'utilisateur a écrit "Apt" ou "apt."
    if (/^apt\.?\b/i.test(trimmed)) {
        return trimmed.replace(/^apt\.?\s*/i, 'Appartement ');
    }

    // Sinon, préfixer automatiquement avec "Appartement "
    return `Appartement ${trimmed}`;
}

function onNameInput(input, hintId) {
    const hint = document.getElementById(hintId);
    if (!hint) return;
    const val = input.value.trim();
    if (val) {
        hint.textContent = `🏷️ Enregistré comme : ${formatApartmentName(val)}`;
    } else {
        hint.textContent = `💡 Écrivez juste le numéro (ex: 1), "Appartement" sera ajouté automatiquement.`;
    }
}

function onNameBlur(input, hintId) {
    if (!input || !input.value.trim()) return;
    input.value = formatApartmentName(input.value);
    const hint = document.getElementById(hintId);
    if (hint) {
        hint.textContent = `🏷️ Enregistré comme : ${input.value}`;
    }
}

function onEditResidentsInput() {
    const resInput = document.getElementById('edit-input-residents');
    const reqInput = document.getElementById('edit-input-required');
    const hintEl = document.getElementById('edit-calc-hint');
    if (!resInput || !reqInput) return;

    const residents = parseInt(resInput.value, 10) || 0;
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    const autoAmount = residents * rate;

    reqInput.value = autoAmount;
    if (hintEl) {
        hintEl.textContent = `💡 Calcul automatique : ${residents} personne${residents > 1 ? 's' : ''} × ${rate} DH = ${autoAmount} DH`;
    }
}

function onAddResidentsInput() {
    const resInput = document.getElementById('add-input-residents');
    const reqInput = document.getElementById('add-input-required');
    const hintEl = document.getElementById('add-calc-hint');
    if (!resInput || !reqInput) return;

    const residents = parseInt(resInput.value, 10) || 0;
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    const autoAmount = residents * rate;

    reqInput.value = autoAmount;
    if (hintEl) {
        hintEl.textContent = `💡 Calcul automatique : ${residents} personne${residents > 1 ? 's' : ''} × ${rate} DH = ${autoAmount} DH`;
    }
}

function openEditModal(aptId) {
    const data = findApartmentById(aptId);
    if (!data) return;

    currentApartmentId = aptId;
    const apt = data.apartment;
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    const res = apt.residents || 0;

    document.getElementById('edit-modal-floor-label').textContent = data.floor.name;
    document.getElementById('edit-input-name').value = apt.name;
    document.getElementById('edit-input-residents').value = res;
    document.getElementById('edit-input-required').value = apt.requiredAmount !== undefined ? apt.requiredAmount : (res * rate);
    document.getElementById('edit-input-paid').value = apt.paidAmount || 0;

    const nameHint = document.getElementById('edit-name-hint');
    if (nameHint) {
        nameHint.textContent = `🏷️ Enregistré comme : ${apt.name}`;
    }

    const hintEl = document.getElementById('edit-calc-hint');
    if (hintEl) {
        hintEl.textContent = `💡 Calcul automatique : ${res} personne${res > 1 ? 's' : ''} × ${rate} DH = ${res * rate} DH`;
    }

    document.getElementById('modal-edit-backdrop').classList.add('active');
}

function closeEditModal(event) {
    if (!event || event.target.id === 'modal-edit-backdrop' || event.target.classList.contains('modal-close')) {
        document.getElementById('modal-edit-backdrop').classList.remove('active');
    }
}

function handleEditSubmit(event) {
    event.preventDefault();
    const rawName = document.getElementById('edit-input-name').value.trim();
    const newName = formatApartmentName(rawName) || 'Appartement';
    const residents = parseInt(document.getElementById('edit-input-residents').value, 10) || 0;
    const requiredAmount = parseFloat(document.getElementById('edit-input-required').value) || 0;
    const paidAmount = parseFloat(document.getElementById('edit-input-paid').value) || 0;

    editApartment(currentApartmentId, newName, residents, requiredAmount, paidAmount);
    closeEditModal();
}

/**
 * Met à jour les informations d'un appartement
 */
function editApartment(apartmentId, newName, residents, requiredAmount, paidAmount) {
    const data = findApartmentById(apartmentId);
    if (!data) return;

    const apt = data.apartment;
    apt.name = newName || apt.name;
    apt.residents = Math.max(0, residents);
    apt.requiredAmount = Math.max(0, requiredAmount);
    if (paidAmount !== undefined) {
        apt.paidAmount = Math.max(0, paidAmount);
    }
    apt.status = computeStatus(apt.paidAmount, apt.requiredAmount);

    saveData();
    updateDashboard();

    if (currentFloorId) {
        renderApartments(currentFloorId);
    }
    renderGlobalList();

    showToast(`${apt.name} modifié avec succès !`);
}

// ==============================================================================
// 8. SUPPRESSION & AJOUT D'UN APPARTEMENT
// ==============================================================================

/**
 * Supprime un appartement
 */
function deleteApartment(apartmentId) {
    const data = findApartmentById(apartmentId);
    if (!data) return;

    const confirmMsg = `Êtes-vous sûr de vouloir supprimer ${data.apartment.name} (${data.floor.name}) ?`;
    if (!confirm(confirmMsg)) return;

    data.floor.apartments = data.floor.apartments.filter(a => a.id !== apartmentId);

    saveData();
    updateDashboard();

    if (currentFloorId) {
        renderApartments(currentFloorId);
        // Mettre à jour le sous-titre de l'étage
        const statsEl = document.getElementById('current-floor-stats');
        if (statsEl) statsEl.textContent = `${data.floor.apartments.length} appartements`;
    }
    renderGlobalList();

    showToast(`${data.apartment.name} supprimé.`);
}

/**
 * Modale d'ajout d'appartement
 */
function openAddApartmentModal() {
    const select = document.getElementById('add-select-floor');
    if (select && currentFloorId) {
        select.value = currentFloorId;
    }
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;

    document.getElementById('add-input-name').value = '';
    document.getElementById('add-input-residents').value = '0';
    document.getElementById('add-input-required').value = '0';

    const nameHint = document.getElementById('add-name-hint');
    if (nameHint) {
        nameHint.textContent = `💡 Écrivez juste le numéro (ex: 5), "Appartement" sera ajouté automatiquement.`;
    }

    const hintEl = document.getElementById('add-calc-hint');
    if (hintEl) {
        hintEl.textContent = `💡 Calcul automatique : 0 personne × ${rate} DH = 0 DH`;
    }

    document.getElementById('modal-add-backdrop').classList.add('active');
}

function closeAddModal(event) {
    if (!event || event.target.id === 'modal-add-backdrop' || event.target.classList.contains('modal-close')) {
        document.getElementById('modal-add-backdrop').classList.remove('active');
    }
}

function handleAddSubmit(event) {
    event.preventDefault();
    const floorId = document.getElementById('add-select-floor').value;
    const rawName = document.getElementById('add-input-name').value.trim();
    const floor = appData.floors.find(f => f.id === floorId);
    if (!floor) return;

    const fallbackIndex = floor.apartments ? floor.apartments.length + 1 : 1;
    const name = rawName ? formatApartmentName(rawName) : `Appartement ${fallbackIndex}`;
    const residents = parseInt(document.getElementById('add-input-residents').value, 10) || 0;
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    const reqVal = parseFloat(document.getElementById('add-input-required').value);
    const required = (!isNaN(reqVal) && reqVal >= 0) ? reqVal : (residents * rate);

    const newId = `${floorId}-apt-${Date.now()}`;
    const newApt = {
        id: newId,
        name: name,
        residents: residents,
        requiredAmount: required,
        paidAmount: 0,
        status: "unpaid",
        paymentDate: "",
        notes: ""
    };

    if (!floor.apartments) floor.apartments = [];
    floor.apartments.push(newApt);

    saveData();
    updateDashboard();

    if (currentFloorId === floorId) {
        renderApartments(currentFloorId);
    }
    renderGlobalList();

    closeAddModal();
    showToast(`${newApt.name} ajouté avec succès !`);
}

// ==============================================================================
// 9. VUE STATISTIQUES & LISTE GLOBALE
// ==============================================================================

let currentStatsFilter = 'all';

function applyStatsFilter(filter, buttonEl) {
    currentStatsFilter = filter;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');
    renderGlobalList();
}

function filterAndShowStats(filter) {
    currentStatsFilter = filter;
    document.querySelectorAll('.filter-pill').forEach(p => {
        if (p.getAttribute('data-filter') === filter) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
    showView('stats');
    renderGlobalList();
}

function renderGlobalList() {
    const container = document.getElementById('global-apartments-list');
    if (!container || !appData || !appData.floors) return;

    container.innerHTML = '';

    let allApts = [];
    let countAll = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;

    appData.floors.forEach(floor => {
        if (floor.apartments) {
            floor.apartments.forEach(apt => {
                countAll++;
                const status = computeStatus(apt.paidAmount, apt.requiredAmount);
                if (status === 'paid') countPaid++;
                else if (status === 'partial') countPartial++;
                else countUnpaid++;

                allApts.push({
                    apartment: apt,
                    floor: floor,
                    status: status
                });
            });
        }
    });

    // Mettre à jour les compteurs des badges de filtre
    const elAll = document.getElementById('stats-filter-all');
    const elPaid = document.getElementById('stats-filter-paid');
    const elPart = document.getElementById('stats-filter-partial');
    const elUnpaid = document.getElementById('stats-filter-unpaid');
    if (elAll) elAll.textContent = countAll;
    if (elPaid) elPaid.textContent = countPaid;
    if (elPart) elPart.textContent = countPartial;
    if (elUnpaid) elUnpaid.textContent = countUnpaid;

    // Filtrer la liste
    const filtered = allApts.filter(item => {
        if (currentStatsFilter === 'all') return true;
        return item.status === currentStatsFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-muted" style="text-align:center; padding:30px;">Aucun appartement dans cette catégorie.</p>`;
        return;
    }

    filtered.forEach(item => {
        const apt = item.apartment;
        const floor = item.floor;
        const paid = parseFloat(apt.paidAmount) || 0;
        const required = parseFloat(apt.requiredAmount) || 0;
        const remaining = Math.max(0, required - paid);

        let statusBadge = '';
        let amountHtml = '';

        if (item.status === 'paid') {
            statusBadge = `<span class="badge-status badge-paid">🟢 Payé</span>`;
            amountHtml = `<span class="global-row-amount text-success">${paid} DH</span>`;
        } else if (item.status === 'partial') {
            statusBadge = `<span class="badge-status badge-partial">🟠 Partiel</span>`;
            amountHtml = `<span class="global-row-amount text-warning">${paid} / ${required} DH</span><small class="text-danger">Reste ${remaining} DH</small>`;
        } else {
            statusBadge = `<span class="badge-status badge-unpaid">🔴 Non payé</span>`;
            amountHtml = `<span class="global-row-amount text-danger">0 / ${required} DH</span><small class="text-danger">Reste ${required} DH</small>`;
        }

        const row = document.createElement('div');
        row.className = 'global-row-card';
        row.onclick = () => openApartmentDetails(apt.id);

        row.innerHTML = `
            <div class="global-row-left">
                <span class="global-row-badge-floor">${escapeHTML(floor.name)}</span>
                <div>
                    <h4 class="global-row-title">${escapeHTML(apt.name)}</h4>
                    <span class="global-row-meta">👥 ${apt.residents || 0} personne${apt.residents > 1 ? 's' : ''} ${apt.paymentDate ? '• Payé le ' + apt.paymentDate : ''}</span>
                </div>
            </div>
            <div class="global-row-right">
                ${statusBadge}
                ${amountHtml}
            </div>
        `;

        container.appendChild(row);
    });
}

/**
 * Génère et copie dans le presse-papier un message de rappel WhatsApp pour les non-payés
 */
function generateReminderMessage() {
    const unpaidList = [];
    appData.floors.forEach(floor => {
        if (floor.apartments) {
            floor.apartments.forEach(apt => {
                const status = computeStatus(apt.paidAmount, apt.requiredAmount);
                if (status === 'unpaid' || status === 'partial') {
                    const remaining = Math.max(0, (apt.requiredAmount || 50) - (apt.paidAmount || 0));
                    unpaidList.push(`• ${floor.name} - ${apt.name} : reste ${remaining} DH`);
                }
            });
        }
    });

    const month = (appData.settings && appData.settings.currentMonth) ? appData.settings.currentMonth : "ce mois";
    const message = `Bonjour chers voisins,\n\nCeci est un rappel bienveillant pour la cotisation Wi-Fi de l'immeuble pour ${month}.\n\nAppartements concernés :\n${unpaidList.join('\n')}\n\nMerci de régler votre part dès que possible afin d'éviter toute coupure.\nBonne journée à tous ! 📶`;

    navigator.clipboard.writeText(message).then(() => {
        showToast("Message de rappel copié dans le presse-papier !");
    }).catch(() => {
        prompt("Copiez ce message pour WhatsApp :", message);
    });
}

// ==============================================================================
// 10. GESTION DES VUES & NAVIGATION
// ==============================================================================

/**
 * Affiche une vue spécifique (dashboard, floor, stats, settings)
 */
function showView(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Gestion de l'onglet actif
    if (viewId === 'dashboard') {
        document.getElementById('tab-dashboard').classList.add('active');
    } else if (viewId === 'floor' || viewId === 'floors-menu') {
        document.getElementById('tab-floors').classList.add('active');
    } else if (viewId === 'stats') {
        document.getElementById('tab-stats').classList.add('active');
        renderGlobalList();
    } else if (viewId === 'settings') {
        document.getElementById('tab-settings').classList.add('active');
    }

    // Historique
    if (navigationHistory[navigationHistory.length - 1] !== viewId) {
        navigationHistory.push(viewId);
    }
}

/**
 * Fonction de retour universel (← Retour)
 */
function navigateBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); // Retire la vue courante
        const prev = navigationHistory[navigationHistory.length - 1] || 'dashboard';
        showView(prev);
    } else {
        showView('dashboard');
    }
}

// ==============================================================================
// 11. OPTIONS, PARAMÈTRES & IMPORT/EXPORT
// ==============================================================================

function saveTargetSetting() {
    const input = document.getElementById('setting-target-input');
    const val = parseFloat(input.value);
    if (val && val > 0) {
        if (!appData.settings) appData.settings = {};
        appData.settings.targetAmount = val;
        saveData();
        updateDashboard();
        showToast(`Objectif mensuel fixé à ${val} DH`);
    }
}

function saveMonthSetting() {
    const input = document.getElementById('setting-month-input');
    const val = input.value.trim();
    if (val) {
        if (!appData.settings) appData.settings = {};
        appData.settings.currentMonth = val;
        saveData();
        updateDashboard();
        showToast(`Mois de facturation mis à jour : ${val}`);
    }
}

function openPricePerPersonModal() {
    const rateInput = document.getElementById('rate-modal-input');
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    if (rateInput) rateInput.value = rate;
    document.getElementById('modal-rate-backdrop').classList.add('active');
}

function closeRateModal(event) {
    if (!event || event.target.id === 'modal-rate-backdrop' || event.target.classList.contains('modal-close') || event.type === 'button') {
        document.getElementById('modal-rate-backdrop').classList.remove('active');
    }
}

function handleRateSubmit(event) {
    event.preventDefault();
    const val = parseFloat(document.getElementById('rate-modal-input').value);
    const applyAll = document.getElementById('rate-modal-apply-all').checked;

    if (!isNaN(val) && val >= 0) {
        if (!appData.settings) appData.settings = {};
        appData.settings.pricePerPerson = val;

        if (applyAll) {
            applyPricePerPersonToAllInternal(val);
        } else {
            saveData();
            updateDashboard();
            showToast(`Tarif fixé à ${val} DH / personne.`);
        }
    }
    closeRateModal();
}

function savePricePerPersonSetting() {
    const input = document.getElementById('setting-rate-input');
    const val = parseFloat(input.value);
    if (!isNaN(val) && val >= 0) {
        if (!appData.settings) appData.settings = {};
        appData.settings.pricePerPerson = val;
        saveData();
        updateDashboard();
        showToast(`Tarif fixé à ${val} DH / personne.`);
    }
}

function applyPricePerPersonToAllInternal(rate) {
    let updatedCount = 0;
    if (appData && appData.floors) {
        appData.floors.forEach(floor => {
            if (floor.apartments) {
                floor.apartments.forEach(apt => {
                    const residents = parseInt(apt.residents, 10) || 0;
                    apt.requiredAmount = residents * rate;
                    apt.status = computeStatus(apt.paidAmount, apt.requiredAmount);
                    updatedCount++;
                });
            }
        });
    }
    saveData();
    updateDashboard();
    if (currentFloorId) renderApartments(currentFloorId);
    renderGlobalList();
    showToast(`Tous les appartements (${updatedCount}) ont été recalculés selon ${rate} DH/pers. !`);
}

function applyPricePerPersonToAll() {
    const rate = (appData && appData.settings && appData.settings.pricePerPerson) ? appData.settings.pricePerPerson : 20;
    if (confirm(`Voulez-vous recalculer automatiquement le montant demandé de tous les appartements selon le tarif de ${rate} DH par personne ?\n(Ex: 3 personnes = ${3 * rate} DH)`)) {
        applyPricePerPersonToAllInternal(rate);
    }
}

function resetMonthlyPayments() {
    if (!confirm("Voulez-vous réinitialiser tous les paiements à 0 pour entamer un nouveau mois ?\n(Les appartements et les résidents seront conservés).")) {
        return;
    }

    appData.floors.forEach(floor => {
        if (floor.apartments) {
            floor.apartments.forEach(apt => {
                apt.paidAmount = 0;
                apt.status = "unpaid";
                apt.paymentDate = "";
                apt.notes = "";
            });
        }
    });

    saveData();
    updateDashboard();
    renderGlobalList();
    showToast("Paiements réinitialisés pour le nouveau mois !");
}

function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `wifi_building_backup_${Date.now()}.json`);
    dlAnchor.click();
    showToast("Sauvegarde JSON téléchargée !");
}

function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.floors) {
                appData = imported;
                saveData();
                updateDashboard();
                renderGlobalList();
                showToast("Données importées avec succès !");
            } else {
                alert("Fichier JSON non valide pour cette application.");
            }
        } catch (err) {
            alert("Erreur lors de la lecture du fichier : " + err.message);
        }
    };
    reader.readAsText(file);
}

function resetToInitialData() {
    if (confirm("Attention : Voulez-vous restaurer les données d'origine ? Toutes les modifications manuelles seront écrasées.")) {
        localStorage.removeItem(STORAGE_KEY);
        loadData();
        updateDashboard();
        renderGlobalList();
        showToast("Données d'origine restaurées !");
    }
}

// ==============================================================================
// 12. UTILITAIRES & NOTIFICATIONS TOAST
// ==============================================================================

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

let toastTimer = null;
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 3200);
}

// ==============================================================================
// 13. INITIALISATION DE L'APPLICATION AU DÉMARRAGE
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les données permanentes depuis localStorage
    loadData();

    // 2. Mettre à jour l'accueil
    updateDashboard();

    // 3. Préparer les inputs de la vue paramètres
    if (appData && appData.settings) {
        const targetInput = document.getElementById('setting-target-input');
        const monthInput = document.getElementById('setting-month-input');
        if (targetInput) targetInput.value = appData.settings.targetAmount || 400;
        if (monthInput) monthInput.value = appData.settings.currentMonth || "Octobre 2026";
    }

    // 4. Configuration des boutons d'onglets de navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.getAttribute('data-view');
            if (view === 'floors-menu') {
                // Si l'utilisateur clique sur Étages, on affiche soit le dernier étage ouvert, soit TAG 1
                openFloor(currentFloorId || 'tag-1');
            } else {
                showView(view);
            }
        });
    });

    console.log("📶 Application Gestion Wi-Fi chargée avec succès !");
});

// Attachement global pour accès direct depuis le DOM
window.loadData = loadData;
window.saveData = saveData;
window.calculateTotal = calculateTotal;
window.calculateProgress = calculateProgress;
window.updateDashboard = updateDashboard;
window.addPayment = addPayment;
window.editApartment = editApartment;
window.deleteApartment = deleteApartment;
window.renderApartments = renderApartments;
window.openFloor = openFloor;
window.openApartmentDetails = openApartmentDetails;
window.closeDetailsModal = closeDetailsModal;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openAddApartmentModal = openAddApartmentModal;
window.closeAddModal = closeAddModal;
window.navigateBack = navigateBack;
window.showView = showView;
window.setQuickPaymentAmount = setQuickPaymentAmount;
window.handlePaymentSubmit = handlePaymentSubmit;
window.handleEditSubmit = handleEditSubmit;
window.handleAddSubmit = handleAddSubmit;
window.applyStatsFilter = applyStatsFilter;
window.filterAndShowStats = filterAndShowStats;
window.generateReminderMessage = generateReminderMessage;
window.saveTargetSetting = saveTargetSetting;
window.saveMonthSetting = saveMonthSetting;
window.resetMonthlyPayments = resetMonthlyPayments;
window.exportDataJSON = exportDataJSON;
window.importDataJSON = importDataJSON;
window.resetToInitialData = resetToInitialData;
window.openPaymentFromDetails = openPaymentFromDetails;
window.openEditFromDetails = openEditFromDetails;
window.deleteApartmentFromDetails = deleteApartmentFromDetails;
window.onEditResidentsInput = onEditResidentsInput;
window.onAddResidentsInput = onAddResidentsInput;
window.openPricePerPersonModal = openPricePerPersonModal;
window.closeRateModal = closeRateModal;
window.handleRateSubmit = handleRateSubmit;
window.savePricePerPersonSetting = savePricePerPersonSetting;
window.applyPricePerPersonToAll = applyPricePerPersonToAll;
window.formatApartmentName = formatApartmentName;
window.onNameInput = onNameInput;
window.onNameBlur = onNameBlur;
window.goToPrevFloor = goToPrevFloor;
window.goToNextFloor = goToNextFloor;