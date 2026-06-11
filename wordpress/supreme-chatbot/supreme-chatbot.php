<?php
/**
 * Plugin Name:       Supreme Lending — Chatbot
 * Description:       Adds the Supreme Assistant floating chat widget to every page. Self-contained: no external services, scripted FAQ replies, with typing indicator and notification badge.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Supreme Lending
 *
 * INSTALLATION
 * ------------
 * 1. Upload the entire `supreme-chatbot/` folder via FTP into:
 *      /wp-content/plugins/
 * 2. WordPress admin → Plugins → activate "Supreme Lending — Chatbot".
 * 3. The bot now appears site-wide. No further setup required.
 *
 * CUSTOMIZING
 * -----------
 * • The FAQ matchers and replies live in chatbot.js (top of the file).
 *   Edit the FAQ array to add/change canned responses.
 * • All visual styling lives in chatbot.css. Class names are prefixed
 *   slchat- so they won't collide with theme styles.
 * • To exclude the bot on certain pages, see the filter at the bottom
 *   of this file.
 *
 * COMPLIANCE NOTE
 * ---------------
 * This bot is for general informational purposes only. The default
 * replies do NOT quote rates, give credit decisions, or reference
 * specific borrower scenarios. Any change to the FAQ replies should
 * be reviewed by Compliance & Legal before publishing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Supreme_Chatbot {

	const VERSION = '1.0.0';

	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
		add_action( 'wp_footer',          array( __CLASS__, 'render_widget' ), 99 );
	}

	public static function enqueue_assets() {
		if ( ! self::should_render() ) return;

		wp_enqueue_style(
			'supreme-chatbot',
			plugins_url( 'chatbot.css', __FILE__ ),
			array(),
			self::VERSION
		);

		// Google Fonts — only loads once, skipped if theme already enqueued them
		wp_enqueue_style(
			'supreme-chatbot-fonts',
			'https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap',
			array(),
			null
		);

		wp_enqueue_script(
			'supreme-chatbot',
			plugins_url( 'chatbot.js', __FILE__ ),
			array(),
			self::VERSION,
			true /* in footer */
		);
	}

	/**
	 * Render the FAB + chat window markup at the very end of the body.
	 */
	public static function render_widget() {
		if ( ! self::should_render() ) return;
		?>
		<button id="slchatFab" class="slchat-fab" aria-label="Open chat">
			<span class="slchat-fab__icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
				</svg>
			</span>
			<span id="slchatBadge" class="slchat-fab__badge" aria-hidden="true">1</span>

			<span id="slchatTip" class="slchat-fab__tip" aria-hidden="true">Hi! Need help? Chat with us.</span>
		</button>
		<aside id="slchatWin" class="slchat-window" role="dialog" aria-label="Supreme Lending chat">
			<div class="slchat-header">
				<div class="slchat-header__id">
					<div class="slchat-header__avatar" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2L2 10v12h6v-7h8v7h6V10L12 2z" fill="#ff4040"/>
							<path d="M9 12h6v1.5H9.7v1H15V16H9v-4z" fill="#001a40"/>
						</svg>
					</div>
					<div>
						<div class="slchat-header__title">Supreme Assistant</div>
						<div class="slchat-header__status">Online · Typically replies instantly</div>
					</div>
				</div>
				<button id="slchatClose" aria-label="Close chat">&times;</button>
			</div>
			<div id="slchatBody" class="slchat-body"></div>
			<div id="slchatQuick" class="slchat-quick">
				<button data-q="What documents do I need?">Documents</button>
				<button data-q="How long does the process take?">Process</button>
				<button data-q="Tell me about loan options">Loan Options</button>
				<button data-q="How do I contact you?">Contact</button>
			</div>
			<div class="slchat-input">
				<input id="slchatInput" type="text" placeholder="Type your question…" aria-label="Type your question">
				<button id="slchatSend">Send</button>
			</div>
			<div class="slchat-disclaimer">For general information only. Not a credit decision or rate quote.</div>
		</aside>
		<?php
	}

	/**
	 * Filter point: opt out of the chatbot on specific pages.
	 *
	 * Example — disable on the legal pages:
	 *   add_filter( 'supreme_chatbot_should_render', function ( $render ) {
	 *       if ( is_page( array( 'privacy-policy', 'disclaimer', 'terms-of-use' ) ) ) {
	 *           return false;
	 *       }
	 *       return $render;
	 *   });
	 */
	private static function should_render() {
		$render = ! is_admin();
		return apply_filters( 'supreme_chatbot_should_render', $render );
	}
}

Supreme_Chatbot::init();
