# Jakhabitat 360° Virtual Tour Documentation

## Overview
Sistem virtual tour 360° untuk website Jakhabitat yang memungkinkan user melihat unit apartemen secara interaktif dengan teknologi panorama dan hotspot navigation.

## Features

### 1. Virtual Tour 360°
- **Interactive panorama view** dengan drag & zoom
- **Hotspot navigation** antar ruangan
- **Auto fullscreen** untuk pengalaman optimal
- **Toggle mode** antara static dan 360° view

### 2. Unit Management
- **Upload panorama** dengan kategori ruangan
- **Set default panorama** untuk setiap unit
- **Delete panorama** dengan konfirmasi
- **Toast notifications** untuk feedback

### 3. Hotspot System
- **Debug mode** untuk set koordinat hotspot
- **Click coordinates** untuk positioning
- **3D hotspot rendering** di panorama
- **Navigation** antar ruangan via hotspot

## Architecture

### Frontend Components
```
src/components/
├── Tour360.tsx              # Main 360° viewer component
├── Tour360Modal.tsx         # Fullscreen 360° modal
├── ContentModal.tsx         # Unit gallery modal
└── cms/
    ├── UnitTourManager.tsx  # Admin upload interface
    └── MediaManager.tsx     # Hotspot management
```

### Backend API Endpoints
```
/api/jakhabitat/
├── public/
│   ├── master-unit          # GET - List all units
│   └── panoramas/:unitId    # GET - Get unit panoramas
├── panoramas                # GET - All panoramas (admin)
├── panoramas/:id            # DELETE - Delete panorama
├── upload/panorama          # POST - Upload panorama
└── hotspots/:photoId        # GET - Get photo hotspots
```

### Database Schema
```sql
-- Panorama photos
WEBSITE_JAKHABITAT_FOTO (
  ID NUMBER PRIMARY KEY,
  FILENAME VARCHAR2(255),
  ORIGINAL_NAME VARCHAR2(255),
  FILE_PATH VARCHAR2(500),
  UNIT_ID NUMBER,
  ROOM_CATEGORY VARCHAR2(50),
  IS_DEFAULT NUMBER(1) DEFAULT 0,
  CREATED_AT TIMESTAMP
)

-- Hotspots for navigation
WEBSITE_JAKHABITAT_HOTSPOTS (
  ID NUMBER PRIMARY KEY,
  PHOTO_ID NUMBER,
  X_COORDINATE NUMBER,
  Y_COORDINATE NUMBER,
  DESTINATION VARCHAR2(50),
  CREATED_AT TIMESTAMP
)
```

## Usage Guide

### For End Users

#### 1. Viewing Virtual Tour
1. Klik menu "Unit & Tour" di landing page
2. Pilih tower yang diinginkan
3. Klik "Lihat 360°" untuk membuka virtual tour
4. Toggle "360° ON/OFF" untuk switch view mode
5. Drag untuk look around, scroll untuk zoom
6. Klik green dots (hotspots) untuk navigasi antar ruangan

#### 2. Navigation Controls
- **Drag**: Look around dalam 360°
- **Scroll**: Zoom in/out
- **Green dots**: Hotspots untuk pindah ruangan
- **Dots navigation**: Switch antar foto
- **"Galeri" button**: Kembali ke galeri foto
- **Close button**: Tutup modal

### For Administrators

#### 1. Upload Panorama
1. Login ke admin panel
2. Masuk menu "Konten" → "Unit & Tour"
3. Pilih unit dan kategori ruangan
4. Centang "Set sebagai panorama default" jika diperlukan
5. Upload file panorama (PNG/JPG max 10MB)

#### 2. Set Hotspots
1. Masuk menu "Media" → pilih foto panorama
2. Aktifkan "Debug Mode"
3. Klik pada foto untuk set koordinat hotspot
4. Catat koordinat yang muncul di console
5. Simpan hotspot dengan destination ruangan

#### 3. Manage Photos
- **View details**: Klik tombol "Detail" di tabel
- **Delete photo**: Klik tombol "Hapus" dengan konfirmasi
- **Set default**: Centang saat upload untuk foto utama

## Technical Details

### Coordinate System
Hotspot menggunakan sistem koordinat percentage:
- **X: 0-100%** → Longitude (0°-360°)
- **Y: 0-100%** → Latitude (180°-0°, inverted)

### 3D Conversion Formula
```javascript
const convertTo3D = (x, y, radius = 25) => {
  const xPercent = parseFloat(x.toString().replace('%', '')) / 100;
  const yPercent = parseFloat(y.toString().replace('%', '')) / 100;
  
  const phi = xPercent * Math.PI * 2;
  const theta = (1 - yPercent) * Math.PI;
  
  return [
    -radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi)
  ];
};
```

### File Structure
```
panorama images: /images/jakhabitat/360/YYYY/MM/DD/
API base URL: https://dprkp.jakarta.go.id/api/jakhabitat/
Image URL: https://dprkp.jakarta.go.id/api/jakhabitat/image/{filename}
```

## Configuration

### Environment Variables
```env
DB_USER=system
DB_PASSWORD=Pusd4t1n2025
DB_CONNECT_STRING=10.15.38.162:1539/FREEPDB1
```

### Dependencies
```json
{
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "three": "^0.x",
  "lucide-react": "^0.x"
}
```

## Troubleshooting

### Common Issues

#### 1. React Error #300
- **Cause**: Three.js texture loading error
- **Solution**: Wrap Canvas dengan Suspense, add error boundaries

#### 2. Hotspot Position Incorrect
- **Cause**: Wrong coordinate conversion
- **Solution**: Use debug mode untuk test koordinat

#### 3. Photo Not Loading
- **Cause**: File path atau permission issue
- **Solution**: Check file exists di server, verify URL

#### 4. Modal Not Opening
- **Cause**: Z-index conflict atau state issue
- **Solution**: Check z-index values, verify state management

### Debug Mode
Aktifkan debug mode untuk:
- Set koordinat hotspot dengan klik
- View koordinat di console log
- Test hotspot positioning
- Troubleshoot navigation issues

## Performance Optimization

### Image Optimization
- Compress panorama images sebelum upload
- Use WebP format jika supported
- Implement lazy loading untuk gallery

### 3D Rendering
- Limit texture resolution untuk mobile
- Use lower polygon count untuk hotspots
- Implement LOD (Level of Detail) system

### Caching
- Cache panorama images di browser
- Use service worker untuk offline access
- Implement CDN untuk faster loading

## Security Considerations

### File Upload
- Validate file type dan size
- Sanitize filename
- Check for malicious content
- Limit upload rate

### API Security
- Implement proper authentication
- Rate limiting untuk API calls
- Input validation dan sanitization
- CORS configuration

## Future Enhancements

### Planned Features
- **VR support** untuk Oculus/Meta Quest
- **Audio narration** untuk guided tour
- **Measurement tools** untuk ukur ruangan
- **Furniture placement** AR feature
- **Social sharing** panorama links
- **Analytics** untuk track user behavior

### Technical Improvements
- **WebXR integration** untuk VR devices
- **Progressive loading** untuk large images
- **Offline mode** dengan service worker
- **Mobile optimization** untuk touch controls
- **Performance monitoring** dan optimization

## Support

### Contact Information
- **Developer**: Amazon Q Assistant
- **Project**: Jakhabitat Virtual Tour
- **Version**: 1.0.0
- **Last Updated**: September 2025

### Resources
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Oracle Database Guide](https://docs.oracle.com/database/)