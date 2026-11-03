# 🌿 잠깐 (Jamkkan) — 하루 한 질문 디지털 디톡스 서비스

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-Android%20Native-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

<br/>

**"지루함을 견디지 못해 무의식적으로 핸드폰을 켜는 당신에게 건네는 3초의 쉼표"**  
하루의 시작을 도파민 스크롤 대신, 스스로를 마주하는 한 번의 질문으로 채우는 디지털 디톡스 & 성찰 크로스 플랫폼 서비스입니다.

[🌐 웹서비스(PWA) 바로가기](https://wnsgk0509.github.io/first_button/) · [📱 안드로이드 APK 다운로드](./잠깐_v1.0.apk)

</div>

---

## 📖 목차
1. [프로젝트 기획 배경](#-프로젝트-기획-배경)
2. [핵심 기능 및 사용자 경험](#-핵심-기능-및-사용자-경험)
3. [기술 아키텍처 및 특징](#-기술-아키텍처-및-특징)
4. [기술 스택](#-기술-스택)
5. [엔지니어링 트러블슈팅 (Troubleshooting)](#-엔지니어링-트러블슈팅-troubleshooting)
6. [프로젝트 디렉토리 구조](#-프로젝트-디렉토리-구조)
7. [설치 및 실행 방법](#-설치-및-실행-방법)

---

## 🎯 프로젝트 기획 배경

* **문제 정의**: 현대인은 잠깐의 여유나 지루함이 생기면 무의식적으로 스마트폰을 켭니다. 이는 개인의 의지 박약이 아니라 손가락의 무의식적 습관 행동입니다.
* **해결책**: 스마트폰을 켜는 순간 **기술적으로 행동을 인터셉트(차단)**하여 3초간 숨을 고르게 하고, 자극적인 숏폼/SNS 대신 **스스로에게 솔직해질 수 있는 하루 1개의 성찰 질문**을 마주하도록 돕습니다.
* **접근 전략**: 초기 프로토타입은 접근성이 높은 **웹(PWA)**으로 검증 후, 스마트폰의 홈화면과 잠금화면을 직접 제어할 수 있는 **네이티브 안드로이드 앱**으로 확장 개발했습니다.

---

## ✨ 핵심 기능 및 사용자 경험

### 1. 🛡️ 3초 멈춤 게이트 (Habit Interceptor)
* 앱이 켜지는 순간 원형 프로그레스 애니메이션과 함께 3초간 동작을 멈추는 게이트 오버레이 노출
* *"지금 이 순간, 어디에 있나요?", "잠깐, 지금 뭘 하려 했나요?"* 등의 메시지로 무의식 스크롤 차단

### 2. 📱 안드로이드 홈화면 위젯 (`AppWidgetProvider`)
* 앱을 굳이 켜지 않아도 스마트폰 홈화면에 오늘의 질문이 항상 머물러 있습니다.
* 터치 시 즉시 앱으로 진입하여 생각을 기록할 수 있는 딥링크 연동

### 3. ⏰ 잠금화면 성찰 알림 (`AlarmManager` & `BroadcastReceiver`)
* 사용자가 원하는 기상/시작 시간(예: 오전 07:00)을 직접 설정
* 해당 시간에 잠금화면과 상단바에 오늘의 성찰 질문이 도착하여 기상 직후 도파민 행동을 방지

### 4. 📊 주간 성찰 리포트 (키워드 텍스트 마이닝)
* 지난 7일간의 기록 달성률을 %와 요일별(월~일) 도트로 시각화
* 작성한 일기 텍스트에서 불용어(조사, 일반 부사 등)를 필터링하고 빈도수를 분석하여 **나의 핵심 키워드 TOP 5** 자동 추출

### 5. 🤝 실시간 익명 광장 (Supabase BaaS)
* 오늘 같은 질문을 마주한 전 세계 다른 사용자들의 깊고 솔직한 생각을 실시간으로 공유
* 내 생각도 닉네임('익명의 나그네')으로 안전하게 광장에 발행
* 댓글이나 비방 없이 오직 서로의 마음에 조용히 새싹을 띄우는 **`🌿 공감해요`** 인터랙션 (로컬 상태 영속화)

### 6. 📤 감성 질문 공유 카드 (`Share` API)
* '오늘의 질문'을 깔끔한 감성 텍스트 템플릿으로 카카오톡, 인스타그램 스토리 등에 원클릭 공유

---

## 🏗️ 기술 아키텍처 및 특징

```
[클라이언트 계층]
  ├── 웹 환경: HTML5, CSS3, Vanilla JS, Service Worker (PWA 캐싱)
  └── 모바일 앱: React Native 0.88, TypeScript
        ├── 4개 화면 탭: 오늘(Today) / 기록(Journal) / 광장(Community) / 설정(Settings)
        └── 로컬 영속화: AsyncStorage (일기, 스트릭, 설정값 캐싱)

[네이티브 브릿지 계층 (Kotlin)]
  ├── JamkkanBridgeModule: React Native ↔ Android Native 양방향 통신
  ├── AppWidgetProvider: 홈화면 위젯 RemoteViews 동기화
  ├── AlarmManager + BroadcastReceiver: 백그라운드 정확한 시간 알람 스케줄링
  └── WindowInsetsControllerCompat: 소프트키 자동 숨김 몰입 모드 제어

[클라우드 백엔드 계층 (BaaS)]
  └── Supabase (PostgreSQL)
        ├── REST API: 익명 광장 실시간 글 조회(GET), 등록(POST), 공감 증감(PATCH)
        ├── RLS (Row Level Security): 누구나 안전하게 읽고 쓸 수 있는 접근 보안 정책
        └── Offline-first: 네트워크 단절 시에도 로컬 캐시를 통한 안정적 피드 렌더링
```

---

## 🛠️ 기술 스택

| 영역 | 기술 스택 | 사용 목적 |
|---|---|---|
| **Frontend** | React Native 0.88, React 19, TypeScript | 크로스 플랫폼 네이티브 모바일 애플리케이션 개발 |
| **Mobile Native** | Android SDK, Kotlin, Gradle 9 | 홈화면 위젯, AlarmManager, 몰입 모드 제어 |
| **Backend / DB** | Supabase (PostgreSQL BaaS), REST API | 실시간 커뮤니티 데이터 영속화 및 RLS 접근 제어 |
| **Local Storage** | `@react-native-async-storage/async-storage` | 개인 성찰 일기, 스트릭, 로컬 설정 오프라인 보관 |
| **Web / PWA** | Vanilla JS, Service Worker, Web App Manifest | 무설치 웹 접속 지원 및 GitHub Pages 배포 |
| **CI / Deploy** | GitHub Actions, Git, Gradle Release Signing | 정적 웹 호스팅 및 standalone 릴리즈 APK 빌드 |

---

## 🔧 엔지니어링 트러블슈팅 (Troubleshooting)

### 1. 최신 안드로이드 Edge-to-Edge 전면 화면 오버랩 해결
* **문제**: 안드로이드 15+ 전면 화면(Edge-to-Edge) 기본 적용으로 인해 상단 상태바(시계/배터리)와 하단 3버튼 소프트키가 앱의 헤더 및 내비게이션 탭바와 겹쳐 가려지는 현상 발생.
* **해결**: `react-native-safe-area-context`의 `SafeAreaProvider` 및 `useSafeAreaInsets`를 결합하여 기기별 상태바 높이(`insets.top`)와 내비게이션 바 높이(`insets.bottom`)를 동적으로 계산하고, 상하단 패딩에 반영하여 완벽한 반응형 뷰포트를 확보했습니다.

### 2. 가상 키패드 활성화 시 입력창 가림 및 시인성 개선
* **문제**: 일기 작성 시 가상 키보드가 올라오면 작성 영역이 키보드 아래에 머물러 있어 사용자가 작성 내용을 확인하기 위해 수동으로 스크롤해야 하는 번거로움 발생.
* **해결**: `Keyboard.addListener`로 키패드 오픈 이벤트를 감지하여 스크롤뷰의 하단 패딩을 동적으로 확장하고, `scrollToEnd({ animated: true })`를 적용하여 텍스트 입력창과 '저장하기' 버튼이 키보드 바로 위로 부드럽게 자동 스크롤되도록 UX를 고도화했습니다. 작성 중에는 하단 탭바를 자동 숨김 처리하여 타이핑 영역을 극대화했습니다.

### 3. AAPT2 이미지 바이너리 헤더 불일치 빌드 오류 해결
* **문제**: 앱 릴리즈 빌드(`assembleRelease`) 도중 `Android resource compilation failed (AAPT: error: file failed to compile)` 오류로 빌드 실패.
* **원인**: 웹 프로젝트의 아이콘 파일이 확장자는 `.png`였으나 내부 헤더가 JPEG(`0xFF 0xD8 ... JFIF`) 포맷으로 생성되어 있어 안드로이드 리소스 컴파일러(AAPT2)의 시그니처 검증을 통과하지 못함.
* **해결**: C#/.NET `System.Drawing` 파이프라인을 활용해 원본 이미지를 실제 PNG 바이너리 규격(`\x89PNG\r\n\x1a\n`)으로 리인코딩하고, 밀도별 mipmap(`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`)으로 분할 생성하여 리소스 컴파일을 100% 정상화했습니다.

### 4. 하단 소프트키 고정 방지 및 몰입 모드(Immersive Sticky Mode) 구현
* **문제**: 기본 테마 상태에서 3버튼 내비게이션 바가 화면을 지속적으로 점유하여 미니멀한 명상 톤앤매너를 저해함.
* **해결**: `MainActivity.kt`에서 `WindowInsetsControllerCompat`을 도입하여 `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE` 및 `hide(WindowInsetsCompat.Type.navigationBars())`를 적용, 평소에는 하단 버튼이 자동으로 숨겨지고 아래에서 위로 쓸어 올렸을 때만 일시적으로 나타나도록 몰입 모드를 구축했습니다.

---

## 📁 프로젝트 디렉토리 구조

```
first_button/
├── index.html                   # 웹서비스 (PWA) 진입점
├── style.css                    # PWA 미니멀 스타일시트
├── app.js                       # 웹 질문 뱅크 및 로컬 스토리지 로직
├── sw.js                        # 오프라인 캐싱 서비스 워커
├── manifest.json                # PWA 설치 매니페스트
├── 잠깐_v1.0.apk                 # 최신 빌드 완료된 안드로이드 릴리즈 APK
│
└── first_button_app/            # React Native 네이티브 앱 프로젝트
    ├── App.tsx                  # 최상위 4개 탭 네비게이션 및 안전 영역 관리
    ├── src/
    │   ├── components/
    │   │   ├── BreathGuide.tsx  # 4-4-4-2 호흡 애니메이션 링
    │   │   └── GateScreen.tsx   # 3초 멈춤 게이트 인터셉터 오버레이
    │   ├── constants/
    │   │   └── questions.ts     # 30개 일일 성찰 질문 뱅크 & 날짜 헬퍼
    │   ├── screens/
    │   │   ├── TodayScreen.tsx  # 오늘의 질문, 일기 작성, 공유 기능
    │   │   ├── JournalScreen.tsx# 기록 목록 & 주간 리포트
    │   │   ├── CommunityScreen.tsx # Supabase 실시간 익명 광장 피드
    │   │   └── SettingsScreen.tsx  # 알림 시간 설정 & 위젯 동기화
    │   └── services/
    │       ├── nativeBridge.ts  # Kotlin NativeModule 브릿지 인터페이스
    │       ├── reportAnalysis.ts# 주간 키워드 마이닝 & 달성률 분석
    │       ├── storage.ts       # AsyncStorage 영속화 서비스
    │       └── supabaseService.ts# Supabase 실시간 REST 통신 및 오프라인 캐싱
    └── android/
        └── app/src/main/
            ├── AndroidManifest.xml
            ├── res/layout/widget_jamkkan.xml        # 홈화면 위젯 XML 레이아웃
            └── java/com/first_button_app/
                ├── JamkkanWidgetProvider.kt         # 위젯 프로바이더 (AppWidgetProvider)
                ├── JamkkanAlarmReceiver.kt          # 잠금화면 알림 수신자 (BroadcastReceiver)
                ├── JamkkanBridgeModule.kt           # RN-네이티브 통신 모듈
                └── MainActivity.kt                  # 몰입 모드 제어 액티비티
```

---

## 🚀 설치 및 실행 방법

### 1. 안드로이드 실기기 직접 설치
1. 본 레포지토리 루트의 [`잠깐_v1.0.apk`](./잠깐_v1.0.apk) 파일을 스마트폰으로 다운로드합니다.
2. 다운로드된 APK 파일을 터치하여 설치합니다. *(‘출처를 알 수 없는 앱 설치’ 허용)*
3. 설치 완료 후 홈화면 빈 곳을 길게 눌러 **[위젯] → [잠깐]** 위젯을 추가합니다.

### 2. 로컬 개발 환경 실행
```bash
# 레포지토리 클론
git clone https://github.com/wnsgk0509/first_button.git
cd first_button/first_button_app

# 의존성 패키지 설치
npm install

# 안드로이드 디버그 실행
npx react-native run-android

# 릴리즈 APK 빌드
cd android
./gradlew assembleRelease
```

---

<div align="center">
  <sub>Built with 🌿 by <a href="https://github.com/wnsgk0509">wnsgk0509</a> · 하루에 한 번, 나를 위한 쉼표를 선물합니다.</sub>
</div>
