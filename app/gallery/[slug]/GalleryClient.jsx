// Di dalam GalleryClient.jsx / tsx

const saveSelection = async (slug, selectedPhotos) => {
  try {
    // Tampilkan state loading jika perlu
    // setIsLoading(true);

    const response = await fetch('/api/gallery/selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: slug,
        selectedPhotos: selectedPhotos
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Tangani error dari server (expired, limit, dll)
      // Tampilkan toast / alert error ke user
      alert(`Gagal: ${data.error}`);
      return;
    }

    // Sukses!
    // Tampilkan notifikasi sukses atau pindah halaman
    alert('Berhasil: ' + data.message);
    
  } catch (error) {
    console.error('Error saving selection:', error);
    alert('Terjadi kesalahan jaringan, coba lagi nanti.');
  } finally {
    // setIsLoading(false);
  }
};
