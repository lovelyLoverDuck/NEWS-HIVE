# clear_redis.py
import redis

# Redis 연결 설정 (host, port 수정 가능)
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# keyword:* 와 news:* 키 전체 삭제
deleted_count = 0
for key in r.keys("keyword:*") + r.keys("news:*"):
    print(f"🗑 삭제: {key}")
    r.delete(key)
    deleted_count += 1

print(f"\n✅ 삭제 완료: 총 {deleted_count}개 키 삭제됨")
