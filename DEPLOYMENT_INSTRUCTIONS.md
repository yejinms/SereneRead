# 배포 완료 안내

## 현재 상태
✅ GitHub 저장소 생성 완료: https://github.com/yejinms/SereneRead
✅ 코드 푸시 완료
✅ GitHub Pages 기본 설정 완료

## 남은 작업 (워크플로우 파일 추가)

워크플로우 파일을 추가하려면 다음 단계를 따르세요:

### 방법 1: GitHub 웹사이트에서 직접 추가 (권장)

1. https://github.com/yejinms/SereneRead 로 이동
2. "Add file" → "Create new file" 클릭
3. 파일 경로 입력: `.github/workflows/deploy.yml`
4. 아래 내용을 복사하여 붙여넣기:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GITHUB_REPOSITORY: ${{ github.repository }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. "Commit new file" 클릭

### 방법 2: GitHub Pages 설정 변경

워크플로우 파일을 추가한 후:

1. https://github.com/yejinms/SereneRead/settings/pages 로 이동
2. Source를 "GitHub Actions"로 변경
3. 저장

## 배포 확인

워크플로우 파일을 추가하고 설정을 변경하면:
- 자동으로 빌드가 시작됩니다
- Actions 탭에서 진행 상황을 확인할 수 있습니다
- 배포 완료 후 https://yejinms.github.io/SereneRead/ 에서 앱을 확인할 수 있습니다

## 환경 변수 설정 (선택사항)

GEMINI_API_KEY가 필요한 경우:
1. https://github.com/yejinms/SereneRead/settings/secrets/actions 로 이동
2. "New repository secret" 클릭
3. Name: `GEMINI_API_KEY`
4. Secret: API 키 값 입력
5. "Add secret" 클릭
