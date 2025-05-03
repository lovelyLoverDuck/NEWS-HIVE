def process_news(query, max_results=500):
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

    query = query
    display = 100
    sort = "sim"
    max_results = 500  # 가져올 뉴스의 수

    # ------ 네이버 뉴스 수집 ------
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
    print("\n===   결과   ===")

    '''
    deduplicated_df --> title / description / pubDate / originallink / text / processed_text / cluster
    text = title + description 
    processed_text = def processed_text(text)
    '''

    for i, title in enumerate(deduplicated_df['title'], start=1):
        print(f"{i}. {title}")

    # GPT로 키워드 추출하기 위해 생성
    go_GPT = '\n'.join(deduplicated_df['processed_text'].tolist())

    return deduplicated_df.to_dict(orient='records')  # JSON 직렬화 가능 형태로 반환
