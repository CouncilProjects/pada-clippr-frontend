<script lang="ts">
  import django from '$lib/assets/django.svg';
  import github from '$lib/assets/github.svg';
  import lucide from '$lib/assets/lucide.svg';
  import playwright from '$lib/assets/playwright.svg';
  import skeleton from '$lib/assets/skeleton.svg';
  import sqlite from '$lib/assets/sqlite.svg';
  import svelteLogo from '$lib/assets/svelte.svg';
  import tailwind from '$lib/assets/tailwind.svg';
  import trello from '$lib/assets/trello.svg';

  const technologies = [
  {
    name: "Django",
    category: "Backend Framework",
    logo: django,
    url: "https://www.djangoproject.com/",
    color: "#092e20"
  },
  {
    name: "Svelte",
    category: "Frontend Framework",
    logo: svelteLogo,
    url: "https://svelte.dev/",
    color: "#ff3e00"
  },
  {
    name: "Skeleton UI",
    category: "UI Framework",
    logo: skeleton,
    url: "https://www.skeleton.dev/",
    color: "#000029"
  },
  {
    name: "Tailwind CSS",
    category: "Styling Library",
    logo: tailwind,
    url: "https://tailwindcss.com/",
    color: "#38bdf8"
  },
  {
    name: "Lucide",
    category: "Icons",
    logo: lucide,
    url: "https://lucide.dev/",
    color: "#f56565"
  },
  {
    name: "GitHub",
    category: "Version Control",
    logo: github,
    url: "https://github.com/",
    color: "#002025"
  },
  {
    name: "Trello",
    category: "Project Management",
    logo: trello,
    url: "https://trello.com/",
    color: "#0356d0"
  },
  {
    name: "Playwright",
    category: "Testing",
    logo: playwright,
    url: "https://playwright.dev/",
    color: "#1d8d22"
  },
  {
    name: "SQLite",
    category: "Database",
    logo: sqlite,
    url: "https://www.sqlite.org/",
    color: "#73c1eb"
  }
];
</script>

<section class="max-w-6xl mx-auto p-6">
  <h1 class="text-3xl text-center font-bold mb-2">Powered by</h1>
  <p class="text-primary-500 mb-8 text-center">
    This project is built using modern, open-source technologies.
  </p>

  <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
    {#each technologies as tech}
      <a
        href={tech.url}
        target="_blank"
        rel="noopener noreferrer"
        style={`--hover-color:${tech.color};`}
        class="card preset-filled-surface-300-700 p-5 flex flex-col items-center text-center gap-3
               transition hover:scale-[1.03]
               focus:outline-none focus:ring-2 focus:ring-primary-500 hover:[box-shadow:0_20px_25px_-5px_var(--hover-color)]"
      >
        <img
          src={tech.logo}
          alt={`${tech.name} logo`}
          class="h-12 w-auto object-contain"
        />

        <div>
          <h2 class="text-lg font-semibold">{tech.name}</h2>
          <p class="text-sm text-primary-900 dark:text-primary-200">{tech.category}</p>
        </div>
      </a>
    {/each}
  </div>
</section>
