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
        # 최대 3개까지만 반환
        return result.get('keywords', [])[:3]
        
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

def define_keywords(keywords, context):
    """
    각 키워드가 주어진 요약문(문맥)에서 어떤 의미인지 한 문장으로 정의해서 dict로 반환.
    """
    definitions = {}
    for kw in keywords:
        prompt = f"'{kw}'라는 단어가 아래 요약문 맥락에서 어떤 의미를 가지는지 한 문장으로 정의해줘.\n\n요약문: {context}"
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            definitions[kw] = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ '{kw}' 정의 실패: {e}")
            definitions[kw] = "정의 생성 실패"
    return definitions

# def generate_final_report(keywords, summary):
#     """
#     키워드와 요약문을 받아, 선생님께 제출하는 보고서처럼 각 키워드의 정의를 먼저 자연스럽게 소개하고, 이어서 요약문을 바탕으로 전체 내용을 설명하는 하나의 완결된 글로 작성.
#     """
#     prompt = (
#         "아래의 키워드들과 요약문이 있습니다. 선생님께 제출하는 보고서처럼, 먼저 각 키워드(주제)에 대한 정의를 자연스럽게 소개하고, 이어서 요약문을 바탕으로 전체 내용을 설명하는 하나의 완결된 글로 작성해줘. "
#         "글머리표, 리스트, 구분선 없이, 완전히 자연스러운 단락으로만 써줘."
#         f"\n\n키워드: {', '.join(keywords)}\n요약문: {summary}"
#     )
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[{"role": "user", "content": prompt}]
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         print(f"❌ 최종 보고 리포트 생성 실패: {e}")
#         return "최종 보고 생성 실패"

from openai import OpenAI
from config import OPENAI_API_KEY
import json

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_final_report(keywords, summary):
    """
    키워드와 요약문을 받아, 정의 없이 자연스럽게 요약을 작성하는 보고서 생성.
    """
    prompt = (
        "다음은 뉴스 요약입니다. 아래 키워드들과 요약문을 참고하여 "
        "자연스러운 보고서 형태로 작성해주세요. "
        "키워드 정의 없이, 요약문을 중심으로 전체 내용을 설명해 주세요. "
        "글머리표, 리스트, 구분선 없이 단락 형태로만 써주세요."
        f"\n\n키워드: {', '.join(keywords)}\n요약문: {summary}"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ 최종 보고 리포트 생성 실패: {e}")
        return "최종 보고 생성 실패"
