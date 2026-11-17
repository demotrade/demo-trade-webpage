import { renderNotFoundPage } from './NotFoundPage.js';
import { normalizeRichContentHtml } from '../utils/contentNormalizer.js';

export function renderBlogPage(posts, activePostId, searchTerm = '', selectedCategory = 'all', currentPage = 1) {
  // If an active article is selected, render Single Article view
  if (activePostId) {
    const post = posts.find(p => p.id === activePostId);
    if (!post) {
      return renderNotFoundPage();
    }
    return `
      <div class="container blog-single-container" style="padding-top: calc(80px + 2.5rem); padding-bottom: 5rem;">
        <button class="btn btn-outline back-to-blog-btn" style="margin-bottom: 2rem;">
          <i class="fa-solid fa-arrow-left"></i> Vissza a hírekhez
        </button>

        <article class="article-header">
          <div style="margin-bottom: 1rem;">
            <span class="blog-category">${post.category}</span>
            <span style="color: var(--gray-500); font-size: 0.9rem; margin-left: 1rem;">
              <i class="fa-regular fa-calendar"></i> ${post.date} &bull; <i class="fa-regular fa-user"></i> ${post.author}
            </span>
          </div>
          <h1 style="font-size: clamp(1.6rem, 4.5vw, 2.4rem); font-weight: 900; line-height: 1.3; color: var(--dark);">${post.title}</h1>
        </article>

        <img src="${post.image}" alt="${post.title}" class="article-cover" />

        <div class="article-content">
          ${normalizeRichContentHtml(post.content)}
        </div>

        <!-- SHARE BUTTONS -->
        <div style="max-width: 840px; margin: 3rem auto 0; padding-top: 2rem; border-top: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="font-weight: 700; color: var(--gray-700);">Cikk megosztása:</div>
          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
            <button class="btn-outline share-btn-fb" data-title="${encodeURIComponent(post.title)}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
              <i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Facebook
            </button>
            <button class="btn-outline share-btn-in" data-title="${encodeURIComponent(post.title)}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
              <i class="fa-brands fa-linkedin" style="color: #0a66c2;"></i> LinkedIn
            </button>
            <button class="btn-outline share-btn-copy" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
              <i class="fa-solid fa-link"></i> Link másolása
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Filter posts by search term
  let filteredPosts = posts;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredPosts = filteredPosts.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.excerpt.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  const postsPerPage = 6;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  return `
    <div class="blog-page-wrapper">
      <!-- DEDICATED HERO HEADER BANNER -->
      <header class="blog-hero-banner">
        <div class="container">
          <div class="blog-hero-content">
            <div class="blog-hero-badge">
              <i class="fa-solid fa-newspaper"></i> Hírek &amp; Cikkek
            </div>
            <h1 class="blog-hero-title">Agrár Szakmai Blog</h1>
            <p class="blog-hero-subtitle">
              Friss hírek, vidékfejlesztési támogatások és növényvédelmi előrejelzések egy helyen.
              <span class="blog-count-pill">${filteredPosts.length} bejegyzés</span>
            </p>
          </div>

          <!-- FILTER BAR -->
          <div class="blog-search-bar">
            <div class="search-input-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="blog-search" placeholder="Keresés hírekben, kifejezésekben..." value="${searchTerm}" />
            </div>
          </div>
        </div>
      </header>

      <!-- POSTS GRID -->
      <div class="container blog-posts-container" style="padding-bottom: 5rem;">
        ${paginatedPosts.length === 0 ? `
          <div style="text-align: center; padding: 4rem 0; color: var(--gray-500);">
            <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Nincs a keresésnek megfelelő bejegyzés</h3>
            <p>Próbáljon meg más keresőszót megadni!</p>
          </div>
        ` : `
          <div class="blog-grid">
            ${paginatedPosts.map(post => `
              <div class="blog-card">
                <img src="${post.image}" alt="${post.title}" class="blog-card-img" />
                <div class="blog-card-body">
                  <div class="blog-meta">
                    <span class="blog-category">${post.category}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                  </div>
                  <h3 class="blog-card-title">${post.title}</h3>
                  <p class="blog-card-excerpt">${post.excerpt}</p>
                  <div class="blog-card-footer">
                    <span><i class="fa-regular fa-user"></i> ${post.author}</span>
                    <button class="btn-outline view-post-btn" data-id="${post.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                      Elolvasom <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- PAGINATION CONTROLS: Smart sliding window with ellipsis and arrows -->
          ${totalPages > 1 ? (() => {
            let startPage, endPage;
            if (totalPages <= 3) {
              startPage = 1;
              endPage = totalPages;
            } else {
              if (validPage <= 2) {
                startPage = 1;
                endPage = 3;
              } else if (validPage >= totalPages - 1) {
                startPage = totalPages - 2;
                endPage = totalPages;
              } else {
                startPage = validPage - 1;
                endPage = validPage + 1;
              }
            }

            const pageButtons = [];
            for (let p = startPage; p <= endPage; p++) {
              pageButtons.push(`
                <button class="blog-page-btn blog-page-num ${p === validPage ? 'active' : ''}" data-page-num="${p}" aria-label="${p}. oldal">
                  ${p}
                </button>
              `);
            }

            return `
              <div class="blog-pagination">
                <button class="blog-page-btn blog-page-nav" data-page-num="${validPage - 1}" ${validPage === 1 ? 'disabled' : ''} aria-label="Előző oldal">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                
                ${startPage > 1 ? '<span class="blog-pagination-dots">&hellip;</span>' : ''}
                
                ${pageButtons.join('')}
                
                ${endPage < totalPages ? '<span class="blog-pagination-dots">&hellip;</span>' : ''}
                
                <button class="blog-page-btn blog-page-nav" data-page-num="${validPage + 1}" ${validPage === totalPages ? 'disabled' : ''} aria-label="Következő oldal">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            `;
          })() : ''}
        `}
      </div>
    </div>
  `;
}
