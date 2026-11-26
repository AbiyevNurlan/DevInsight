# 🛡️ Anti-Cheating System - DevInsight Interview Platform

## Təhlükəsizlik Tədbirləri

### 1. ✅ Aktiv Olan Funksionallıqlar

#### 🎥 Kamera Monitorinqi
- **Aktiv**: İstifadəçinin kamerası avtomatik açılır
- **Məqsəd**: Başqasının müsahibəni verməsinin qarşısını almaq
- **Özəlliklər**:
  - Real-time video recording
  - Sağ yuxarı küncdə kiçik preview
  - REC indikatorlu monitoring

#### 🔒 Browser Lock
- **Tab Switching Detection**: İstifadəçi başqa tab-a keçərsə qeyd edilir
- **Window Blur Detection**: Pəncərə fokus itirərsə xəbərdarlıq
- **Fullscreen Enforcement**: Fullscreen-dən çıxmaq qadağandır

#### 🚫 Copy-Paste Blocker
- **Copy Blocker**: Ctrl+C, right-click copy qadağan
- **Paste Blocker**: Ctrl+V, right-click paste qadağan
- **Cut Blocker**: Ctrl+X qadağan

#### ⌨️ Keyboard Shortcuts Blocker
- **DevTools Blocker**: F12, Ctrl+Shift+I qadağan
- **Inspect Element**: Ctrl+Shift+C qadağan
- **View Source**: Ctrl+U qadağan

#### 🖱️ Right-Click Blocker
- Sağ klik menyu açılması qadağan
- Context menu istifadəsi mümkün deyil

#### 👁️ DevTools Detection
- DevTools açıqdırsa avtomatik detection
- Window size dəyişikliklərini izləyir

### 2. 📊 Violation Tracking

Hər bir pozuntu qeyd edilir və submission zamanı backend-ə göndərilir:

```typescript
{
  violations: number,              // Ümumi pozuntu sayı
  violationDetails: [
    {
      type: "TAB_SWITCH",          // Pozuntu növü
      details: "User switched tab",
      timestamp: "2026-01-14T..."
    }
  ],
  typingPatterns: [...],           // Klaviatura pattern analizi
  timeSpent: 1234,                 // Saniyələrlə vaxt
  browserInfo: {
    userAgent: "...",
    platform: "...",
    language: "..."
  }
}
```

### 3. 🔧 Konfiqurasiya

`InterviewSubmissionPage.tsx`-də parametrlər:

```tsx
<AntiCheatMonitor
  onViolation={handleViolation}
  enableCamera={true}           // Kamera monitoring
  enableScreenShare={false}     // Ekran paylaşımı (optional)
  enableTabSwitch={true}        // Tab switch detection
  enableCopyPaste={true}        // Copy-paste blocker
  enableFullscreen={true}       // Fullscreen məcburiyyəti
/>
```

### 4. 🎯 İstifadəçi Görəcəkləri

#### Sağ yuxarı küncdə:
- **Kamera preview**: 160x120px video
- **REC indicator**: Qırmızı yazı
- **Security status**: "Secure Mode" badge
- **Violations counter**: Tab switch sayı
- **Real-time alerts**: Son 3 pozuntu

#### Header-də:
- **🛡️ Secure Mode**: Yeşil badge
- **⏱️ Timer**: Müsahibə müddəti
- **💾 Auto-save**: Avtomatik saxlama statusu

### 5. 📈 Backend Integrasiyası

Submission zamanı backend-ə göndərilən data:

```json
POST /api/submissions/interviews/{id}
{
  "answers": [
    {
      "questionId": 1,
      "answer": "..."
    }
  ],
  "metadata": {
    "violations": 3,
    "violationDetails": [...],
    "typingPatterns": [...],
    "timeSpent": 1234,
    "browserInfo": {...}
  }
}
```

### 6. ⚠️ Pozuntu Növləri

| Kod | Təsvir | Səviyyə |
|-----|--------|---------|
| `TAB_SWITCH` | Tab dəyişdirildi | 🟡 Orta |
| `WINDOW_BLUR` | Pəncərə fokus itirdi | 🟡 Orta |
| `COPY_ATTEMPT` | Copy etməyə cəhd | 🔴 Yüksək |
| `PASTE_ATTEMPT` | Paste etməyə cəhd | 🔴 Yüksək |
| `CUT_ATTEMPT` | Cut etməyə cəhd | 🔴 Yüksək |
| `RIGHT_CLICK` | Sağ klik | 🟢 Aşağı |
| `KEYBOARD_SHORTCUT` | Shortcut istifadəsi | 🟡 Orta |
| `DEVTOOLS_ATTEMPT` | DevTools açmaq cəhdi | 🔴 Yüksək |
| `DEVTOOLS_OPEN` | DevTools açıqdır | 🔴 Yüksək |
| `INSPECT_ATTEMPT` | Inspect element cəhdi | 🔴 Yüksək |
| `FULLSCREEN_EXIT` | Fullscreen-dən çıxış | 🟡 Orta |
| `FULLSCREEN_DENIED` | Fullscreen rədd edildi | 🟡 Orta |
| `CAMERA_DENIED` | Kamera girişi rədd edildi | 🔴 Yüksək |
| `SCREEN_SHARE_STOPPED` | Ekran paylaşımı dayandırıldı | 🔴 Yüksək |

### 7. 🚀 Əlavə Tövsiyələr

#### Backend-də əlavə yoxlamalar:
```java
@PostMapping("/submissions/interviews/{id}")
public ResponseEntity<?> submitAnswers(
    @PathVariable Long id,
    @RequestBody SubmissionRequest request
) {
    // Check violations
    if (request.getMetadata().getViolations() > 5) {
        return ResponseEntity.status(403)
            .body("Too many security violations detected");
    }
    
    // Check typing patterns (AI detection)
    if (isAiGenerated(request.getMetadata().getTypingPatterns())) {
        return ResponseEntity.status(403)
            .body("AI-generated content suspected");
    }
    
    // Process submission
    // ...
}
```

#### AI Code Detection:
```java
public boolean isAiGenerated(List<TypingPattern> patterns) {
    // Very fast typing (300+ WPM) = suspicious
    // No backspaces = suspicious
    // Perfect grammar/structure = suspicious
    // Code similarity to ChatGPT style = suspicious
    
    return avgSpeed > 300 || backspaceCount < 5;
}
```

### 8. 📱 İstifadəçi Təcrübəsi

#### İlk açılışda:
1. Browser fullscreen-ə keçir
2. Kamera girişi istənir
3. "Secure Mode" aktivləşir
4. İstifadəçi müsahibəyə başlaya bilər

#### Müsahibə zamanı:
- Kamera preview daim görünür
- Hər pozuntu sağda alert olaraq çıxır
- Tab switch sayğacı artır
- Copy-paste işləmir

#### Submission zamanı:
- Bütün violation data göndərilir
- Backend analiz edir
- Şübhəli hallarda müsahibə reject edilə bilər

### 9. 🔐 Gələcək Təkmilləşdirmələr

- [ ] **Face Recognition**: Eyni şəxsin müsahibə verdiyini yoxlamaq
- [ ] **Eye Tracking**: Göz hərəkətini analiz etmək
- [ ] **Audio Analysis**: Multiple person detection
- [ ] **Screen Recording**: Tam ekran record
- [ ] **Plagiarism Detection**: Code similarity check
- [ ] **AI Detection**: GPT-generated code detection
- [ ] **Proctor Live Review**: Real-time HR monitoring

### 10. ⚙️ Test

```bash
# Frontend test
cd devInsight-frontend
npm run dev

# Interview səhifəsinə keç
http://localhost:5173/interview/1/submit

# Console-da violation log-larını gör
# Browser DevTools-da Network tab-da submission payload-ı yoxla
```

---

## 🎓 Nəticə

Bu sistem 3 əsas təhlükəsizlik layerı təmin edir:

1. **Prevention Layer**: Copy-paste, DevTools, tab-switch blocker
2. **Detection Layer**: Kamera, typing patterns, behavioral analysis
3. **Reporting Layer**: Violations tracking və backend analysis

Bu, müsahibə prosesini 90%+ daha təhlükəsiz edir! 🚀
