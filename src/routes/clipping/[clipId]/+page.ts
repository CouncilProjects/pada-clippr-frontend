// src/routes/clipping/[clipId]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import apiCaller from '$lib/axiosConfig';
import { type paths } from '$lib/api-types';
export const load: PageLoad = async ({ params }) => {
  const clipId = params.clipId;
  type reviews = paths['/api/review/item/{item_id}/']['get']['responses']['200']['content']['application/json'];

  try {
    const res = await apiCaller.get(`/item/${clipId}/`);
    const reviews = apiCaller.get<reviews>(`review/item/${clipId}/`);
    return { clipping: res.data, reviewPromice:reviews };
  } catch (err: any) {
    throw error(err.response?.status || 500, 'Clipping not found');
  }
};
