/* =========================================================
   SUPREME LENDING — Shared JS
   - Mobile nav toggle
   - Active link highlight
   - Scripted FAQ chatbot
   - Mortgage calculators (Affordability, Payment, Refi, VA Entitlement)
   - CSV-driven loan officer directory
   ========================================================= */

(function () {
  'use strict';

  /* -------- Mobile nav toggle -------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.nav-toggle');
    if (t) {
      var nav = document.getElementById('primary-nav');
      if (nav) nav.classList.toggle('is-open');
    }
  });

  /* -------- Active link -------- */
  document.addEventListener('DOMContentLoaded', function () {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav__link').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (!href) return;
      var hereName = here.replace('.html', '');
      var linkName = href.split('/').pop().replace('.html', '');
      if (hereName && linkName && hereName === linkName) a.classList.add('is-active');
    });
  });

  /* =========================================================
     CHATBOT — scripted FAQ
     ========================================================= */
  // Order matters: more specific patterns first. Word boundaries on short
  // tokens (\blo\b, \bva\b) so they don't match inside "loan", "have", etc.
  var FAQ = [
    { match: /\b(hi|hello|hey|start)\b/i,
      reply: "Hi! I'm Supreme Lending's virtual assistant. I can share general info on the homebuying process, document checklists, our loan options, and how to reach us. What would you like to know?" },
    { match: /(rate|apr|interest)/i,
      reply: "Rates change throughout the day and depend on your specific scenario. I can't quote rates here — please connect with a loan officer in our Directory for a personalized quote." },
    { match: /(document|paperwork|checklist)/i,
      reply: "Typical items include: 30 days of pay stubs, 2 years W-2s and tax returns, 2 months of bank/asset statements, and a photo ID. Self-employed borrowers may need additional business documentation." },
    { match: /(process|steps|how long|timeline)/i,
      reply: "The mortgage process generally has six steps: Pre-Approval, Home Shopping, Application, Processing, Underwriting, and Closing. Visit Homebuyer Resources › Process for details." },
    // Loan Options FIRST — must match before Loan Officer Directory
    { match: /(loan option|loan product|loan program|fha|usda|conventional|jumbo|renovation|\bproduct\b)/i,
      reply: "We offer Conventional, FHA, VA, USDA, Jumbo, and specialty programs including renovation loans. Visit the Loan Options page from the menu for details. Eligibility varies by borrower and property." },
    { match: /(loan officer|find a loan officer|find someone|directory|\blo\b)/i,
      reply: "Our Loan Officer Directory lets you search by name, city, ZIP, or state. Use the 'Find a Loan Officer' link in the top right." },
    { match: /(calculator|monthly payment|afford|refi|refinance|va entitlement)/i,
      reply: "We have four calculators: Affordability, Monthly Payment, Refinance, and VA Entitlement. Open the Calculators page from the menu." },
    { match: /(prequalif|pre-?qualif|preapprov|pre-?approv)/i,
      reply: "Pre-approval estimates how much you may be able to borrow based on submitted documentation. It's not a commitment to lend. A loan officer can walk you through the steps." },
    { match: /(contact|email|phone|reach)/i,
      reply: "You can reach us at info@supremelending.com or use the Contact form. We'll route your message to the right team." },
    { match: /(career|job|hiring|recruit)/i,
      reply: "Visit careers.supremelending.com to learn about open roles and the Supreme Lending culture." },
    { match: /(privacy|data|secure)/i,
      reply: "We treat your information as confidential. For full details, see our Privacy Policy in the footer." },
    { match: /(thank|thanks|bye|goodbye)/i,
      reply: "You're welcome! Have a great day — we're here whenever you need us." }
  ];

  var DEFAULT_REPLY = "I'm not sure I have a great answer for that here. For specific questions, please email info@supremelending.com or contact a loan officer from our Directory.";

  function botReply(text) {
    var hit = FAQ.find(function (f) { return f.match.test(text); });
    return hit ? hit.reply : DEFAULT_REPLY;
  }

  // Tiny SVG avatar (white house mark) for bot messages
  var BOT_AVATAR_SVG =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">' +
      '<path d="M12 3L3 11v10h7v-6h4v6h7V11L12 3z" fill="#ffffff"/>' +
    '</svg>';

  function appendMsg(body, text, who) {
    var row = document.createElement('div');
    row.className = 'chat-msg-row ' + who;

    if (who === 'bot') {
      var avatar = document.createElement('span');
      avatar.className = 'chat-avatar';
      avatar.innerHTML = BOT_AVATAR_SVG;
      row.appendChild(avatar);
    }

    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + who;
    msg.textContent = text;
    row.appendChild(msg);

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  function appendTyping(body) {
    var row = document.createElement('div');
    row.className = 'chat-msg-row bot';

    var avatar = document.createElement('span');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = BOT_AVATAR_SVG;
    row.appendChild(avatar);

    var typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(typing);

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  function initChat() {
    var fab    = document.getElementById('chatFab');
    var win    = document.getElementById('chatWin');
    var close  = document.getElementById('chatClose');
    var body   = document.getElementById('chatBody');
    var input  = document.getElementById('chatInput');
    var send   = document.getElementById('chatSend');
    var quick  = document.getElementById('chatQuick');
    var badge  = document.getElementById('chatBadge');
    var tip    = document.getElementById('chatTip');
    if (!fab || !win) return;

    // Pop in the "Need help?" tooltip after a short delay, hide on first interaction
    var tipTimer = setTimeout(function () { if (tip) tip.classList.add('is-visible'); }, 4000);
    function hideTip() {
      clearTimeout(tipTimer);
      if (tip) tip.classList.remove('is-visible');
    }

    fab.addEventListener('click', function () {
      win.classList.toggle('is-open');
      fab.classList.toggle('is-active', win.classList.contains('is-open'));
      if (badge) badge.classList.add('is-hidden');
      hideTip();
    });
    close.addEventListener('click', function () {
      win.classList.remove('is-open');
      fab.classList.remove('is-active');
    });

    function botReplyAfterTyping(text) {
      var typingRow = appendTyping(body);
      var delay = 600 + Math.min(1200, text.length * 12);
      setTimeout(function () {
        typingRow.parentNode && typingRow.parentNode.removeChild(typingRow);
        appendMsg(body, botReply(text), 'bot');
      }, delay);
    }

    function userSays(t) {
      if (!t || !t.trim()) return;
      appendMsg(body, t, 'user');
      botReplyAfterTyping(t);
    }

    send.addEventListener('click', function () {
      var v = input.value; input.value = ''; userSays(v);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); send.click(); }
    });
    if (quick) {
      quick.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]');
        if (b) userSays(b.getAttribute('data-q'));
      });
    }

    // Greeting
    appendMsg(body, "Hi there! 👋 I'm the Supreme Assistant. Ask me about the homebuying process, documents, calculators, or how to reach a loan officer.", 'bot');
  }
  document.addEventListener('DOMContentLoaded', initChat);

  /* =========================================================
     CALCULATORS
     ========================================================= */
  function fmtUSD(n) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }
  function fmtUSD2(n) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  }
  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  // Standard amortized monthly P&I
  function monthlyPI(principal, annualRatePct, years) {
    var r = (annualRatePct / 100) / 12;
    var n = years * 12;
    if (r === 0) return n ? principal / n : 0;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  /* ---- Tabs ---- */
  function initCalcTabs() {
    var tabs = document.querySelectorAll('.calc-tab');
    if (!tabs.length) return;
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('.calc-tab').forEach(function (x) { x.classList.remove('is-active'); });
        document.querySelectorAll('.calc-panel').forEach(function (x) { x.classList.remove('is-active'); });
        t.classList.add('is-active');
        var id = t.getAttribute('data-target');
        var panel = document.getElementById(id);
        if (panel) panel.classList.add('is-active');
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initCalcTabs);

  /* ---- Affordability ----
     Approx max purchase price using 36% DTI on housing+other debts.
     Uses user-entered taxes/insurance % and rate. */
  window.calcAffordability = function () {
    var income      = num('aff-income');           // monthly
    var debts       = num('aff-debts');             // monthly
    var down        = num('aff-down');              // dollars
    var rate        = num('aff-rate');              // %
    var years       = num('aff-term') || 30;
    var taxIns      = num('aff-taxins') || 1.5;     // % of home value annual (tax+ins+HOA est)
    var dti         = (num('aff-dti') || 36) / 100;

    var maxHousing = Math.max(0, income * dti - debts);
    // housing = P&I + (taxIns/12) * homeValue ; homeValue = loan + down
    // try iterative solve
    var lo = 0, hi = 5_000_000, mid;
    for (var i = 0; i < 60; i++) {
      mid = (lo + hi) / 2;
      var loan = Math.max(0, mid - down);
      var pi   = monthlyPI(loan, rate, years);
      var ti   = (taxIns / 100 / 12) * mid;
      var total = pi + ti;
      if (total > maxHousing) hi = mid; else lo = mid;
    }
    var price = mid;
    var loan  = Math.max(0, price - down);
    var pi    = monthlyPI(loan, rate, years);
    var ti    = (taxIns / 100 / 12) * price;

    document.getElementById('aff-result').innerHTML =
      'Estimated home price: <strong>' + fmtUSD(price) + '</strong><br>' +
      'Estimated loan amount: ' + fmtUSD(loan) + '<br>' +
      'Estimated monthly housing (PITI est.): ' + fmtUSD2(pi + ti) +
      ' <span class="muted">(P&amp;I ' + fmtUSD2(pi) + ' + taxes/insurance est. ' + fmtUSD2(ti) + ')</span>';
  };

  /* ---- Payment ---- */
  window.calcPayment = function () {
    var price  = num('pay-price');
    var down   = num('pay-down');
    var rate   = num('pay-rate');
    var years  = num('pay-term') || 30;
    var taxAnn = num('pay-tax');         // annual $
    var insAnn = num('pay-ins');         // annual $
    var hoaMo  = num('pay-hoa');         // monthly $

    var loan = Math.max(0, price - down);
    var pi   = monthlyPI(loan, rate, years);
    var t    = taxAnn / 12;
    var i    = insAnn / 12;
    var total = pi + t + i + hoaMo;

    document.getElementById('pay-result').innerHTML =
      'Estimated monthly payment: <strong>' + fmtUSD2(total) + '</strong><br>' +
      'Principal &amp; Interest: ' + fmtUSD2(pi) + '<br>' +
      'Taxes: ' + fmtUSD2(t) + ' &middot; Insurance: ' + fmtUSD2(i) + ' &middot; HOA: ' + fmtUSD2(hoaMo) + '<br>' +
      'Loan amount: ' + fmtUSD(loan);
  };

  /* ---- Refinance ---- */
  window.calcRefi = function () {
    var balance  = num('refi-balance');
    var curRate  = num('refi-cur-rate');
    var curYears = num('refi-cur-years');     // remaining
    var newRate  = num('refi-new-rate');
    var newYears = num('refi-new-years') || 30;
    var costs    = num('refi-costs');

    var curPmt = monthlyPI(balance, curRate, curYears);
    var newPmt = monthlyPI(balance, newRate, newYears);
    var save   = curPmt - newPmt;
    var be     = save > 0 ? Math.ceil(costs / save) : Infinity;

    document.getElementById('refi-result').innerHTML =
      'Current monthly P&amp;I: ' + fmtUSD2(curPmt) + '<br>' +
      'New monthly P&amp;I: <strong>' + fmtUSD2(newPmt) + '</strong><br>' +
      'Monthly difference: ' + (save >= 0 ? fmtUSD2(save) + ' lower' : fmtUSD2(-save) + ' higher') + '<br>' +
      'Estimated break-even: ' + (isFinite(be) ? be + ' months' : 'N/A') +
      '<div class="muted" style="margin-top:8px;font-size:13px;">Does not include changes in loan term cost or tax effects. Educational only.</div>';
  };

  /* ---- VA Entitlement (simplified) ----
     2024+ guidance: full-entitlement borrowers have no VA loan limit.
     For partial entitlement (existing VA loan in use), available guaranty
     is generally 25% of the county loan limit minus entitlement already used.
     Lender approves the actual loan; this is an estimate only. */
  window.calcVA = function () {
    var first   = document.getElementById('va-first').value === 'yes';
    var hasOpen = document.getElementById('va-open').value === 'yes';
    var loanLimit = num('va-county') || 766550;     // user-supplied county limit; default 2024 baseline
    var prior   = num('va-prior');                  // entitlement charged on existing VA loan
    var price   = num('va-price');

    var html = '';
    if (first || !hasOpen) {
      html =
        'Status: <strong>Full entitlement</strong><br>' +
        'For full-entitlement borrowers, VA does not impose a loan limit on the borrower; lenders use their own underwriting standards. ' +
        '<div class="muted" style="margin-top:8px;font-size:13px;">No down payment is generally required for purchases at or below the property value, subject to lender approval and funding fee rules.</div>';
    } else {
      var maxGuaranty = loanLimit * 0.25;
      var available   = Math.max(0, maxGuaranty - prior);
      var maxNoDown   = available * 4; // 25% guaranty rule of thumb
      var down = Math.max(0, (price - maxNoDown) * 0.25);
      html =
        'Status: <strong>Partial entitlement</strong><br>' +
        'County loan limit (entered): ' + fmtUSD(loanLimit) + '<br>' +
        'Maximum guaranty (25% of limit): ' + fmtUSD(maxGuaranty) + '<br>' +
        'Entitlement already used: ' + fmtUSD(prior) + '<br>' +
        'Estimated remaining entitlement: <strong>' + fmtUSD(available) + '</strong><br>' +
        'Estimated max purchase with $0 down: ' + fmtUSD(maxNoDown) +
        (price > 0 ? '<br>Estimated down payment for ' + fmtUSD(price) + ': <strong>' + fmtUSD(down) + '</strong>' : '');
    }
    html += '<div class="muted" style="margin-top:10px;font-size:13px;">Educational estimate only. VA, lender, and county rules apply. Confirm eligibility with the VA and a loan officer.</div>';
    document.getElementById('va-result').innerHTML = html;
  };

  /* =========================================================
     LOAN OFFICER DIRECTORY (CSV)
     ========================================================= */
  function parseCSV(text) {
    var rows = [];
    var i = 0, field = '', row = [], inQuotes = false;
    while (i < text.length) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i+1] === '"') { field += '"'; i += 2; continue; }
        if (c === '"') { inQuotes = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.length > 1 || (r[0] && r[0].trim()); });
  }

  function rowToObject(headers, row) {
    var o = {};
    headers.forEach(function (h, idx) { o[h.trim()] = (row[idx] || '').trim(); });
    return o;
  }

  // Normalize messy lists like "; TN; OH: PA; MO" -> ["TN","OH","PA","MO"]
  function splitStates(s) {
    if (!s) return [];
    return s.split(/[;,:/|]+/)
            .map(function (x) { return x.trim().toUpperCase(); })
            .filter(Boolean);
  }

  // Read the email from the CSV, tolerant of common header typos
  function getEmail(o) {
    return (o['Email'] || o['Eemail'] || o['E-mail'] || '').trim();
  }

  function ensureUrl(u) {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : ('https://' + u);
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function renderDirectory(officers) {
    var grid = document.getElementById('lo-rows');
    if (!grid) return;
    if (!officers.length) {
      grid.innerHTML = '<div class="lo-empty">No loan officers match your filter, or the directory CSV has not been populated yet.</div>';
      return;
    }
    grid.innerHTML = officers.map(function (o) {
      var name      = escapeHTML((o['Full Name'] || '').trim());
      var title     = escapeHTML((o['Title']     || '').trim());
      var nmls      = escapeHTML((o['NMLS']      || '').trim());
      var city      = escapeHTML((o['City']      || '').trim());
      var state     = escapeHTML((o['State']     || '').trim());
      var zip       = escapeHTML((o['Zip Code']  || '').trim());
      var email     = escapeHTML(getEmail(o));
      var profile   = ensureUrl((o['Profile URL'] || '').trim());
      var profileSafe = escapeHTML(profile);
      // states list is no longer rendered on the card, but the search/dropdown
      // filter still uses Other Licensed States so this LO appears under each
      // state they're licensed in.
      var loc = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');

      var nameNode = profile
        ? '<a href="' + profileSafe + '" target="_blank" rel="noopener">' + name + '</a>'
        : name;

      var actions = [];
      if (profile) actions.push('<a class="btn-outline" href="' + profileSafe + '" target="_blank" rel="noopener">Visit Website</a>');
      if (email)   actions.push('<a class="btn-primary" href="mailto:' + email + '">Email</a>');

      return '' +
        '<article class="lo-card">' +
          '<h3 class="lo-card__name">' + nameNode + '</h3>' +
          (title ? '<div class="lo-card__title">' + title + '</div>' : '') +
          (loc   ? '<div class="lo-card__location">' + loc + '</div>'  : '') +
          (nmls  ? '<div class="lo-card__nmls">NMLS #' + nmls + '</div>' : '') +
          (actions.length ? '<div class="lo-card__actions">' + actions.join('') + '</div>' : '') +
        '</article>';
    }).join('');
  }

  function initDirectory() {
    var tbody = document.getElementById('lo-rows');
    if (!tbody) return;

    fetch('data/loanofficers.csv', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('CSV not found'); return r.text(); })
      .then(function (text) {
        var rows = parseCSV(text);
        if (!rows.length) { renderDirectory([]); return; }
        var headers = rows.shift();
        var data = rows.map(function (r) { return rowToObject(headers, r); })
                       .filter(function (o) { return o['Full Name']; });

        // Populate state filter
        var stateSel = document.getElementById('lo-state');
        if (stateSel) {
          var states = Array.from(new Set(
            data.flatMap(function (o) {
              return [(o['State'] || '').trim().toUpperCase()].concat(splitStates(o['Other Licensed States']));
            }).filter(Boolean)
          )).sort();
          states.forEach(function (s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s; stateSel.appendChild(opt);
          });
        }

        function showPrompt() {
          var grid = document.getElementById('lo-rows');
          if (!grid) return;
          grid.innerHTML =
            '<div class="lo-empty">' +
              '<strong style="display:block;font-family:\'Work Sans\',sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;color:var(--primary);margin-bottom:8px;">Find your loan officer</strong>' +
              'Select a state above or search by name, city, ZIP, or NMLS to view loan officers licensed in your area.' +
            '</div>';
        }

        function filter() {
          var q = (document.getElementById('lo-search').value || '').trim().toLowerCase();
          var st = (document.getElementById('lo-state').value || '').trim().toLowerCase();
          // No input -> show prompt, do NOT list all loan officers.
          if (!q && !st) { showPrompt(); return; }
          var filtered = data.filter(function (o) {
            var hay = [o['Full Name'], o['City'], o['State'], o['Zip Code'], o['Other Licensed States'], o['NMLS']].join(' ').toLowerCase();
            var matchesQ = !q || hay.indexOf(q) !== -1;
            var stateHay = (o['State'] + ',' + (o['Other Licensed States'] || '')).toLowerCase();
            var matchesS = !st || stateHay.indexOf(st) !== -1;
            return matchesQ && matchesS;
          });
          renderDirectory(filtered);
        }

        // Initial state: prompt the user to search
        showPrompt();
        var s = document.getElementById('lo-search');
        var st = document.getElementById('lo-state');
        if (s) s.addEventListener('input', filter);
        if (st) st.addEventListener('change', filter);
      })
      .catch(function () {
        tbody.innerHTML =
          '<div class="lo-empty">' +
          'The directory will appear here once <code>data/loanofficers.csv</code> is populated. ' +
          'Tip: opening the site directly from the file system may block CSV loading — serve the folder via a local web server (e.g. <code>python3 -m http.server</code>) to view the directory.' +
          '</div>';
      });
  }
  document.addEventListener('DOMContentLoaded', initDirectory);

  /* =========================================================
     CONTACT FORM (mailto fallback)
     ========================================================= */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form#contact-form');
    if (!f) return;
    e.preventDefault();
    var name    = (f.elements['name'].value || '').trim();
    var email   = (f.elements['email'].value || '').trim();
    var phone   = (f.elements['phone'].value || '').trim();
    var topic   = (f.elements['topic'].value || '').trim();
    var message = (f.elements['message'].value || '').trim();
    if (!name || !email || !message) { alert('Please complete the required fields.'); return; }

    var subject = encodeURIComponent('Website inquiry: ' + (topic || 'General'));
    var body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      'Topic: ' + topic + '\n\n' +
      'Message:\n' + message + '\n'
    );
    window.location.href = 'mailto:info@supremelending.com?subject=' + subject + '&body=' + body;
    var ok = document.getElementById('contact-ok');
    if (ok) ok.style.display = 'block';
  });

})();
