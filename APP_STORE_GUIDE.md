# SereneRead 앱스토어 출시 가이드

## 1. 준비 사항

### 1.1 Apple Developer Program
- **가입**: [developer.apple.com](https://developer.apple.com) → Account → Enroll  
- **비용**: 연 $99 (약 13만 원)  
- 가입 후 1~2일 내 승인되는 경우가 많음  

### 1.2 출시 전 체크리스트
- [ ] **앱 아이콘**: `assets/icon.png` 를 **1024×1024px** 실제 아이콘으로 교체 (현재 1x1 플레이스홀더)
- [ ] **번들 ID**: `app.json` 의 `ios.bundleIdentifier` (`com.sereneread.app`) 가 Apple에 등록할 ID와 동일한지 확인
- [ ] **앱 이름/설명**: 앱스토어에 쓸 이름, 부제, 설명, 키워드, 카테고리 정리

---

## 2. 앱스토어에 올리는 두 가지 방법

### 방법 A: Xcode에서 직접 아카이브 후 제출 (로컬 빌드)

Mac에서 Xcode로 Release 빌드 → 아카이브 → App Store Connect에 업로드합니다.

#### Step 1: Release 스킴으로 빌드
1. Xcode에서 **SereneRead.xcworkspace** 열기  
2. 상단 스킴에서 **SereneRead** 선택 → 옆 기기에서 **Any iOS Device (arm64)** 선택  
3. 메뉴 **Product → Scheme → Edit Scheme**  
4. 왼쪽 **Run** 선택 → **Build Configuration** 을 **Release** 로 변경 (테스트 끝났을 때)  
5. **Archive** 할 때는 자동으로 Release 로 빌드됨  

#### Step 2: 서명 설정 (Apple Developer 계정)
1. Xcode 왼쪽에서 **SereneRead** 프로젝트 클릭  
2. **Signing & Capabilities** 탭  
3. **Team**: 본인 Apple Developer 팀 선택 (없으면 Xcode에서 Apple ID 로그인 후 팀 생성)  
4. **Bundle Identifier**: `com.sereneread.app` (또는 등록한 ID)  
5. **Automatically manage signing** 체크  

#### Step 3: 아카이브 & 업로드
1. 메뉴 **Product → Archive**  
2. 아카이브가 끝나면 **Organizer** 창이 뜸  
3. 방금 만든 아카이브 선택 → **Distribute App**  
4. **App Store Connect** → **Upload** 선택 후 다음 단계 진행  
5. 업로드 완료 후 [App Store Connect](https://appstoreconnect.apple.com) 에서 빌드가 “처리 중” → “준비됨” 으로 바뀔 때까지 대기 (보통 10~30분)  

#### Step 4: App Store Connect에서 앱 정보 입력
1. [App Store Connect](https://appstoreconnect.apple.com) 로그인  
2. **내 앱** → **+** 로 새 앱 추가  
   - **플랫폼**: iOS  
   - **이름**: SereneRead  
   - **기본 언어**, **번들 ID** (`com.sereneread.app`), **SKU** 등 입력  
3. **앱 정보** 에서:
   - **이름**, **부제목**, **설명**, **키워드**, **카테고리** (예: 생산성 또는 라이프스타일)  
   - **스크린샷**: iPhone 6.7", 6.5", 5.5" 등 필수 크기에 맞춰 올리기  
   - **앱 아이콘**: 1024×1024 (Connect에서 자동으로 앱 빌드에서 가져오는 경우도 있음)  
4. **빌드** 섹션에서 위에서 업로드한 빌드 선택  
5. **제출하여 검토** 클릭  

---

### 방법 B: EAS Build로 클라우드 빌드 후 제출 (Expo 권장)

Expo 계정으로 로그인해 클라우드에서 iOS 빌드를 만들고, 생성된 `.ipa` 를 다운로드해 Transporter로 업로드하거나, EAS Submit으로 바로 제출할 수 있습니다.

#### Step 1: EAS CLI 설치 및 로그인
```bash
npm install -g eas-cli
eas login
```
(Expo 계정이 없으면 [expo.dev](https://expo.dev)에서 가입)

#### Step 2: 프로젝트에 EAS 설정
```bash
cd /Users/niko/SereneRead
eas build:configure
```
- iOS 선택 후 생성되는 `eas.json` 을 그대로 두거나, 프로필만 수정해서 사용  

#### Step 3: iOS 프로덕션 빌드
```bash
eas build --platform ios --profile production
```
- Apple Developer 계정으로 로그인하라는 안내가 나오면 진행  
- 빌드가 끝나면 다운로드 링크가 나옴 (`.ipa` 파일)  

#### Step 4: App Store Connect에 제출
**옵션 1 – EAS Submit (같은 계정으로 제출)**  
```bash
eas submit --platform ios --latest
```
- App Store Connect 앱이 이미 있고, 빌드가 “준비됨” 상태면 바로 제출 가능  

**옵션 2 – Transporter 앱으로 수동 제출**  
- Mac의 **Transporter** 앱 (App Store에서 설치) 열기  
- EAS에서 받은 `.ipa` 를 드래그해서 업로드  

이후 **방법 A의 Step 4** 와 동일하게 App Store Connect에서 앱 정보·스크린샷 입력 후 “제출하여 검토” 하면 됩니다.

---

## 3. 앱스토어 필수 정보 예시

| 항목 | 예시 |
|------|------|
| **이름** | SereneRead |
| **부제목** | 집중 리딩 타이머 |
| **설명** | 포모도로 스타일의 미니멀 리딩 타이머. ASMR 노이즈, 책별 기록, 주간·월간 통계로 읽기 습관을 만드세요. |
| **키워드** | 독서,타이머,포모도로,집중,ASMR,통계 |
| **카테고리** | 생산성 또는 라이프스타일 |
| **개인정보 처리방침 URL** | (필요 시 본인 사이트 또는 GitHub 페이지) |

---

## 4. 스크린샷 규격 (iPhone)

- **6.7" (iPhone 15 Pro Max 등)**: 1290 × 2796 px  
- **6.5" (iPhone 14 Plus 등)**: 1284 × 2778 px  
- **5.5" (iPhone 8 Plus 등)**: 1242 × 2208 px  

시뮬레이터에서 해당 기기로 실행 → **⌘+S** 로 저장하거나, 디자인 툴에서 동일 비율로 제작하면 됩니다.

---

## 5. 요약 체크리스트

1. [ ] Apple Developer Program 가입 ($99/년)  
2. [ ] `assets/icon.png` 1024×1024 실제 아이콘으로 교체  
3. [ ] Xcode **Signing & Capabilities** 에 팀·번들 ID 설정  
4. [ ] **Product → Archive** 후 **Distribute App** → App Store Connect 업로드  
   - 또는 **EAS Build** 로 빌드 후 **EAS Submit** / Transporter 로 제출  
5. [ ] App Store Connect에서 앱 생성, 이름·설명·스크린샷·빌드 연결  
6. [ ] **제출하여 검토** 후 Apple 검토 대기 (보통 1~3일)  

검토 통과 후 설정한 출시 옵션(수동/자동)에 따라 앱스토어에 노출됩니다.
