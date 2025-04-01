import re

def clean_text(text):
    """HTML 태그와 특수 문자를 제거하는 함수"""
    # 원본 텍스트 저장
    original_text = text
    
    # HTML 태그 제거 (<b>, </b> 등)
    text = re.sub(r'<[^>]*>', '', text)
    
    # 특수 문자 변환 (&quot; 등)
    text = text.replace('&quot;', '"')\
               .replace('&amp;', '&')\
               .replace('&lt;', '<')\
               .replace('&gt;', '>')\
               .replace('&apos;', "'")\
               .replace('&nbsp;', ' ')
    
    cleaned_text = text.strip()
    
    return cleaned_text

def clean_news_results(news_results):
    """네이버 뉴스 API 결과의 description과 title에서 HTML 태그를 제거하는 함수"""
    if not news_results or 'items' not in news_results:
        return news_results
    
    for item in news_results['items']:
        if 'description' in item:
            item['description'] = clean_text(item['description'])
        if 'title' in item:
            item['title'] = clean_text(item['title'])
    
    return news_results 