# SereneRead → React Native iOS 전환 계획

## 1. 현재 앱 구조 요약

| 항목 | 현재 (Web) | 비고 |
|------|------------|------|
| **프레임워크** | React 19 + Vite | SPA |
| **스타일** | Tailwind CSS (CDN) | `className` 기반 |
| **UI 요소** | `div`, `button`, `span`, `input` | HTML |
| **아이콘** | lucide-react | SVG |
| **차트** | recharts (BarChart, stacked bar) | DOM/SVG |
| **저장소** | localStorage | 동기 API |
| **햅틱** | `navigator.vibrate` | Web API |
| **오디오** | Web Audio API (AudioContext) | 화이트/핑크/브라운 노이즈 생성 |
| **폰트** | Inter, Instrument Serif (Google Fonts) | CDN |

---

## 2. 구조 변경이 필요한 부분

### 2.1 진입점 & 렌더링

- **제거**: `index.html`, `index.tsx`의 `ReactDOM.createRoot`, `document.getElementById('root')`
- **추가**: React Native `AppRegistry`, `App` 등록, iOS용 `index.js` (또는 엔트리 설정)

### 2.2 컴포넌트 매핑

| Web | React Native |
|-----|---------------|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1>` 등 | `<Text>` |
| `<button>` | `<Pressable>` 또는 `<TouchableOpacity>` |
| `<input>` | `<TextInput>` |
| 스크롤 영역 | `<ScrollView>` 또는 `<FlatList>` |

### 2.3 스타일

- **Tailwind** → React Native용 중 하나로 전환 필요:
  - **NativeWind** (Tailwind for RN): 기존 `className` 패턴 유지 가능, 학습 비용 낮음
  - **StyleSheet**: `StyleSheet.create({ ... })` 로 전부 변환

### 2.4 라이브러리 대체

| 용도 | 현재 | React Native 대안 |
|------|------|-------------------|
| 아이콘 | lucide-react | `@expo/vector-icons` 또는 `react-native-vector-icons` |
| 차트 | recharts | `react-native-gifted-charts`, `victory-native`, `react-native-chart-kit` |
| 저장소 | localStorage | `@react-native-async-storage/async-storage` |
| 햅틱 | navigator.vibrate | `expo-haptics` 또는 `react-native-haptic-feedback` |
| 오디오 | Web Audio API | `expo-av` + **사전 제작 노이즈 파일** 또는 네이티브 오디오 모듈 |

### 2.5 오디오 (ASMR) 전략

- Web에서는 JS로 화이트/핑크/브라운 노이즈를 실시간 생성합니다.
- React Native에서는:
  - **옵션 A**: 무음 파일 3종을 미리 만들어 프로젝트에 포함하고, `expo-av`로 재생 (구현 단순, 용량 소량 증가)
  - **옵션 B**: 네이티브 모듈(또는 기존 라이브러리)로 노이즈 생성 (구현 복잡, 유연함)
  - **권장**: 우선 **옵션 A**로 출시 후, 필요 시 B 검토

### 2.6 레이아웃/비주얼

- **Layout.tsx**의 `backdrop-blur`, `blur-[120px]` 등:
  - `expo-blur`의 `<BlurView>` 또는 `@react-native-community/blur` 사용
- **애니메이션** (`animate-pulse`, `scale-105` 등):
  - `react-native-reanimated` + `react-native-gesture-handler` 조합으로 재구현

### 2.7 폰트

- Inter, Instrument Serif:
  - `expo-font`로 번들에 포함하거나, Expo 프로젝트면 `@expo-google-fonts/*` 사용

---

## 3. 권장 폴더 구조 (RN 전환 후)

```
SereneRead/
├── App.tsx                 # RN 루트 (Navigation 또는 단일 화면)
├── index.js                # RN 엔트리
├── app.json / app.config.* # Expo 또는 RN CLI 설정
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── StatsChart.tsx   # 차트 라이브러리로 재작성
│   │   └── BookManager.tsx
│   ├── screens/
│   │   └── HomeScreen.tsx   # 현재 App.tsx의 “페이지” 로직
│   ├── services/
│   │   ├── AudioService.ts  # expo-av 기반으로 재작성
│   │   └── StorageService.ts # AsyncStorage 래핑
│   ├── hooks/
│   │   └── useHaptic.ts     # expo-haptics 래핑
│   └── types.ts
├── assets/
│   ├── fonts/
│   └── sounds/             # white/pink/brown 노이즈 파일 (옵션 A 시)
└── ios/                    # Xcode 프로젝트 (RN CLI 시)
```

- 단일 화면이면 `screens/` 대신 `App.tsx` 안에 현재 “페이지” 로직을 두고, `components/`만 분리해도 됩니다.

---

## 4. 단계별 마이그레이션 계획

| 단계 | 작업 | 산출물 |
|------|------|--------|
| **0** | 실행 전 결정 사항 정리 및 결정 | 아래 “실행 전 결정 사항” 반영 |
| **1** | React Native 프로젝트 생성 (Expo 또는 RN CLI) | 새 RN 루트, `package.json` |
| **2** | 타입/상수 이동 | `types.ts`, 상수, `UNTRACKED_ID` 등 |
| **3** | Storage 서비스 구현 | AsyncStorage 기반, 기존 키/형식 호환 |
| **4** | Layout → View + BlurView | 화면 틀, 배경 블러 |
| **5** | TimerDisplay, 버튼 영역 RN 컴포넌트로 변환 | View, Text, Pressable |
| **6** | BookManager 변환 | ScrollView, TextInput, 롱프레스 등 |
| **7** | StatsChart 변환 | 선정한 RN 차트 라이브러리로 재구현 |
| **8** | AudioService 재구현 | expo-av + 노이즈 파일 또는 네이티브 |
| **9** | 햅틱 훅/유틸 | expo-haptics 등 |
| **10** | App.tsx에 흐름 통합, 상태/효과 검증 | iOS 시뮬레이터/기기 테스트 |
| **11** | 스타일/폰트/접근성 정리 | 최종 UI 정리 |
| **12** | iOS 빌드·출시 설정 | 스토어용 스크린샷, 메타데이터, 인증서 등 |

---

## 5. 실행 전에 결정해야 할 사항

### 5.1 React Native 프로젝트 방식

- **Expo (권장)**  
  - 장점: 빌드·OTA·iOS 설정이 단순함, `expo-av`, `expo-haptics`, `expo-blur`, `expo-font` 등 바로 사용  
  - 단점: 네이티브 코드 직접 수정이 상대적으로 제한적  
  - **결정**: “Expo로 진행” 여부 (예/아니오)

- **React Native CLI**  
  - 장점: 네이티브(iOS/Android) 코드 전면 제어  
  - 단점: Xcode·CocoaPods 설정, 인증서 등 직접 관리  
  - **결정**: “반드시 RN CLI를 써야 하는 이유가 있는지” (예: 특정 네이티브 SDK)

### 5.2 기존 저장소와의 관계

- **옵션 A**: 현재 SereneRead 루트에 RN 프로젝트를 **새 디렉터리**로 만들어 “웹용”과 “모바일용”을 나란히 두기  
  - 예: `SereneRead/web/`, `SereneRead/mobile/`  
- **옵션 B**: **새 저장소**를 만들고 그곳에만 React Native 코드 두기  
- **옵션 C**: 현재 저장소를 **RN 전용으로 전환**하고, 기존 웹 코드는 `web/` 등 하위로 이동  

**결정**: A/B/C 중 어떤 구조를 원하는지.

### 5.3 차트 라이브러리 선택

- **react-native-gifted-charts**: 스택 바·여러 차트 타입, 커스터마이즈 용이  
- **victory-native**: SVG 기반, 디자인 유연하나 설정이 다소 무거움  
- **react-native-chart-kit**: 사용이 단순, 디자인 옵션은 제한적  

**결정**: “스택 바 + 주간/월간 뷰” 요구에 맞게 위 셋 중 하나를 선택할지, 또는 “1차 버전에서는 통계 화면 단순화(예: 숫자/리스트만)”로 갈지.

### 5.4 ASMR 노이즈 처리 방식

- **옵션 A**: 화이트/핑크/브라운 노이즈 **파일 3개**를 준비해 `expo-av`로 재생 (권장)  
- **옵션 B**: 네이티브 모듈 또는 오디오 라이브러리로 **실시간 노이즈 생성**  
- **옵션 C**: 1차 출시에서는 ASMR 기능 제외, 이후 업데이트로 추가  

**결정**: A/B/C 중 하나.

### 5.5 스타일 전략

- **NativeWind** 사용 시: Tailwind 식 클래스 유지 가능, Expo에서 설정 가능  
- **StyleSheet만 사용**: 추가 의존성 없음, 클래스명을 모두 스타일 객체로 바꿔야 함  

**결정**: NativeWind 도입 여부.

### 5.6 출시 범위

- **iOS만** 출시할지, **Android도** 같이 타깃할지.  
  - iOS만 하면 `Platform.OS === 'ios'` 분기만 넣어 두고, 나중에 Android 대응 시 활용 가능.

### 5.7 목업 데이터

- 현재 `App.tsx`에 “이미지 캡처용 목업”이 `useEffect`로 들어가 있음.  
- **결정**: RN 버전에서는  
  - 처음 설치 시 “빈 상태”로 둘지,  
  - 데모용 목업을 유지할지,  
  - 개발 빌드에만 목업을 넣을지.

---

## 6. 결정 사항 체크리스트 (실행 전 확인)

실제 코드 작업에 들어가기 전에 아래를 정해두면 좋습니다.

1. [ ] **RN 방식**: Expo / React Native CLI  
2. [ ] **저장소 구조**: 기존 repo 내 디렉터리 분리 / 새 repo / 현재 repo를 RN 중심으로 전환  
3. [ ] **차트**: 사용할 라이브러리 또는 “통계 단순화” 여부  
4. [ ] **ASMR**: 노이즈 파일 사용(A) / 실시간 생성(B) / 1차 미포함(C)  
5. [ ] **스타일**: NativeWind 사용 여부  
6. [ ] **플랫폼**: iOS 전용으로 할지, Android 포함할지  
7. [ ] **목업**: 빈 상태 / 데모 목업 유지 / 개발 전용 목업  

위를 정한 뒤, “4. 단계별 마이그레이션 계획”의 0단계를 “결정 사항 반영”으로 두고, 1단계(프로젝트 생성)부터 진행하면 됩니다.  
이 문서를 “실행 전 결정용”으로 두고, 선택한 내용을 문서 상단이나 별도 `DECISIONS.md`에 적어두면 이후 구현·리뷰 시 혼선을 줄일 수 있습니다.
