def process_news(query_list, is_initial=True, max_results=500):
    from gpt_processor import extract_keywords
    import numpy as np
    import pandas as pd
    import html
    import re
    import json
    import urllib.request
    import urllib.parse
    from soynlp.word import WordExtractor
    from soynlp.tokenizer import LTokenizer
    from sklearn.metrics import silhouette_score
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import DBSCAN
    from config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
    from redis_manager import RedisManager
    from datetime import datetime

    if isinstance(query_list, str):
        # 기존 단일 query 입력도 허용
        query_list = [query_list]
    query = " ".join(query_list)
    display = 100
    sort = "sim"
    max_results = 500  # 가져올 뉴스의 수

    # ====== Redis 캐시 체크 (키워드 조합) ======
    redis_mgr = RedisManager()
    search_key = "keyword:" + query
    cached_links = redis_mgr.conn.smembers(search_key)
    articles_from_cache = []
    if cached_links:
        print(f"🟢 Redis HIT: {search_key}, 기사 {len(cached_links)}건")
        for link in cached_links:
            article = redis_mgr.conn.hgetall(f"news:{link}")
            if article:
                articles_from_cache.append(article)
        if articles_from_cache:
            keywords = extract_keywords(articles_from_cache)
            return {"articles": articles_from_cache, "keywords": keywords}
        else:
            print(f"⚠️ 링크는 있으나 기사 본문 없음 (news:{{link}})")
    else:
        print(f"🔴 Redis MISS: {search_key}")

    # ------ 네이버 뉴스 수집 (캐시 miss 시에만) ------
    encText = urllib.parse.quote(query)
    all_results = []

    for start in range(1, max_results + 1, display):
        url = f"https://openapi.naver.com/v1/search/news.json?query={encText}&display={display}&start={start}&sort={sort}"
        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", NAVER_CLIENT_ID)
        request.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)

        try:
            response = urllib.request.urlopen(request)
            rescode = response.getcode()
            if rescode == 200:
                response_body = response.read()
                result = json.loads(response_body.decode('utf-8'))
                for item in result.get("items", []):
                    all_results.append({
                        "title": item.get("title"),
                        "description": item.get("description"),
                        "pubDate": item.get("pubDate"),
                        "originallink": item.get("originallink")
                    })
            else:
                print(f"Error Code: {rescode}")
                break
        except Exception as e:
            print(f"Error during API call: {e}")
            break

    if not all_results:
        print("뉴스를 가져오기 실패")
        exit()

    # ------ 함수 정의 ------
    def convert_pubdate(date_str):
        dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
        hour = dt.hour
        ampm = "오전" if hour < 12 else "오후"
        hour_12 = hour if 1 <= hour <= 12 else abs(
            hour - 12) if hour != 0 else 12
        return f"{dt.year}.{dt.month:02}.{dt.day:02}. {ampm} {hour_12}:{dt.minute:02}"

    def clean_html(raw_text):
        decoded_text = html.unescape(str(raw_text))
        clean_text = re.sub(r'<.*?>', '', decoded_text)
        return clean_text

    def preprocess_text(text, tokenizer):
        tokens = tokenizer.tokenize(text)
        return ' '.join(tokens)

    # 평가 지표

    def compute_dbscan_results(texts, eps_values, min_samples_values):
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        tfidf_array = tfidf_matrix.toarray()
        results = []

        for eps in eps_values:
            for min_samples in min_samples_values:
                dbscan = DBSCAN(eps=eps, min_samples=int(
                    min_samples), metric='cosine')
                clusters = dbscan.fit_predict(tfidf_array)
                num_clusters = len(set(clusters)) - \
                    (1 if -1 in clusters else 0)
                mask = clusters != -1
                if num_clusters > 1 and np.sum(mask) > 1:
                    try:
                        score = silhouette_score(
                            tfidf_array[mask], clusters[mask], metric='cosine')
                    except ValueError:
                        score = None
                else:
                    score = None
                results.append({'eps': eps, 'min_samples': int(min_samples),
                                'num_clusters': num_clusters, 'silhouette_score': score})
        return pd.DataFrame(results)

    # 중복 제거

    def deduplicate_articles(df, eps, min_samples, nc):
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(df['processed_text'])
        dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric='cosine')
        clusters = dbscan.fit_predict(tfidf_matrix.toarray())
        df['cluster'] = clusters
        unique_docs = df[df['cluster'] != -
                         1].groupby('cluster', group_keys=False).apply(lambda x: x.sample(nc))
        return unique_docs.reset_index(drop=True)

    # 1. 데이터프레임
    articles_df = pd.DataFrame(all_results)
    articles_df['title'] = articles_df['title'].apply(clean_html)
    articles_df['description'] = articles_df['description'].apply(clean_html)
    articles_df['text'] = articles_df['title'] + \
        " " + articles_df['description']
    articles_df['pubDate'] = articles_df['pubDate'].apply(convert_pubdate)

    # 2. 형태소 분석 (soynlp 기반)
    word_extractor = WordExtractor()
    word_extractor.train(articles_df['text'].tolist())
    word_scores = word_extractor.extract()
    word_score_dict = {word: score.cohesion_forward for word,
                       score in word_scores.items()}
    l_tokenizer = LTokenizer(scores=word_score_dict)
    articles_df['processed_text'] = articles_df['text'].apply(
        lambda x: preprocess_text(x, l_tokenizer))

    # 3. 최적 파라미터 찾기
    eps_values = np.arange(0.2, 1.0, 0.1)
    min_samples_values = list(range(2, 11))
    results_df = compute_dbscan_results(
        articles_df['processed_text'], eps_values, min_samples_values)
    ranked = results_df.dropna().sort_values(
        by='silhouette_score', ascending=False)

    if len(ranked) >= 2:
        second_best = ranked.iloc[1]
        epsInput = float(second_best['eps'])
        min_samplesInput = int(second_best['min_samples'])
    else:
        print("유효한 실루엣 점수가 충분하지 않아 기본 파라미터 사용")
        epsInput = 0.2
        min_samplesInput = 2
    # 3. 중복 제거
    num_cu = 1
    if (second_best['num_clusters'] < 4):
        num_cu = 2
    deduplicated_df = deduplicate_articles(
        articles_df, epsInput, min_samplesInput, num_cu)
    # 4. 결과
    result = {
        "articles": deduplicated_df.to_dict(orient='records'),
        "keywords": []
    }

    if is_initial:
        try:
            raw_keywords = extract_keywords(deduplicated_df.to_dict('records'))
            # 🔥 핵심 수정: 항상 검색어(query) 자체를 첫 번째 키워드로 포함, 최대 3개 제한
            if isinstance(raw_keywords, list) and all(isinstance(kw, str) for kw in raw_keywords):
                # 검색어(조합일 경우 전체 문자열) 포함
                base_query = " ".join(query_list).strip()
                keywords = [
                    base_query] if base_query and base_query not in raw_keywords else []
                for kw in raw_keywords:
                    if kw != base_query:
                        keywords.append(kw)
                    if len(keywords) >= 3:
                        break
            else:
                print(f"⚠️ 잘못된 키워드 형식: {type(raw_keywords)}")
                keywords = []
            result["keywords"] = keywords

            # Redis 저장 로직 (최초 검색어 조합에만 저장)
            redis_mgr = RedisManager()
            news_links = deduplicated_df['originallink'].tolist()
            valid_links = [link for link in news_links if isinstance(
                link, str) and link.startswith('http')]
            search_key = " ".join(query_list)
            redis_mgr.save_keywords([search_key], valid_links)
            articles = deduplicated_df.to_dict('records')
            redis_mgr.save_news_articles(articles)
        except Exception as e:
            print(f"❌ 저장 실패: {str(e)}")
    # 파생/조합 검색 시에는 기사만 반환, 키워드 추출X, 저장X
    return result
