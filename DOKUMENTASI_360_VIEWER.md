# Dokumentasi 360° Object Viewer

## Overview
Sistem 360° Object Viewer menggunakan frame-based rotation yang di-extract dari video menggunakan FFmpeg untuk memberikan pengalaman rotasi objek yang halus dan responsif.

## Cara Mengganti Video

### 1. Upload Video Baru
- Upload video baru ke folder `/public/gedung/`
- Nama file contoh: `dprkp.mp4`

### 2. Extract Frames dengan FFmpeg
```bash
cd /Users/admin/Documents/WEBSITE/jakhabitat/public/gedung
~/bin/ffmpeg -i namavideomu.mp4 -vf fps=10 -q:v 2 ../frames360/frame_%03d.jpg
```

**Parameter FFmpeg:**
- `-i namavideomu.mp4`: Input video file
- `-vf fps=10`: Extract 10 frames per detik
- `-q:v 2`: Kualitas tinggi (1-31, semakin kecil semakin bagus)
- `../frames360/frame_%03d.jpg`: Output format dengan 3 digit padding

### 3. Hitung Jumlah Frames
```bash
ls ../frames360/frame_*.jpg | wc -l
```

### 4. Update Kode
Edit file `/src/pages/Landing.tsx`:
```tsx
<Object360Viewer 
  images={Array.from({length: JUMLAH_FRAMES_BARU}, (_, i) => 
    `/jakhabitat/frames360/frame_${String(i + 1).padStart(3, '0')}.jpg`
  )}
  className="w-full h-screen"
/>
```

Ganti `JUMLAH_FRAMES_BARU` dengan hasil dari langkah 3.

## Struktur File
```
public/
├── gedung/
│   ├── dprkp.mp4 (video asli)
│   └── gedung3.mp4 (video baru)
└── frames360/
    ├── frame_001.jpg
    ├── frame_002.jpg
    └── ... (603 frames)
```

## Komponen yang Digunakan
- **Object360Viewer**: Component untuk rotasi frame-based
- **VideoTo360Viewer**: Component untuk rotasi video-based (tidak digunakan)

## Tips Optimasi
- **FPS**: Gunakan fps=10 untuk balance antara kualitas dan ukuran file
- **Kualitas**: `-q:v 2` untuk kualitas terbaik, `-q:v 5` untuk ukuran lebih kecil
- **Format**: JPG untuk kompresi yang baik, PNG untuk kualitas maksimal

## Troubleshooting
- **FFmpeg not found**: Install dengan `curl -L https://evermeet.cx/ffmpeg/ffmpeg-6.1.zip -o ffmpeg.zip`
- **Frames tidak muncul**: Periksa path dan jumlah frames di kode
- **Loading lambat**: Kurangi fps atau kualitas image