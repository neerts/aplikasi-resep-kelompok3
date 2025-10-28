// File: script.js (Homepage)

/* ==================
   FUNGSI BANTU
================== */

// Fungsi untuk menampilkan notifikasi kecil
let toastTimer;
function showToast(msg) {
	let el = document.querySelector('.toast');
	if (!el) {
		el = document.createElement('div');
		el.className = 'toast';
		document.body.appendChild(el);
	}
	el.textContent = msg;
	el.classList.add('show');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

/* ==================
   FUNGSI UTAMA
================== */

// Fungsi baru untuk membuat 1 kartu resep (List View)
// Data 'resep' sekarang datang dari Supabase
function createRecipeCard(resep) {
    const card = document.createElement("div");
    card.className = "latest-card-list"; 

    // Ambil data langsung dari objek resep Supabase
    const resepId = resep.id;
    const thumb = resep.photo_url; // Pakai foto dari Supabase
    const title = resep.title;

    card.innerHTML = `
      <a href="artikel.html?resep=${resepId}" class="thumb-wrapper-list">
        <img src="${thumb || 'https://via.placeholder.com/320x180?text=%20'}" alt="${title}" loading="lazy">
      </a>
      <div class="details-wrapper-list">
        <div class="meta-list">
          <a href="artikel.html?resep=${resepId}" class="title-list">
            ${title}
          </a>
          <span class="meta-line-list">
            Resepku • Dibuat pengguna
          </span>
        </div>
        <div class="dots-menu-yt">
          <button class="dots-btn-yt" data-id="${resepId}">⋮</button>
          <div class="kebab-menu dropdown-yt">
            <button class="menu-item" data-act="share" data-id="${resepId}" data-title="${title}">Bagikan</button>
            <hr class="menu-sep">
            <button class="menu-item" data-act="copy" data-id="${resepId}">Salin tautan</button>
          </div>
        </div>
      </div>
    `;
    return card;
}


// Fungsi yang dijalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Ambil container
    const container = document.getElementById('latestArticlesList');
    if (!container) return;

    // 2. Ambil resep dari SUPABASE
    // (Tidak perlu lagi ambil dari localStorage atau database.js)
    
    const { data: allRecipes, error } = await supabase
        .from('resep') // Nama tabel Anda
        .select('*')
        .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

    // 3. Render resep
    container.innerHTML = ""; // Bersihkan pesan "Memuat..."
    
    if (error) {
        console.error("Gagal mengambil resep:", error);
        container.innerHTML = "<p class='article-desc'>Gagal memuat resep.</p>";
        return;
    }
    
    if (allRecipes.length === 0) {
        container.innerHTML = "<p class='article-desc'>Belum ada resep. Klik tombol (+) untuk membuat resep pertamamu!</p>";
        return;
    }

    // Tampilkan setiap resep
    for (const resep of allRecipes) {
        const card = createRecipeCard(resep); // Kirim seluruh objek resep
        container.appendChild(card);
    }

    // 4. Fungsi search bar (masih dummy, tidak berubah)
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value;
            if (query) {
                alert(`Mencari resep untuk: ${query}`);
            } else {
                alert('Silakan masukkan resep yang ingin dicari.');
            }
        });
    }
});


// 5. Event listener untuk menu titik tiga (diperbarui)
document.addEventListener('click', async (e) => {
  
  // Logika untuk Buka/Tutup dropdown (tetap sama)
  const dotsBtn = e.target.closest('.dots-btn-yt');
  if (dotsBtn) {
    e.preventDefault();
    const dropdown = dotsBtn.nextElementSibling;
    document.querySelectorAll('.dropdown-yt').forEach(d => {
      if (d !== dropdown) d.style.display = 'none';
    });
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
    return;
  }
  if (!e.target.closest('.dots-menu-yt')) {
    document.querySelectorAll('.dropdown-yt').forEach(d => d.style.display = 'none');
  }
  
  // Logika untuk item menu (Share/Copy)
  const menuItem = e.target.closest('.dots-menu-yt .menu-item');
  if (menuItem) {
    e.preventDefault();
    const act = menuItem.dataset.act;
    const resepId = menuItem.dataset.id;
    
    if (!resepId) return; 

    // Ambil judul dari data-title (TIDAK perlu query ke DB lagi)
    const title = menuItem.dataset.title || 'Resep Enak';
    
    // Buat URL lengkap
    const cleanPath = location.pathname.replace('index.html', '');
    const url = `${location.origin}${cleanPath}artikel.html?resep=${resepId}`;
    
    if (act === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Tautan berhasil disalin');
      } catch (err) {
        showToast('Gagal menyalin tautan');
      }
    }
    
    if (act === 'share') {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Lihat resep ${title} di Aplikasi Resepku!`,
          url: url
        }).catch(err => console.error('Gagal bagikan:', err));
      } else {
        // Fallback jika 'share' tidak didukung
        try {
          await navigator.clipboard.writeText(url);
          showToast('Tautan disalin (Share tidak didukung)');
        } catch (err) {
          showToast('Gagal membagikan');
        }
      }
    }
    // Tutup semua dropdown
    document.querySelectorAll('.dropdown-yt').forEach(d => d.style.display = 'none');
  }
});
