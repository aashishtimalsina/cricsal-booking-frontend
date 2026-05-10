import api from './axios';

/** @typedef {{ name: string, short_name: string, tagline: string|null, email: string, phone: string, address: string|null, footer_note: string|null }} Company */

export async function fetchCompany() {
  const { data } = await api.get('/company');
  return data.data;
}

/** @param {Partial<Company>} payload */
export async function updateCompany(payload) {
  const { data } = await api.put('/company', payload);
  return data.data;
}
