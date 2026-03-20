# 🚀 Asan Test Planı

## ✅ Hazır Olan

### Frontend ✅
- **Status:** İŞLƏYİR!
- **Port:** 5173
- **URL:** http://localhost:5173

### Backend ⏳
- **Status:** BAŞLAYIR... (bir neçə dəqiqə gözlə)
- **Port:** 8080
- **URL:** http://localhost:8080

---

## 📝 Test Addımları

### ADDIM 1: Frontend-i Test Et (İNDİ MÜMKÜN!)

**Frontend artıq işləyir, test edə bilərsən!**

1. **Browser-i aç:** http://localhost:5173/login

2. **Login ol:**
   - Email: `hr@test.com`
   - Password: `password123`

3. **Test et:**

   ✅ **UI-ı yoxla (Backend lazım DEYİL):**
   - Dashboard səhifəsi açılır?
   - Menyu işləyir?
   - Səhifələr arası keçid işləyir?
   - Kartlar və dizayn düzgün görünür?

   **Getməli səhifələr:**
   - `/hr/dashboard` - Əsas dashboard
   - `/hr/questions` - Question Bank
   - `/hr/candidates` - Namizədlər
   - `/hr/decisions` - HR Decision Panel
   - `/hr/upskilling` - Upskilling
   - `/hr/talent-matching` - Talent Matching
   - `/hr/ai-dashboard` - AI Metrics

---

### ADDIM 2: Backend Hazır Olanda (5-10 dəqiqə sonra)

**Backend-in hazır olub-olmadığını yoxla:**

```powershell
# Bu əmri terminalda icra et:
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
```

**Əgər cavab gələrsə:**
```json
{
  "status": "UP"
}
```

**Yaxşı! Backend hazırdır! İndi tam test et:**

---

### ADDIM 3: Tam Funksional Test (Backend Hazır Olanda)

#### 🔐 Login Test
1. Aç: http://localhost:5173/login
2. Email: `hr@test.com`
3. Password: `password123`
4. Gözlə: Dashboard açılmalı

---

#### 2️⃣ Question Generation

**Səhifə:** http://localhost:5173/hr/questions

**Test:**
1. "Generate Questions" düyməsi tap
2. Form doldur:
   - Job Role: `Senior Java Developer`
   - Skills: `Java, Spring Boot, Microservices`
   - Experience: `Senior`
   - Count: `5`
3. "Generate" klikləyib
4. **Gözlənilən:** 5 sual yaradılsın və görünsün

---

#### 3️⃣ Auto-Scoring

**Səhifə:** http://localhost:5173/hr/candidates

**Test:**
1. Namizədlərin siyahısını gör
2. Hər namizədin ballarına bax (0-100)
3. Score bar-ların rəng kodlarını yoxla:
   - 🟢 Yaşıl: >80
   - 🟡 Sarı: 60-80
   - 🔴 Qırmızı: <60
4. Sıralama düyməsini test et

---

#### 4️⃣ Behavioral Analysis

**Səhifə:** http://localhost:5173/hr/decisions

**Test:**
1. Namizədlərin siyahısından birini seç (məsələn, Elvin Mammadov)
2. "Behavioral Analysis" kartına bax
3. **Yoxla:**
   - ✅ Confidence Level görsənir? (məs: 85%)
   - ✅ Stress Response badge-i var? (CALM/MODERATE/NERVOUS)
   - ✅ Communication Style var? (CLEAR/FRIENDLY)
   - ✅ Adaptability var? (HIGH/MODERATE/LOW)
   - ✅ Engagement Level bar-ı görsənir?

---

#### 5️⃣ Explainable AI

**Səhifə:** http://localhost:5173/hr/decisions (eyni səhifə)

**Test:**
1. Namizəd seçdikdən sonra aşağı scroll et
2. "AI Reasoning (Explainable AI)" bölməsini tap
3. **Yoxla:**
   - ✅ Bullet list görünür?
   - ✅ Hər səbəb aydın şəkildə yazılıb?
   - ✅ Lightbulb ikonu (💡) var?
   - ✅ 3-5 səbəb sadalanır?

**Nümunə nəticə:**
- ✓ Strong technical skills (95%)
- ✓ 8+ years experience (100%)
- ✓ CALM stress response (85%)

---

#### 6️⃣ Upskilling

**Səhifə:** http://localhost:5173/hr/upskilling

**Test:**
1. Namizəd seç
2. "Analyze Skill Gaps" klikləyib
3. **Yoxla:**
   - ✅ Skill gap kartları görsənir?
   - ✅ Gap severity (CRITICAL/HIGH/MEDIUM) göstərilir?
   - ✅ Current vs Target skills müqayisəsi var?

4. "Generate Learning Path" klikləyib
5. **Yoxla:**
   - ✅ Kurs tövsiyələri görsənir?
   - ✅ Hər kursun provider-i var? (Udemy, Coursera, etc)
   - ✅ Difficulty level var? (Beginner/Intermediate)
   - ✅ Duration göstərilir? (8 hours, etc)
   - ✅ Rating var? (4.5★, etc)

---

#### 7️⃣ Global Talent Matching

**Səhifə:** http://localhost:5173/hr/talent-matching

**Test:**
1. Job Details doldur:
   - Job Title: `Senior Java Developer`
   - Skills: `Java, Spring Boot`
   - Location: `Baku`
   - Experience: `Senior`
2. "Find Matches" klikləyib
3. **Yoxla:**
   - ✅ Namizəd kartları görsənir?
   - ✅ Match score (0-100) var?
   - ✅ Skill breakdown görünür?
   - ✅ Top 20 namizəd göstərilir?

---

#### 8️⃣ HR Review & Decision

**Səhifə:** http://localhost:5173/hr/decisions

**Test:**
1. Sol tərəfdə namizəd siyahısı görsənməli
2. Bir namizəd seç (məsələn: Elvin Mammadov)
3. **Sağ tərəfdə bu kartlar görsənməli:**
   - 📄 CV Analysis
   - 🎯 Interview Scores
   - 🧠 Behavioral Analysis
   - 📊 Skill Gap Analysis
   - 💡 AI Reasoning

4. **Aşağıda HR Decision düymələri:**
   - 🟢 HIRE
   - 🔴 REJECT
   - 🟡 MAYBE
   - 🔵 SECOND_INTERVIEW

5. Bir qərar seç və yoxla:
   - ✅ Qərar yadda qalır?
   - ✅ Notes yazmaq mümkündür?
   - ✅ Success mesajı görsənir?

6. "Provide Feedback" düyməsini test et:
   - ✅ Modal açılır?
   - ✅ Form doldurulur?
   - ✅ Submit işləyir?

---

## 🧪 Test Checklist

### Frontend UI (Backend olmadan)
- [ ] Login səhifəsi açılır
- [ ] Dashboard yüklənir
- [ ] Menyu navigation işləyir
- [ ] Bütün səhifələr açılır
- [ ] Kartlar və komponenetlər görünür
- [ ] Dizayn düzgündür (rənglər, ikonlar)
- [ ] Responsive (mobil/tablet/desktop)
- [ ] Loading spinners görsənir

### Backend Integration (Backend hazır olanda)
- [ ] Login backend ilə işləyir
- [ ] Question Generation API çağırır
- [ ] Scoring API-dən məlumat gəlir
- [ ] Behavioral Analysis data alır
- [ ] Explainable AI səbəblər göstərir
- [ ] Upskilling API işləyir
- [ ] Matching API cavab verir
- [ ] HR Review yaradılır
- [ ] Decision submit olunur
- [ ] Feedback göndərilir

### Data Flow
- [ ] API call-lar успешно
- [ ] Loading state-lər görsənir
- [ ] Data UI-da görsənir
- [ ] Error handling işləyir
- [ ] Success toasts görsənir
- [ ] Validation işləyir

---

## 🎯 Backend Hazır Olanda Tam Test

Backend hazır olanda bu skripti işə sal:

```powershell
cd C:\Users\Nurlan\Desktop\Devinsigt3
.\test-ai-features.ps1
```

Bu skript:
- ✅ Backend-i yoxlayır
- ✅ Login edir
- ✅ Bütün 8 API-ni test edir
- ✅ Nəticələri göstərir

---

## 📊 Hal-hazırda Status

```
✅ Frontend:  İŞLƏYİR  (Port 5173)
⏳ Backend:   BAŞLAYIR (Port 8080 - 5-10 dəqiqə)

Frontend artıq test edilə bilər!
Backend hazır olanda tam test ediləcək.
```

---

## 💡 İndi Nə Eləmək Olar?

### Frontend Test (İNDİ)
1. Aç: http://localhost:5173/login
2. Login: `hr@test.com` / `password123`
3. Hər səhifəyə get və UI-ı yoxla
4. Dizayn və layout-u test et
5. Responsive-ni yoxla (browser-i kiçilt/böyüt)

### Backend Test (5-10 dəqiqə sonra)
1. Bu əmri terminalda icra et:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
   ```
2. Əgər `status: UP` gördünsə, backend hazırdır!
3. Test skriptini işə sal:
   ```powershell
   .\test-ai-features.ps1
   ```
4. Yaxud frontend-də button-lara klikləyib əl ilə test et

---

## 🐛 Problem Olarsa

### Frontend açılmır
```powershell
cd devInsight-frontend
npm run dev
```

### Backend başlamır
```powershell
cd devInsight-backend
./gradlew clean bootRun
```

### Port tutulub
```powershell
# Port 8080
netstat -ano | findstr :8080
# Proses ID-si tap və kill et
taskkill /PID <PID> /F

# Port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Browser console error-lar
- F12 bas
- Console tab-a bax
- Network tab-da API call-ları yoxla

---

## 📝 Test Nəticələri

**Hər xüsusiyyəti test edəndən sonra qeyd et:**

```
✅ Question Generation - İŞLƏYİR / Problems: ...
✅ Auto-Scoring - İŞLƏYİR / Problems: ...
✅ Behavioral Analysis - İŞLƏYİR / Problems: ...
✅ Explainable AI - İŞLƏYİR / Problems: ...
✅ Upskilling - İŞLƏYİR / Problems: ...
✅ Global Matching - İŞLƏYİR / Problems: ...
✅ HR Review - İŞLƏYİR / Problems: ...
```

---

**Uğurlar! İndi frontend-i test edə bilərsən!** 🚀

**Backend 5-10 dəqiqəyə hazır olacaq!** ⏱️
