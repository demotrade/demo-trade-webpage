/**
 * Egységesíti a bemásolt vagy mentett cikkek / leírások HTML kódját:
 * - Eltávolítja az idegen betűtípusokat (Arial, Times New Roman, Helvetica stb.), betűméreteket és Word/Mac szemét stílusokat (-webkit-text-stroke, <font> stb.)
 * - A szöveges bekezdéseket alapértelmezetten sorkizárttá (text-align: justify) teszi
 * - Összefűzi a PDF/Word másolás miatt mondat közben (pl. vesszőnél) széttört bekezdéseket
 * - A táblázatokat megtisztítja a fix, szűk pixel-szélességektől és középre igazítja
 */
export function normalizeRichContentHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  if (typeof DOMParser === 'undefined') return rawHtml;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="norm-root">${rawHtml}</div>`, 'text/html');
    const root = doc.getElementById('norm-root');
    if (!root) return rawHtml;

    // 1. <font> és <span class="Apple-converted-space"> elemek kicsomagolása (tartalom megtartásával)
    root.querySelectorAll('font, span.Apple-converted-space').forEach(el => {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });

    // 2. Üres formázó tagek (<b></b>, <strong></strong>, <i></i>) eltávolítása
    root.querySelectorAll('b, strong, i, em, u, span').forEach(el => {
      if (!el.textContent.trim() && el.children.length === 0) {
        el.remove();
      }
    });

    // 3. Táblázatokon belüli üres <p><br></p> térközök eltávolítása és cellák tisztítása
    root.querySelectorAll('table').forEach(table => {
      table.removeAttribute('width');
      table.removeAttribute('height');
      table.removeAttribute('cellspacing');
      table.removeAttribute('cellpadding');
      table.className = 'article-data-table';
      table.setAttribute('style', 'margin: 1.8rem auto; border-collapse: collapse; width: 100%;');

      table.querySelectorAll('tr, td, th, tbody, thead').forEach(cell => {
        cell.removeAttribute('width');
        cell.removeAttribute('height');
        cell.removeAttribute('valign');
        cell.removeAttribute('class');
        cell.removeAttribute('style');
      });

      table.querySelectorAll('p').forEach(p => {
        const txt = p.textContent.replace(/\u00a0/g, ' ').trim();
        if (!txt && p.querySelectorAll('img').length === 0) {
          p.remove();
        } else {
          p.removeAttribute('class');
          p.setAttribute('style', 'text-align: center; margin: 0.15rem 0;');
        }
      });
    });

    // 4. Táblázaton kívüli üres <p><br></p> vagy <p>&nbsp;</p> spacer bekezdések törlése
    Array.from(root.querySelectorAll('p')).forEach(p => {
      if (p.closest('table')) return;
      const hasMedia = p.querySelector('img, iframe, video, table');
      const cleanText = p.textContent.replace(/\u00a0/g, ' ').trim();
      if (!hasMedia && !cleanText) {
        p.remove();
      }
    });

    // 5. Mondat közben (pl. vesszőnél vagy kisbetűs folytatásnál) széttört egymás utáni <p> tagek összefűzése
    let children = Array.from(root.children);
    for (let i = 0; i < children.length - 1; i++) {
      const curr = children[i];
      const next = children[i + 1];
      if (
        curr.tagName === 'P' &&
        next.tagName === 'P' &&
        !curr.querySelector('img, table, iframe') &&
        !next.querySelector('img, table, iframe')
      ) {
        const currText = curr.textContent.replace(/\u00a0/g, ' ').trim();
        const nextText = next.textContent.replace(/\u00a0/g, ' ').trim();

        // Ha az első bekezdés nem mondatzáró írásjellel (. ! ? : ;) végződik, VAGY a következő kisbetűvel indul
        const endsIncomplete = currText.length > 0 && !/[.!?:;]$/.test(currText);
        const startsLower = nextText.length > 0 && /^[a-záéíóöőúüű]/.test(nextText);

        if (endsIncomplete || startsLower) {
          curr.innerHTML = `${curr.innerHTML.replace(/(&nbsp;|\s)+$/g, '')} ${next.innerHTML.replace(/^(&nbsp;|\s)+/g, '')}`;
          next.remove();
          children = Array.from(root.children);
          i--; // Ellenőrizzük, hogy a következővel is összefűzhető-e
        }
      }
    }

    // 6. Minden elem inline stílusának megtisztítása az idegen betűtípusoktól és méretektől
    root.querySelectorAll('*').forEach(el => {
      if (el.closest('table') || el.tagName === 'TABLE') return;

      // Word / Apple Pages osztályok törlése (kivéve saját wp-caption / aligncenter)
      if (el.className && typeof el.className === 'string') {
        const allowedClasses = el.className
          .split(/\s+/)
          .filter(c => ['wp-caption', 'wp-caption-text', 'aligncenter', 'alignnone', 'size-full', 'article-data-table'].includes(c));
        if (allowedClasses.length > 0) {
          el.className = allowedClasses.join(' ');
        } else {
          el.removeAttribute('class');
        }
      }

      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        // Megtartjuk a tudatos szövegszínt vagy kiemelést (ha nem fekete alapértelmezett), és az igazítást
        const keptStyles = [];
        const alignMatch = styleAttr.match(/text-align\s*:\s*(center|right|justify)/i);
        if (alignMatch) {
          keptStyles.push(`text-align: ${alignMatch[1].toLowerCase()}`);
        } else if (el.tagName === 'P') {
          keptStyles.push('text-align: justify');
        }

        const colorMatch = styleAttr.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
        if (colorMatch) {
          const col = colorMatch[1].trim().toLowerCase();
          if (col !== '#000' && col !== '#000000' && col !== 'rgb(0, 0, 0)' && col !== 'black' && col !== '#1e293b') {
            keptStyles.push(`color: ${colorMatch[1].trim()}`);
          }
        }

        const bgMatch = styleAttr.match(/background(?:-color)?\s*:\s*([^;]+)/i);
        if (bgMatch) {
          const bg = bgMatch[1].trim().toLowerCase();
          if (bg !== 'transparent' && bg !== '#fff' && bg !== '#ffffff' && bg !== 'rgb(255, 255, 255)' && bg !== 'white') {
            keptStyles.push(`background-color: ${bgMatch[1].trim()}`);
          }
        }

        if (keptStyles.length > 0) {
          el.setAttribute('style', keptStyles.join('; ') + ';');
        } else {
          el.removeAttribute('style');
        }
      } else if (el.tagName === 'P') {
        el.setAttribute('style', 'text-align: justify;');
      }
    });

    return root.innerHTML.trim();
  } catch (err) {
    console.warn('HTML normalizer fallback:', err);
    return rawHtml;
  }
}
