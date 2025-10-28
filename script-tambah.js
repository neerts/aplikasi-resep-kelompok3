// File: script-tambah.js (Diperbarui)
document.addEventListener('DOMContentLoaded', () => {

    // (Semua elemen di atas sini tetap sama)
    const bahanListContainer = document.getElementById('bahan-list');
    const tambahBahanBtn = document.getElementById('tambah-bahan-btn');
    const totalCostSpan = document.getElementById('total-cost');
    const form = document.getElementById('recipeForm');
    const submitBtn = document.getElementById('submit-btn');

    // === ELEMEN BARU UNTUK PROGRESS BAR ===
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // (Fungsi calculateTotal tetap SAMA)
    const calculateTotal = () => {
        let total = 0;
        const semuaInputHarga = document.querySelectorAll('.harga-bahan');
        semuaInputHarga.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        totalCostSpan.textContent = total.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
    };

    // (Fungsi addBahanRow tetap SAMA)
    const addBahanRow = () => {
        const bahanItem = document.createElement('div');
        bahanItem.classList.add('bahan-item');
        bahanItem.innerHTML = `
            <input type="text" placeholder="Nama Bahan" required>
            <input type="text" placeholder="Jumlah">
            <input type="number" class="harga-bahan" placeholder="Harga" value="0">
            <button type="button" class="hapus-bahan-btn"><i class="fas fa-trash"></i></button>
        `;
        bahanListContainer.appendChild(bahanItem);
        bahanItem.querySelector('.harga-bahan').addEventListener('input', calculateTotal);
        bahanItem.querySelector('.hapus-bahan-btn').addEventListener('click', () => {
            bahanItem.remove();
            calculateTotal();
        });
    };

    tambahBahanBtn.addEventListener('click', addBahanRow);
    addBahanRow();

    // === FUNGSI BARU UNTUK MENAMPILKAN PROGRESS ===
    const updateProgress = (text, percentage) => {
        progressText.textContent = `${text} ${Math.round(percentage)}%`;
        progressBar.style.width = `${percentage}%`;
    };


    // --- FUNGSI SUBMIT (DIUBAH TOTAL) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memulai...'; // Ganti teks
        progressContainer.style.display = 'block'; // Tampilkan progress bar
        updateProgress('Memulai...', 0);

        try {
            const title = document.getElementById('recipeTitle').value;
            const instructions = document.getElementById('caraMembuat').value;
            const photoFile = document.getElementById('recipePhoto').files[0];
            const videoFile = document.getElementById('recipeVideo').files[0];

            if (!photoFile || !videoFile) {
                throw new Error('Foto dan Video wajib diisi!');
            }

            const photoName = `photo-${Date.now()}-${photoFile.name}`;
            const videoName = `video-${Date.now()}-${videoFile.name}`;

            // 4. Upload Foto (dengan progress)
            const { data: photoData, error: photoError } = await supabase
                .storage
                .from('photos')
                .upload(photoName, photoFile, {
                    cacheControl: '3600',
                    upsert: false,
                    // event listener untuk progress
                    onProgress: (event) => {
                        // Kita alokasikan 0-10% untuk foto
                        const percentage = (event.loaded / event.total) * 10;
                        updateProgress('Mengunggah Foto...', percentage);
                    }
                });
            if (photoError) throw photoError;
            updateProgress('Foto Selesai!', 10); // Foto selesai di 10%

            // 5. Upload Video (dengan progress)
            const { data: videoData, error: videoError } = await supabase
                .storage
                .from('videos')
                .upload(videoName, videoFile, {
                    cacheControl: '3600',
                    upsert: false,
                    // event listener untuk progress
                    onProgress: (event) => {
                        // Kita alokasikan 10-90% untuk video
                        const percentage = 10 + (event.loaded / event.total) * 80;
                        updateProgress('Mengunggah Video...', percentage);
                    }
                });
            if (videoError) throw videoError;
            updateProgress('Video Selesai!', 90); // Video selesai di 90%

            // 6. Dapatkan URL
            const { data: photoUrlData } = supabase.storage.from('photos').getPublicUrl(photoName);
            const { data: videoUrlData } = supabase.storage.from('videos').getPublicUrl(videoName);
            const photoPublicUrl = photoUrlData.publicUrl;
            const videoPublicUrl = videoUrlData.publicUrl;

            // 7. Ambil bahan (SAMA)
            let ingredients = [];
            document.querySelectorAll('.bahan-item').forEach(item => {
                const nama = item.querySelector('input[placeholder="Nama Bahan"]').value;
                const jumlah = item.querySelector('input[placeholder="Jumlah"]').value;
                const harga = parseFloat(item.querySelector('.harga-bahan').value) || 0;
                if (nama) {
                    ingredients.push({ nama, jumlah, harga });
                }
            });

            // 8. Buat objek resep (SAMA)
            const newRecipe = {
                title,
                photo_url: photoPublicUrl,
                video_url: videoPublicUrl,
                ingredients,
                instructions: `<p>${instructions.replace(/\n/g, '</p><p>')}</p>`
            };

            // 9. Simpan ke Database
            updateProgress('Menyimpan Resep...', 95);
            const { data: dbData, error: dbError } = await supabase
                .from('resep')
                .insert([newRecipe]);
            if (dbError) throw dbError;

            // 10. Selesai
            updateProgress('Selesai!', 100);
            alert('Resep berhasil disimpan!');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error saat menyimpan resep:', error.message);
            alert(`Gagal menyimpan resep: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Resep';
            progressContainer.style.display = 'none'; // Sembunyikan jika gagal
        }
    });
});
