from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from .models import Team, Player, FanSupport, HistoricalWorldCup
from .serializers import TeamListSerializer, TeamDetailSerializer, PlayerListSerializer, PlayerDetailSerializer, NewsArticleSerializer
from .news_service import get_or_fetch_team_news, get_or_fetch_player_news
from ml_engine.pipeline import ai_engine
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ─── TEAMS ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
def teams_list(request):
    """List all teams, optionally filtered by confederation."""
    confederation = request.query_params.get('confederation')
    limit = request.query_params.get('limit')

    qs = Team.objects.all().order_by('fifa_rank')
    if confederation:
        qs = qs.filter(confederation__iexact=confederation)
    if limit:
        qs = qs[:int(limit)]

    serializer = TeamListSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def team_detail(request, pk):
    """Full team profile including players, WC history, fan support."""
    try:
        team = Team.objects.prefetch_related('players', 'wc_history', 'fan_support').get(pk=pk)
    except Team.DoesNotExist:
        return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TeamDetailSerializer(team)
    return Response(serializer.data)


@api_view(['POST'])
def support_team(request, pk):
    """Increment fan support for a nation."""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

    fan_support, _ = FanSupport.objects.get_or_create(team=team)
    fan_support.total_supporters += 1
    fan_support.supporters_today += 1
    fan_support.supporters_this_week += 1
    fan_support.last_support_at = timezone.now()
    fan_support.save()

    # Also update team's fan_support_count cache
    team.fan_support_count += 1
    team.save(update_fields=['fan_support_count'])

    return Response({
        'total_supporters': fan_support.total_supporters,
        'supporters_today': fan_support.supporters_today,
        'message': f'You are now supporting {team.name}! 🎉'
    })


@api_view(['GET'])
def fan_rankings(request):
    """Get the top teams by fan support."""
    top_n = int(request.query_params.get('top', 10))
    teams = Team.objects.order_by('-fan_support_count')[:top_n]
    serializer = TeamListSerializer(teams, many=True)
    return Response(serializer.data)


# ─── PLAYERS ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
def players_list(request):
    """Searchable, filterable paginated player list."""
    search = request.query_params.get('search', '')
    team_id = request.query_params.get('team')
    position = request.query_params.get('position')
    page = int(request.query_params.get('page', 1))
    per_page = int(request.query_params.get('per_page', 50))

    qs = Player.objects.select_related('team').order_by('-ai_rating')

    if search:
        qs = qs.filter(Q(name__icontains=search) | Q(team__name__icontains=search) | Q(club__icontains=search))
    if team_id:
        qs = qs.filter(team_id=team_id)
    if position:
        qs = qs.filter(position_code__iexact=position)

    total = qs.count()
    start = (page - 1) * per_page
    end = start + per_page
    players = qs[start:end]

    serializer = PlayerListSerializer(players, many=True)
    return Response({
        'count': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page,
        'results': serializer.data
    })


@api_view(['GET'])
def player_detail(request, pk):
    """Full player profile."""
    try:
        player = Player.objects.select_related('team').get(pk=pk)
    except Player.DoesNotExist:
        return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PlayerDetailSerializer(player)
    return Response(serializer.data)


# ─── PREDICTIONS ───────────────────────────────────────────────────────────────

@api_view(['POST'])
def predict_match(request):
    """AI match prediction with explanation engine."""
    team1_id = request.data.get('home_team')
    team2_id = request.data.get('away_team')

    if not team1_id or not team2_id:
        return Response({'error': 'Both home_team and away_team are required'}, status=400)

    try:
        home_team = Team.objects.prefetch_related('players').get(id=team1_id)
        away_team = Team.objects.prefetch_related('players').get(id=team2_id)
    except Team.DoesNotExist:
        return Response({'error': 'Teams not found'}, status=404)

    # Get live news sentiment
    home_news = get_or_fetch_team_news(home_team)
    away_news = get_or_fetch_team_news(away_team)
    
    home_sentiment = sum(a.sentiment_score for a in home_news) / len(home_news) if home_news else 0.0
    away_sentiment = sum(a.sentiment_score for a in away_news) / len(away_news) if away_news else 0.0

    home_data = {
        'elo_rating': home_team.elo_rating,
        'recent_form': home_team.recent_form,
        'squad_market_value': home_team.squad_market_value,
        'world_cup_appearances': home_team.world_cup_appearances,
        'news_sentiment': home_sentiment,
        'players': [{'recent_form': p.recent_form, 'injury_status': p.injury_status} for p in home_team.players.all()]
    }
    away_data = {
        'elo_rating': away_team.elo_rating,
        'recent_form': away_team.recent_form,
        'squad_market_value': away_team.squad_market_value,
        'world_cup_appearances': away_team.world_cup_appearances,
        'news_sentiment': away_sentiment,
        'players': [{'recent_form': p.recent_form, 'injury_status': p.injury_status} for p in away_team.players.all()]
    }

    prediction = ai_engine.predict_match(home_data, away_data)

    # Build explanation
    elo_diff = home_team.elo_rating - away_team.elo_rating
    is_upset_alert = False
    explanations = []

    if abs(elo_diff) > 0:
        stronger = home_team.name if elo_diff > 0 else away_team.name
        explanations.append(f"{stronger} holds a significant ELO advantage of {abs(elo_diff):.0f} points, making them the statistical favourite.")

    if home_team.recent_form > away_team.recent_form + 1:
        explanations.append(f"{home_team.name}'s recent form ({home_team.recent_form}/10) significantly outperforms {away_team.name} ({away_team.recent_form}/10).")
    elif away_team.recent_form > home_team.recent_form + 1:
        explanations.append(f"{away_team.name} arrives in outstanding form ({away_team.recent_form}/10) compared to {home_team.name}'s ({home_team.recent_form}/10).")

    injured_home = [p for p in home_team.players.all() if p.injury_status]
    injured_away = [p for p in away_team.players.all() if p.injury_status]
    if injured_home:
        explanations.append(f"{home_team.name} faces injury concerns with {len(injured_home)} player(s) unavailable.")
    if injured_away:
        explanations.append(f"{away_team.name} is also impacted by injuries affecting {len(injured_away)} squad member(s).")

    if home_team.squad_market_value > away_team.squad_market_value * 1.5:
        explanations.append(f"{home_team.name}'s squad depth (€{home_team.squad_market_value:.0f}M) vastly outvalues {away_team.name} (€{away_team.squad_market_value:.0f}M), suggesting superior quality through the starting XI.")

    if home_sentiment > 0.4 and away_sentiment < -0.2:
        explanations.append(f"Recent news strongly favors {home_team.name}, generating positive momentum compared to {away_team.name}'s current struggles.")
    elif away_sentiment > 0.4 and home_sentiment < -0.2:
        explanations.append(f"Recent news strongly favors {away_team.name}, generating positive momentum compared to {home_team.name}'s current struggles.")
    elif home_sentiment > 0.3:
        explanations.append(f"A positive news cycle surrounding {home_team.name} boosts their predicted performance.")
    elif away_sentiment > 0.3:
        explanations.append(f"A positive news cycle surrounding {away_team.name} boosts their predicted performance.")
    elif home_sentiment < -0.3:
        explanations.append(f"Negative press and team issues surrounding {home_team.name} lower their expected performance.")
    
    if not explanations:
        explanations.append("Both teams are closely matched across all key metrics, making this a highly unpredictable encounter.")

    # Upset detector
    if abs(elo_diff) > 200:
        underdog = home_team if elo_diff < 0 else away_team
        underdog_prob = prediction['win_prob'] if underdog == home_team else prediction['loss_prob']
        if underdog_prob > 0.28:
            is_upset_alert = True
            commentary = f"🚨 UPSET ALERT: {underdog.name}'s red-hot form gives them a dangerous {underdog_prob*100:.0f}% chance to shock the tournament!"
        else:
            commentary = f"The AI backs the favourite, though {underdog.name}'s resilience could cause problems."
    else:
        commentary = "A fiercely contested battle between two evenly matched sides. Expect a tight tactical game."

    prediction['ai_commentary'] = commentary
    prediction['is_upset_alert'] = is_upset_alert
    prediction['explanations'] = explanations[:4]

    return Response({
        'home_team': TeamListSerializer(home_team).data,
        'away_team': TeamListSerializer(away_team).data,
        'prediction': prediction
    })


@api_view(['POST'])
def predict_tournament(request):
    """Monte Carlo tournament simulation across all 48 teams."""
    iterations = int(request.data.get('iterations', 1000))
    iterations = min(iterations, 10000)

    teams_db = Team.objects.prefetch_related('players').all()
    if not teams_db:
        return Response({'error': 'No teams seeded yet'}, status=400)

    teams_data = [
        {
            'name': t.name,
            'flag_emoji': t.flag_emoji,
            'elo_rating': t.elo_rating,
            'recent_form': t.recent_form,
            'squad_market_value': t.squad_market_value,
            'world_cup_appearances': t.world_cup_appearances,
            'players': [{'recent_form': p.recent_form} for p in t.players.all()]
        }
        for t in teams_db
    ]

    result = ai_engine.simulate_tournament(teams_data, iterations)
    return Response(result)


@api_view(['GET'])
def team_compare(request, pk):
    """Compare one team against another via query param."""
    team_id2 = request.query_params.get('team_id2')
    try:
        team1 = Team.objects.get(pk=pk)
        team2 = Team.objects.get(pk=team_id2)
    except Team.DoesNotExist:
        return Response({'error': 'Teams not found'}, status=404)

    def metrics(team):
        return {
            'elo': round(team.elo_rating),
            'form': team.recent_form * 10,
            'squad_value': min(100, team.squad_market_value / 10),
            'experience': min(100, team.world_cup_appearances * 5),
            'attacking': round(min(100, team.elo_rating / 22)),
            'defending': round(min(100, team.elo_rating / 23)),
        }

    return Response({
        'team1': TeamListSerializer(team1).data,
        'team2': TeamListSerializer(team2).data,
        'metrics_team1': metrics(team1),
        'metrics_team2': metrics(team2),
    })

# ─── NEWS ──────────────────────────────────────────────────────────────────────

@api_view(['GET'])
def team_news(request, pk):
    """Fetch live news for a team."""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({'error': 'Team not found'}, status=404)
        
    force = request.query_params.get('force', 'false').lower() == 'true'
    articles = get_or_fetch_team_news(team, force_refresh=force)
    serializer = NewsArticleSerializer(articles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def player_news(request, pk):
    """Fetch live news for a player."""
    try:
        player = Player.objects.get(pk=pk)
    except Player.DoesNotExist:
        return Response({'error': 'Player not found'}, status=404)
        
    force = request.query_params.get('force', 'false').lower() == 'true'
    articles = get_or_fetch_player_news(player, force_refresh=force)
    serializer = NewsArticleSerializer(articles, many=True)
    return Response(serializer.data)
