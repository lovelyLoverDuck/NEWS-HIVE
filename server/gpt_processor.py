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

        
        # JSON 파싱 전처리
        cleaned = raw_response.replace("'", '"').strip('` \n') 
        result = json.loads(cleaned)
        # candidates(입력 명사)와 중복되는 키워드는 제외
        # news_data가 str 또는 list[dict] 형태일 수 있으므로 분기 처리
        import re
        if isinstance(news_data, str):
            candidates = re.findall(r'[가-힣]{2,}|[a-zA-Z0-9]{2,}', news_data)
            joined = ' '.join(candidates)
        elif isinstance(news_data, list) and len(news_data) > 0:
            texts = []
            for item in news_data:
                for key in ['content', 'title', 'description']:
                    if key in item and isinstance(item[key], str):
                        texts.append(item[key])
            text = ' '.join(texts)
            candidates = re.findall(r'[가-힣]{2,}|[a-zA-Z0-9]{2,}', text)
            joined = ' '.join(candidates)
        else:
            candidates = []
            joined = ''
        # 모든 연속 조합(2-gram, 3-gram 등)도 후보에 포함
        def normalize(s):
            norm = s.replace(' ', '').strip().lower()

            return norm


        candidate_set = set([normalize(x) for x in candidates])
        n = len(candidates)
        # 붙여쓰기 및 띄어쓰기 조합 모두 포함 (정규화해서 set에 추가)
        for i in range(n):
            for j in range(i+1, n+1):
                if j-i >= 2:
                    candidate_set.add(normalize(''.join(candidates[i:j])))     # 붙여쓰기
                    candidate_set.add(normalize(' '.join(candidates[i:j])))   # 띄어쓰기
        gpt_keywords = result.get('keywords', [])


        if not candidate_set:
            return gpt_keywords[:3]
        filtered = [kw for kw in gpt_keywords if normalize(kw) not in candidate_set]
        # 만약 필터링 후 결과가 비어있으면, gpt_keywords에서 최소 1개는 반환
        if not filtered and gpt_keywords:
            return gpt_keywords[:1]
        return filtered[:3]
        
    except json.JSONDecodeError as e:

        return []

# 테스트 코드
# (테스트 코드 제거됨)

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

        return summary
    except Exception as e:

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

        return "최종 보고 생성 실패"
