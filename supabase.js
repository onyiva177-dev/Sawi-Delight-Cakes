// Supabase Configuration - Sawi's Delight Cakes
const SUPABASE_URL = 'https://ueiekavacznhqlclvtiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWVrYXZhY3puaHFsY2x2dGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzUzOTYsImV4cCI6MjA4Nzg1MTM5Nn0.qiA2VSxITLnS_cygAa_VtlPPRQArmNcF2MRMUZa-HWU';

// The UMD build exposes the library as window.supabase (an object with createClient)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Database Helper Functions ───────────────────────────────────────────────

async function fetchBusinessInfo() {
  const { data, error } = await supabase.from('business_info').select('*').single();
  if (error) { console.error('fetchBusinessInfo:', error); return null; }
  return data;
}

async function fetchCakes() {
  const { data, error } = await supabase
    .from('cakes')
    .select(`*, cake_images(*), cake_details(*)`)
    .order('sort_order');
  if (error) { console.error('fetchCakes:', error); return []; }
  // Sort nested arrays
  return data.map(c => ({
    ...c,
    cake_images: (c.cake_images || []).sort((a, b) => a.sort_order - b.sort_order),
    cake_details: (c.cake_details || []).sort((a, b) => a.sort_order - b.sort_order)
  }));
}

async function fetchFeatures() {
  const { data, error } = await supabase.from('features').select('*').order('sort_order');
  if (error) { console.error('fetchFeatures:', error); return []; }
  return data;
}

async function fetchOrderingSteps() {
  const { data, error } = await supabase.from('ordering_steps').select('*').order('step_number');
  if (error) { console.error('fetchOrderingSteps:', error); return []; }
  return data;
}

async function fetchTestimonials() {
  const { data, error } = await supabase.from('testimonials').select('*').order('sort_order');
  if (error) { console.error('fetchTestimonials:', error); return []; }
  return data;
}

async function fetchAboutContent() {
  const { data, error } = await supabase.from('about_content').select('*').order('paragraph_number');
  if (error) { console.error('fetchAboutContent:', error); return []; }
  return data;
}

// ─── Admin Update Functions ───────────────────────────────────────────────────

async function updateBusinessInfo(info) {
  const { error } = await supabase.from('business_info').update(info).eq('id', info.id);
  if (error) throw error;
}

async function updateCake(id, data) {
  const { error } = await supabase.from('cakes').update(data).eq('id', id);
  if (error) throw error;
}

async function updateCakeImages(cakeId, images) {
  // Delete existing then re-insert
  await supabase.from('cake_images').delete().eq('cake_id', cakeId);
  if (images.length > 0) {
    const { error } = await supabase.from('cake_images').insert(
      images.map((img, i) => ({ cake_id: cakeId, url: img.url, alt: img.alt, sort_order: i }))
    );
    if (error) throw error;
  }
}

async function updateCakeDetails(cakeId, details) {
  await supabase.from('cake_details').delete().eq('cake_id', cakeId);
  if (details.length > 0) {
    const { error } = await supabase.from('cake_details').insert(
      details.map((d, i) => ({ cake_id: cakeId, label: d.label, value: d.value, sort_order: i }))
    );
    if (error) throw error;
  }
}

async function addFeature(feature) {
  const { error } = await supabase.from('features').insert(feature);
  if (error) throw error;
}

async function updateFeature(id, data) {
  const { error } = await supabase.from('features').update(data).eq('id', id);
  if (error) throw error;
}

async function deleteFeature(id) {
  const { error } = await supabase.from('features').delete().eq('id', id);
  if (error) throw error;
}

async function addOrderingStep(step) {
  const { error } = await supabase.from('ordering_steps').insert(step);
  if (error) throw error;
}

async function updateOrderingStep(id, data) {
  const { error } = await supabase.from('ordering_steps').update(data).eq('id', id);
  if (error) throw error;
}

async function deleteOrderingStep(id) {
  const { error } = await supabase.from('ordering_steps').delete().eq('id', id);
  if (error) throw error;
}

async function addTestimonial(t) {
  const { error } = await supabase.from('testimonials').insert(t);
  if (error) throw error;
}

async function updateTestimonial(id, data) {
  const { error } = await supabase.from('testimonials').update(data).eq('id', id);
  if (error) throw error;
}

async function deleteTestimonial(id) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

async function updateAboutParagraph(id, content) {
  const { error } = await supabase.from('about_content').update({ content }).eq('id', id);
  if (error) throw error;
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

async function uploadCakeImage(file, path) {
  const { data, error } = await supabase.storage.from('cake-images').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('cake-images').getPublicUrl(path);
  return publicUrl;
}
