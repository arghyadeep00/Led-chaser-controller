/**
 * GlowControl IoT Dashboard — Main Client Application
 * Vanilla JS, Fetch API, Lucide Icons, Chart.js
 */

// Global State
window.GlowControl = {
  isPolling: true,
  lastCommandId: null,
  activeChart: null
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initialize UI Subsystems
  initMobileNav();
  initToastSystem();
  initSimulatorToggle();
  initQuickCommands();
  initControllerPage();
  initEffectsPage();
  initAutomationPage();
  initHistoryPage();
  initSettingsPage();
  initOverviewChart();

  // Start background live status polling
  startDevicePolling();
});

/* ==========================================================================
   1. Toast Notification System
   ========================================================================== */
function initToastSystem() {
  window.showToast = function (title, message, type = 'info', meta = '') {
    const container = document.getElementById('toast-container');
    const template = document.getElementById('toast-template');
    if (!container || !template) return;

    const clone = template.content.cloneNode(true);
    const toast = clone.querySelector('.toast-item');
    const titleEl = toast.querySelector('.toast-title');
    const msgEl = toast.querySelector('.toast-message');
    const iconEl = toast.querySelector('.toast-icon');
    const metaEl = toast.querySelector('.toast-meta');
    const closeBtn = toast.querySelector('.toast-close');

    titleEl.textContent = title;
    msgEl.textContent = message;

    if (meta) {
      metaEl.textContent = meta;
      metaEl.classList.remove('hidden');
    }

    // Set colors & icons based on type
    if (type === 'success') {
      toast.classList.add('border-emerald-500/40', 'bg-navy-800');
      iconEl.innerHTML = '<svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
      toast.classList.add('border-rose-500/40', 'bg-navy-800');
      iconEl.innerHTML = '<svg class="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else if (type === 'warning') {
      toast.classList.add('border-amber-500/40', 'bg-navy-800');
      iconEl.innerHTML = '<svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      toast.classList.add('border-sky-500/40', 'bg-navy-800');
      iconEl.innerHTML = '<svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    container.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    const removeToast = () => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', removeToast);
    setTimeout(removeToast, 4500);
  };
}

/* ==========================================================================
   2. Confirmation Modal System
   ========================================================================== */
function showConfirmModal(title, message, onProceed) {
  const modal = document.getElementById('confirm-modal');
  if (!modal) {
    if (confirm(message)) onProceed();
    return;
  }

  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  const cancelBtn = document.getElementById('confirm-modal-cancel');
  const proceedBtn = document.getElementById('confirm-modal-proceed');

  titleEl.textContent = title;
  msgEl.textContent = message;

  // Open modal
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100');

  const cleanup = () => {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0', 'pointer-events-none');
    cancelBtn.onclick = null;
    proceedBtn.onclick = null;
  };

  cancelBtn.onclick = () => {
    cleanup();
  };

  proceedBtn.onclick = () => {
    cleanup();
    onProceed();
  };
}

/* ==========================================================================
   3. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.getElementById('sidebar-nav');
  const backdrop = document.getElementById('sidebar-backdrop');
  const closeBtn = document.getElementById('close-sidebar-btn');

  if (!toggleBtn || !sidebar || !backdrop) return;

  const openSidebar = () => {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  };

  const closeSidebar = () => {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  };

  toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
}

/* ==========================================================================
   4. Command Submission Helper (Anti-Double Click Guard)
   ========================================================================== */
async function dispatchCommand(command, value = null, buttonElement = null) {
  if (buttonElement && buttonElement.disabled) return;

  let originalHtml = '';
  if (buttonElement) {
    buttonElement.disabled = true;
    originalHtml = buttonElement.innerHTML;
    buttonElement.innerHTML = '<span class="inline-block animate-spin mr-1">&#9696;</span> Sending...';
  }

  try {
    const response = await fetch('/api/device/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ command, value, origin: 'web_dashboard' })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit command');
    }

    const cmdData = result.data;
    showToast(
      'Command Submitted',
      `Queued: '${command}' ${value !== null ? '(value: ' + value + ')' : ''}`,
      'success',
      `ID: ${cmdData.id} • Status: ${cmdData.status}`
    );

    // Immediate state refresh
    fetchLiveDeviceStatus();

    return cmdData;
  } catch (err) {
    showToast('Command Failed', err.message, 'error');
    console.error('[Command Error]', err);
  } finally {
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.innerHTML = originalHtml;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

/* ==========================================================================
   5. Quick Commands & Overview Handlers
   ========================================================================== */
function initQuickCommands() {
  document.querySelectorAll('[data-quick-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-quick-cmd');
      dispatchCommand(cmd, null, btn);
    });
  });

  const refreshBtn = document.getElementById('refresh-dashboard-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchLiveDeviceStatus(true);
      showToast('Dashboard Refreshed', 'Synced latest status and telemetry from database', 'info');
    });
  }
}

/* ==========================================================================
   6. Controller Page Handlers
   ========================================================================== */
function initControllerPage() {
  // Direct command buttons
  const cmdButtons = [
    'btn-all-on',
    'btn-all-off',
    'btn-prev-effect',
    'btn-next-effect',
    'btn-reset-effect',
    'btn-lock-pattern',
    'btn-unlock-pattern',
    'btn-enable-auto',
    'btn-disable-auto'
  ];

  cmdButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      const confirmMsg = btn.getAttribute('data-confirm');

      if (confirmMsg) {
        showConfirmModal('Confirm Hardware Action', confirmMsg, () => {
          dispatchCommand(cmd, null, btn);
        });
      } else {
        dispatchCommand(cmd, null, btn);
      }
    });
  });

  // Speed Slider Live Feedback
  const speedSlider = document.getElementById('speed-range-slider');
  const speedDisplay = document.getElementById('speed-value-display');
  const applySpeedBtn = document.getElementById('apply-speed-btn');

  if (speedSlider && speedDisplay) {
    speedSlider.addEventListener('input', () => {
      speedDisplay.textContent = speedSlider.value;
    });

    // Preset buttons
    document.querySelectorAll('[data-speed-preset]').forEach(presetBtn => {
      presetBtn.addEventListener('click', () => {
        const val = presetBtn.getAttribute('data-speed-preset');
        speedSlider.value = val;
        speedDisplay.textContent = val;
      });
    });

    if (applySpeedBtn) {
      applySpeedBtn.addEventListener('click', () => {
        dispatchCommand('speed', parseInt(speedSlider.value, 10), applySpeedBtn);
      });
    }
  }

  // 1-50 Effect Selector
  const effectSelect = document.getElementById('effect-select-dropdown');
  const dispatchEffectBtn = document.getElementById('dispatch-effect-btn');
  const effTitle = document.getElementById('selected-eff-title');
  const effCat = document.getElementById('selected-eff-category');
  const effDesc = document.getElementById('selected-eff-desc');

  if (effectSelect && dispatchEffectBtn) {
    effectSelect.addEventListener('change', async () => {
      const selectedId = effectSelect.value;
      try {
        const res = await fetch('/api/effects');
        const data = await res.json();
        const effect = data.data.find(e => e.id === Number(selectedId));
        if (effect && effTitle && effCat && effDesc) {
          effTitle.textContent = `#${effect.id} ${effect.name}`;
          effCat.textContent = effect.category;
          effDesc.textContent = effect.description;
        }
      } catch (e) {
        console.error(e);
      }
    });

    dispatchEffectBtn.addEventListener('click', () => {
      const effId = parseInt(effectSelect.value, 10);
      dispatchCommand('effect', effId, dispatchEffectBtn);
    });
  }
}

/* ==========================================================================
   7. Effects Library Page Handlers
   ========================================================================== */
function initEffectsPage() {
  const searchInput = document.getElementById('effect-search-input');
  const pills = document.querySelectorAll('.category-filter-pill');
  const cards = document.querySelectorAll('.effect-card');
  const noMatchBox = document.getElementById('no-effects-match');
  const clearBtn = document.getElementById('reset-effect-filters');
  const clearBtn2 = document.getElementById('clear-search-btn');

  if (!cards.length) return;

  let activeCategory = 'All';
  let searchTerm = '';

  const filterCards = () => {
    let visibleCount = 0;
    const term = searchTerm.trim().toLowerCase();

    cards.forEach(card => {
      const id = card.getAttribute('data-effect-id');
      const name = card.getAttribute('data-effect-name');
      const category = card.getAttribute('data-effect-category');

      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const matchesSearch = term === '' || id.includes(term) || name.includes(term) || category.toLowerCase().includes(term);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (noMatchBox) {
      if (visibleCount === 0) {
        noMatchBox.classList.remove('hidden');
      } else {
        noMatchBox.classList.add('hidden');
      }
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      filterCards();
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('bg-accent/15', 'text-accent', 'border-accent/40', 'font-semibold', 'shadow-sm');
        p.classList.add('bg-navy-900', 'text-slate-400', 'border-navy-700');
      });

      pill.classList.add('bg-accent/15', 'text-accent', 'border-accent/40', 'font-semibold', 'shadow-sm');
      pill.classList.remove('bg-navy-900', 'text-slate-400', 'border-navy-700');

      activeCategory = pill.getAttribute('data-category');
      filterCards();
    });
  });

  const resetAll = () => {
    if (searchInput) searchInput.value = '';
    searchTerm = '';
    activeCategory = 'All';
    pills.forEach(p => {
      if (p.getAttribute('data-category') === 'All') {
        p.classList.add('bg-accent/15', 'text-accent', 'border-accent/40', 'font-semibold', 'shadow-sm');
        p.classList.remove('bg-navy-900', 'text-slate-400', 'border-navy-700');
      } else {
        p.classList.remove('bg-accent/15', 'text-accent', 'border-accent/40', 'font-semibold', 'shadow-sm');
        p.classList.add('bg-navy-900', 'text-slate-400', 'border-navy-700');
      }
    });
    filterCards();
  };

  if (clearBtn) clearBtn.addEventListener('click', resetAll);
  if (clearBtn2) clearBtn2.addEventListener('click', resetAll);

  // Select Effect Card Buttons
  document.querySelectorAll('[data-select-effect]').forEach(btn => {
    btn.addEventListener('click', () => {
      const effId = parseInt(btn.getAttribute('data-select-effect'), 10);
      const title = btn.getAttribute('data-effect-title');
      dispatchCommand('effect', effId, btn);
    });
  });
}

/* ==========================================================================
   8. Automation Page Handlers
   ========================================================================== */
function initAutomationPage() {
  const form = document.getElementById('automation-form');
  const toggle = document.getElementById('auto-mode-toggle');
  const intervalSlider = document.getElementById('auto-interval-input');
  const intervalDisplay = document.getElementById('interval-display');
  const speedSlider = document.getElementById('auto-speed-input');
  const speedDisplay = document.getElementById('auto-speed-display');
  const statePill = document.getElementById('auto-state-pill');

  if (!form) return;

  if (toggle && statePill) {
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        statePill.textContent = 'Enabled';
        statePill.className = 'badge badge-success text-[10px]';
      } else {
        statePill.textContent = 'Disabled';
        statePill.className = 'badge badge-neutral text-[10px]';
      }
    });
  }

  if (intervalSlider && intervalDisplay) {
    intervalSlider.addEventListener('input', () => {
      intervalDisplay.textContent = intervalSlider.value;
    });
  }

  if (speedSlider && speedDisplay) {
    speedSlider.addEventListener('input', () => {
      speedDisplay.textContent = speedSlider.value;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-automation-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const payload = {
        enabled: toggle ? toggle.checked : false,
        intervalSeconds: intervalSlider ? parseInt(intervalSlider.value, 10) : 10,
        speedMs: speedSlider ? parseInt(speedSlider.value, 10) : 150
      };

      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update automation');
      }

      showToast('Automation Saved', 'Cycle interval and settings updated persistently in SQLite.', 'success');

      // Update right summary card
      const summaryMode = document.getElementById('summary-mode');
      const summaryInterval = document.getElementById('summary-interval');
      const summarySpeed = document.getElementById('summary-speed');

      if (summaryMode) summaryMode.textContent = payload.enabled ? 'Automatic Cycle' : 'Manual Lock';
      if (summaryInterval) summaryInterval.textContent = `${payload.intervalSeconds} seconds`;
      if (summarySpeed) summarySpeed.textContent = `${payload.speedMs} ms`;

    } catch (err) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  });
}

/* ==========================================================================
   9. History Page Handlers
   ========================================================================== */
function initHistoryPage() {
  const refreshBtn = document.getElementById('refresh-history-btn');
  const purgeBtn = document.getElementById('purge-expired-btn');
  const searchInput = document.getElementById('history-search-input');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  if (purgeBtn) {
    purgeBtn.addEventListener('click', () => {
      showConfirmModal(
        'Purge Expired Commands',
        'Are you sure you want to delete all expired queue items from the SQLite database?',
        async () => {
          try {
            const res = await fetch('/api/commands/expired', { method: 'DELETE' });
            const json = await res.json();
            showToast('Expired Cleaned', `Removed ${json.purgedCount} expired commands.`, 'success');
            setTimeout(() => window.location.reload(), 1000);
          } catch (e) {
            showToast('Purge Failed', e.message, 'error');
          }
        }
      );
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        const url = new URL(window.location.href);
        if (val) {
          url.searchParams.set('search', val);
        } else {
          url.searchParams.delete('search');
        }
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
      }
    });
  }
}

/* ==========================================================================
   10. Settings Page Handlers
   ========================================================================== */
function initSettingsPage() {
  const form = document.getElementById('device-settings-form');
  const testBtn = document.getElementById('test-connection-btn');
  const simCardBtn = document.getElementById('toggle-simulator-card-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('save-settings-btn');
      if (saveBtn) saveBtn.disabled = true;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/device/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to update settings');
        }

        showToast('Settings Updated', 'Device configuration saved to SQLite.', 'success');
      } catch (err) {
        showToast('Error', err.message, 'error');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      try {
        const res = await fetch('/api/device/status');
        const json = await res.json();
        const status = json.data;

        if (status.isOnline || status.isSimulated) {
          showToast(
            'Connection Active',
            `Device '${status.deviceName}' is reachable (${status.statusLabel}). Last communication: ${status.lastSeenSecondsAgo || 0}s ago.`,
            'success'
          );
        } else {
          showToast(
            'Device Offline',
            `ESP32 has not polled within the last ${status.commandTimeoutSeconds}s window.`,
            'warning'
          );
        }
      } catch (err) {
        showToast('Connection Test Failed', err.message, 'error');
      } finally {
        testBtn.disabled = false;
      }
    });
  }

  if (simCardBtn) {
    simCardBtn.addEventListener('click', async () => {
      await toggleSimulatorMode();
      setTimeout(() => window.location.reload(), 600);
    });
  }
}

/* ==========================================================================
   11. Simulator Toggle Controls
   ========================================================================== */
function initSimulatorToggle() {
  const quickBtn = document.getElementById('quick-simulator-btn');
  const startBtn = document.getElementById('start-sim-btn');
  const stopBtn = document.getElementById('stop-sim-btn');

  const handler = async () => {
    await toggleSimulatorMode();
    setTimeout(() => window.location.reload(), 600);
  };

  if (quickBtn) quickBtn.addEventListener('click', handler);
  if (startBtn) startBtn.addEventListener('click', handler);
  if (stopBtn) stopBtn.addEventListener('click', handler);
}

async function toggleSimulatorMode() {
  try {
    const res = await fetch('/api/simulator/toggle', { method: 'POST' });
    const json = await res.json();
    showToast(
      json.isSimulated ? 'Demo Simulator Started' : 'Simulator Stopped',
      json.message,
      json.isSimulated ? 'info' : 'warning'
    );
  } catch (e) {
    showToast('Simulator Toggle Failed', e.message, 'error');
  }
}

/* ==========================================================================
   12. Background Real-Time Poller (Refreshes LED Bus & Telemetry)
   ========================================================================== */
function startDevicePolling() {
  setInterval(async () => {
    if (!window.GlowControl.isPolling) return;
    await fetchLiveDeviceStatus(false);
  }, 2000);
}

async function fetchLiveDeviceStatus(showError = false) {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) return;

    const json = await res.json();
    if (!json.success || !json.data) return;

    const data = json.data;
    const device = data.device;

    // 1. Update 5-LED hardware visualizer indicators
    if (device && Array.isArray(device.ledStates)) {
      device.ledStates.forEach((state, idx) => {
        const pinNum = idx + 1;
        const ledNode = document.getElementById(`led-indicator-${pinNum}`);
        const stateText = document.getElementById(`led-state-text-${pinNum}`);

        if (ledNode) {
          if (state === 1) {
            ledNode.classList.add('active-led');
          } else {
            ledNode.classList.remove('active-led');
          }
        }
        if (stateText) {
          stateText.textContent = state === 1 ? 'HIGH' : 'LOW';
          stateText.className = `text-[10px] font-mono font-medium ${state === 1 ? 'text-accent' : 'text-slate-500'}`;
        }
      });
    }

    // 2. Update Header Status Badge
    const statusText = document.getElementById('device-status-text');
    const wifiText = document.getElementById('wifi-status-text');
    const syncTime = document.getElementById('last-sync-time');

    if (statusText) statusText.textContent = device.statusLabel;
    if (wifiText) wifiText.textContent = device.wifiStatus;
    if (syncTime && device.lastCommunicationTime) {
      syncTime.textContent = new Date(device.lastCommunicationTime).toLocaleTimeString();
    }

    // 3. Update Metric Card Values on Overview Page
    const metricStatus = document.getElementById('metric-device-status');
    const metricWifi = document.getElementById('metric-wifi-status');
    const metricEffId = document.getElementById('metric-effect-id');
    const metricEffName = document.getElementById('metric-effect-name');
    const metricSpeed = document.getElementById('metric-speed');
    const metricAuto = document.getElementById('metric-auto-mode');
    const metricLastComm = document.getElementById('metric-last-comm');
    const activeEffPill = document.getElementById('active-effect-pill');

    if (metricStatus) metricStatus.textContent = device.statusLabel;
    if (metricWifi) metricWifi.textContent = device.wifiStatus;
    if (metricEffId) metricEffId.textContent = device.currentEffectId;
    if (metricEffName) metricEffName.textContent = device.currentEffectName;
    if (metricSpeed) metricSpeed.textContent = device.speedMs;
    if (metricAuto) metricAuto.textContent = device.autoMode ? 'Enabled' : 'Disabled';
    if (metricLastComm && device.lastCommunicationTime) {
      metricLastComm.textContent = new Date(device.lastCommunicationTime).toLocaleTimeString();
    }
    if (activeEffPill) activeEffPill.textContent = `#${device.currentEffectId} ${device.currentEffectName}`;

    // 4. Update Quick Lock and Auto Mode Button state
    const quickAutoLabel = document.getElementById('quick-auto-label');
    if (quickAutoLabel) {
      quickAutoLabel.textContent = device.autoMode ? 'Auto: ON' : 'Auto: OFF';
    }
    const quickLockBtn = document.getElementById('quick-lock-btn');
    const quickLockLabel = document.getElementById('quick-lock-label');
    if (quickLockBtn && quickLockLabel) {
      if (device.isLocked) {
        quickLockBtn.setAttribute('data-quick-cmd', 'unlock');
        quickLockLabel.textContent = 'Unlock';
      } else {
        quickLockBtn.setAttribute('data-quick-cmd', 'lock');
        quickLockLabel.textContent = 'Lock Pattern';
      }
    }

  } catch (err) {
    if (showError) console.error('[Polling Error]', err);
  }
}

/* ==========================================================================
   13. Overview Chart.js Initialization
   ========================================================================== */
function initOverviewChart() {
  const canvas = document.getElementById('overviewActivityChart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Chart configuration for telemetry and command distribution
  const ctx = canvas.getContext('2d');
  const gradientCyan = ctx.createLinearGradient(0, 0, 0, 200);
  gradientCyan.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  gradientCyan.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  const gradientPurple = ctx.createLinearGradient(0, 0, 0, 200);
  gradientPurple.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
  gradientPurple.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

  // Dummy activity points or initial data
  const labels = ['-14s', '-12s', '-10s', '-8s', '-6s', '-4s', '-2s', 'Now'];
  const effectData = [1, 1, 2, 2, 3, 3, 3, 3];
  const speedData = [150, 150, 150, 150, 120, 120, 100, 100];

  window.GlowControl.activeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Effect Number (#)',
          data: effectData,
          borderColor: '#38BDF8',
          backgroundColor: gradientCyan,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#38BDF8',
          pointRadius: 3,
          yAxisID: 'y'
        },
        {
          label: 'Speed (ms)',
          data: speedData,
          borderColor: '#8B5CF6',
          backgroundColor: gradientPurple,
          borderWidth: 1.5,
          borderDash: [4, 4],
          fill: false,
          tension: 0.2,
          pointBackgroundColor: '#8B5CF6',
          pointRadius: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: '#1E293B',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(30, 41, 59, 0.4)'
          },
          ticks: {
            color: '#64748B',
            font: { size: 10, family: 'monospace' }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 1,
          max: 50,
          grid: {
            color: 'rgba(30, 41, 59, 0.4)'
          },
          ticks: {
            color: '#38BDF8',
            font: { size: 10, family: 'monospace' },
            stepSize: 10
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: 1000,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#8B5CF6',
            font: { size: 10, family: 'monospace' }
          }
        }
      }
    }
  });
}
