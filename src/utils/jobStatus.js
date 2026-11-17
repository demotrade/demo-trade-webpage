// Álláshirdetés aktív / inaktív állapota.
// A státuszt a meglévő `badge` mezőben tároljuk ('inactive' = inaktív), így nincs szükség
// adatbázis-módosításra. Minden korábbi (nem 'inactive' jelölésű) hirdetés aktívnak számít.
export const JOB_INACTIVE_MARK = 'inactive';
export const JOB_ACTIVE_MARK = 'active';

export function isJobActive(post) {
  return !post || post.badge !== JOB_INACTIVE_MARK;
}

export function getActiveJobs(posts) {
  return (posts || []).filter(p => p.type === 'career' && isJobActive(p));
}
