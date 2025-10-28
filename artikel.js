// File: artikel.js

// Fungsi format Rupiah (Tetap sama)
function formatRupiah(angka) {
    return (angka || 0).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
}

// Fungsi untuk menghentikan video (baru)
const stopHeroVideo = () => {
  const video = document.getElementById('hero-video-player');
  if (video) video.pause();
};


// Fungsi utama yang dijalankan saat halaman dimuat
async function loadRecipe() {
    // === 1. AMBIL ELEMEN ===
    const params = new URLSearchParams(window.location.search);
    const resepId = params.get('resep'); // Ini adalah ID angka dari Supabase

    // Elemen Hero Baru
    const titleHero = document.getElementById('article-title-hero');
    const heroVideo = document.getElementById('hero-video-player');
    const heroContainer = document.getElementById('hero-container');
    
    // Elemen Konten
    const articleDesc = document.getElementById('article-desc');
    const ingredientsContainer = document.getElementById('article-ingredients');
    const totalCostEl = document.getElementById('article-total-cost');
    const instructionsContainer = document.getElementById('article-instructions');
    const mainContent = document.querySelector('.article-main-content');

    // Elemen Menu Hapus
    const optionsMenu = document.getElementById('options-menu-container');
    const optionsBtn = document.getElementById('options-menu-btn');
    const optionsDropdown = document.getElementById('options-dropdown-menu');
    const deleteBtn = document.getElementById('delete-recipe-btn');

    // === 2. AMBIL DATA RESEP DARI SUPABASE ===
    if (!resepId) {
        titleHero.textContent = "Resep Tidak Ditemukan";
        heroContainer.style.display = 'none';
        articleDesc.textContent = "ID Resep tidak valid.";
        mainContent.style.display = 'none';
        optionsMenu.style.display = 'none';
        return;
    }

    // Ambil satu resep berdasarkan ID
    const { data: resep, error } = await supabase
        .from('resep')
        .select('*')
        .eq('id', resepId)
        .single(); // .single() untuk ambil 1 objek, bukan array

    // === 3. JIKA RESEP TIDAK DITEMUKAN ===
    if (error || !resep) {
        console.error('Resep tidak ditemukan:', error);
        stopHeroVideo();
        titleHero.textContent = "Resep Tidak Ditemukan";
        heroContainer.style.display = 'none';
        articleDesc.textContent = "Maaf, resep yang Anda cari tidak ada.";
        mainContent.style.display = 'none';
        optionsMenu.style.display = 'none';
        return;
    }

    // === 4. ISI HALAMAN DENGAN DATA RESEP ===
    document.title = resep.title;
    titleHero.textContent = resep.title;

    // Set Video dan Thumbnail (Poster)
    heroVideo.src = resep.video_url;
    heroVideo.poster = resep.photo_url; // Foto thumbnail jadi poster

    // Hitung total biaya dari 'ingredients' (JSON)
    let totalBiaya = 0;
    if (resep.ingredients && Array.isArray(resep.ingredients)) {
        resep.ingredients.forEach(item => {
            totalBiaya += item.harga || 0;
        });
    }
    // Set Deskripsi (kita isi dengan total biaya seperti sebelumnya)
    articleDesc.textContent = `Perkiraan total biaya untuk resep ini adalah ${formatRupiah(totalBiaya)}.`;

    // Set Bahan-bahan (Tabel)
    let ingredientsHTML = '<table>';
    ingredientsHTML += '<tr><th>Bahan</th><th>Jumlah</th><th>Perkiraan Harga</th></tr>';
    if (resep.ingredients && Array.isArray(resep.ingredients)) {
        resep.ingredients.forEach(item => {
            ingredientsHTML += `
                <tr>
                    <td>${item.nama}</td>
                    <td>${item.jumlah}</td>
                    <td>${formatRupiah(item.harga)}</td>
                </tr>
            `;
        });
    }
    ingredientsHTML += '</table>';
    ingredientsContainer.innerHTML = ingredientsHTML;

    // Set Total Biaya (di bawah tabel)
    totalCostEl.textContent = formatRupiah(totalBiaya);

    // Set Instruksi Cara Membuat
    instructionsContainer.innerHTML = resep.instructions;
    
    // === 5. LOGIKA MENU HAPUS (Diperbarui untuk Supabase) ===
    optionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsDropdown.classList.toggle('show');
    });

    deleteBtn.addEventListener('click', async () => {
        if (confirm(`Anda yakin ingin menghapus resep "${resep.title}"?`)) {
            try {
                // Hentikan video sebelum menghapus
                stopHeroVideo();
                deleteBtn.textContent = 'Menghapus...';
                deleteBtn.disabled = true;

                // 1. Hapus file dari Storage
                // Ekstrak nama file dari URL
                const photoName = resep.photo_url.split('/').pop();
                const videoName = resep.video_url.split('/').pop();
                
                if (photoName) {
                    await supabase.storage.from('photos').remove([photoName]);
                }
                if (videoName) {
                    await supabase.storage.from('videos').remove([videoName]);
                }

                // 2. Hapus data dari Database
                await supabase.from('resep').delete().eq('id', resep.id);

                alert('Resep berhasil dihapus.');
                window.location.href = 'index.html';
            } catch (deleteError) {
                alert(`Gagal menghapus resep: ${deleteError.message}`);
                deleteBtn.textContent = 'Hapus Artikel';
                deleteBtn.disabled = false;
            }
        }
    });
    
    // Tutup dropdown jika klik di luar
    window.addEventListener('click', () => {
        if (optionsDropdown.classList.contains('show')) {
            optionsDropdown.classList.remove('show');
        }
    });
}

// Panggil fungsi utama saat DOM dimuat
document.addEventListener('DOMContentLoaded', loadRecipe);
