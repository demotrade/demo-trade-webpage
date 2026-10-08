export function renderAboutPage() {
  return `
    <div class="container" style="padding-top: 4rem; padding-bottom: 5rem;">
      <div class="section-title">
        <span class="subtitle">Demo-Trade Kft.</span>
        <h2>Rólunk</h2>
      </div>

      <div style="max-width: 900px; margin: 0 auto; background: white; padding: 3rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);">
        <h3 style="font-size: 1.8rem; margin-bottom: 1.5rem; color: var(--dark);">Szakmai szaktanácsadási központ</h3>
        <p style="font-size: 1.15rem; line-height: 1.8; color: var(--gray-800); margin-bottom: 1.5rem;">
          Küldetésünk, hogy minél több termelőnek megkönnyítsük az agrár- és vidékfejlesztéshez kapcsolódó ügyintézését. Szakmai szaktanácsadási központként a technológiai és növényvédelmi szaktanácsadástól kezdve a pályázati lehetőségek kiaknázásán át a permetezőgépek felülvizsgálatáig állunk ügyfeleink rendelkezésére.
        </p>
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--gray-700);">
          Tevékenységünk során kiemelt figyelmet fordítunk arra, hogy a gazdálkodók számára átlátható, szakszerű és jogszabályoknak megfelelő támogatást nyújtsunk a mezőgazdasági termelés minden fázisában.
        </p>
      </div>
    </div>
  `;
}
