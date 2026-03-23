(function () {
  'use strict';

  // ============================================================
  // CONFIG — Replace these with your Supabase project credentials
  // ============================================================
  const SUPABASE_URL = 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

  const LS_PREFIX = 'bench:';
  const SYNC_KEYS = ['nk:settings', 'nk:sessions', 'nk:prs', 'nk:programmes'];
  const SYNC_TS_PREFIX = 'bench_sync_ts:';

  // ============================================================
  // Supabase Client
  // ============================================================
  let sb = null;
  function getClient() {
    if (!sb && window.supabase) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return sb;
  }

  // ============================================================
  // Write Queue (offline resilience)
  // ============================================================
  const writeQueue = [];
  let retryTimer = null;

  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimeout(async function () {
      retryTimer = null;
      const client = getClient();
      if (!client) return;
      const { data } = await client.auth.getSession();
      if (!data.session) return;

      const pending = writeQueue.splice(0);
      for (const item of pending) {
        try {
          await client.from('user_data').upsert({
            user_id: data.session.user.id,
            key: item.key,
            value: JSON.parse(item.value),
            updated_at: item.timestamp
          }, { onConflict: 'user_id,key' });
        } catch (_) {
          writeQueue.push(item);
        }
      }
      if (writeQueue.length > 0) scheduleRetry();
    }, 5000);
  }

  window.addEventListener('online', function () { scheduleRetry(); });

  // ============================================================
  // Sync to Supabase (fire-and-forget on each write)
  // ============================================================
  async function syncToSupabase(key, value) {
    var client = getClient();
    if (!client) return;
    var sess = await client.auth.getSession();
    if (!sess.data.session) return;

    var now = new Date().toISOString();
    localStorage.setItem(SYNC_TS_PREFIX + key, now);

    try {
      await client.from('user_data').upsert({
        user_id: sess.data.session.user.id,
        key: key,
        value: JSON.parse(value),
        updated_at: now
      }, { onConflict: 'user_id,key' });
    } catch (_) {
      writeQueue.push({ key: key, value: value, timestamp: now });
      scheduleRetry();
    }
  }

  async function deleteFromSupabase(key) {
    var client = getClient();
    if (!client) return;
    var sess = await client.auth.getSession();
    if (!sess.data.session) return;
    try {
      await client.from('user_data')
        .delete()
        .eq('user_id', sess.data.session.user.id)
        .eq('key', key);
    } catch (_) { /* silent */ }
  }

  // ============================================================
  // Initial Sync (on login / page load with session)
  // ============================================================
  let syncInProgress = false;

  async function performInitialSync() {
    var client = getClient();
    if (!client || syncInProgress) return;
    syncInProgress = true;

    try {
      var sess = await client.auth.getSession();
      if (!sess.data.session) { syncInProgress = false; return; }

      var userId = sess.data.session.user.id;
      var { data: remoteData, error } = await client
        .from('user_data')
        .select('key, value, updated_at')
        .eq('user_id', userId);

      if (error) { syncInProgress = false; return; }

      var dataChanged = false;

      for (var i = 0; i < SYNC_KEYS.length; i++) {
        var key = SYNC_KEYS[i];
        var remote = remoteData ? remoteData.find(function (r) { return r.key === key; }) : null;
        var localRaw = localStorage.getItem(LS_PREFIX + key);
        var localTimestamp = localStorage.getItem(SYNC_TS_PREFIX + key);

        if (remote && !localRaw) {
          // Remote exists, local empty — take remote
          localStorage.setItem(LS_PREFIX + key, JSON.stringify(remote.value));
          localStorage.setItem(SYNC_TS_PREFIX + key, remote.updated_at);
          dataChanged = true;
        } else if (!remote && localRaw) {
          // Local exists, remote empty — push local to remote
          await syncToSupabase(key, localRaw);
        } else if (remote && localRaw) {
          // Both exist — compare timestamps, latest wins
          var remoteTime = new Date(remote.updated_at).getTime();
          var localTime = localTimestamp ? new Date(localTimestamp).getTime() : 0;

          if (remoteTime > localTime) {
            localStorage.setItem(LS_PREFIX + key, JSON.stringify(remote.value));
            localStorage.setItem(SYNC_TS_PREFIX + key, remote.updated_at);
            dataChanged = true;
          } else if (localTime > remoteTime) {
            await syncToSupabase(key, localRaw);
          }
        }
      }

      // Flush any queued writes
      if (writeQueue.length > 0) scheduleRetry();

      updateSyncStatus('synced');

      // Reload if remote data was newer, so React picks up the new localStorage values
      if (dataChanged) {
        window.location.reload();
      }
    } catch (_) {
      updateSyncStatus('error');
    }
    syncInProgress = false;
  }

  // Re-sync when tab becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      performInitialSync();
    }
  });

  // ============================================================
  // window.storage — intercepts all app reads/writes
  // ============================================================
  window.storage = {
    get: async function (key) {
      var raw = localStorage.getItem(LS_PREFIX + key);
      if (raw === null) throw new Error('Key not found');
      return { key: key, value: raw };
    },

    set: async function (key, value) {
      try {
        var strValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(LS_PREFIX + key, strValue);

        if (SYNC_KEYS.indexOf(key) !== -1) {
          updateSyncStatus('syncing');
          syncToSupabase(key, strValue).then(function () {
            updateSyncStatus('synced');
          });
        }

        return { key: key, value: value };
      } catch (_) {
        return null;
      }
    },

    delete: async function (key) {
      localStorage.removeItem(LS_PREFIX + key);
      deleteFromSupabase(key);
      return { key: key, deleted: true };
    },

    list: async function (prefix) {
      var keys = Object.keys(localStorage)
        .filter(function (k) { return k.startsWith(LS_PREFIX + (prefix || '')); })
        .map(function (k) { return k.replace(LS_PREFIX, ''); });
      return { keys: keys };
    }
  };

  // ============================================================
  // Auth UI — injected into the DOM
  // ============================================================
  var authBtn = null;
  var syncDot = null;

  function updateSyncStatus(status) {
    if (!syncDot) return;
    var colors = { synced: '#34C759', syncing: '#FF9500', error: '#FF3B30' };
    syncDot.style.background = colors[status] || '#6B6B6B';
  }

  function updateAuthUI(user) {
    if (!authBtn) return;
    if (user) {
      var initial = (user.email || '?')[0].toUpperCase();
      authBtn.innerHTML = '';
      // Sync dot
      syncDot = document.createElement('span');
      syncDot.style.cssText = 'display:inline-block;width:6px;height:6px;border-radius:50%;background:#34C759;margin-right:8px;';
      authBtn.appendChild(syncDot);
      // User initial
      var txt = document.createTextNode(initial);
      authBtn.appendChild(txt);
      authBtn.style.color = '#FFFFFF';
    } else {
      syncDot = null;
      authBtn.textContent = 'SIGN IN';
      authBtn.style.color = '#9B9B9B';
    }
  }

  function createAuthButton() {
    authBtn = document.createElement('div');
    authBtn.id = 'bench-sync-btn';
    authBtn.style.cssText =
      'position:fixed;bottom:80px;right:16px;z-index:9999;' +
      'background:#1A1A1A;border:1px solid #3A3A3A;border-radius:20px;' +
      'padding:8px 14px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      'font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;' +
      'color:#9B9B9B;cursor:pointer;user-select:none;';
    authBtn.textContent = 'SIGN IN';
    authBtn.addEventListener('click', toggleAuthModal);
    document.body.appendChild(authBtn);
  }

  // ============================================================
  // Auth Modal
  // ============================================================
  var modalEl = null;
  var isSignUp = false;

  function toggleAuthModal() {
    var client = getClient();
    if (!client) return;

    // If logged in, show account menu instead
    client.auth.getSession().then(function (res) {
      if (res.data.session) {
        showAccountMenu(res.data.session.user);
      } else {
        showAuthModal();
      }
    });
  }

  function showAccountMenu(user) {
    if (modalEl) { closeModal(); return; }

    modalEl = document.createElement('div');
    modalEl.id = 'bench-sync-modal';
    modalEl.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;';
    modalEl.addEventListener('click', function (e) { if (e.target === modalEl) closeModal(); });

    var card = document.createElement('div');
    card.style.cssText = 'background:#1A1A1A;border-radius:12px;padding:32px;width:min(320px,85vw);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;';

    card.innerHTML =
      '<div style="font-size:10px;font-weight:800;letter-spacing:2px;color:#9B9B9B;text-transform:uppercase;margin-bottom:20px;">ACCOUNT</div>' +
      '<div style="color:#fff;font-size:14px;margin-bottom:20px;word-break:break-all;">' + (user.email || '') + '</div>' +
      '<button id="bs-signout" style="width:100%;background:#2A2A2A;color:#FF3B30;border:1px solid #3A3A3A;border-radius:4px;padding:14px;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase;">SIGN OUT</button>';

    modalEl.appendChild(card);
    document.body.appendChild(modalEl);

    document.getElementById('bs-signout').addEventListener('click', function () {
      getClient().auth.signOut().then(function () {
        updateAuthUI(null);
        closeModal();
      });
    });
  }

  function showAuthModal() {
    if (modalEl) { closeModal(); return; }
    isSignUp = false;

    modalEl = document.createElement('div');
    modalEl.id = 'bench-sync-modal';
    modalEl.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;';
    modalEl.addEventListener('click', function (e) { if (e.target === modalEl) closeModal(); });

    var card = document.createElement('div');
    card.style.cssText = 'background:#1A1A1A;border-radius:12px;padding:32px;width:min(320px,85vw);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;';

    card.innerHTML =
      '<div id="bs-title" style="font-size:10px;font-weight:800;letter-spacing:2px;color:#9B9B9B;text-transform:uppercase;margin-bottom:20px;">SIGN IN TO BENCH</div>' +
      '<input id="bs-email" type="email" placeholder="Email" autocomplete="email" style="' +
        'width:100%;box-sizing:border-box;background:#2A2A2A;border:1px solid #3A3A3A;' +
        'border-radius:4px;padding:12px;color:#fff;font-size:14px;font-family:inherit;margin-bottom:10px;outline:none;" />' +
      '<input id="bs-password" type="password" placeholder="Password" autocomplete="current-password" style="' +
        'width:100%;box-sizing:border-box;background:#2A2A2A;border:1px solid #3A3A3A;' +
        'border-radius:4px;padding:12px;color:#fff;font-size:14px;font-family:inherit;margin-bottom:16px;outline:none;" />' +
      '<div id="bs-error" style="color:#FF3B30;font-size:12px;margin-bottom:10px;display:none;"></div>' +
      '<button id="bs-submit" style="' +
        'width:100%;background:#FA5400;color:#fff;border:none;border-radius:4px;padding:14px;' +
        'font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase;">SIGN IN</button>' +
      '<div style="text-align:center;margin-top:14px;">' +
        '<span id="bs-toggle" style="color:#6B6B6B;font-size:11px;cursor:pointer;">' +
          'Don\'t have an account? <span style="color:#FA5400;">Sign up</span>' +
        '</span>' +
      '</div>';

    modalEl.appendChild(card);
    document.body.appendChild(modalEl);

    // Wire events
    document.getElementById('bs-submit').addEventListener('click', handleSubmit);
    document.getElementById('bs-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSubmit();
    });
    document.getElementById('bs-toggle').addEventListener('click', function () {
      isSignUp = !isSignUp;
      document.getElementById('bs-title').textContent = isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN TO BENCH';
      document.getElementById('bs-submit').textContent = isSignUp ? 'SIGN UP' : 'SIGN IN';
      document.getElementById('bs-password').setAttribute('autocomplete', isSignUp ? 'new-password' : 'current-password');
      document.getElementById('bs-toggle').innerHTML = isSignUp
        ? 'Already have an account? <span style="color:#FA5400;">Sign in</span>'
        : 'Don\'t have an account? <span style="color:#FA5400;">Sign up</span>';
      document.getElementById('bs-error').style.display = 'none';
    });

    document.getElementById('bs-email').focus();
  }

  async function handleSubmit() {
    var email = document.getElementById('bs-email').value.trim();
    var password = document.getElementById('bs-password').value;
    var errEl = document.getElementById('bs-error');
    var btn = document.getElementById('bs-submit');

    if (!email || !password) {
      errEl.textContent = 'Please enter email and password.';
      errEl.style.display = 'block';
      return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = isSignUp ? 'CREATING...' : 'SIGNING IN...';
    errEl.style.display = 'none';

    var client = getClient();
    var result;

    if (isSignUp) {
      result = await client.auth.signUp({ email: email, password: password });
    } else {
      result = await client.auth.signInWithPassword({ email: email, password: password });
    }

    if (result.error) {
      errEl.textContent = result.error.message;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = isSignUp ? 'SIGN UP' : 'SIGN IN';
      return;
    }

    closeModal();
    // Auth state change listener will handle sync + UI update
  }

  function closeModal() {
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
  }

  // ============================================================
  // Init — wait for DOM, then set up auth listener + UI
  // ============================================================
  function init() {
    var client = getClient();
    if (!client) return;

    createAuthButton();

    // Listen for auth state changes
    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' && session) {
        updateAuthUI(session.user);
        performInitialSync();
      } else if (event === 'SIGNED_OUT') {
        updateAuthUI(null);
      }
    });

    // Check for existing session on load
    client.auth.getSession().then(function (res) {
      if (res.data.session) {
        updateAuthUI(res.data.session.user);
        performInitialSync();
      }
    });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
