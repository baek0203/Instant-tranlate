# Git 사용 가이드 - DragTranslator

이 문서는 DragTranslator 프로젝트에서 Git을 사용하는 방법을 상세히 설명합니다.

## 목차
1. [Git 기본 개념](#git-기본-개념)
2. [초기 설정](#초기-설정)
3. [일상적인 작업 흐름](#일상적인-작업-흐름)
4. [브랜치 관리](#브랜치-관리)
5. [문제 해결](#문제-해결)
6. [협업하기](#협업하기)
7. [유용한 명령어 모음](#유용한-명령어-모음)

---

## Git 기본 개념

### Git이란?
Git은 **분산 버전 관리 시스템(DVCS)**입니다. 코드의 변경 이력을 추적하고, 여러 개발자가 협업할 수 있게 해줍니다.

### 주요 용어

- **Repository (저장소)**: 프로젝트의 파일과 변경 이력이 저장되는 공간
  - **Local Repository**: 내 컴퓨터에 있는 저장소
  - **Remote Repository**: GitHub/GitLab 같은 원격 서버에 있는 저장소

- **Commit (커밋)**: 변경사항을 저장소에 기록하는 것
  - 스냅샷처럼 특정 시점의 프로젝트 상태를 저장
  - 각 커밋은 고유한 ID(해시)를 가짐

- **Branch (브랜치)**: 독립적인 작업 공간
  - 메인 코드에 영향을 주지 않고 새 기능 개발 가능
  - 작업 완료 후 메인 브랜치에 병합(merge)

- **Stage (스테이징)**: 커밋할 파일을 선택하는 중간 단계
  - Working Directory → Staging Area → Repository

- **Working Directory (작업 디렉토리)**: 실제로 파일을 편집하는 공간

---

## 초기 설정

### 1. Git 설치 확인

```bash
git --version
# 출력 예: git version 2.39.0
```

### 2. 사용자 정보 설정

Git 커밋에 포함될 이름과 이메일을 설정합니다.

```bash
# 전역 설정 (모든 프로젝트에 적용)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 현재 프로젝트에만 적용
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 설정 확인
git config --list
```

### 3. 에디터 설정 (선택사항)

```bash
# VS Code를 기본 에디터로 설정
git config --global core.editor "code --wait"

# Vim을 기본 에디터로 설정
git config --global core.editor "vim"
```

### 4. 저장소 초기화

#### 새 프로젝트 시작
```bash
mkdir DragTranslator
cd DragTranslator
git init
```

#### 기존 저장소 클론
```bash
git clone https://github.com/baek0203/DragTranslator.git
cd DragTranslator
```

---

## 일상적인 작업 흐름

### 전체 흐름도

```
작업 디렉토리 → 스테이징 영역 → 로컬 저장소 → 원격 저장소
  (수정)      git add     git commit    git push
```

### 1. 현재 상태 확인

항상 작업 전에 상태를 확인하는 습관을 들이세요.

```bash
git status
```

**출력 예시:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   content.js
        modified:   background.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        fail-and-trial.md

no changes added to commit (use "git add" and/or "git commit -a")
```

**상태 설명:**
- `modified`: 수정된 파일 (아직 스테이징 안 됨)
- `Untracked`: Git이 추적하지 않는 새 파일
- `Changes to be committed`: 커밋 준비된 파일 (스테이징됨)

### 2. 변경사항 확인

```bash
# 수정된 내용 보기 (스테이징 전)
git diff

# 특정 파일만 보기
git diff content.js

# 스테이징된 변경사항 보기
git diff --staged
```

### 3. 파일 스테이징

```bash
# 특정 파일 추가
git add content.js

# 여러 파일 추가
git add content.js background.js

# 모든 변경된 파일 추가
git add .

# 특정 확장자 파일만 추가
git add *.js

# 특정 폴더의 파일 추가
git add src/
```

**주의사항:**
- `git add .`는 현재 디렉토리와 하위 디렉토리의 모든 변경사항을 추가
- `.gitignore`에 명시된 파일은 제외됨

### 4. 커밋 만들기

```bash
# 기본 커밋 (에디터가 열림)
git commit

# 인라인 메시지로 커밋
git commit -m "Fix translation button display issue"

# 모든 수정된 파일을 자동으로 스테이징하고 커밋
git commit -am "Update background.js"

# 여러 줄 메시지
git commit -m "Add retry logic to translation" -m "- Retry up to 2 times on failure
- Add 0.3s delay between retries
- Improve error handling"
```

**좋은 커밋 메시지 작성법:**

```
<타입>: <제목> (50자 이내)

<본문> (선택사항, 72자마다 줄바꿈)

<푸터> (선택사항)
```

**타입 예시:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 파일 수정

**예시:**
```bash
git commit -m "feat: Add retry logic for translation API

- Implement 2-retry mechanism with 0.3s delay
- Add timeout handling (5s per attempt)
- Improve error messages for users

Closes #15"
```

### 5. 원격 저장소에 푸시

```bash
# 기본 푸시
git push

# 처음 푸시할 때 (upstream 설정)
git push -u origin main

# 특정 브랜치에 푸시
git push origin feature-branch
```

### 6. 원격 저장소에서 가져오기

```bash
# 변경사항 확인만 (다운로드하지 않음)
git fetch

# 가져오기 + 병합
git pull

# pull은 fetch + merge와 같음
git fetch origin main
git merge origin/main
```

---

## 브랜치 관리

### 브랜치란?

브랜치를 사용하면 메인 코드에 영향을 주지 않고 독립적으로 작업할 수 있습니다.

```
main branch:      A---B---C---F---G
                       \       /
feature branch:         D---E
```

### 브랜치 기본 명령어

```bash
# 현재 브랜치 확인
git branch

# 모든 브랜치 확인 (원격 포함)
git branch -a

# 새 브랜치 생성
git branch feature/add-settings

# 브랜치 전환
git checkout feature/add-settings

# 브랜치 생성 + 전환 (한 번에)
git checkout -b feature/add-settings

# 최신 Git (2.23+)에서는 switch 사용
git switch feature/add-settings
git switch -c feature/add-settings
```

### 브랜치 작업 흐름

#### 1. 새 기능 개발하기

```bash
# 1. main 브랜치에서 최신 코드 가져오기
git checkout main
git pull origin main

# 2. 새 브랜치 생성
git checkout -b feature/add-dark-mode

# 3. 작업하기
# ... 코드 수정 ...

# 4. 변경사항 커밋
git add .
git commit -m "feat: Add dark mode toggle"

# 5. 원격에 푸시
git push -u origin feature/add-dark-mode
```

#### 2. 브랜치 병합하기

```bash
# 1. main 브랜치로 전환
git checkout main

# 2. 최신 상태로 업데이트
git pull origin main

# 3. feature 브랜치 병합
git merge feature/add-dark-mode

# 4. 원격에 푸시
git push origin main

# 5. 사용 완료한 브랜치 삭제 (선택)
git branch -d feature/add-dark-mode
git push origin --delete feature/add-dark-mode
```

### 브랜치 네이밍 컨벤션

```bash
# 기능 개발
feature/기능명
feature/add-settings
feature/dark-mode

# 버그 수정
fix/버그명
fix/translation-button
fix/memory-leak

# 문서 작업
docs/문서명
docs/api-guide
docs/readme-update

# 리팩토링
refactor/대상
refactor/popup-component
refactor/api-service
```

---

## 문제 해결

### 1. 커밋 취소하기

#### 마지막 커밋 취소 (변경사항 유지)
```bash
git reset --soft HEAD~1
```
- 커밋만 취소, 파일은 스테이징 상태로 유지

#### 마지막 커밋 취소 (스테이징 해제)
```bash
git reset HEAD~1
# 또는
git reset --mixed HEAD~1
```
- 커밋 취소 + 스테이징 해제, 파일은 수정된 상태로 유지

#### 마지막 커밋 완전히 취소 (변경사항 삭제)
```bash
git reset --hard HEAD~1
```
⚠️ **위험**: 변경사항이 완전히 사라집니다!

#### 여러 커밋 취소
```bash
# 최근 3개 커밋 취소
git reset --soft HEAD~3
```

### 2. 커밋 수정하기

#### 마지막 커밋 메시지 수정
```bash
git commit --amend -m "New commit message"
```

#### 마지막 커밋에 파일 추가
```bash
# 파일 수정
git add forgotten-file.js
git commit --amend --no-edit
```

⚠️ **주의**: `--amend`는 이미 푸시한 커밋에는 사용하지 마세요!

### 3. 파일 변경사항 되돌리기

#### 스테이징 취소
```bash
# 특정 파일
git restore --staged content.js

# 또는 (이전 방식)
git reset HEAD content.js

# 모든 파일
git restore --staged .
```

#### 파일 수정 취소 (원래대로)
```bash
# 특정 파일
git restore content.js

# 또는 (이전 방식)
git checkout -- content.js

# 모든 파일
git restore .
```

⚠️ **위험**: 수정한 내용이 완전히 사라집니다!

### 4. Push 충돌 해결

#### 문제 상황
```bash
git push origin main

# 에러:
# ! [rejected]        main -> main (fetch first)
# error: failed to push some refs to 'origin'
```

#### 원인
원격 저장소에 로컬에 없는 커밋이 있습니다.

#### 해결 방법 1: Merge (권장)
```bash
# 1. 원격 변경사항 가져오기
git pull origin main

# 2. 병합 커밋 생성
# (에디터가 열리면 저장 후 종료)

# 3. 푸시
git push origin main
```

**결과:**
```
*   Merge commit
|\
| * Remote commit
* | Local commit
```

#### 해결 방법 2: Rebase (깔끔한 히스토리)
```bash
# 1. Rebase로 가져오기
git pull --rebase origin main
# 또는
git fetch origin main
git rebase origin/main

# 2. 푸시
git push origin main
```

**결과:**
```
* Local commit (rebased)
* Remote commit
```

#### 충돌 발생 시

```bash
# 충돌 발생
Auto-merging content.js
CONFLICT (content): Merge conflict in content.js
```

**해결 과정:**

1. 충돌 파일 확인
```bash
git status
# Unmerged paths:
#   both modified:   content.js
```

2. 파일 열어서 수정
```javascript
<<<<<<< HEAD
// 내 코드
const timeout = 5000;
=======
// 원격의 코드
const timeout = 3000;
>>>>>>> origin/main
```

3. 충돌 마커 제거하고 원하는 코드 선택
```javascript
const timeout = 5000;
```

4. 스테이징하고 커밋
```bash
git add content.js
git commit  # (rebase 중이면: git rebase --continue)
git push origin main
```

### 5. 잘못된 브랜치에 커밋한 경우

```bash
# 현재 main 브랜치에 있는데 실수로 커밋함
git log  # 커밋 ID 확인 (예: abc123)

# 1. 새 브랜치 생성 (커밋 포함)
git branch feature/my-work

# 2. main에서 커밋 제거
git reset --hard HEAD~1

# 3. 새 브랜치로 전환
git checkout feature/my-work
```

### 6. 스테이징 영역 전체 초기화

```bash
# 모든 스테이징 취소
git reset

# 또는
git restore --staged .
```

### 7. .gitignore 후에도 추적되는 파일

```bash
# Git 캐시에서 제거
git rm --cached filename

# 또는 폴더 전체
git rm -r --cached foldername

# 커밋
git commit -m "Remove ignored files from tracking"
```

---

## 협업하기

### Pull Request (PR) 워크플로우

#### 1. Fork & Clone
```bash
# GitHub에서 Fork 후
git clone https://github.com/YOUR_USERNAME/DragTranslator.git
cd DragTranslator

# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/baek0203/DragTranslator.git

# 확인
git remote -v
# origin    https://github.com/YOUR_USERNAME/DragTranslator.git (fetch)
# origin    https://github.com/YOUR_USERNAME/DragTranslator.git (push)
# upstream  https://github.com/baek0203/DragTranslator.git (fetch)
# upstream  https://github.com/baek0203/DragTranslator.git (push)
```

#### 2. 작업 시작
```bash
# upstream에서 최신 코드 가져오기
git fetch upstream
git checkout main
git merge upstream/main

# 새 브랜치 생성
git checkout -b feature/add-translation-cache

# 작업 + 커밋
git add .
git commit -m "feat: Add translation cache"

# 자신의 fork에 푸시
git push origin feature/add-translation-cache
```

#### 3. Pull Request 생성
1. GitHub에서 자신의 repository로 이동
2. "Compare & pull request" 버튼 클릭
3. PR 제목과 설명 작성
4. "Create pull request" 클릭

#### 4. 피드백 반영
```bash
# 코드 수정
git add .
git commit -m "fix: Address review comments"

# 같은 브랜치에 푸시 (PR 자동 업데이트)
git push origin feature/add-translation-cache
```

### 코드 리뷰 후 머지

#### Squash and Merge (권장)
여러 커밋을 하나로 합쳐서 머지
```bash
# GitHub UI에서 "Squash and merge" 선택
```

#### Rebase and Merge
커밋 히스토리를 선형으로 유지
```bash
# GitHub UI에서 "Rebase and merge" 선택
```

#### Merge Commit
모든 커밋 히스토리 유지
```bash
# GitHub UI에서 "Create a merge commit" 선택
```

---

## 유용한 명령어 모음

### 로그 보기

```bash
# 기본 로그
git log

# 한 줄로 간단히
git log --oneline

# 그래프로 보기
git log --oneline --graph --all

# 최근 5개 커밋
git log -5

# 특정 파일의 히스토리
git log content.js

# 커밋 상세 정보
git show abc123

# 작성자별 필터
git log --author="Your Name"

# 날짜별 필터
git log --since="2 weeks ago"
git log --after="2024-01-01" --before="2024-01-31"
```

**예쁘게 보기:**
```bash
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

이 명령어를 alias로 등록:
```bash
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 사용
git lg
```

### Stash (임시 저장)

작업 중인 변경사항을 임시로 저장하고 나중에 복원할 수 있습니다.

```bash
# 현재 변경사항 임시 저장
git stash

# 메시지와 함께 저장
git stash save "Work in progress on feature X"

# Stash 목록 보기
git stash list
# stash@{0}: WIP on main: 5002d47 Fix bug
# stash@{1}: Work in progress on feature X

# 가장 최근 stash 복원
git stash pop

# 특정 stash 복원
git stash apply stash@{1}

# Stash 삭제
git stash drop stash@{0}

# 모든 stash 삭제
git stash clear

# Untracked 파일도 포함
git stash -u
```

**사용 예시:**
```bash
# feature 브랜치에서 작업 중
git stash save "Half-done feature"

# main 브랜치로 전환해서 긴급 버그 수정
git checkout main
git pull
# ... 버그 수정 ...
git commit -am "fix: Critical bug"
git push

# 다시 feature 브랜치로 돌아와서 작업 재개
git checkout feature-branch
git stash pop
```

### 태그 (버전 관리)

```bash
# 태그 목록
git tag

# 태그 생성
git tag v1.0.0

# Annotated 태그 (권장)
git tag -a v1.0.0 -m "Release version 1.0.0"

# 특정 커밋에 태그
git tag -a v1.0.0 abc123 -m "Release version 1.0.0"

# 태그 푸시
git push origin v1.0.0

# 모든 태그 푸시
git push origin --tags

# 태그 삭제 (로컬)
git tag -d v1.0.0

# 태그 삭제 (원격)
git push origin --delete v1.0.0
```

### 검색

```bash
# 코드에서 텍스트 검색
git grep "translateText"

# 커밋 메시지에서 검색
git log --grep="translation"

# 코드 변경사항에서 검색
git log -S "translateText"
```

### 파일 히스토리

```bash
# 파일의 각 줄이 언제, 누가 수정했는지 보기
git blame content.js

# 특정 라인 범위만
git blame -L 10,20 content.js

# 파일 삭제 찾기
git log --diff-filter=D --summary

# 파일 이름 변경 추적
git log --follow content.js
```

### Remote 관리

```bash
# Remote 목록
git remote -v

# Remote 추가
git remote add origin https://github.com/user/repo.git

# Remote URL 변경
git remote set-url origin https://github.com/user/new-repo.git

# Remote 삭제
git remote remove origin

# Remote 정보 상세히 보기
git remote show origin
```

### 유용한 Alias 설정

```bash
# Status 단축
git config --global alias.st status

# Commit 단축
git config --global alias.cm commit

# Checkout 단축
git config --global alias.co checkout

# Branch 단축
git config --global alias.br branch

# 예쁜 로그
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Undo last commit
git config --global alias.undo 'reset HEAD~1 --mixed'

# 사용 예시
git st
git cm -m "message"
git lg
git undo
```

---

## .gitignore 작성

`.gitignore` 파일로 Git이 추적하지 않을 파일을 지정할 수 있습니다.

### DragTranslator용 .gitignore

```gitignore
# Chrome Extension
*.crx
*.pem
*.zip

# Node modules (if using npm)
node_modules/
package-lock.json

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Temporary files
*.tmp
*.bak
.cache/

# Environment variables
.env
.env.local

# Build output
dist/
build/

# Test coverage
coverage/
```

### 패턴 설명

```gitignore
# 특정 파일
secret.txt

# 특정 확장자
*.log

# 특정 폴더
node_modules/

# 특정 폴더의 특정 파일
logs/*.log

# 모든 하위 폴더
**/temp

# 예외 (무시하지 않기)
!important.log

# 특정 파일만 추적
/*
!.gitignore
!README.md
```

---

## 고급 기능

### Cherry-pick

다른 브랜치의 특정 커밋만 가져오기

```bash
# feature 브랜치의 특정 커밋을 main에 적용
git checkout main
git cherry-pick abc123

# 여러 커밋
git cherry-pick abc123 def456

# 커밋 메시지 수정하며 cherry-pick
git cherry-pick abc123 --edit
```

### Bisect (버그 찾기)

이진 탐색으로 버그를 도입한 커밋 찾기

```bash
# Bisect 시작
git bisect start

# 현재 커밋은 나쁨 (버그 있음)
git bisect bad

# 과거의 좋은 커밋 지정
git bisect good v1.0.0

# Git이 중간 커밋으로 이동
# 테스트 후 good 또는 bad 입력
git bisect good  # 또는 git bisect bad

# 반복하면 문제의 커밋을 찾아줌

# 종료
git bisect reset
```

### Submodule

다른 Git 저장소를 서브모듈로 포함

```bash
# Submodule 추가
git submodule add https://github.com/user/library.git libs/library

# Submodule이 있는 저장소 클론
git clone --recursive https://github.com/user/repo.git

# 또는 클론 후
git submodule init
git submodule update

# Submodule 업데이트
git submodule update --remote
```

---

## 트러블슈팅

### "fatal: not a git repository"
```bash
# 현재 디렉토리가 Git 저장소가 아닙니다
git init  # 또는 올바른 디렉토리로 이동
```

### "Permission denied (publickey)"
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# 공개 키를 GitHub에 등록
cat ~/.ssh/id_ed25519.pub
# GitHub Settings → SSH and GPG keys → New SSH key
```

### "detached HEAD state"
```bash
# HEAD가 특정 커밋을 가리키고 있음 (브랜치가 아님)
# 브랜치로 돌아가기
git checkout main

# 현재 상태를 새 브랜치로 저장
git checkout -b new-branch-name
```

### 대용량 파일 실수로 커밋
```bash
# BFG Repo-Cleaner 사용 (권장)
# https://rtyley.github.io/bfg-repo-cleaner/

# 또는 git filter-branch (느림)
git filter-branch --tree-filter 'rm -f large-file.zip' HEAD
```

---

## 참고 자료

### 공식 문서
- [Pro Git Book (한글)](https://git-scm.com/book/ko/v2)
- [Git 공식 문서](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)

### 학습 자료
- [Learn Git Branching (대화형)](https://learngitbranching.js.org/?locale=ko)
- [Git 치트시트](https://education.github.com/git-cheat-sheet-education.pdf)
- [Visualizing Git](https://git-school.github.io/visualizing-git/)

### GUI 도구
- **GitKraken**: 강력한 Git GUI 클라이언트
- **SourceTree**: 무료 Git GUI
- **GitHub Desktop**: GitHub 공식 클라이언트
- **VS Code**: 내장 Git 지원

---

## 요약: 매일 사용하는 명령어

```bash
# 상태 확인
git status

# 변경사항 확인
git diff

# 스테이징
git add .

# 커밋
git commit -m "message"

# 푸시
git push

# 풀
git pull

# 브랜치 생성 + 전환
git checkout -b new-branch

# 브랜치 병합
git checkout main
git merge feature-branch

# 로그 확인
git log --oneline
```

---

**마지막 업데이트**: 2026-01-11

**다음 단계**: [fail-and-trial.md](fail-and-trial.md)에서 실제 프로젝트에서 겪은 Git 문제들을 확인하세요.
