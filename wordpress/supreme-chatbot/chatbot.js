/* =====================================================================
   SUPREME LENDING — Chatbot
   Self-contained scripted FAQ bot. Edit the FAQ array below to add or
   change canned responses. Patterns are JS regex; order matters
   (more specific patterns first).
   ===================================================================== */

(function () {
	'use strict';

	// --------------------------------------------------------------------
	// FAQ — edit here. Reviewed by Compliance & Legal before publishing.
	// --------------------------------------------------------------------
	var FAQ = [
		{ match: /\b(hi|hello|hey|start)\b/i,
		  reply: "Hi! I'm Supreme Lending's virtual assistant. I can share general info on the homebuying process, document checklists, our loan options, and how to reach us. What would you like to know?" },
		{ match: /(rate|apr|interest)/i,
		  reply: "Rates change throughout the day and depend on your specific scenario. I can't quote rates here — please connect with a loan officer in our Directory for a personalized quote." },
		{ match: /(document|paperwork|checklist)/i,
		  reply: "Typical items include: 30 days of pay stubs, 2 years W-2s and tax returns, 2 months of bank/asset statements, and a photo ID. Self-employed borrowers may need additional business documentation." },
		{ match: /(process|steps|how long|timeline)/i,
		  reply: "The mortgage process generally has six steps: Pre-Approval, Home Shopping, Application, Processing, Underwriting, and Closing." },
		{ match: /(loan option|loan product|loan program|fha|usda|conventional|jumbo|renovation|\bproduct\b)/i,
		  reply: "We offer Conventional, FHA, VA, USDA, Jumbo, and specialty programs including renovation loans. Eligibility varies by borrower and property." },
		{ match: /(loan officer|find a loan officer|find someone|directory|\blo\b)/i,
		  reply: "Our Loan Officer Directory lets you search by name, city, ZIP, or state." },
		{ match: /(calculator|monthly payment|afford|refi|refinance|va entitlement)/i,
		  reply: "We have four calculators: Affordability, Monthly Payment, Refinance, and VA Entitlement." },
		{ match: /(prequalif|pre-?qualif|preapprov|pre-?approv)/i,
		  reply: "Pre-approval estimates how much you may be able to borrow based on submitted documentation. It's not a commitment to lend. A loan officer can walk you through the steps." },
		{ match: /(contact|email|phone|reach)/i,
		  reply: "You can reach us at info@supremelending.com. We'll route your message to the right team." },
		{ match: /(career|job|hiring|recruit)/i,
		  reply: "Visit careers.supremelending.com to learn about open roles and the Supreme Lending culture." },
		{ match: /(privacy|data|secure)/i,
		  reply: "We treat your information as confidential. For full details, see our Privacy Policy in the footer." },
		{ match: /(thank|thanks|bye|goodbye)/i,
		  reply: "You're welcome! Have a great day — we're here whenever you need us." }
	];

	var DEFAULT_REPLY = "I'm not sure I have a great answer for that here. For specific questions, please email info@supremelending.com.";

	function botReply(text) {
		var hit = FAQ.find(function (f) { return f.match.test(text); });
		return hit ? hit.reply : DEFAULT_REPLY;
	}

	// --------------------------------------------------------------------
	// UI
	// --------------------------------------------------------------------
	var BOT_AVATAR_SVG =
		'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">' +
			'<path d="M12 3L3 11v10h7v-6h4v6h7V11L12 3z" fill="#ffffff"/>' +
		'</svg>';

	function appendMsg(body, text, who) {
		var row = document.createElement('div');
		row.className = 'slchat-msg-row ' + who;

		if (who === 'bot') {
			var avatar = document.createElement('span');
			avatar.className = 'slchat-avatar';
			avatar.innerHTML = BOT_AVATAR_SVG;
			row.appendChild(avatar);
		}

		var msg = document.createElement('div');
		msg.className = 'slchat-msg ' + who;
		msg.textContent = text;
		row.appendChild(msg);

		body.appendChild(row);
		body.scrollTop = body.scrollHeight;
		return row;
	}

	function appendTyping(body) {
		var row = document.createElement('div');
		row.className = 'slchat-msg-row bot';

		var avatar = document.createElement('span');
		avatar.className = 'slchat-avatar';
		avatar.innerHTML = BOT_AVATAR_SVG;
		row.appendChild(avatar);

		var typing = document.createElement('div');
		typing.className = 'slchat-typing';
		typing.innerHTML = '<span></span><span></span><span></span>';
		row.appendChild(typing);

		body.appendChild(row);
		body.scrollTop = body.scrollHeight;
		return row;
	}

	function init() {
		var fab    = document.getElementById('slchatFab');
		var win    = document.getElementById('slchatWin');
		var close  = document.getElementById('slchatClose');
		var body   = document.getElementById('slchatBody');
		var input  = document.getElementById('slchatInput');
		var send   = document.getElementById('slchatSend');
		var quick  = document.getElementById('slchatQuick');
		var badge  = document.getElementById('slchatBadge');
		var tip    = document.getElementById('slchatTip');
		if (!fab || !win) return;

		var tipTimer = setTimeout(function () { if (tip) tip.classList.add('is-visible'); }, 4000);
		function hideTip() { clearTimeout(tipTimer); if (tip) tip.classList.remove('is-visible'); }

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

	if (document.readyState !== 'loading') init();
	else document.addEventListener('DOMContentLoaded', init);
})();
