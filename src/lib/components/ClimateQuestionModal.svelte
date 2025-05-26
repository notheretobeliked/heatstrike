<script lang="ts">
  import Button from '$components/atoms/Button.svelte';
  import AcfMailChimp from '$components/blocks/AcfMailChimp.svelte';
  import { onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Define the question interface based on your data
  interface Question {
    questionTitle: string;
    questionExploringText: string;
    mailchimpTagId: string;
    mailchimpEndpoint: string;
    showCommentBox?: boolean;
  }

  // Props
  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
    questions?: Question[];
  }

  let { 
    isOpen = false, 
    onClose = () => {}, 
    questions = []
  }: Props = $props();

  // State
  let selectedQuestion = $state<Question | null>(null);
  let showMailchimp = $state(false);
  let activeDonation = $state(false);
  
  function handleOptionSelect(question: Question) {
    selectedQuestion = question;
    
    // Check if this is a donation question
    if (question.questionTitle.toLowerCase().includes('donate')) {
      activeDonation = true;
    } else {
      showMailchimp = true;
    }
  }

  function handleCloseModal() {
    if (onClose) onClose();
    // Reset state when modal closes
    selectedQuestion = null;
    showMailchimp = false;
    activeDonation = false;
  }

  // Handle escape key to close modal
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      handleCloseModal();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  // Prevent scrolling on the body when modal is open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center"
    transition:fade={{ duration: 200 }}
  >
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-yellow bg-opacity-50" 
      on:click={handleCloseModal}
      aria-hidden="true"
      transition:fade={{ duration: 300 }}
    ></div>
    
    <!-- Modal content -->
    <div 
      class="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto w-full"
      role="dialog"
      aria-modal="true"
      transition:slide={{ duration: 400, easing: quintOut, axis: 'y' }}
    >
      <!-- Close button -->
      <button 
        class="absolute top-4 right-4 text-black hover:text-red focus:outline-none"
        on:click={handleCloseModal}
        aria-label="Close modal"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="p-6">
        {#if !selectedQuestion}
          <!-- Initial question and options -->
          <div
            in:slide={{ duration: 300, delay: 200 }}
            out:slide={{ duration: 200 }}
          >
            <h2 class="text-base md:text-lg xl:text-xl font-semibold uppercase mb-6 text-center">What brings you here today?</h2>
            
            <div class="flex flex-col space-y-4">
              {#each questions as question, i}
                <div in:slide={{ duration: 300, delay: 300 + (i * 100) }}>
                  <Button 
                    label={question.questionTitle}
                    fullWidth={true}
                    on:click={() => handleOptionSelect(question)}
                  />
                </div>
              {/each}
            </div>
          </div>
          
        {:else}
          <!-- Selected option content -->
          <div 
            class="mb-8"
            in:slide={{ duration: 300, delay: 200 }}
          >
            {#if activeDonation}
              <div class="prose max-w-none content">{@html selectedQuestion.questionExploringText}</div>
              
              <div class="mt-6 flex flex-col space-y-4">
                <div in:slide={{ duration: 300, delay: 400 }}>
                  <Button 
                    label="Make a donation now"
                    url="/support"
                    fullWidth={true}
                    colourClass="bg-red"
                    textColourClass="text-white"
                  />
                </div>
                <div in:slide={{ duration: 300, delay: 500 }}>
                  <Button 
                    label="Contact us to discuss"
                    fullWidth={true}
                    colourClass="bg-black"
                    textColourClass="text-yellow"
                    on:click={() => { showMailchimp = true; activeDonation = false; }}
                  />
                </div>
              </div>
              
            {:else}
              <div class="prose max-w-none content">{@html selectedQuestion.questionExploringText}</div>
            {/if}
          </div>
          
          {#if showMailchimp}
            <div 
              class="mt-8"
              in:slide={{ duration: 400, delay: activeDonation ? 200 : 400 }}
            >
              <AcfMailChimp 
                block={{
                  attributes: { backgroundColor: 'yellow' },
                  mailChimp: { 
                    blockHeadline: 'Get in touch', 
                    mailchimpEndpoint: selectedQuestion.mailchimpEndpoint 
                  },
                  endpoint: selectedQuestion.mailchimpEndpoint,
                  tags: selectedQuestion.mailchimpTagId ? [parseInt(selectedQuestion.mailchimpTagId)] : undefined,
                  showCommentBox: selectedQuestion.showCommentBox || false
                }}
              />
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Style the content from WordPress */
  :global(.content ul) {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  :global(.content p) {
    margin-bottom: 1rem;
  }
  
  :global(.content a) {
    color: #2563eb;
    text-decoration: underline;
  }
  
  :global(.content a:hover) {
    text-decoration: none;
  }
</style> 