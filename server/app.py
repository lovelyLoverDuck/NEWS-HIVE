from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from news_processor import process_news
from gpt_processor import summarize_articles
from gpt_processor import generate_final_report



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
            # 문장형 자연어 입력 시 핵심 키워드 추출
            keywords = local_extract_keywords(search_query)
            query_list = keywords if keywords else [search_query]

        processed_results = process_news(query_list, is_initial)

        # 항상 query_list를 응답에 포함
        response = dict(processed_results)
        response['query_list'] = query_list
        # 검색 결과가 없으면 추천 키워드와 안내 메시지 추가
        if not response.get('articles'):
            response['recommend_keywords'] = query_list
            response['alert'] = '문장형 검색어 대신 핵심 키워드 위주로 검색해 주세요.'

        return jsonify(response)
    except Exception as e:
        print(f"❌ 처리 실패: {e}")
        # 뉴스 검색 실패 시에도 안내 메시지와 추천 키워드 반환
        if 'query_list' in locals():
            return jsonify({
                'articles': [],
                'query_list': query_list,
                'recommend_keywords': query_list,
                'alert': '검색 결과가 없습니다. 문장형 검색어 대신 키워드 위주로 검색해 주세요.',
                
            })
        return jsonify({'error': str(e)}), 500

# === 키워드 추출 엔드포인트 추가 ===
from gpt_processor import extract_keywords as gpt_extract_keywords
from keyword_extractor import extract_keywords as local_extract_keywords

@app.route('/keywords', methods=['POST'])
@cross_origin()
def keywords():
    try:
        data = request.get_json()
        articles = data.get('articles', [])
        if not articles or not isinstance(articles, list):
            return jsonify({'error': '뉴스 기사 리스트가 필요합니다.'}), 400
        keywords = extract_keywords(articles)
        return jsonify({'keywords': keywords})
    except Exception as e:
        print(f"❌ 키워드 추출 실패: {e}")
        return jsonify({'error': str(e)}), 500
    
#요약
@app.route('/summary', methods=['POST'])
@cross_origin()
def summary():
    try:
        data = request.get_json()
        articles = data.get('articles', [])
        if not articles or not isinstance(articles, list):
            return jsonify({'error': '뉴스 기사 리스트가 필요합니다.'}), 400

        summary_text = summarize_articles(articles)
        return jsonify({'summary': summary_text})
    except Exception as e:
        print(f"❌ 요약 API 실패: {e}")
        return jsonify({'error': str(e)}), 500 

# # === 최종 보고 엔드포인트 ===
# from gpt_processor import define_keywords

# @app.route('/final_report', methods=['POST'])
# @cross_origin()
# def final_report():
#     try:
#         data = request.get_json()
#         keywords = data.get('keywords', [])
#         summary = data.get('summary', '')
#         if not keywords or not isinstance(keywords, list) or not summary:
#             return jsonify({'error': '키워드 리스트와 요약문이 필요합니다.'}), 400
#         from gpt_processor import define_keywords
#         keyword_definitions = define_keywords(keywords, summary)
#         final_report = f"키워드 정의:\n" + "\n".join([f"- {k}: {v}" for k, v in keyword_definitions.items()]) + f"\n\n요약:\n{summary}"
#         return jsonify({'final_report': final_report, 'definitions': keyword_definitions})
#     except Exception as e:
#         print(f"❌ 최종 보고 API 실패: {e}")
#         return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True, port=5001)

# ✅ 최종 보고 (정의 없음)
@app.route('/final_report', methods=['POST'])
@cross_origin()
def final_report():
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        summary = data.get('summary', '')
        if not keywords or not isinstance(keywords, list) or not summary:
            return jsonify({'error': '키워드 리스트와 요약문이 필요합니다.'}), 400

        final_report = generate_final_report(keywords, summary)
        return jsonify({'final_report': final_report})  # ✅ 키워드 정의 제거됨
    except Exception as e:
        print(f"❌ 최종 보고 API 실패: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

