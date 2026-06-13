from django.urls import path
from . import views

urlpatterns = [
    # Teams
    path('teams/', views.teams_list, name='teams-list'),
    path('teams/<int:pk>/', views.team_detail, name='team-detail'),
    path('teams/<int:pk>/support/', views.support_team, name='team-support'),
    path('teams/<int:pk>/compare/', views.team_compare, name='team-compare'),
    path('fan-rankings/', views.fan_rankings, name='fan-rankings'),

    # Players
    path('players/', views.players_list, name='players-list'),
    path('players/<int:pk>/', views.player_detail, name='player-detail'),
    path('players/<int:pk>/news/', views.player_news, name='player-news'),
    path('teams/<int:pk>/news/', views.team_news, name='team-news'),

    # Predictions
    path('predict/match/', views.predict_match, name='predict-match'),
    path('predict/tournament/', views.predict_tournament, name='predict-tournament'),
]
