<script lang="ts">
  import Button from '$components/atoms/Button.svelte';
  import ClimateQuestionModal from '$components/ClimateQuestionModal.svelte';

  // State management
  let showModal = $state(false);

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }
</script>

<div class="container mx-auto p-6">
  <div class="max-w-md mx-auto text-center">
    <h1 class="text-3xl font-bold mb-6">Climate Action Network</h1>
    
    <p class="mb-6">
      Ready to take action for the climate? Join us in holding climate criminals accountable.
    </p>
    
    <Button
      label="Get Involved"
      colourClass="bg-black"
      textColourClass="text-yellow"
      fullWidth={true}
      on:click={openModal}
    />
  </div>
</div>

<!-- Modal component -->
<ClimateQuestionModal
  isOpen={showModal}
  onClose={closeModal}
/> 