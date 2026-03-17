<script lang="ts">
    // You can customize this component with any props you might need
    let { message = "Page not found" } = $props();
  </script>

  <div class="flex flex-col items-center justify-center py-12">
    <h1 class="text-4xl font-bold mb-4">404</h1>
    <p class="text-xl mb-6">{message}</p>
    <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Return to Home
    </a>
  </div>