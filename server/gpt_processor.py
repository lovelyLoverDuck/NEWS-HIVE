from openai import OpenAI
from config import OPENAI_API_KEY
import json

client = OpenAI(api_key=OPENAI_API_KEY)

def extract_keywords(news_data):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "system",
                "content": 
                '''반드시 JSON 형식으로 응답. 예시: 
                {"keywords": ["키워드1","키워드2"]}
                - 설명문 절대 금지
                - JSON 포맷 준수 필수'''
            }, {
                "role": "user",
                "content": json.dumps(news_data, ensure_ascii=False)
            }],
            response_format={"type": "json_object"}
        )
        raw_response = response.choices[0].message.content
        print(f"🔍 GPT 원본 응답: {raw_response}")
        
        # JSON 파싱 전처리
        cleaned = raw_response.replace("'", '"').strip('` \n') 
        result = json.loads(cleaned)
        return result.get('keywords', [])
        
    except json.JSONDecodeError as e:
        print(f"🚨 JSON 파싱 실패: {e}\n원본: {raw_response}")
        return []

# 테스트 코드
if __name__ == "__main__":
    sample = [{"content": "AI 기술 발전 현황"}]
    try:
        print("추출 키워드:", extract_keywords(sample))
    except Exception as e:
        print(e)
        
#gpt요약        
def summarize_articles(news_data):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "다음 뉴스 기사 목록을 요약해줘. 5문장 이내로 전체 흐름을 설명하듯 써줘. 반드시 요약문만 응답해."
                },
                {
                    "role": "user",
                    "content": json.dumps(news_data, ensure_ascii=False)
                }
            ]
        )
        summary = response.choices[0].message.content.strip()
        print(f"📝 요약문: {summary}")
        return summary
    except Exception as e:
        print(f"❌ GPT 요약 실패: {e}")
        return "요약 생성 실패"