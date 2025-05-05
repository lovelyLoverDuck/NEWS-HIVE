# server/redis_manager.py
from redis import Redis
from config import REDIS_HOST, REDIS_PORT, REDIS_DB

class RedisManager:
    def __init__(self):
        self.conn = Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            decode_responses=True
        )
    
    def save_keywords(self, keywords, news_links):
        """키워드-뉴스 링크 매핑 저장"""
        if not isinstance(keywords, list) or not all(isinstance(k, str) for k in keywords):
            raise ValueError("키워드는 문자열 리스트여야 합니다.")
    
        cleaned_links = [link for link in news_links if link.startswith('http')]
        print(f"🧹 유효한 링크 {len(cleaned_links)}개 필터링 완료")
    
        for keyword in keywords:
            key = f"keyword:{keyword.strip()}"
            self.conn.sadd(key, *cleaned_links)
            self.conn.expire(key, 604800)

    def save_news_articles(self, articles):
        """
        뉴스 기사 전체 저장. articles: [{originallink, title, description, pubDate, ...}, ...]
        """
        for article in articles:
            link = article.get('originallink')
            if link and link.startswith('http'):
                key = f"news:{link}"
                self.conn.hmset(key, article)
                self.conn.expire(key, 604800)  # 7일 만료(필요시 조정)
            
    def test_connection(self):
        """Redis 연결 테스트"""
        return self.conn.ping()