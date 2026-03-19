<script lang="ts">
  import { onMount } from 'svelte';
  import apiCaller from "$lib/axiosConfig";
  import type { paths, components } from "$lib/api-types";
  import { toaster } from "$lib/toast";
  import { Line, Doughnut } from 'svelte-chartjs';
  import 'chart.js/auto';

  type analyticsResponse = paths['/api/analytics/']['get']['responses']['200']['content']['application/json'];
  type siteAnalyticsData = components["schemas"]["SiteAnalytics"][];
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

  let usersChart = $state({
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

  let usersPie = $state({
    labels: ['Member Accounts', 'Seller Accounts', 'Admin Accounts'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)', 'rgb(205, 130, 130)'],
      data: [] as number[],
    }]
  });

  let itemsChart = $state({
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

  let itemsPie = $state({
    labels: ['Member Items', 'Seller Items'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let itemAvgChart = $state({
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

  let tagsChart = $state({
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

  let tagsPie = $state({
    labels: ['Member Tag Usage', 'Seller Tag Usage'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let tagAvgChart = $state({
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

  let uniqTagChart = $state({
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

  let uniqTagsPie = $state({
    labels: ['Member Unique Tag Usage', 'Seller Unique Tag Usage'],
    datasets: [{
      backgroundColor: ['rgb(130, 130, 205)', 'rgb(130, 205, 158)'],
      data: [] as number[],
    }]
  });

  let uniqTagAvgChart = $state({
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

  onMount(async () => {
    try {
      const response = await apiCaller.get('/analytics/');
      const genericAnalyticsResponse: analyticsResponse | null = response.data;
      const siteAnalyticsData: siteAnalyticsData | null = genericAnalyticsResponse?.data ?? null;

      siteAnalyticsData?.forEach((entry) => {
        const date = new Date(entry.created_at).toLocaleString(undefined, chartLocale);
        usersChart.labels.push(date);
        usersChart.datasets[0].data.push(entry.member_count ?? 0);
        usersChart.datasets[1].data.push(entry.seller_count ?? 0);
        usersChart.datasets[2].data.push(entry.admin_count ?? 0);

        itemsChart.labels.push(date);
        itemsChart.datasets[0].data.push(entry.member_items_count ?? 0);
        itemsChart.datasets[1].data.push(entry.seller_items_count ?? 0);
        itemAvgChart.labels.push(date);
        itemAvgChart.datasets[0].data.push(entry.member_count ? (entry.member_items_count ?? 0) / entry.member_count : 0);
        itemAvgChart.datasets[1].data.push(entry.seller_count ? (entry.seller_items_count ?? 0) / entry.seller_count : 0);

        tagsChart.labels.push(date);
        tagsChart.datasets[0].data.push(entry.member_used_tags_count ?? 0);
        tagsChart.datasets[1].data.push(entry.seller_used_tags_count ?? 0);
        tagAvgChart.labels.push(date);
        tagAvgChart.datasets[0].data.push(entry.member_items_count ? (entry.member_used_tags_count ?? 0) / entry.member_items_count : 0);
        tagAvgChart.datasets[1].data.push(entry.seller_items_count ? (entry.seller_used_tags_count ?? 0) / entry.seller_items_count : 0);

        uniqTagChart.labels.push(date);
        uniqTagChart.datasets[0].data.push(entry.member_distinct_tags_count ?? 0);
        uniqTagChart.datasets[1].data.push(entry.seller_distinct_tags_count ?? 0);
        uniqTagAvgChart.labels.push(date);
        uniqTagAvgChart.datasets[0].data.push(entry.member_items_count ? (entry.member_distinct_tags_count ?? 0) / entry.member_items_count : 0);
        uniqTagAvgChart.datasets[1].data.push(entry.seller_items_count ? (entry.seller_distinct_tags_count ?? 0) / entry.seller_items_count : 0);
      });

      const lastEntry = siteAnalyticsData?.at(-1);
      itemsPie.datasets[0].data = [
        lastEntry?.member_items_count ?? 0,
        lastEntry?.seller_items_count ?? 0
      ];
      usersPie.datasets[0].data = [
        lastEntry?.member_count ?? 0,
        lastEntry?.seller_count ?? 0,
        lastEntry?.admin_count ?? 0
      ];
      tagsPie.datasets[0].data = [
        lastEntry?.member_used_tags_count ?? 0,
        lastEntry?.seller_used_tags_count ?? 0
      ];
      uniqTagsPie.datasets[0].data = [
        lastEntry?.member_distinct_tags_count ?? 0,
        lastEntry?.seller_distinct_tags_count ?? 0
      ];

    } catch (error) {
      toaster.info({title: "Error fetching analytics data", duration: 1500})
    }
  });
</script>

<div>
  <div class="flex flex-row">
    <div class="flex-1 h-80"><Line data={usersChart} options={lineOptions} /></div>
    <div class="ml-3 h-80"><Doughnut data={usersPie} options={pieOptions} /></div>
  </div>
  <div class="mt-10 flex flex-row">
    <div class="flex-1 h-80"><Line data={itemsChart} options={lineOptions} /></div>
    <div class="ml-3 h-80"><Doughnut data={itemsPie} options={pieOptions} /></div>
    <div class="flex-1 h-80"><Line data={itemAvgChart} options={lineOptions} /></div>
  </div>
  <div class="mt-10 flex flex-row">
    <div class="flex-1 h-80"><Line data={tagsChart} options={lineOptions} /></div>
    <div class="ml-3 h-80"><Doughnut data={tagsPie} options={pieOptions} /></div>
    <div class="flex-1 h-80"><Line data={tagAvgChart} options={lineOptions} /></div>
  </div>
  <div class="mt-10 flex flex-row">
    <div class="flex-1 h-80"><Line data={uniqTagChart} options={lineOptions} /></div>
    <div class="ml-3 h-80"><Doughnut data={uniqTagsPie} options={pieOptions} /></div>
    <div class="flex-1 h-80"><Line data={uniqTagAvgChart} options={lineOptions} /></div>
  </div>
</div>
