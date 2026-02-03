# SereneRead – iOS Reading Timer (Expo)

미니멀 리딩 타이머 앱. 포모도로 스타일 타이머, ASMR 노이즈(화이트/핑크/브라운), 책별·일별 기록, 주간 스택 바·월간 인텐시티 그리드로 진행률을 확인할 수 있습니다.

## 요구 사항

- Node.js 18+
- Xcode (iOS 시뮬레이터/기기 빌드)
- iOS만 지원 (Android 미지원)

## 로컬 실행

1. 의존성 설치  
   ```bash
   npm install
   ```

2. 노이즈 오디오 파일 생성 (최초 1회)  
   ```bash
   npm run generate-noise
   ```
   `assets/sounds/` 에 `white.wav`, `pink.wav`, `brown.wav` 가 생성됩니다.

3. 개발 서버 실행  
   ```bash
   npx expo start
   ```

4. iOS 빌드 및 시뮬레이터 실행  
   ```bash
   npm run ios
   ```
   - CocoaPods UTF-8 오류가 나면 터미널에서 `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` 후 다시 실행  
   - **첫 빌드는 10~15분** 걸릴 수 있습니다 (네이티브 컴파일)  
   - 이미 `ios/`와 Pods가 있으면 `npm run ios`만으로 빌드·실행됩니다.

## 프로덕션 iOS 빌드 전

- **앱 아이콘**: `assets/icon.png` (1024×1024) 를 추가한 뒤 빌드하세요. 없으면 Expo 기본 아이콘이 사용될 수 있습니다.
- **번들 ID**: `app.json` → `expo.ios.bundleIdentifier` (`com.sereneread.app`) 를 원하는 값으로 수정할 수 있습니다.

## 프로젝트 구조

```
├── App.tsx                 # 루트 앱 (폰트 로드, 레이아웃, 타이머/통계 토글)
├── index.js                # Expo 진입점
├── app.json                # Expo 설정 (iOS 전용)
├── theme.ts                # 컬러/스타일 상수
├── constants.ts            # 스토리지 키, 팔레트
├── types.ts                # Book, DailyStats, ASMRType
├── components/
│   ├── Layout.tsx          # 배경·메인 틀
│   ├── TimerDisplay.tsx    # MM:SS 표시
│   ├── BookManager.tsx     # 책 선택/추가/수정/삭제
│   └── StatsChart.tsx      # 주간 스택 바 + 월간 그리드
├── services/
│   ├── AudioService.ts     # expo-av 기반 ASMR 재생
│   └── StorageService.ts   # AsyncStorage 래핑
├── hooks/
│   └── useHaptic.ts        # expo-haptics 래핑
├── assets/
│   └── sounds/             # white.wav, pink.wav, brown.wav (generate-noise로 생성)
└── scripts/
    └── generate-noise.js   # 노이즈 WAV 생성 스크립트
```

## 데이터·목업

- **목업 데이터 없음**: 첫 실행 시 책 목록·통계는 비어 있습니다.
- **저장소**: `AsyncStorage`  
  - `sereneread_books` : 책 목록  
  - `sereneread_stats_v3` : 일별·책별 읽은 시간(초)

## 라이선스

MIT
