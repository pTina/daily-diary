# Daily Diary

개인·회사 일정과 할 일을 한 캘린더에서 관리하는 반응형 웹 다이어리입니다.

배포: https://ptina.github.io/daily-diary/

## 기능

- 월간 캘린더, 날짜별 할 일 목록
- 회사 / 개인 그룹 필터 및 색상 설정
- 할 일 추가·수정·삭제, 완료 체크, 드래그로 순서·그룹 변경
- 시간, 반복, 브라우저 알림
- Google 로그인 (재방문 시 자동 로그인)
- Firestore로 기기 간 동기화

## 기술 스택

React, TypeScript, Vite, Tailwind CSS, KRDS, TanStack Query, Zustand, React Router, dnd-kit, Firebase (Auth + Firestore)

## 로컬 실행

```bash
npm i
```

프로젝트 루트에 `.env`를 만들고 Firebase 웹 앱 설정값을 넣습니다.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

```bash
npm run dev
```

`.env`는 git에 올리지 않습니다. 값을 바꾼 뒤에는 개발 서버를 재시작하세요.

## Firebase 설정

Spark(무료) 플랜 기준으로 Auth + Firestore만 사용합니다.

1. Firebase 프로젝트에서 **Authentication → Google** 로그인을 켭니다.
2. Firestore는 **Standard** 버전으로 만듭니다.
3. 규칙 예시: `firestore.rules` (`users/{uid}`는 본인만 읽기/쓰기)
4. Authorized domains에 `localhost`와 `ptina.github.io`를 추가합니다. 경로는 넣지 않습니다.

## 배포

GitHub Pages (`gh-pages` 브랜치)로 배포합니다.

1. 저장소 Settings → Pages → Deploy from a branch → `gh-pages` / root
2. 로컬에서 다시 배포할 때:

```bash
npm run build
npx gh-pages -d dist -b gh-pages
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
