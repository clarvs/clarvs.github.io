// admin.formula.js â requires admin.utils.js and admin.roster.js to be loaded first

// --- FORMULA SYSTEM ---

class FormulaSystem {
    constructor() {
        this.customMeta = {};
        this.currentPhase = 1;
        this._manualFormulaMode = false;
        this.metricsContainer = document.getElementById("metrics-management-container");
        this.scoreContainer = document.getElementById("talent-score-builder-container");
        this.reloadBtn = document.getElementById("formula-reload-btn");
        this.addBtn = document.getElementById("add-metric-btn");
        this.init();
    }

    init() {
        if (this.reloadBtn) this.reloadBtn.addEventListener("click", () => this.load());
        if (this.addBtn) this.addBtn.addEventListener("click", () => this.openAddModal());

        document.getElementById('add-metric-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('fm-cancel-btn')?.addEventListener('click', () => this.closeModal());

        const form = document.getElementById('add-metric-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMetric();
            });
        }

        const combSelect = document.getElementById('fm-combinator');
        if (combSelect) {
            combSelect.addEventListener('change', () => {
                this.syncFromBuilder('_ADD_');
                this._updateCombinatorExample();
            });
        }

        const keyInput = document.getElementById('fm-key');
        if (keyInput) {
            keyInput.addEventListener('input', () => {
                if (keyInput.value.trim()) this._activateStep(2);
                this.validateMetricForm();
            });
        }

        const labelInput = document.getElementById('fm-label');
        if (labelInput) {
            labelInput.addEventListener('input', () => this.validateMetricForm());
        }


        document.getElementById('fm-load-template-btn')?.addEventListener('click', () => this._loadTemplate());

        const previewPlayer = document.getElementById('fm-preview-player');
        if (previewPlayer) {
            previewPlayer.addEventListener('change', () => this.updatePreview());
        }

        if (this.metricsContainer || this.scoreContainer) this.load();
    }

    async setPhase(n) {
        this.currentPhase = n;
        await this.load(); // Forza il ricaricamento delle metriche per avere i blocchi più recenti

        const phaseSelect = document.getElementById('fm-phase');
        if (phaseSelect) phaseSelect.value = n;

        // Non resettare pesi/operatori se stiamo editando una metrica esistente
        if (!this._editingKey) {
            this._lastAddMetricWeights = {};
            this._lastAddMetricOperators = {};
            this._activeSelectionOrder = [];
        }

        // UI: Aggiorna Titoli e Visibilità Sezioni
        const sectionTitle = document.getElementById('fm-section-2-title');
        const weightSumCont = document.getElementById('fm-weight-sum-container');
        const combinatorSelect = document.getElementById('fm-combinator');

        const formulaArea = document.getElementById('fm-formula-area');
        const submitBtn = document.getElementById('fm-submit-btn');
        const identitySection = document.getElementById('fm-identity-section');
        const subTabs = document.getElementById('fm-sub-tabs');
        const subTab1 = document.getElementById('fm-sub-tab-1');
        const subTab2 = document.getElementById('fm-sub-tab-2');
        if (n === 0) {
            if (sectionTitle) sectionTitle.innerText = 'GESTIONE TALENT SCORE';
            if (weightSumCont) weightSumCont.style.display = 'none';
            if (formulaArea) formulaArea.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
            if (identitySection) identitySection.style.display = 'none';
            if (subTabs) subTabs.style.display = 'none';
            this.renderInModalScoreBuilder();
        } else {
            // phase 1 = Individuale, phase 2 = Contestuale
            const title = (n === 2) ? 'METRICA CONTESTUALE' : 'METRICA INDIVIDUALE';
            if (sectionTitle) sectionTitle.innerText = title;
            if (weightSumCont) weightSumCont.style.display = 'none';
            if (formulaArea) formulaArea.style.display = '';
            if (submitBtn) submitBtn.style.display = '';
            if (identitySection) identitySection.style.display = '';
            if (subTabs) subTabs.style.display = 'flex';
            // Aggiorna stato sub-tabs
            if (subTab1) { subTab1.style.background = (n === 1) ? 'rgba(0,188,212,0.15)' : 'transparent'; subTab1.style.color = (n === 1) ? '#00bcd4' : 'rgba(255,255,255,0.3)'; }
            if (subTab2) { subTab2.style.background = (n === 2) ? 'rgba(0,188,212,0.15)' : 'transparent'; subTab2.style.color = (n === 2) ? '#00bcd4' : 'rgba(255,255,255,0.3)'; }
        }

        this._manualFormulaMode = false;
        this._updateManualModeBadge(false);
        if (n !== 0) this.renderAddMetricBuilder(); // skip in TALENT SCORE mode
        this._updateFlowNav(n);
        if (n !== 0) this.syncFromBuilder('_ADD_'); // skip in TALENT SCORE mode
        this.validateMetricForm();
    }

    async jumpToStep(n) {
        const targetPhase = (n === 1) ? 1 : 0;
        await this.setPhase(targetPhase);
    }

    _updateFlowNav(phase) {
        const stepNum = (phase === 1 || phase === 2) ? 1 : 2;
        const steps = document.querySelectorAll('.flow-step');
        steps.forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === stepNum);
            s.style.opacity = (sNum === stepNum) ? '1' : (sNum < stepNum ? '0.6' : '0.3');
        });
    }

    async load() {
        try {
            const res = await fetch(API_BASE + "/api/talents/formula");
            if (res.ok) {
                const data = await res.json();
                this.customMeta = {};
                if (Array.isArray(data)) {
                    data.forEach(row => {
                        this.customMeta[row.key] = {
                            key: row.key,
                            expression: row.expression,
                            phase: row.phase,
                            label: row.label,
                            description: row.description,
                            isDefault: row.is_default !== false,
                            isActive: row.is_active !== false,
                            minRange: row.min_range || 0,
                            maxRange: row.max_range || 100,
                            weight: row.weight || 0,
                            normEnabled: row.normalization_enabled !== false,
                            uiConfig: row.ui_config || {}
                        };
                    });
                }
            }
        } catch (e) {
            console.error("[FormulaSystem] Load error:", e);
        } finally {
            this.updateWeightSum();
            this.render();
            this.validateMetricForm();
        }
    }

    exportMetrics() {
        const data = JSON.stringify(Object.values(this.customMeta), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clarvs-metrics-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    async importMetrics(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) throw new Error("Formato JSON non valido. Deve essere un array di metriche.");

                if (!confirm(`Trovate ${imported.length} metriche. Importare? (I duplicati verranno sovrascritti)`)) return;

                for (const m of imported) {
                    const row = {
                        key: m.key, expression: m.expression, phase: m.phase,
                        label: m.label, description: m.description,
                        is_active: m.isActive, min_range: m.minRange, max_range: m.maxRange,
                        weight: m.weight, normalization_enabled: m.normEnabled,
                        ui_config: m.uiConfig
                    };
                    await fetch(API_BASE + "/api/talents/formula", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(row)
                    });
                }
                alert("Importazione completata con successo!");
                this.load();
            } catch (err) { alert("Errore durante l'import: " + err.message); }
        };
        reader.readAsText(file);
    }

    render() {
        if (this.metricsContainer) {
            const keys = Object.keys(this.customMeta).filter(k => k !== "SCORE");
            this.metricsContainer.innerHTML = keys.length > 0
                ? keys.map(k => this.card(k)).join("")
                : `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:rgba(255,255,255,0.2);">Nessuna metrica trovata.</div>`;
        }
        if (this.scoreContainer) {
            this.renderScoreBuilder();
        }
    }

    card(key) {
        const m = this.customMeta[key];
        if (!m) return "";
        const color = m.phase === 1 ? "#f39c12" : (m.phase === 2 ? "#00bcd4" : "#a78bfa");
        const typeLabel = m.phase === 1 ? "INDIVIDUALE" : (m.phase === 2 ? "CONTESTUALE" : "FINALE");

        return `
            <div class="scouting-card metric-card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:15px; padding:1.25rem; display:flex; flex-direction:column; gap:1rem; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <span style="font-size:1.1rem; font-weight:900; color:#fff;">${key}</span>
                            <span style="font-size:0.55rem; border:1px solid ${color}; color:${color}; border-radius:4px; padding:1px 5px; font-weight:800;">${typeLabel}</span>
                        </div>
                        <div style="font-size:0.8rem; color:rgba(255,255,255,0.6);">${m.label}</div>
                    </div>
                    <label class="switch-small">
                        <input type="checkbox" ${m.isActive ? 'checked' : ''} onchange="window.formulaSystem.updateScalar('${key}', 'isActive', this.checked)">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:0.75rem; border:1px solid rgba(255,255,255,0.03); max-height:3.8rem; overflow:hidden; position:relative;">
                    ${this.formatHumanFormula(m.expression, m.uiConfig?.combinator || 'sum')}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                    <span style="font-size:0.65rem; color:rgba(255,255,255,0.2);">Peso: ${m.weight} | Range: ${m.minRange}-${m.maxRange}</span>
                    <div style="display:flex; gap:6px;">
                        <button class="run-btn" onclick="window.formulaSystem.openModal('${key}')" style="font-size:0.7rem; padding:4px 10px;">Configura</button>
                        ${!m.isDefault ? `<button onclick="window.formulaSystem.deleteMetric('${key}')" style="font-size:0.7rem; padding:4px 10px; background:rgba(231,76,60,0.15); border:1px solid rgba(231,76,60,0.3); color:#e74c3c; border-radius:6px; cursor:pointer;"><i class='fas fa-trash'></i></button>` : ''}
                    </div>
                </div>
                ${m.isActive ? `<div style="position:absolute; top:0; left:0; width:3px; height:100%; background:${color};"></div>` : ''}
            </div>
        `;
    }

    renderScoreBuilder() {
        const m = this.customMeta["SCORE"];
        if (!m) return;
        const weights = m.uiConfig?.weights || {};
        const activeMetrics = Object.keys(this.customMeta).filter(k => k !== "SCORE" && this.customMeta[k].isActive);

        this.scoreContainer.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem;">
                <div style="background:rgba(0,0,0,0.2); border-radius:15px; padding:1.5rem; border:1px solid rgba(167,139,250,0.2);">
                    <h4 style="margin-bottom:1rem; color:#a78bfa;">Pesi Talent Score</h4>
                    <div style="display:grid; gap:1rem;">
                        ${activeMetrics.length > 0 ? activeMetrics.map(k => `
                            <div style="display:flex; align-items:center; gap:1rem;">
                                <span style="flex:1; font-weight:700;">${k}</span>
                                <input type="range" min="0" max="1" step="0.05" value="${weights[k] || 0.1}" oninput="window.formulaSystem.updateScoreWeight('${k}', this.value)" style="flex:2; accent-color:#a78bfa;">
                                <span style="width:40px; font-family:monospace;">${(weights[k] || 0.1).toFixed(2)}</span>
                            </div>
                        `).join("") : '<div style="opacity:0.3; text-align:center;">Attiva almeno una metrica per costruire lo score.</div>'}
                    </div>
                </div>
                <div style="background:rgba(167,139,250,0.05); border-radius:15px; padding:1.5rem; border:1px solid rgba(167,139,250,0.3);">
                    <h4 style="margin-bottom:1rem;">Preview Formula Finale</h4>
                    <div style="font-family:monospace; font-size:1.2rem; min-height:3rem; line-height:1.6;">
                        ${this.getScoreFormulaPreview(weights)}
                    </div>
                    <button onclick="window.formulaSystem.saveFormula('SCORE')" class="run-btn" style="width:100%; margin-top:1.5rem; background:#a78bfa; color:#000; font-weight:900;">Salva Configurazione Score</button>
                </div>
            </div>
        `;
    }

    updateScoreWeight(k, v) {
        const m = this.customMeta["SCORE"];
        if (!m) return;
        m.uiConfig.weights = m.uiConfig.weights || {};
        m.uiConfig.weights[k] = parseFloat(v);
        this.syncScoreExpression();
        this.renderScoreBuilder();
    }

    syncScoreExpression() {
        const m = this.customMeta["SCORE"];
        if (!m) return;
        const weights = m.uiConfig.weights || {};
        const active = Object.keys(weights).filter(k => this.customMeta[k]?.isActive && weights[k] > 0);
        m.expression = active.length > 0 ? active.map(k => `Math.pow(${k}_n, ${weights[k]})`).join(" * ") : "0";
    }

    getScoreFormulaPreview(weights) {
        const active = Object.keys(weights).filter(k => this.customMeta[k]?.isActive && weights[k] > 0);
        if (active.length === 0) return "â";
        return active.map(k => `<span class="f-token-var">${k}</span><sup class="f-token-num">${weights[k]}</sup>`).join(' <span class="f-token-op">&times;</span> ');
    }

    formatHumanFormula(expr, combinator, phase) {
        if (!expr || expr === "0") return '<span style="color:rgba(255,255,255,0.2)">Seleziona almeno un blocco dati per iniziare...</span>';

        const rawLabels = {
            pr: "PR",
            earnings: "Guadagni", events_total: "N. Tornei Totali",
            avg_top: "Media Top Generale", avg_top_recent10: "Media Top Recent 10",
            avg_pr_recent10: "Media PR Recent 10",
            N: "Pool Size", prRank: "Rank PR", earningsRank: "Rank Guadagni", rank_delta_raw: "Rank Delta Raw"
        };
        Object.keys(this.customMeta).forEach(k => {
            rawLabels[k] = this.customMeta[k].label || k;
            rawLabels[`${k}_n`] = this.customMeta[k].label || k;
            rawLabels[`${k}_rank`] = `Rank ${this.customMeta[k].label || k}`;
        });

        const combLabels = {
            'product': 'PROD',
            'avg': 'AVG',
            'sum': 'SUM',
            'division': 'DIV',
            'delta': 'DELTA'
        };
        const combLabel = combLabels[combinator] || 'SUM';
        let html = `<span class="f-token-badge" style="background:${phase === 0 ? '#a78bfa' : '#00bcd4'}">${combLabel}</span> `;

        if (phase === 0) {
            const powerMatches = [...expr.matchAll(/Math\.pow\(([^,]+),\s*([^)]+)\)/g)];
            if (powerMatches.length > 0) {
                html += powerMatches.map(m => {
                    const varName = m[1];
                    const weight = m[2];
                    return `<span class="f-token-var">${rawLabels[varName] || varName}</span><sup class="f-token-num" style="opacity:0.7">${weight}</sup>`;
                }).join('<span class="f-token-op">&times;</span>');
                return html;
            }
        }

        // --- Clean technical boilerplate for human display ---
        let cleanExpr = expr;
        // Strip zero-guard ternary: ((check) ? 0 : (actual)) -> actual
        if (cleanExpr.includes('?') && cleanExpr.includes(':')) {
            const ternaryMatch = cleanExpr.match(/\?\s*0\s*:\s*\((.*)\)\s*\)$/);
            if (ternaryMatch) cleanExpr = ternaryMatch[1];
        }
        
        // Strip outer parens if they wrap the entire cleaned expression
        if (cleanExpr.startsWith('(') && cleanExpr.endsWith(')')) {
            const inner = cleanExpr.slice(1, -1);
            // Simple balance check: if no '(' or only balanced ones
            let depth = 0;
            let balanced = true;
            for (let i = 0; i < inner.length; i++) {
                if (inner[i] === '(') depth++;
                else if (inner[i] === ')') depth--;
                if (depth < 0) { balanced = false; break; }
            }
            if (balanced && depth === 0) cleanExpr = inner;
        }

        const tokens = cleanExpr.match(/([A-Za-z0-9_]+)|([\+\-\*\/\^])|(\d+(\.\d+)?)/g) || [];
        tokens.forEach(t => {
            if (rawLabels[t]) {
                html += `<span class="f-token-var">${rawLabels[t]}</span>`;
            } else if (!isNaN(t)) {
                html += `<span class="f-token-num">${t}</span>`;
            } else if (['+', '-', '*', '/', '^'].includes(t)) {
                const sym = { '*': '&times;', '/': '&divide;', '+': '+', '-': '-', '^': '^' }[t];
                html += `<span class="f-token-op">${sym}</span>`;
            } else if (t !== 'Math' && t !== 'pow') {
                html += `<span style="color:rgba(255,255,255,0.2)">${t}</span>`;
            }
        });
        return html;
    }

    renderBuilder(key, m) {
        const phase = m.phase;
        const weights = m.uiConfig?.weights || {};
        const operators = m.uiConfig?.operators || {};
        const rawLabels = {
            pr: "Power Ranking",
            earnings: "Guadagni", events_total: "N. Tornei Totali",
            avg_top: "Media Top Generale", avg_top_recent10: "Media Top Recent 10",
            avg_pr_recent10: "Media PR Recent 10",
            N: "Pool Size", prRank: "Rank PR", earningsRank: "Rank Guadagni",
            prPercentile: "Percentile PR", earningsPercentile: "Percentile Guadagni",
            PR_DENSITY: "PR Density", rank_delta_raw: "Rank Delta Raw"
        };

        let vars = [];
        if (phase === 1) {
            vars = ["pr", "earnings", "events_total", "avg_top", "avg_top_recent10", "avg_pr_recent10", "N", "prRank", "earningsRank", "prPercentile", "earningsPercentile", "PR_DENSITY", "rank_delta_raw"];
        } else if (phase === 2) {
            vars = ["prRank", "earningsRank", "prPercentile", "earningsPercentile", "rank_delta_raw", "N"];
            rawLabels["prPercentile"] = "PR Percentile";
            rawLabels["earningsPercentile"] = "Earnings Percentile";

            Object.keys(this.customMeta).forEach(k => {
                if (this.customMeta[k].phase === 1) {
                    const rKey = `${k}_rank`;
                    const pKey = `${k}_percentile`;
                    vars.push(rKey);
                    vars.push(pKey);
                    rawLabels[rKey] = `Rank ${k}`;
                    rawLabels[pKey] = `Percentile ${k}`;
                }
            });
        } else if (phase === 0) {
            vars = Object.keys(this.customMeta).filter(k => k !== "SCORE").map(k => `${k}_n`);
        }

        const activeVars = vars.filter(v => (weights[v] || 0) !== 0);
        let activeCount = 0;

        let html = "";

        // Grouping Percentiles in UI
        let currentGroup = '';

        vars.forEach(v => {
            const w = weights[v] || 0;
            const op = operators[v] || "*";
            const active = w !== 0;
            if (active) activeCount++;

            if (phase === 2) {
                const isPercentile = v.includes('Percentile') || v.includes('percentile');
                const isRankRelated = v.includes('Rank') || v.includes('rank') || v === 'rank_delta_raw';
                const group = isPercentile ? 'Percentile Scores (0-1)' : (v === 'N' ? 'Pool' : 'Ranks (1-N)');
                if (group !== currentGroup) {
                    html += `<div style="grid-column: 1 / -1; margin-top: 15px; margin-bottom: 5px; color: ${group.includes('Percentile') ? '#ff9800' : '#a78bfa'}; font-size: 0.8rem; font-weight: bold; padding-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">${group}</div>`;
                    currentGroup = group;
                }
            }

            // Limitazioni visuali in base al combinator
            const combinator = document.getElementById('fm-combinator')?.value || 'sum';

            let label = rawLabels[v] || (v.endsWith('_n') ? (this.customMeta[v.replace('_n', '')]?.label || v) : v);

            // Override labels for division and delta
            if (active && phase !== 0) {
                const order = this._activeSelectionOrder || [];
                const activeIndex = order.indexOf(v);
                if (combinator === 'division') {
                    label = `<span style="opacity:0.6;font-size:0.65rem;">${activeIndex === 0 ? 'Numeratore /' : 'è Denominatore'}</span><br>${label}`;
                } else if (combinator === 'delta') {
                    label = `<span style="opacity:0.6;font-size:0.65rem;">${activeIndex === 0 ? 'Minuendo (A)' : 'Sottraendo (B)'}</span><br>${label}`;
                }
            }

            // Tooltip for Percentile
            let tooltipTitle = '';
            if (v.includes('percentile') || v.includes('Percentile')) {
                tooltipTitle = ' title="Percentile 1.0 = best in pool, 0.0 = worst in pool. Already normalized, set Min=0 Max=1" ';
            } else if (v === 'rank_delta_raw') {
                tooltipTitle = ' title="Normalized delta between PR rank and PR_DENSITY rank. Positive = player outperforming their historical reputation. Range: -1 to +1. Already normalized, set Min=-1 Max=1" ';
            }

            // Reducers logic
            const uiCfg = key === '_ADD_' ? this._lastAddMetricUiConfig : (this.customMeta[key]?.uiConfig || {});
            const reducers = uiCfg?.reducers || {};

            // Disabilita selezioni extra se Delta è già pieno (max 2)
            const isDeltaFull = combinator === 'delta' && activeCount >= 2 && !active;
            const pointerEvents = isDeltaFull ? 'none' : 'auto';
            const opacity = isDeltaFull ? '0.3' : '1';

            const color = (phase === 0 || v.includes('Rank') || v.includes('rank') || v.includes('ercentile')) ? '#a78bfa' : '#00bcd4';

            html += `
                <div class="formula-block ${active ? 'active' : ''}" ${tooltipTitle}
                     style="padding:1rem; border-radius:12px; cursor:pointer; transition:all 0.3s; border:1px solid ${active ? color : 'rgba(255,255,255,0.05)'}; background:${active ? 'rgba(0,0,0,0.3)' : 'transparent'}; opacity:${opacity}; pointer-events:${pointerEvents}"
                     onclick="window.formulaSystem.toggleBlock('${key}', '${v}', event)">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:700; font-size:0.8rem; color:${active ? '#fff' : 'rgba(255,255,255,0.3)'}">${label}</span>
                        <i class="fas ${active ? 'fa-check-circle' : 'fa-circle'}" style="color:${active ? color : 'rgba(255,255,255,0.1)'}; font-size:0.9rem;"></i>
                    </div>
                    ${active ? `
                        <div style="margin-top:12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;" onclick="event.stopPropagation()">
                            ${phase !== 0 ? `
                                <select onchange="window.formulaSystem.syncFromBuilder('${key}')" class="builder-op-${key}" data-var="${v}" 
                                    style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:${color}; font-size:0.75rem; border-radius:4px; padding:2px;">
                                    <option value="*" ${op === '*' ? 'selected' : ''}>&times;</option>
                                    <option value="/" ${op === '/' ? 'selected' : ''}>&divide;</option>
                                    <option value="+" ${op === '+' ? 'selected' : ''}>+</option>
                                    <option value="-" ${op === '-' ? 'selected' : ''}>-</option>
                                </select>
                            ` : ''}
                            <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                                <span style="font-size:0.55rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase;">PESO</span>
                                <input type="number" step="0.05" value="${w}" oninput="window.formulaSystem.syncFromBuilder('${key}')" class="builder-weight-${key}" data-var="${v}" 
                                    style="width:100%; background:transparent; border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.85rem; text-align:center; border-radius:4px; font-family:monospace; padding:2px;">
                            </div>
                        </div>
                    ` : ''}
                </div>`;
        });

        if (!html && (phase === 2 || phase === 0)) {
            return `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:rgba(255,255,255,0.2); border:1px dashed rgba(255,255,255,0.1); border-radius:15px;">
                Nessuna metrica disponibile — crea prima le metriche in Fase 1 e Fase 2
            </div>`;
        }
        return html;
    }

    toggleBlock(key, varName, event) {
        const block = event.currentTarget;
        const newState = !block.classList.contains('active');
        let weights = (key === "_ADD_") ? (this._lastAddMetricWeights || {}) : (this.customMeta[key]?.uiConfig?.weights || {});
        weights[varName] = newState ? 1.0 : 0.0;

        // Selection Order Tracking
        if (!this._activeSelectionOrder) this._activeSelectionOrder = [];
        if (newState) {
            if (!this._activeSelectionOrder.includes(varName)) this._activeSelectionOrder.push(varName);
        } else {
            this._activeSelectionOrder = this._activeSelectionOrder.filter(n => n !== varName);
        }

        if (key === "_ADD_") {
            this._lastAddMetricWeights = weights;

        } else {
            this.customMeta[key].uiConfig.weights = weights;
        }

        this.renderAddMetricBuilder();
        this.syncFromBuilder(key);
        this.validateMetricForm();
    }

    async syncFromBuilder(key) {
        if (key !== '_ADD_') return;
        const weights = {};
        document.querySelectorAll(`.builder-weight-_ADD_`).forEach(i => weights[i.dataset.var] = parseFloat(i.value) || 0);
        const operators = {};
        document.querySelectorAll(`.builder-op-_ADD_`).forEach(s => operators[s.dataset.var] = s.value);

        // Harvest reducers from the builder UI
        const reducers = {};
        document.querySelectorAll(`.builder-reducer-_ADD_`).forEach(s => reducers[s.dataset.var] = s.value);

        // Update UI config safely
        this._lastAddMetricUiConfig = this._lastAddMetricUiConfig || {};
        this._lastAddMetricUiConfig.weights = weights;
        this._lastAddMetricUiConfig.operators = operators;
        this._lastAddMetricUiConfig.reducers = reducers;

        const combinator = document.getElementById('fm-combinator').value;
        const phase = this.currentPhase;

        let parts = [];
        let totalWeight = 0;
        
        // Use Selection Order if available, otherwise fallback to weights keys
        const order = this._activeSelectionOrder || Object.keys(weights).filter(v => weights[v] !== 0);
        
        order.forEach(v => {
            const w = weights[v];
            if (w && w !== 0) {
                totalWeight += w;
                if (phase === 0) parts.push(`Math.pow(${v}, ${w})`);
                else {
                    const op = operators[v] || '*';
                    parts.push(`(${v} ${op} ${w})`);
                }
            }
        });

        let expr = "0";
        if (parts.length > 0) {
            if (phase === 0 || combinator === 'product') {
                expr = parts.join(" * ");
            } else if (combinator === 'avg') {
                expr = `(${parts.join(" + ")}) / ${parts.length}`;
            } else if (combinator === 'division') {
                if (parts.length === 1) {
                    expr = parts[0];
                } else {
                    const numerator = parts[0];
                    const denominators = parts.slice(1);
                    // Zero guard: se un denominatore è 0, restituiamo 0
                    const zeroCheck = denominators.map(d => `(${d}) === 0`).join(' || ');
                    expr = `((${zeroCheck}) ? 0 : (${numerator} / ${denominators.join(' / ')}))`;
                }
            } else if (combinator === 'delta') {
                if (parts.length === 1) expr = parts[0];
                else expr = `(${parts[0]} - ${parts[1]})`;
            } else {
                expr = parts.join(" + ");
            }
        }

        if (!this._manualFormulaMode) {
            document.getElementById('fm-expr').value = expr;
        }
        const exprForPreview = this._manualFormulaMode ? (document.getElementById('fm-expr')?.value || expr) : expr;
        document.getElementById('fm-preview-text').innerHTML = this.formatHumanFormula(exprForPreview, combinator, phase);

        if (phase === 0) {
            const badge = document.getElementById('fm-weight-sum-badge');
            if (badge) {
                badge.innerText = totalWeight.toFixed(2);
                badge.style.background = (Math.abs(totalWeight - 1.0) < 0.01) ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)';
                badge.style.color = (Math.abs(totalWeight - 1.0) < 0.01) ? '#2ecc71' : '#e74c3c';
            }
        }
        this.updatePreview();
        this.validateMetricForm();
    }

    updateScalar(key, field, val) {
        if (!this.customMeta[key]) return;
        this.customMeta[key][field] = val;
        this.saveFormula(key);
    }

    async saveFormula(key) {
        const m = this.customMeta[key];
        const row = {
            key, expression: m.expression, phase: m.phase, label: m.label,
            description: m.description, is_active: m.isActive, weight: m.weight,
            min_range: m.minRange, max_range: m.maxRange, normalization_enabled: m.normEnabled,
            ui_config: m.uiConfig
        };
        try {
            const res = await fetch(API_BASE + "/api/talents/formula", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(row)
            });
            const result = await res.json();
            console.log("[FormulaSystem] saveFormula response:", result);
            if (res.ok) {
                window.rosterSystem?.showToast(`Metrica ${key} salvata`, 'success');
                await this.load();
            } else {
                window.rosterSystem?.showToast(`Errore: ${result.error || 'Salvataggio fallito'}`, 'error');
            }
        } catch (e) {
            console.error("[FormulaSystem] saveFormula error:", e);
            window.rosterSystem?.showToast('Errore di connessione', 'error');
        }
    }

    updateWeightSum() {
        let total = 0;
        Object.values(this.customMeta).forEach(m => { if (m.isActive && m.weight) total += m.weight; });
        const bar = document.getElementById('weight-sum-bar');
        const text = document.getElementById('weight-sum-text');
        if (bar && text) {
            bar.style.width = Math.min(100, total * 100) + "%";
            text.innerText = `${total.toFixed(2)} / 1.0`;
            bar.style.background = total > 1.01 ? "#e74c3c" : (total > 0.95 ? "#2ecc71" : "#f39c12");
        }
    }

    renderInModalScoreBuilder() {
        const cont = document.getElementById('add-metric-visual-builder');
        if (!cont) return;
        const allMetrics = Object.keys(this.customMeta).filter(k => k !== 'SCORE');
        if (allMetrics.length === 0) {
            cont.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:2rem;">Nessuna metrica configurata. Crea prima le metriche nella tab COSTRUTTORE.</div>';
            return;
        }
        const phase1 = allMetrics.filter(k => this.customMeta[k].phase === 1);
        const phase2 = allMetrics.filter(k => this.customMeta[k].phase === 2);
        const activeKeys = allMetrics.filter(k => this.customMeta[k].isActive);
        const totalW = activeKeys.reduce((s, k) => s + (this.customMeta[k].weight || 0), 0);
        const budgetPct = Math.min(100, totalW * 100);
        const bc = totalW > 1.0 ? '#e74c3c' : (totalW >= 0.8 ? '#2ecc71' : '#f39c12');

        const renderGroup = (keys, title, color) => {
            if (keys.length === 0) return '';
            return `<div style="margin-bottom:1.25rem;">
                <div style="font-size:0.6rem;color:${color};font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:0.75rem;padding-bottom:0.4rem;border-bottom:1px solid rgba(255,255,255,0.07);">${title}</div>
                ${keys.map(k => {
                    const m = this.customMeta[k];
                    const active = !!m.isActive;
                    const w = (m.weight != null && m.weight > 0) ? m.weight : 1;
                    return `<div style="background:rgba(0,0,0,${active ? '0.35' : '0.12'});border:1px solid rgba(255,255,255,${active ? '0.1' : '0.04'});border-radius:10px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;margin-bottom:0.5rem;transition:all .2s;">
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:800;color:${active ? '#fff' : 'rgba(255,255,255,0.3)'};font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.label || k)}</div>
                            <div style="font-size:0.6rem;color:rgba(255,255,255,0.2);font-family:monospace;margin-top:2px;">${k}</div>
                        </div>
                        ${active ? `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;">
                            <span style="font-size:0.55rem;color:rgba(255,255,255,0.35);font-weight:800;letter-spacing:1px;">PESO</span>
                            <input type="number" min="0" max="5" step="0.05" value="${w}"
                                style="width:72px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;padding:5px 8px;font-size:0.9rem;font-family:'JetBrains Mono',monospace;text-align:center;outline:none;"
                                oninput="window.formulaSystem._liveWeightUpdate('${k}', this.value)"
                                onchange="window.formulaSystem.setMetricWeight('${k}', this.value)"
                                onfocus="this.style.borderColor='#00bcd4'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'" />
                        </div>` : '<div style="width:72px;"></div>'}
                        <div onclick="window.formulaSystem.toggleMetricInScore('${k}')"
                            title="${active ? 'Rimuovi dal Talent Score' : 'Includi nel Talent Score'}"
                            style="cursor:pointer;width:34px;height:34px;border-radius:50%;border:2px solid ${active ? '#00bcd4' : 'rgba(255,255,255,0.18)'};background:${active ? '#00bcd4' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;">
                            ${active ? '<i class="fas fa-check" style="color:#000;font-size:0.75rem;pointer-events:none;"></i>' : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        };

        cont.innerHTML = `
            <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:0.65rem;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Budget Peso Totale</span>
                    <span id="score-budget-total" style="font-size:0.8rem;font-family:monospace;color:${bc};font-weight:800;">${totalW.toFixed(2)} / 1.0</span>
                </div>
                <div style="background:rgba(255,255,255,0.06);border-radius:6px;height:8px;overflow:hidden;">
                    <div id="score-budget-fill" style="height:100%;background:${bc};width:${budgetPct}%;transition:width .25s,background .25s;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:5px;">
                    <span style="font-size:0.6rem;color:rgba(255,255,255,0.25);">Assegnato: <strong style="color:rgba(255,255,255,0.5);">${totalW.toFixed(2)}</strong></span>
                    <span style="font-size:0.6rem;color:rgba(255,255,255,0.25);">Disponibile: <strong id="score-budget-available" style="color:${bc};">${Math.max(0, 1.0-totalW).toFixed(2)}</strong></span>
                </div>
            </div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-bottom:1rem;line-height:1.5;">
                Attiva le metriche e imposta il loro <strong style="color:rgba(255,255,255,0.6);">peso relativo</strong>. La somma dei pesi determina il contributo proporzionale sul punteggio finale.
            </div>
            ${renderGroup(phase1, 'Metriche Individuali â Phase 1', '#f39c12')}
            ${renderGroup(phase2, 'Metriche Contestuali â Phase 2', '#00bcd4')}
            ${activeKeys.length === 0 ? '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:0.75rem;padding:0.5rem;">Nessuna metrica attiva. Abilita almeno una metrica per calcolare il Talent Score.</div>' : ''}
            <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.07);">
                <button onclick="window.formulaSystem.saveAllScoreMetrics()" class="run-btn" style="width:100%;background:linear-gradient(135deg,rgba(0,188,212,0.2),rgba(167,139,250,0.2));border:1px solid rgba(0,188,212,0.35);color:#fff;font-weight:800;letter-spacing:0.5px;padding:12px;border-radius:10px;font-size:0.9rem;">
                    <i class="fas fa-save" style="margin-right:8px;"></i>Salva Configurazione Talent Score
                </button>
            </div>
        `;
    }

    async toggleMetricInScore(key) {
        const m = this.customMeta[key];
        if (!m) return;
        m.isActive = !m.isActive;
        if (m.isActive && (!m.weight || m.weight <= 0)) m.weight = 1;
        this.renderInModalScoreBuilder(); // update UI immediately (optimistic)
        await this.saveFormula(key);
    }

    async setMetricWeight(key, value) {
        const m = this.customMeta[key];
        if (!m) return;
        m.weight = parseFloat(value) || 1;
        this.renderInModalScoreBuilder(); // optimistic update
        await this.saveFormula(key);
    }

    onExprInput() {
        if (!this._manualFormulaMode) {
            this._manualFormulaMode = true;
            this._updateManualModeBadge(true);
        }
        const expr = document.getElementById("fm-expr")?.value || "";
        const combinator = document.getElementById("fm-combinator")?.value || "sum";
        const previewEl = document.getElementById("fm-preview-text");
        if (previewEl) previewEl.innerHTML = this.formatHumanFormula(expr, combinator, this.currentPhase);
        this.syncBuilderFromExpr();
        this.validateMetricForm();
    }
    syncBuilderFromExpr() {
        const exprEl = document.getElementById('fm-expr');
        const expr = exprEl?.value || '';
        if (!expr || expr === '0') return;
        const phase = this.currentPhase;
        if (phase === 0) return;

        let allVars = [];
        if (phase === 1) {
            allVars = ['pr', 'earnings', 'events_total', 'avg_top', 'avg_top_recent10',
                       'avg_pr_recent10', 'N', 'prRank', 'earningsRank', 'prPercentile',
                       'earningsPercentile', 'PR_DENSITY', 'rank_delta_raw'];
        } else if (phase === 2) {
            allVars = ['prRank', 'earningsRank', 'prPercentile', 'earningsPercentile', 'rank_delta_raw', 'N'];
            Object.keys(this.customMeta).forEach(k => {
                if (this.customMeta[k].phase === 1) {
                    allVars.push(k + '_rank', k + '_percentile');
                }
            });
        }
        allVars.sort((a, b) => b.length - a.length); // longest first to avoid partial matches

        const newWeights = {};
        const newOrder = [];
        allVars.forEach(v => {
            // Variable names are alphanumeric+underscore, safe to use in regex without escaping
            if (new RegExp('\b' + v + '\b').test(expr)) {
                const m1 = expr.match(new RegExp('(\d+(?:\.\d+)?)\s*\*\s*\b' + v + '\b'));
                const m2 = expr.match(new RegExp('\b' + v + '\b\s*\*\s*(\d+(?:\.\d+)?)'));
                const coeff = m1 ? parseFloat(m1[1]) : (m2 ? parseFloat(m2[1]) : 1);
                newWeights[v] = coeff > 0 ? coeff : 1;
                newOrder.push(v);
            }
        });

        if (Object.keys(newWeights).length === 0) return;

        allVars.forEach(v => { if (!newWeights[v]) delete this._lastAddMetricWeights[v]; });
        Object.assign(this._lastAddMetricWeights, newWeights);
        this._activeSelectionOrder = newOrder;

        const cont = document.getElementById('add-metric-visual-builder');
        if (cont) cont.innerHTML = this.renderBuilder('_ADD_', {
            phase,
            uiConfig: { weights: this._lastAddMetricWeights, operators: this._lastAddMetricOperators || {} }
        });
    }


    updateModalWeightSum() { this.updateWeightSum(); }

    _updateManualModeBadge(active) {
        let badge = document.getElementById('fm-manual-badge');
        if (!badge) {
            const exprEl = document.getElementById('fm-expr');
            if (!exprEl || !exprEl.parentElement) return;
            badge = document.createElement('div');
            badge.id = 'fm-manual-badge';
            badge.style.cssText = 'display:none;margin-top:6px;padding:6px 10px;background:rgba(243,156,18,0.1);border:1px solid rgba(243,156,18,0.3);border-radius:8px;font-size:0.7rem;color:#f39c12;align-items:center;gap:8px;';
            badge.innerHTML = '<i class="fas fa-pencil-alt"></i><span>ModalitÃ  manuale â il builder non sovrascrive la formula</span><button onclick="window.formulaSystem.resetManualMode()" style="margin-left:auto;background:rgba(243,156,18,0.2);border:1px solid rgba(243,156,18,0.4);color:#f39c12;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.65rem;">âº Usa builder</button>';
            exprEl.parentElement.appendChild(badge);
        }
        badge.style.display = active ? 'flex' : 'none';
    }

    resetManualMode() {
        this._manualFormulaMode = false;
        this._updateManualModeBadge(false);
        this.syncFromBuilder('_ADD_');
    }

    _liveWeightUpdate(key, value) {
        const m = this.customMeta[key];
        if (!m) return;
        m.weight = parseFloat(value) || 0;
        this._updateScoreBudget();
    }

    _updateScoreBudget() {
        const activeMetrics = Object.keys(this.customMeta).filter(k => k !== 'SCORE' && this.customMeta[k].isActive);
        let total = 0;
        activeMetrics.forEach(k => { total += (this.customMeta[k].weight || 0); });
        const totalEl = document.getElementById('score-budget-total');
        const fillEl = document.getElementById('score-budget-fill');
        const availEl = document.getElementById('score-budget-available');
        if (!totalEl) return;
        const pct = Math.min(100, total * 100);
        totalEl.textContent = total.toFixed(2) + ' / 1.0';
        if (availEl) availEl.textContent = Math.max(0, 1.0 - total).toFixed(2);
        if (fillEl) {
            fillEl.style.width = pct + '%';
            fillEl.style.background = total > 1.0 ? '#e74c3c' : (total >= 0.8 ? '#2ecc71' : '#f39c12');
        }
    }

    async saveAllScoreMetrics() {
        const activeMetrics = Object.keys(this.customMeta).filter(k => k !== 'SCORE' && this.customMeta[k].isActive);
        for (const k of activeMetrics) {
            await this.saveFormula(k);
        }
        window.rosterSystem?.showToast('Configurazione Talent Score salvata â', 'success');
    }


    async updatePreview() {
        const expr = document.getElementById('fm-expr').value;
        const player = document.getElementById('fm-preview-player')?.value;
        if (!expr || expr === "0") return;
        const res = await fetch(`/api/talents/preview?expression=${encodeURIComponent(expr)}&phase=${this.currentPhase}&playerName=${encodeURIComponent(player)}`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('fm-preview-value').innerText = data.result.toFixed(1);
            document.getElementById('fm-preview-percentile-bar').style.width = data.percentile + "%";
            const pText = document.getElementById('fm-preview-percent-text');
            if (pText) pText.innerText = Math.round(data.percentile) + "%";
        }
    }

    validateMetricForm() {
        const key = document.getElementById('fm-key')?.value.trim() || "";
        const label = document.getElementById('fm-label')?.value.trim() || "";
        const expr = document.getElementById('fm-expr')?.value || "";
        const phase = this.currentPhase;
        const errEl = document.getElementById('fm-validation-error');
        const submitBtn = document.getElementById('fm-submit-btn');

        let error = "";

        if (phase === 0) {
            // In TALENT SCORE phase, skip key/label validation (identity section hidden)
        } else if (!key) error = "Inserisci una Chiave (ID)";
        else if (!/^[A-Z][A-Z0-9]{0,19}$/.test(key)) error = "Chiave non valida (solo CAPS e numeri)";
        else if (!label) error = "Inserisci un Nome Descrittivo";
        else if (!expr || expr === "0") error = "Seleziona almeno un blocco dati";
       

        if (errEl) errEl.innerText = error;
        if (submitBtn) submitBtn.disabled = error !== "";
    }

    async addMetric() {
        const v = id => document.getElementById(id)?.value?.trim() || "";
        const key = this._editingKey || v('fm-key').toUpperCase();
        const isEditing = !!this._editingKey;
        const data = {
            key, phase: this.currentPhase, expression: document.getElementById('fm-expr').value,
            label: v('fm-label'), description: v('fm-desc'),
            is_active: true,
            ui_config: {
                weights: this._lastAddMetricWeights || {},
                operators: this.getOpsFromUI(),
                combinator: document.getElementById('fm-combinator').value,
                selectionOrder: this._activeSelectionOrder || []
            }
        };
        try {
            const url = isEditing ? "/api/talents/formula" : "/api/talents/formula/custom";
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            console.log(`[FormulaSystem] addMetric (${method}) response:`, result);
            if (res.ok || res.status === 201) {
                const msg = isEditing ? `Metrica ${key} aggiornata!` : `Nuova metrica ${key} creata!`;
                window.rosterSystem?.showToast(msg, 'success');
                this.closeModal();
                await this.load();
            } else {
                window.rosterSystem?.showToast(`Errore: ${result.error || 'Salvataggio fallito'}`, 'error');
            }
        } catch (e) {
            console.error("[FormulaSystem] addMetric error:", e);
            window.rosterSystem?.showToast('Errore durante il salvataggio', 'error');
        }
    }

    renderAddMetricBuilder() {
        const cont = document.getElementById('add-metric-visual-builder');
        if (cont) cont.innerHTML = this.renderBuilder("_ADD_", { phase: this.currentPhase, uiConfig: { weights: this._lastAddMetricWeights || {} } });
    }

    async openAddModal() {
        const addMetricModal = document.getElementById('add-metric-modal');
        addMetricModal.style.display = 'flex';
        if (this._focusTrapCleanup) this._focusTrapCleanup();
        this._focusTrapCleanup = focusTrap(addMetricModal);
        requestAnimationFrame(() => {
            const focusable = Array.from(addMetricModal.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        document.getElementById('add-metric-form').reset();
        this._editingKey = null;
        this._lastAddMetricWeights = {};
        this._activeSelectionOrder = [];
        this._manualFormulaMode = false;
        await this.setPhase(1);
        this.fetchPreviewPlayers();
    }

    async openModal(key) {
        const m = this.customMeta[key];
        if (!m) { window.rosterSystem?.showToast('Metrica non trovata', 'error'); return; }

        const addMetricModalEdit = document.getElementById('add-metric-modal');
        addMetricModalEdit.style.display = 'flex';
        if (this._focusTrapCleanup) this._focusTrapCleanup();
        this._focusTrapCleanup = focusTrap(addMetricModalEdit);
        requestAnimationFrame(() => {
            const focusable = Array.from(addMetricModalEdit.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'));
            const first = focusable.find(el => !el.disabled);
            if (first) first.focus();
        });
        document.getElementById('add-metric-form').reset();
        this._editingKey = key;

        // Popola i campi
        const kEl = document.getElementById('fm-key');
        if (kEl) { kEl.value = key; kEl.readOnly = true; kEl.style.opacity = '0.5'; }
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        set('fm-label', m.label);
        set('fm-desc', m.description);

        // Ripristina pesi e operatori dal uiConfig
        this._lastAddMetricWeights = { ...(m.uiConfig?.weights || {}) };
        this._lastAddMetricOperators = { ...(m.uiConfig?.operators || {}) };
        this._activeSelectionOrder = m.uiConfig?.selectionOrder ? [...m.uiConfig.selectionOrder] : Object.keys(this._lastAddMetricWeights).filter(k => this._lastAddMetricWeights[k] !== 0);
        this._manualFormulaMode = false;

        await this.setPhase(m.phase); // setPhase now reads _lastAddMetricWeights set above

        // Ripristina combinator DOPO setPhase (che resetta il select)
        const combEl = document.getElementById('fm-combinator');
        if (combEl && m.uiConfig?.combinator) combEl.value = m.uiConfig.combinator;

        // Aggiorna preview formula con i dati corretti
        this.syncFromBuilder('_ADD_');

        // Ripristina sempre l'espressione salvata (previene perdita formule manuali)
        const _exprRestore = document.getElementById('fm-expr');
        if (_exprRestore && m.expression) {
            _exprRestore.value = m.expression;
            const _prevRestore = document.getElementById('fm-preview-text');
            const _combRestore = document.getElementById('fm-combinator');
            if (_prevRestore) _prevRestore.innerHTML = this.formatHumanFormula(m.expression, _combRestore?.value || 'sum', m.phase);
        }
        // Auto-seleziona i blocchi dal testo se non c'Ã¨ stato builder precedente
        const _hasBuilderState = Object.values(m.uiConfig?.weights || {}).some(w => w > 0);
        if (!_hasBuilderState) this.syncBuilderFromExpr();

        this.fetchPreviewPlayers();
    }


    showConfirm(message) {
        return new Promise(resolve => {
            // Rimuovi dialogo precedente se esiste
            document.getElementById('custom-confirm-dialog')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'custom-confirm-dialog';
            overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(4px);`;
            overlay.innerHTML = `
                <div style="background:#0d0d0f;border:1px solid rgba(231,76,60,0.4);border-radius:16px;padding:2rem;max-width:420px;width:90%;box-shadow:0 0 40px rgba(231,76,60,0.15);">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;">
                        <i class="fas fa-exclamation-triangle" style="color:#e74c3c;font-size:1.4rem;"></i>
                        <span style="color:#fff;font-weight:700;font-size:1rem;">Conferma Eliminazione</span>
                    </div>
                    <p style="color:rgba(255,255,255,0.7);margin-bottom:1.5rem;line-height:1.5;">${message}</p>
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button id="confirm-cancel" style="padding:8px 20px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:0.85rem;">Annulla</button>
                        <button id="confirm-ok" style="padding:8px 20px;border-radius:8px;border:1px solid rgba(231,76,60,0.5);background:rgba(231,76,60,0.2);color:#e74c3c;cursor:pointer;font-weight:700;font-size:0.85rem;"><i class="fas fa-trash" style="margin-right:6px;"></i>Elimina</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
            overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
            overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
        });
    }

    async deleteMetric(key) {
        const confirmed = await this.showConfirm(`Eliminare definitivamente la metrica <strong style="color:#fff;">${key}</strong>?<br>Questa azione è irreversibile.`);
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/talents/formula`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            const result = await res.json();
            console.log('[FormulaSystem] deleteMetric response:', result);
            if (res.ok) {
                window.rosterSystem?.showToast(`Metrica ${key} eliminata`, 'success');
                await this.load();
            } else {
                window.rosterSystem?.showToast(`Errore: ${result.error || 'Eliminazione fallita'}`, 'error');
            }
        } catch (e) {
            console.error('[FormulaSystem] deleteMetric error:', e);
            window.rosterSystem?.showToast('Errore di connessione', 'error');
        }
    }

    async fetchPreviewPlayers() {
        const sel = document.getElementById('fm-preview-player');
        if (!sel) return;
        const res = await fetch(API_BASE + "/api/talents/stats");
        if (res.ok) {
            const data = await res.json();
            const players = data.players || [];
            sel.innerHTML = players.slice(0, 20).map(p => `<option value="${p.name}">${p.name}</option>`).join("");
        }
    }

    _activateStep(n) {
        document.querySelectorAll('.metric-section').forEach(s => {
            const step = parseInt(s.dataset.step);
            s.style.display = (step === n || (n === 2 && step === 1)) ? 'block' : 'none';
            s.style.opacity = (step === n) ? '1' : '0.5';
        });
    }

    _updateCombinatorExample() {
        const el = document.getElementById('fm-combinator-example');
        if (!el) return;
        const c = document.getElementById('fm-combinator').value;
        const map = { sum: 'es. N.Eventi + EventiPR', avg: 'es. (N.Eventi + EventiPR) / 2', product: 'es. N.Eventi * EventiPR' };
        el.textContent = map[c] || '';
    }

    _loadTemplate() {
        const keys = Object.keys(this.customMeta).filter(k => k !== "SCORE");
        if (keys.length === 0) return;
        const choice = prompt('Scegli una metrica come template:\n' + keys.join(', '));
        if (!choice || !this.customMeta[choice]) return;
        const m = this.customMeta[choice];
        document.getElementById('fm-label').value = m.label;
        document.getElementById('fm-desc').value = m.description;
        this._lastAddMetricWeights = Object.assign({}, m.uiConfig?.weights || {});
        this.renderAddMetricBuilder();
    }

    getOpsFromUI() {
        const operators = {};
        document.querySelectorAll('.builder-op-_ADD_').forEach(s => {
            operators[s.dataset.var] = s.value;
        });
        return operators;
    }

    closeModal() {
        const m = document.getElementById('add-metric-modal');
        if (m) m.style.display = 'none';
        const kEl = document.getElementById('fm-key');
        if (kEl) { kEl.readOnly = false; kEl.style.opacity = ''; }
        this._editingKey = null;
        this._lastAddMetricWeights = {};
        this._lastAddMetricOperators = {};
        this._activeSelectionOrder = [];
        if (this._focusTrapCleanup) { this._focusTrapCleanup(); this._focusTrapCleanup = null; }
    }
}

// --- ADMIN SYSTEM -------------------------------------------------------------


// --- FORCE SCAN SYSTEM --------------------------------------------------------
class ForceScanSystem {
    constructor() {
        this.btn = document.getElementById('force-scan-btn');
        this.status = document.getElementById('force-scan-status');
        this.pollInterval = null;
        this.btn?.addEventListener('click', () => this.run());
    }

    async run() {
        if (!this.btn) return;
        this.btn.disabled = true;
        this.btn.style.opacity = '0.5';
        this.showStatus('Scansione avviata... potrebbe richiedere qualche minuto.', 'running');

        try {
            const res = await fetch(API_BASE + '/api/scraper/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger: 'manual' })
            });

            if (res.ok) {
                this.startPolling();
            } else {
                this.showStatus('Errore avvio scansione', 'error');
                this.reset();
            }
        } catch {
            this.showStatus('Server non disponibile', 'warning');
            this.reset();
        }
    }

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(async () => {
            try {
                const res = await fetch(API_BASE + '/api/scraper/status');
                if (!res.ok) return;
                const data = await res.json();
                if (!data.isRunning) {
                    clearInterval(this.pollInterval);
                    this.pollInterval = null;
                    this.showStatus('Statistiche aggiornate!', 'success');
                    this.reset();
                }
            } catch {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
                this.reset();
            }
        }, 8000);
    }

    showStatus(msg, type) {
        if (!this.status) return;
        const colors = { running: '#60a5fa', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
        this.status.innerHTML = `<span style="color:${colors[type] || '#aaa'}"><i class="fas fa-${type === 'running' ? 'spinner fa-spin' : type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}</span>`;
    }

    reset() {
        if (this.btn) { this.btn.disabled = false; this.btn.style.opacity = ''; }
    }
}