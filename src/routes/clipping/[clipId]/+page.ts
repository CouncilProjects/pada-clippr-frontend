// src/routes/clipping/[clipId]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import apiCaller from '$lib/axiosConfig';

export const load: PageLoad = async ({ params }) => {
  const clipId = params.clipId;

  try {
    const res = await apiCaller.get(`/item/${clipId}/`);
    return { clipping: res.data };
  } catch (err: any) {
    throw error(err.response?.status || 500, 'Clipping not found');
  }
};
