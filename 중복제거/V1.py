from sklearn.metrics import silhouette_score
import numpy as np
import pandas as pd
import platform
import html
import csv
import re
import json
import urllib.request
import urllib.parse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from konlpy.tag import Mecab
from sklearn.manifold import TSNE

client_id = ""
client_secret = ""

query = ""
display = 100
sort = "sim"
max_results = 500
encText = urllib.parse.quote(query)
all_results = []

for start in range(1, max_results + 1, display):
    url = f"https://openapi.naver.com/v1/search/news.json?query={
        encText}&display={display}&start={start}&sort={sort}"
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", client_id)
    request.add_header("X-Naver-Client-Secret", client_secret)

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
                    "pubDate": item.get("pubDate")
                })
        else:
            print(f"Error Code: {rescode}")
            break
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} - {e.reason}")
        break
    except urllib.error.URLError as e:
        print(f"URLError: {e.reason}")
        break
    except Exception as e:
        print(f"Unexpected error: {e}")
        break


if all_results:
    file_path = "1. Get_NEWS.csv"
    with open(file_path, "w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(
            file, fieldnames=["title", "description", "pubDate"])
        writer.writeheader()
        writer.writerows(all_results)
    print(f"----------{len(all_results)}개의 뉴스 기사를 가져왔다----------")
else:
    print("오류 발생")


def clean_html(raw_text):
    decoded_text = html.unescape(str(raw_text))
    clean_text = re.sub(r'<.*?>', '', decoded_text)
    return clean_text


def load_articles_from_csv(file_path):
    data = pd.read_csv(file_path, encoding='utf-8', encoding_errors='ignore')
    articles = [{'title': entry['title'], 'text': f"{entry['title']} {entry['description']}"}
                for _, entry in data.iterrows()]
    return pd.DataFrame(articles)


def preprocess_text(text, mecab):
    # Mecab으로 형태소 분석 후 주요 품사만 추출
    pos_tags = ['NNG', 'NNP', 'VV', 'VA', 'VX', 'SL', 'SN']
    tokens = mecab.pos(text)
    return ' '.join([word for word, tag in tokens if tag in pos_tags])


def compute_dbscan_results(df, mecab, eps_values, min_samples_values):
    df['processed_text'] = df['text'].apply(
        lambda x: preprocess_text(x, mecab))
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['processed_text'])
    tfidf_array = tfidf_matrix.toarray()
    results = []

    for eps in eps_values:
        for min_samples in min_samples_values:
            dbscan = DBSCAN(eps=eps, min_samples=int(
                min_samples), metric='cosine')
            clusters = dbscan.fit_predict(tfidf_array)
            num_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)

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


def deduplicate_articles(df, mecab):
    df['processed_text'] = df['text'].apply(
        lambda x: preprocess_text(x, mecab))

    # TF-IDF 벡터화
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['processed_text'])

    # DBSCAN 클러스터링
    dbscan = DBSCAN(eps=epsInput, min_samples=min_samplesInput,
                    metric='cosine')
    clusters = dbscan.fit_predict(tfidf_matrix.toarray())
    df['cluster'] = clusters

    # 클러스터별 임의의 문서 하나 선택택
    unique_docs = df.groupby('cluster', group_keys=False).apply(
        lambda x: x.sample(1))

    return unique_docs.reset_index(drop=True), df


input_csv_path = "1. Get_NEWS.csv"
output_csv_path = "2. processed_file.csv"

df = pd.read_csv(input_csv_path)

df['title'] = df['title'].apply(clean_html)
df['description'] = df['description'].apply(clean_html)
df = df[['title', 'description']]
df.to_csv(output_csv_path, index=False, encoding='utf-8-sig')

mecab = Mecab(
    dicpath='C:/mecab/mecab-ko-dic') if platform.system() == "Windows" else Mecab()

articles_df = load_articles_from_csv("2. processed_file.csv")

print(f"----------원본 기사 수 : {len(articles_df)}----------")

csv_file_path = "2. processed_file.csv"
articles_df = load_articles_from_csv(csv_file_path)

eps_values = np.arange(0.2, 1.0, 0.1)
min_samples_values = list(range(2, 11))

results_df = compute_dbscan_results(
    articles_df, mecab, eps_values, min_samples_values)

# 두 번째로 높은 실루엣 점수를 가진 조합 추출
ranked = results_df.dropna().sort_values(
    by='silhouette_score', ascending=False)
if len(ranked) >= 2:
    second_best = ranked.iloc[1]
    print(
        f"----------두 번째로 높은 실루엣 점수의 파라미터 : eps: {second_best['eps']}, min_samples: {second_best['min_samples']}")
    print(f"실루엣 점수: {second_best['silhouette_score']:.4f}")
else:
    print("유효한 실루엣 점수를 가진 결과가 2개 이상 존재하지 않습니다.")

epsInput = float(second_best['eps'])
min_samplesInput = int(second_best['min_samples'])

deduplicated_df, clustered_df = deduplicate_articles(articles_df, mecab)
deduplicated_df.to_csv("3. deduplicated_articles.csv",
                       index=False, encoding="utf-8-sig")
print(f"----------중복 제거 후 기사 수 : {len(deduplicated_df)}----------")
print(
    f"----------클러스터 수 : {len(set(clustered_df['cluster'])) - (1 if -1 in clustered_df['cluster'].values else 0)}----------")
