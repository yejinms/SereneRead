<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SereneRead - Aesthetic Reading Timer

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: https://ai.studio/apps/drive/1zp23zJOKJAOX677eAbkB4_bPCAyR7YHD

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to GitHub Pages

이 앱은 GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

### 배포 설정 방법

1. **GitHub 저장소 생성 및 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **GitHub Pages 설정**
   - GitHub 저장소로 이동
   - Settings → Pages 메뉴로 이동
   - Source를 "GitHub Actions"로 선택

3. **환경 변수 설정 (선택사항)**
   - Settings → Secrets and variables → Actions로 이동
   - `GEMINI_API_KEY`를 추가 (필요한 경우)

4. **자동 배포**
   - `main` 브랜치에 코드를 푸시하면 자동으로 빌드 및 배포됩니다
   - Actions 탭에서 배포 진행 상황을 확인할 수 있습니다
   - 배포가 완료되면 `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`에서 앱을 확인할 수 있습니다

### 수동 배포

GitHub Actions 워크플로우를 수동으로 실행하려면:
- Actions 탭 → "Deploy to GitHub Pages" 워크플로우 선택 → "Run workflow" 클릭
