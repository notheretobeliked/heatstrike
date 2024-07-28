<script>
	import { tick } from 'svelte';
  
	let openModal = false;
  
	async function openFormModal() {
	  openModal = true;
	  await tick(); // Ensure DOM is updated before loading the script
	  const script = document.createElement('script');
	  script.src = 'https://actionnetwork.org/widgets/v5/form/join-heat-strike?format=js&source=widget';
	  script.async = true;
	  document.getElementById('script-container').appendChild(script);
	}
  
	function handleClickOutside(event) {
	  const formArea = document.getElementById('can-form-area-join-heat-strike');
	  if (formArea && !formArea.contains(event.target)) {
		openModal = false;
	  }
	}
  </script>
  
  <svelte:head>
	<link href="https://actionnetwork.org/css/style-embed-v3.css" rel="stylesheet" type="text/css" />
  </svelte:head>
  
  <button
	on:click={openFormModal}
	class="border-white border w-full rounded-full px py-5 my-5 hover:bg-caution hover:text-extremedanger bg-black uppercase text-extremecaution transition-all duration-300"
  >Sign up now</button>
  
  {#if openModal}
	<div
	  class="inset-0 justify-center z-50 fixed w-screen min-h-screen flex overflow-y-auto bg-opacity-50 bg-black"
	  on:click|self={handleClickOutside}
	>
	<button on:click={() => openModal = false} class="fixed top-2 left-2 text-2xl text-danger md:text-caution">X</button>
	  <div id="can-form-area-join-heat-strike" class="w-full max-w-screen-md bg-white p-4 rounded-md">
		<!-- this div is the target for our HTML insertion -->
		<div id="script-container"></div>
	  </div>
	</div>
  {/if}
  