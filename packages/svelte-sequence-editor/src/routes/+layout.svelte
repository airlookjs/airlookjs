<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
	import { DarkMode } from 'flowbite-svelte';
</script>

<header class="p-6 container mx-auto">
	<h1 class="text-4xl">Svelte Sequence Editor</h1>
	<nav class="flex">
		<a href="{base}/examples" class="p-2">Examples</a>
		<a href="{base}/examples/markers" class="p-2">Markers</a>
		<a href="{base}/examples/svg" class="p-2">SVG</a>
	</nav>

	<DarkMode />
</header>

<main class="p-6 container mx-auto">
	<slot />
</main>
