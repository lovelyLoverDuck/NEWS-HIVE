# redis_test.py
from redis_manager import RedisManager

if __name__ == "__main__":
    mgr = RedisManager()
    if mgr.test_connection():
        print("✅ Redis 연결 성공")
        mgr.save_keywords(["테스트키워드"], ["http://test.link"])
        print("📌 테스트 데이터 저장 완료")
    else:
        print("❌ Redis 연결 실패 - 서비스가 실행 중인지 확인")