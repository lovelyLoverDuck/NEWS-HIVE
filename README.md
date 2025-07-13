<img width="4678" height="6622" alt="test" src="https://github.com/user-attachments/assets/463ec24a-0a5f-4346-b90a-573cabfbebcd" />


#네이버 뉴스 검색 프로젝트

이 프로젝트는 네이버 뉴스 검색 API를 활용한 웹 애플리케이션입니다.

## 프로젝트 구조

```
.
├── client/          # React + TypeScript 프론트엔드
└── server/          # Flask 백엔드
```

## 설치 방법

### 백엔드 (Python)

1. Python 가상환경 생성 및 활성화
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 필요한 패키지 설치
```bash
pip install flask
pip install flask-cors
pip install requests
```

3. config.py 설정
- `server/config.py` 파일에 네이버 API 인증 정보를 입력해야 합니다:
```python
NAVER_CLIENT_ID = 'your_client_id'
NAVER_CLIENT_SECRET = 'your_client_secret'
```

### 프론트엔드 (Node.js)

1. 의존성 설치
```bash
cd client
npm install
```

## 실행 방법

### 백엔드 실행
```bash
cd server
python app.py
```
- 서버는 http://localhost:5001 에서 실행됩니다.

### 프론트엔드 실행
```bash
cd client
npm run dev
```
- 클라이언트는 http://localhost:5173 에서 실행됩니다.

## API 엔드포인트

- POST `/search`: 뉴스 검색 API
  - Request Body: `{ "query": "검색어" }`
  - Response: 검색 결과 JSON

## 기술 스택

### 백엔드
- Python 3.x
- Flask
- Flask-CORS
- Requests

### 프론트엔드
- React
- TypeScript
- Vite 
