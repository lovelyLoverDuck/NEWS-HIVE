import requests
import json
from typing import Dict, Any

class NaverSearch:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://openapi.naver.com/v1/search/news.json"
        
    def search(self, query: str, display: int = 10, start: int = 1, sort: str = "sim") -> Dict[str, Any]:
        """
        네이버 뉴스 검색 API를 사용하여 검색을 수행합니다.
        
        Args:
            query (str): 검색어
            display (int): 한 번에 표시할 검색 결과 개수 (최대 100)
            start (int): 검색 시작 위치 (최대 1000)
            sort (str): 정렬 방식 (sim: 정확도순, date: 날짜순)
            
        Returns:
            Dict[str, Any]: 검색 결과
        """
        headers = {
            "X-Naver-Client-Id": self.client_id,
            "X-Naver-Client-Secret": self.client_secret
        }
        
        params = {
            "query": query,
            "display": display,
            "start": start,
            "sort": sort
        }
        
        try:
            response = requests.get(
                self.base_url,
                headers=headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"검색 중 오류 발생: {e}")
            return {"error": str(e)} 