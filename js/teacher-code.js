// A local entry code for a static site, not server-side authentication.
// Keeping a digest avoids displaying the entry code in the form or page source.
const expected='08f618f3467d397e0f0a5b517473270c6cfc7ac9f77a8860510fe7e095cd5f1e';
export async function matchesTeacherCode(value){
  if(typeof value!=='string'||value.length>64)return false;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value.trim()));
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')===expected;
}
