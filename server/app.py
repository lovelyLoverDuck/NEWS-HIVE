from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from news_processor import process_news


app = Flask(__name__)
CORS(app)  # CORS 설정 추가


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/search', methods=['POST'])
@cross_origin()
def search():
    try:
        data = request.get_json()
        # 다중 키워드 조합 및 최초/파생 검색 분기 지원
        query_list = data.get('query_list')
        is_initial = data.get('is_initial', True)

        # 기존 단일 query 입력도 호환
        if not query_list:
            search_query = data.get('query', '').strip()
            if not search_query:
                return jsonify({'error': '검색어를 입력해주세요.'}), 400
            query_list = [search_query]

        processed_results = process_news(query_list, is_initial)
        print(f"\n=== 뉴스 검색 결과 ({len(processed_results['articles'])}건) ===")
        return jsonify(processed_results)
    except Exception as e:
        print(f"❌ 처리 실패: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5001)
