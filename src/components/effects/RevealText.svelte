<script lang="ts">
	import { onMount } from 'svelte'
	import type { Snippet } from 'svelte'

	interface Props {
		children?: Snippet
		class?: string
		trigger?: 'scroll-locked' | 'once-on-enter'
		direction?: 'up' | 'from-left' | 'fade-only'
		stagger?: number
		dataSectionBehavior?: string | null
	}

	let {
		children,
		class: className = '',
		trigger = 'once-on-enter',
		direction = 'up',
		stagger = 60,
		dataSectionBehavior = null
	}: Props = $props()

	let root: HTMLDivElement | undefined = $state()

	const SKIP_SELECTORS = 'button, .wp-block-button__link, [data-section-reveal-skip], a.wp-element-button'

	function splitTextNodes(el: HTMLElement) {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT
				const parent = node.parentElement
				if (!parent) return NodeFilter.FILTER_REJECT
				if (parent.closest(SKIP_SELECTORS)) return NodeFilter.FILTER_REJECT
				if ((parent as HTMLElement).dataset?.sectionWord !== undefined)
					return NodeFilter.FILTER_REJECT
				return NodeFilter.FILTER_ACCEPT
			}
		})

		const textNodes: Text[] = []
		let node: Node | null
		while ((node = walker.nextNode())) textNodes.push(node as Text)

		let counter = 0
		for (const tn of textNodes) {
			const text = tn.textContent ?? ''
			const tokens = text.split(/(\s+)/) // keep whitespace as separate tokens
			const frag = document.createDocumentFragment()
			for (const token of tokens) {
				if (!token) continue
				if (/^\s+$/.test(token)) {
					frag.appendChild(document.createTextNode(token))
				} else {
					const span = document.createElement('span')
					span.dataset.sectionWord = ''
					span.style.setProperty('--i', String(counter++))
					span.textContent = token
					frag.appendChild(span)
				}
			}
			tn.replaceWith(frag)
		}

		return counter
	}

	onMount(() => {
		if (!root) return
		if (typeof window === 'undefined') return

		const wordCount = splitTextNodes(root)
		if (wordCount === 0) return

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			root.classList.add('section-reveal-active')
			root.querySelectorAll<HTMLSpanElement>('[data-section-word]').forEach((w) =>
				w.classList.add('section-word-visible')
			)
			return
		}

		if (trigger === 'once-on-enter') {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						root!.classList.add('section-reveal-active')
						observer.disconnect()
					}
				},
				{ threshold: 0.2 }
			)
			observer.observe(root)
			return () => observer.disconnect()
		}

		// scroll-locked
		const words = Array.from(
			root.querySelectorAll<HTMLSpanElement>('[data-section-word]')
		)
		let frame = 0

		const update = () => {
			frame = 0
			if (!root) return
			const rect = root.getBoundingClientRect()
			const vh = window.innerHeight
			// 0 when top of element enters viewport from below (rect.top = vh).
			// 1 well before the element exits the top — multiplier 0.4 so the
			// reveal completes around the upper third of the viewport rather
			// than waiting for the centre. ceil() so the last word doesn't get
			// stranded by floor(0.999) when scroll stops a hair short of 1.
			const range = (rect.height + vh) * 0.4
			const traversed = vh - rect.top
			const progress = Math.max(0, Math.min(1, traversed / range))
			const visibleCount = Math.ceil(progress * words.length)
			for (let i = 0; i < words.length; i++) {
				if (i < visibleCount) words[i].classList.add('section-word-visible')
				else words[i].classList.remove('section-word-visible')
			}
		}

		const schedule = () => {
			if (frame) return
			frame = requestAnimationFrame(update)
		}

		update()
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', schedule, { passive: true })
		return () => {
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', schedule)
			if (frame) cancelAnimationFrame(frame)
		}
	})
</script>

<div
	bind:this={root}
	class="section-reveal-text {className}"
	data-section-trigger={trigger}
	data-section-direction={direction}
	data-section-behavior={dataSectionBehavior}
	style:--section-stagger="{stagger}ms"
>
	{@render children?.()}
</div>

<style>
	:global(.section-reveal-text [data-section-word]) {
		display: inline-block;
		opacity: 0;
		transform: translateY(0.5em);
		transition:
			opacity 600ms cubic-bezier(0.4, 0, 0.2, 1),
			transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* once-on-enter: stagger via per-word transition-delay; visibility toggled via wrapper class */
	:global(
			.section-reveal-text[data-section-trigger='once-on-enter'] [data-section-word]
		) {
		transition-delay: calc(var(--i, 0) * var(--section-stagger, 60ms));
	}
	:global(
			.section-reveal-text[data-section-trigger='once-on-enter'].section-reveal-active
				[data-section-word]
		) {
		opacity: 1;
		transform: translateY(0);
	}

	/* scroll-locked: per-word visibility toggled by JS as scroll advances */
	:global(
			.section-reveal-text[data-section-trigger='scroll-locked']
				[data-section-word].section-word-visible
		) {
		opacity: 1;
		transform: translateY(0);
	}

	/* direction: from-left */
	:global(.section-reveal-text[data-section-direction='from-left'] [data-section-word]) {
		transform: translateX(-0.75em);
	}
	:global(
			.section-reveal-text[data-section-direction='from-left'][data-section-trigger='once-on-enter'].section-reveal-active
				[data-section-word],
			.section-reveal-text[data-section-direction='from-left'][data-section-trigger='scroll-locked']
				[data-section-word].section-word-visible
		) {
		transform: translateX(0);
	}

	/* direction: fade-only */
	:global(.section-reveal-text[data-section-direction='fade-only'] [data-section-word]) {
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.section-reveal-text [data-section-word]) {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
