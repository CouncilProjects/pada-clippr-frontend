<script lang="ts">
  import { onMount } from 'svelte';
  import { loggedUser } from "$lib/universalReactivity/auth.svelte"
  import apiCaller from "$lib/axiosConfig";
  import type { paths, components } from "$lib/api-types";
  import { toaster } from "$lib/toast";
  import { Line, Doughnut } from 'svelte-chartjs';
  import 'chart.js/auto';
    import { elements } from 'chart.js/auto';

  type genericAnalyticsResponse = paths['/api/analytics/']['get']['responses']['200']['content']['application/json'] | null;
  type siteAnalyticsResponse = components["schemas"]["SiteAnalyticsResponse"] | null;
  type sellerAnalyticsResponse = components["schemas"]["SellerAnalyticsResponse"] | null;
  type siteAnalyticsData = components["schemas"]["SiteAnalytics"][] | null;
  type sellerAnalyticsData = components["schemas"]["SellerAnalytics"][] | null;

  const chartLocale: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { x: { grid: { color: 'rgb(50, 50, 50)' } }, y: { grid: { color: 'rgb(50, 50, 50)' } } }
  }

  const pieOptions = {
    responsive: true,
    elements: {
      arc: {
        borderWidth: 0,
        spacing: 2
      }
    }
  };

  // Site Analytics State //

  let siteUsersChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Member Accounts',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Seller Accounts',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      },
      {
        label: 'Admin Accounts',
        borderColor: 'rgb(205, 130, 130)',
        data: [] as number[],
      }
    ]
  });

  let siteUsersPie = $state({
    labels: ['Member Accounts', 'Seller Accounts', 'Admin Accounts'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)', 'rgb(205, 130, 130)'],
      data: [] as number[],
    }]
  });

  let siteItemsChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Member Items',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Seller Items',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let siteItemsPie = $state({
    labels: ['Member Items', 'Seller Items'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let siteItemAvgChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Average Items per Member Account',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Average Items per Seller Account',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let siteTagsChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Member Tag Usage',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Seller Tag Usage',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let siteTagsPie = $state({
    labels: ['Member Tag Usage', 'Seller Tag Usage'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let siteTagAvgChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Average Tags per Member Item',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Average Tags per Seller Item',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let siteUniqTagChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Member Unique Tag Usage',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Seller Unique Tag Usage',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let siteUniqTagsPie = $state({
    labels: ['Member Unique Tag Usage', 'Seller Unique Tag Usage'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let siteUniqTagAvgChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Average Unique Tags per Member Item',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      },
      {
        label: 'Average Unique Tags per Seller Item',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  function processSiteAnalytics(siteAnalyticsData: siteAnalyticsData) {
    siteAnalyticsData?.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleString(undefined, chartLocale);

      siteUsersChart.labels.push(date);
      siteUsersChart.datasets[0].data.push(entry.member_count ?? 0);
      siteUsersChart.datasets[1].data.push(entry.seller_count ?? 0);
      siteUsersChart.datasets[2].data.push(entry.admin_count ?? 0);

      siteItemsChart.labels.push(date);
      siteItemsChart.datasets[0].data.push(entry.member_items_count ?? 0);
      siteItemsChart.datasets[1].data.push(entry.seller_items_count ?? 0);
      siteItemAvgChart.labels.push(date);
      siteItemAvgChart.datasets[0].data.push(entry.member_count ? (entry.member_items_count ?? 0) / entry.member_count : 0);
      siteItemAvgChart.datasets[1].data.push(entry.seller_count ? (entry.seller_items_count ?? 0) / entry.seller_count : 0);

      siteTagsChart.labels.push(date);
      siteTagsChart.datasets[0].data.push(entry.member_used_tags_count ?? 0);
      siteTagsChart.datasets[1].data.push(entry.seller_used_tags_count ?? 0);
      siteTagAvgChart.labels.push(date);
      siteTagAvgChart.datasets[0].data.push(entry.member_items_count ? (entry.member_used_tags_count ?? 0) / entry.member_items_count : 0);
      siteTagAvgChart.datasets[1].data.push(entry.seller_items_count ? (entry.seller_used_tags_count ?? 0) / entry.seller_items_count : 0);

      siteUniqTagChart.labels.push(date);
      siteUniqTagChart.datasets[0].data.push(entry.member_distinct_tags_count ?? 0);
      siteUniqTagChart.datasets[1].data.push(entry.seller_distinct_tags_count ?? 0);
      siteUniqTagAvgChart.labels.push(date);
      siteUniqTagAvgChart.datasets[0].data.push(entry.member_items_count ? (entry.member_distinct_tags_count ?? 0) / entry.member_items_count : 0);
      siteUniqTagAvgChart.datasets[1].data.push(entry.seller_items_count ? (entry.seller_distinct_tags_count ?? 0) / entry.seller_items_count : 0);
    });

    const lastEntry = siteAnalyticsData?.at(-1);
    siteItemsPie.datasets[0].data = [
      lastEntry?.member_items_count ?? 0,
      lastEntry?.seller_items_count ?? 0
    ];
    siteUsersPie.datasets[0].data = [
      lastEntry?.member_count ?? 0,
      lastEntry?.seller_count ?? 0,
      lastEntry?.admin_count ?? 0
    ];
    siteTagsPie.datasets[0].data = [
      lastEntry?.member_used_tags_count ?? 0,
      lastEntry?.seller_used_tags_count ?? 0
    ];
    siteUniqTagsPie.datasets[0].data = [
      lastEntry?.member_distinct_tags_count ?? 0,
      lastEntry?.seller_distinct_tags_count ?? 0
    ];
  }

   // Seller Analytics State //

  let sellerItemsChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Items Listed',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let sellerViewsChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Total Item Views',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      }
    ]
  });

  let sellerTagsChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Total Tags Used',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      },
      {
        label: 'Total Unique Tags Used',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      }
    ]
  });

  let sellerAvgChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Average Views per Item',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      },
      {
        label: 'Average Tags Used per Item',
        borderColor: 'rgb(130, 130, 205)',
        data: [] as number[],
      }
    ]
  });

  let sellerReqChart = $state({
    labels: [] as string[],
    datasets: [
      {
        label: 'Accepted Requests',
        borderColor: 'rgb(130, 205, 158)',
        data: [] as number[],
      },
      {
        label: 'Rejected Requests',
        borderColor: 'rgb(205, 130, 130)',
        data: [] as number[],
      }
    ]
  });

  let sellerReqPie = $state({
    labels: ['Accepted Requests', 'Rejected Requests'],
    datasets: [{
      backgroundColor: ['rgb(130, 205, 158)', 'rgb(205, 130, 130)'],
      data: [] as number[],
    }]
  });

  function processSellerAnalytics(sellerAnalyticsData: sellerAnalyticsData) {
    sellerAnalyticsData?.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleString(undefined, chartLocale);

      sellerItemsChart.labels.push(date);
      sellerItemsChart.datasets[0].data.push(entry.items_count ?? 0);
      sellerViewsChart.labels.push(date);
      sellerViewsChart.datasets[0].data.push(entry.total_views ?? 0);

      sellerTagsChart.labels.push(date);
      sellerTagsChart.datasets[0].data.push(entry.used_tags_count ?? 0);
      sellerTagsChart.datasets[1].data.push(entry.distinct_tags_count ?? 0);
      sellerAvgChart.labels.push(date);
      sellerAvgChart.datasets[0].data.push(entry.items_count ? (entry.total_views ?? 0) / entry.items_count : 0);
      sellerAvgChart.datasets[1].data.push(entry.items_count ? (entry.distinct_tags_count ?? 0) / entry.items_count : 0);

      sellerReqChart.labels.push(date);
      sellerReqChart.datasets[0].data.push(entry.accepted_request_count ?? 0);
      sellerReqChart.datasets[1].data.push(entry.rejected_request_count ?? 0);
    });

    const lastEntry = sellerAnalyticsData?.at(-1);
      sellerReqPie.datasets[0].data = [
      lastEntry?.accepted_request_count ?? 0,
      lastEntry?.rejected_request_count ?? 0
    ];
  }

  onMount(async () => {
    try {
      if (loggedUser.accountType === "ADMIN") {
        const response = await apiCaller.get('/analytics/');
        const siteAnalytics: siteAnalyticsResponse = response.data;
        processSiteAnalytics(siteAnalytics?.data ?? null);
      } else if (loggedUser.accountType === "SELLER") {
        const response = await apiCaller.get('/analytics/');
        const sellerAnalytics: sellerAnalyticsResponse = response.data;
        processSellerAnalytics(sellerAnalytics?.data ?? null);
      }
    } catch (error) {
      toaster.info({title: "Error fetching analytics data", duration: 1500})
    }
  });
</script>

{#if loggedUser.accountType === "ADMIN"}
  <div>
    <div class="flex flex-row">
      <div class="flex-1 h-80"><Line data={siteUsersChart} options={lineOptions} /></div>
      <div class="ml-3 h-80"><Doughnut data={siteUsersPie} options={pieOptions} /></div>
    </div>
    <div class="mt-10 flex flex-row">
      <div class="flex-1 h-80"><Line data={siteItemsChart} options={lineOptions} /></div>
      <div class="ml-3 h-80"><Doughnut data={siteItemsPie} options={pieOptions} /></div>
      <div class="flex-1 h-80"><Line data={siteItemAvgChart} options={lineOptions} /></div>
    </div>
    <div class="mt-10 flex flex-row">
      <div class="flex-1 h-80"><Line data={siteTagsChart} options={lineOptions} /></div>
      <div class="ml-3 h-80"><Doughnut data={siteTagsPie} options={pieOptions} /></div>
      <div class="flex-1 h-80"><Line data={siteTagAvgChart} options={lineOptions} /></div>
    </div>
    <div class="mt-10 flex flex-row">
      <div class="flex-1 h-80"><Line data={siteUniqTagChart} options={lineOptions} /></div>
      <div class="ml-3 h-80"><Doughnut data={siteUniqTagsPie} options={pieOptions} /></div>
      <div class="flex-1 h-80"><Line data={siteUniqTagAvgChart} options={lineOptions} /></div>
    </div>
  </div>
{:else if loggedUser.accountType === "SELLER"}
  <div>
    <div class="flex flex-row">
      <div class="flex-1 h-80"><Line data={sellerItemsChart} options={lineOptions} /></div>
      <div class="flex-1 h-80"><Line data={sellerViewsChart} options={lineOptions} /></div>
    </div>
    <div class="mt-10 flex flex-row">
      <div class="flex-1 h-80"><Line data={sellerTagsChart} options={lineOptions} /></div>
      <div class="flex-1 h-80"><Line data={sellerAvgChart} options={lineOptions} /></div>
    </div>
    <div class="mt-10 flex flex-row">
      <div class="flex-1 h-80"><Line data={sellerReqChart} options={lineOptions} /></div>
      <div class="ml-3 h-80"><Doughnut data={sellerReqPie} options={pieOptions} /></div>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <p class="text-gray-600">Analytics data is not available to member accounts.</p>
  </div>
{/if}
