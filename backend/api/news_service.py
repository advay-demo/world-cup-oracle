import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from django.utils import timezone
from duckduckgo_search import DDGS
from .models import Team, Player, NewsArticle

logger = logging.getLogger(__name__)

# Very basic rule-based sentiment keywords for football news
POSITIVE_WORDS = ['win', 'victory', 'triumph', 'star', 'form', 'goal', 'score', 'excellent', 'unbeaten', 'champion', 'success', 'boost', 'return', 'amazing', 'brilliant', 'hero', 'great', 'confident', 'strong']
NEGATIVE_WORDS = ['loss', 'defeat', 'injury', 'injured', 'crisis', 'struggle', 'blow', 'out', 'miss', 'poor', 'weak', 'doubt', 'fail', 'failure', 'disappointing', 'sack', 'pressure', 'worry']

def _analyze_sentiment(text: str) -> float:
    if not text:
        return 0.0
        
    text_lower = text.lower()
    pos_count = sum(1 for word in POSITIVE_WORDS if re.search(r'\b' + word + r'\b', text_lower))
    neg_count = sum(1 for word in NEGATIVE_WORDS if re.search(r'\b' + word + r'\b', text_lower))
    
    # Simple calculation to map to [-1.0, 1.0]
    total = pos_count + neg_count
    if total == 0:
        return 0.0
        
    score = (pos_count - neg_count) / total
    return round(score, 2)


def fetch_news_for_query(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Fetch news from DuckDuckGo and perform basic sentiment analysis."""
    try:
        ddgs = DDGS()
        results = ddgs.news(query, max_results=max_results)
        if not results:
            return []
            
        news_list = []
        for r in results:
            title = r.get('title', '')
            snippet = r.get('body', '')
            # Combine title and snippet for better sentiment context
            combined_text = f"{title} {snippet}"
            sentiment = _analyze_sentiment(combined_text)
            
            # DDG news dates are usually in ISO format, e.g. "2023-05-18T14:30:00Z"
            pub_date = None
            date_str = r.get('date')
            if date_str:
                try:
                    pub_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                except ValueError:
                    pass
            
            news_list.append({
                'title': title,
                'url': r.get('url', ''),
                'source': r.get('source', ''),
                'snippet': snippet,
                'image_url': r.get('image', ''),
                'published_date': pub_date or timezone.now(),
                'sentiment_score': sentiment
            })
            
        return news_list
    except Exception as e:
        logger.error(f"Error fetching news for '{query}': {e}")
        return []


def get_or_fetch_team_news(team: Team, force_refresh: bool = False) -> List[NewsArticle]:
    """
    Get recent news for a team from the DB, or fetch via DDGS if none exist / stale.
    Caches for 12 hours.
    """
    stale_threshold = timezone.now() - timedelta(hours=12)
    
    if not force_refresh:
        recent_news = NewsArticle.objects.filter(team=team, created_at__gte=stale_threshold).order_by('-published_date')
        if recent_news.exists():
            return list(recent_news)
            
    # Clear old cache for this team
    NewsArticle.objects.filter(team=team).delete()
    
    query = f"{team.name} national football team"
    results = fetch_news_for_query(query, max_results=5)
    
    articles = []
    for data in results:
        article = NewsArticle.objects.create(
            team=team,
            title=data['title'][:500],
            url=data['url'][:500],
            source=data['source'][:200],
            snippet=data['snippet'],
            image_url=data.get('image_url', '')[:500] if data.get('image_url') else None,
            published_date=data['published_date'],
            sentiment_score=data['sentiment_score']
        )
        articles.append(article)
        
    return articles


def get_or_fetch_player_news(player: Player, force_refresh: bool = False) -> List[NewsArticle]:
    """
    Get recent news for a player from the DB, or fetch via DDGS if none exist / stale.
    Caches for 12 hours.
    """
    stale_threshold = timezone.now() - timedelta(hours=12)
    
    if not force_refresh:
        recent_news = NewsArticle.objects.filter(player=player, created_at__gte=stale_threshold).order_by('-published_date')
        if recent_news.exists():
            return list(recent_news)
            
    # Clear old cache for this player
    NewsArticle.objects.filter(player=player).delete()
    
    query = f"{player.name} football player {player.team.name}"
    results = fetch_news_for_query(query, max_results=4)
    
    articles = []
    for data in results:
        article = NewsArticle.objects.create(
            player=player,
            title=data['title'][:500],
            url=data['url'][:500],
            source=data['source'][:200],
            snippet=data['snippet'],
            image_url=data.get('image_url', '')[:500] if data.get('image_url') else None,
            published_date=data['published_date'],
            sentiment_score=data['sentiment_score']
        )
        articles.append(article)
        
    return articles
