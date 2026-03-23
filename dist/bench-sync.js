(function () {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const SUPABASE_URL = 'https://bxfrghqxkxzaibjavykl.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZnJnaHF4a3h6YWliamF2eWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTcyNTQsImV4cCI6MjA4OTg3MzI1NH0.r-DycVwQFyHmjraPwLiuyRw0VPypvtefVI9obiGvp9s';

  const LS_PREFIX = 'bench:';
  const SYNC_KEYS = ['nk:settings', 'nk:sessions', 'nk:prs', 'nk:programmes'];
  const SYNC_TS_PREFIX = 'bench_sync_ts:';

  // ============================================================
  // Hide the app until authenticated
  // ============================================================
  var styleTag = document.createElement('style');
  styleTag.textContent = '#root { display: none !important; } #bench-gate { display: flex; }';
  document.head.appendChild(styleTag);

  function showApp() {
    styleTag.textContent = '#root { display: block !important; } #bench-gate { display: none !important; }';
  }

  function hideApp() {
    styleTag.textContent = '#root { display: none !important; } #bench-gate { display: flex; }';
  }

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
          localStorage.setItem(LS_PREFIX + key, JSON.stringify(remote.value));
          localStorage.setItem(SYNC_TS_PREFIX + key, remote.updated_at);
          dataChanged = true;
        } else if (!remote && localRaw) {
          await syncToSupabase(key, localRaw);
        } else if (remote && localRaw) {
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

      if (writeQueue.length > 0) scheduleRetry();

      // Show the app now that sync is done
      showApp();

      // Reload if remote data was newer so React picks up new localStorage
      if (dataChanged) {
        window.location.reload();
      }
    } catch (_) { /* silent */ }
    syncInProgress = false;
  }

  // Re-sync when tab becomes visible
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
          syncToSupabase(key, strValue);
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
  // Auth Gate — full-screen landing page
  // ============================================================
  var isSignUp = false;

  function createGate() {
    var gate = document.createElement('div');
    gate.id = 'bench-gate';
    gate.style.cssText =
      'position:fixed;inset:0;z-index:10000;background:#0A0A0A;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;';

    gate.innerHTML =
      '<div style="width:min(320px,85vw);text-align:center;">' +
        // Logo
        '<div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#FFFFFF;text-transform:uppercase;margin-bottom:48px;">BENCH</div>' +
        // Form
        '<input id="bs-email" type="email" placeholder="Email" autocomplete="email" style="' +
          'width:100%;box-sizing:border-box;background:#1A1A1A;border:1px solid #2A2A2A;' +
          'border-radius:8px;padding:14px 16px;color:#fff;font-size:15px;font-family:inherit;' +
          'margin-bottom:10px;outline:none;" />' +
        '<input id="bs-password" type="password" placeholder="Password" autocomplete="current-password" style="' +
          'width:100%;box-sizing:border-box;background:#1A1A1A;border:1px solid #2A2A2A;' +
          'border-radius:8px;padding:14px 16px;color:#fff;font-size:15px;font-family:inherit;' +
          'margin-bottom:16px;outline:none;" />' +
        '<div id="bs-error" style="color:#FF3B30;font-size:13px;margin-bottom:12px;display:none;"></div>' +
        '<button id="bs-submit" style="' +
          'width:100%;background:#FA5400;color:#fff;border:none;border-radius:8px;padding:16px;' +
          'font-size:13px;font-weight:800;letter-spacing:2px;cursor:pointer;font-family:inherit;' +
          'text-transform:uppercase;">SIGN IN</button>' +
        '<div style="margin-top:20px;">' +
          '<span id="bs-toggle" style="color:#6B6B6B;font-size:12px;cursor:pointer;">' +
            'Don\'t have an account? <span style="color:#FA5400;">Sign up</span>' +
          '</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(gate);

    // Wire events
    document.getElementById('bs-submit').addEventListener('click', handleSubmit);
    document.getElementById('bs-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSubmit();
    });
    document.getElementById('bs-email').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('bs-password').focus();
    });
    document.getElementById('bs-toggle').addEventListener('click', function () {
      isSignUp = !isSignUp;
      document.getElementById('bs-submit').textContent = isSignUp ? 'SIGN UP' : 'SIGN IN';
      document.getElementById('bs-password').setAttribute('autocomplete', isSignUp ? 'new-password' : 'current-password');
      document.getElementById('bs-toggle').innerHTML = isSignUp
        ? 'Already have an account? <span style="color:#FA5400;">Sign in</span>'
        : 'Don\'t have an account? <span style="color:#FA5400;">Sign up</span>';
      document.getElementById('bs-error').style.display = 'none';
    });
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
    btn.style.opacity = '0.6';
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
      btn.style.opacity = '1';
      btn.textContent = isSignUp ? 'SIGN UP' : 'SIGN IN';
      return;
    }

    // Auth state change listener handles showing the app
  }

  // ============================================================
  // Account button (shown when logged in, inside the app)
  // ============================================================
  function createAccountButton(user) {
    var existing = document.getElementById('bench-sync-btn');
    if (existing) existing.remove();

    var btn = document.createElement('div');
    btn.id = 'bench-sync-btn';
    btn.style.cssText =
      'position:fixed;bottom:80px;right:16px;z-index:9999;' +
      'background:#1A1A1A;border:1px solid #3A3A3A;border-radius:20px;' +
      'padding:8px 14px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
      'font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;' +
      'color:#FFFFFF;cursor:pointer;user-select:none;';

    var dot = document.createElement('span');
    dot.id = 'bench-sync-dot';
    dot.style.cssText = 'display:inline-block;width:6px;height:6px;border-radius:50%;background:#34C759;margin-right:8px;';
    btn.appendChild(dot);

    var initial = (user.email || '?')[0].toUpperCase();
    btn.appendChild(document.createTextNode(initial));

    btn.addEventListener('click', function () {
      showAccountModal(user);
    });

    document.body.appendChild(btn);
  }

  function showAccountModal(user) {
    // Remove existing modal if any
    var existing = document.getElementById('bench-account-modal');
    if (existing) { existing.remove(); return; }

    var overlay = document.createElement('div');
    overlay.id = 'bench-account-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;';
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });

    var card = document.createElement('div');
    card.style.cssText = 'background:#1A1A1A;border-radius:12px;padding:32px;width:min(320px,85vw);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;';

    card.innerHTML =
      '<div style="font-size:10px;font-weight:800;letter-spacing:2px;color:#9B9B9B;text-transform:uppercase;margin-bottom:20px;">ACCOUNT</div>' +
      '<div style="color:#fff;font-size:14px;margin-bottom:24px;word-break:break-all;">' + (user.email || '') + '</div>' +
      '<button id="bs-signout" style="width:100%;background:#2A2A2A;color:#FF3B30;border:1px solid #3A3A3A;border-radius:8px;padding:14px;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;font-family:inherit;text-transform:uppercase;">SIGN OUT</button>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    document.getElementById('bs-signout').addEventListener('click', function () {
      getClient().auth.signOut().then(function () {
        overlay.remove();
        var accBtn = document.getElementById('bench-sync-btn');
        if (accBtn) accBtn.remove();
        hideApp();
        // Reset the gate form
        var emailInput = document.getElementById('bs-email');
        var passInput = document.getElementById('bs-password');
        var errEl = document.getElementById('bs-error');
        var submitBtn = document.getElementById('bs-submit');
        if (emailInput) emailInput.value = '';
        if (passInput) passInput.value = '';
        if (errEl) errEl.style.display = 'none';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; submitBtn.textContent = 'SIGN IN'; }
        isSignUp = false;
      });
    });
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    var client = getClient();
    if (!client) return;

    createGate();

    // Listen for auth state changes
    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' && session) {
        createAccountButton(session.user);
        performInitialSync();
      } else if (event === 'SIGNED_OUT') {
        hideApp();
      }
    });

    // Check for existing session on load
    client.auth.getSession().then(function (res) {
      if (res.data.session) {
        createAccountButton(res.data.session.user);
        performInitialSync();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
