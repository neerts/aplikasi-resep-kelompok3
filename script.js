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

// Variabel global untuk menyimpan data resep
let globalRecipes = [];

/* ==================
   FUNGSI UTAMA
================== */

// Fungsi baru untuk membuat 1 kartu resep (List View)
// (Tidak berubah dari langkah kita sebelumnya)
function createRecipeCard(resep) {
    const card = document.createElement("div");
    card.className = "latest-card-list"; 

    const resepId = resep.id;
    const thumb = resep.photo_url;
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
    const { data: allRecipes, error } = await supabase
        .from('resep')
        .select('*')
        .order('created_at', { ascending: false });

    // 3. Render resep
    container.innerHTML = ""; 
    
    if (error) {
        console.error("Gagal mengambil resep:", error);
        container.innerHTML = "<p class='article-desc'>Gagal memuat resep.</p>";
        return;
    }
    
    if (allRecipes.length === 0) {
        container.innerHTML = "<p class='article-desc'>Belum ada resep. Klik tombol (+) untuk membuat resep pertamamu!</p>";
        return;
    }

    // --- PERUBAHAN PENTING: Simpan resep ke variabel global ---
    globalRecipes = allRecipes;

    // Tampilkan setiap resep
    for (const resep of globalRecipes) { // Gunakan globalRecipes di sini
        const card = createRecipeCard(resep);
        container.appendChild(card);
    }

    // 4. Inisialisasi Fungsi Pencarian & Sugesti (MENGGANTIKAN BLOK LAMA)
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const suggestionsBox = document.getElementById('suggestions-box');
    
    let currentSuggestions = []; // Simpan hasil filter

    // Event listener saat pengguna MENGETIK
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Bersihkan sugesti jika query kosong
        if (query.length === 0) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            currentSuggestions = [];
            return;
        }

        // Filter dari globalRecipes
        const filteredRecipes = globalRecipes.filter(resep => 
            resep.title.toLowerCase().includes(query)
        ).slice(0, 5); // Ambil maks 5 hasil

        currentSuggestions = filteredRecipes; // Simpan untuk tombol search
        suggestionsBox.innerHTML = ''; // Kosongkan box

        if (filteredRecipes.length > 0) {
            filteredRecipes.forEach(resep => {
                const item = document.createElement('a');
                item.href = `artikel.html?resep=${resep.id}`;
                item.className = 'suggestion-item';
                
                // Highlight/Bold teks yang cocok
                const title = resep.title;
                // 'gi' = global, case-insensitive
                const regex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                item.innerHTML = title.replace(regex, (match) => `<strong>${match}</strong>`);
                
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.style.display = 'block';
        } else {
            // Tampilkan "Tidak ada hasil"
            const noResult = document.createElement('div');
            noResult.className = 'suggestion-no-result';
            noResult.textContent = 'Tidak ada resep ditemukan...';
            suggestionsBox.appendChild(noResult);
            suggestionsBox.style.display = 'block';
        }
    });

    // Logika Tombol Search (diperbarui)
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        
        if (currentSuggestions.length > 0) {
            // Pergi ke hasil pertama jika ada sugesti
            window.location.href = `artikel.html?resep=${currentSuggestions[0].id}`;
        } else if (query.length > 0) {
            // Jika ada teks tapi tidak ada sugesti
            alert(`Tidak ada resep ditemukan untuk: "${query}"`);
        } else {
            // Jika kosong
            alert('Silakan masukkan resep yang ingin dicari.');
        }
    });
    
    // Sembunyikan sugesti jika klik di luar area pencarian
    document.addEventListener('click', (e) => {
        // Cek apakah yg diklik BUKAN bagian dari .search-section
        if (!e.target.closest('.search-section')) {
             suggestionsBox.innerHTML = '';
             suggestionsBox.style.display = 'none';
             currentSuggestions = [];
        }
    });
});
