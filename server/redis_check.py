import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# 저장된 모든 키워드별 뉴스 링크 조회
keys = r.keys("keyword:*")
for key in keys:
    print(f"🟢 키: {key}")
    news_links = r.smembers(key)
    print(f"   📄 관련 뉴스: {news_links}")
    # 각 링크별로 뉴스 기사 전체 정보 출력
    for link in news_links:
        article_key = f"news:{link}"
        article = r.hgetall(article_key)
        print(f"      🔗 {link}")
        if article:
            print(f"         제목: {article.get('title')}")
            print(f"         설명: {article.get('description')}")
            print(f"         날짜: {article.get('pubDate')}")
            print(f"         원본링크: {article.get('originallink')}")
        else:
            print("         (기사 정보 없음)")