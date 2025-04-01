from flask import Flask, request, jsonify
from flask_cors import CORS
from config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
from naver_search import NaverSearch
from clean_html import clean_news_results

app = Flask(__name__)
CORS(app)  # CORS 설정 추가

# NaverSearch 인스턴스 생성
naver_search = NaverSearch(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    search_query = data.get('query', '')
    
    # 검색 요청 로깅
    print(f"받은 검색어: {search_query}")
    
    # 네이버 뉴스 검색 API 호출
    search_results = naver_search.search(search_query)
    
    # HTML 태그 정리
    cleaned_results = clean_news_results(search_results)
    
    # 검색 결과 로깅
    print("\n=== 뉴스 검색 결과 ===")
    if 'error' in cleaned_results:
        print(f"오류 발생: {cleaned_results['error']}")
    else:
        print(f"총 검색 결과 수: {cleaned_results.get('total', 0)}")
        print(f"시작 위치: {cleaned_results.get('start', 0)}")
        print(f"표시 개수: {cleaned_results.get('display', 0)}")
        print("\n=== 뉴스 항목 ===")
        for idx, item in enumerate(cleaned_results.get('items', []), 1):
            print(f"\n뉴스 {idx}:")
            print(f"제목: {item.get('title', 'N/A')}")
            print(f"원문 링크: {item.get('originallink', 'N/A')}")
            print(f"네이버 링크: {item.get('link', 'N/A')}")
            print(f"설명: {item.get('description', 'N/A')}")
            print(f"발행일: {item.get('pubDate', 'N/A')}")
    print("\n================\n")
    
    return jsonify({
        'query': search_query,
        'results': cleaned_results
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)