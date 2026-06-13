from rest_framework import serializers
from .models import Team, Player, HistoricalWorldCup, FanSupport, Match, Prediction, TournamentSimulation, NewsArticle


class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = '__all__'


class PlayerListSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_flag = serializers.CharField(source='team.flag_emoji', read_only=True)

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'team', 'team_name', 'team_flag',
            'position', 'position_code', 'jersey_number', 'age',
            'club', 'market_value', 'recent_form', 'goals', 'assists',
            'injury_status', 'ai_rating', 'is_captain',
        ]


class PlayerDetailSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_flag = serializers.CharField(source='team.flag_emoji', read_only=True)
    team_primary_color = serializers.CharField(source='team.primary_color', read_only=True)

    class Meta:
        model = Player
        fields = '__all__'


class HistoricalWCSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalWorldCup
        fields = '__all__'


class FanSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FanSupport
        fields = ['total_supporters', 'supporters_today', 'supporters_this_week', 'last_support_at']


class TeamListSerializer(serializers.ModelSerializer):
    fan_support_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'fifa_rank', 'elo_rating', 'recent_form',
            'confederation', 'flag_emoji', 'flag_url',
            'tactical_formation', 'primary_color', 'secondary_color',
            'manager_name', 'nickname', 'world_cup_appearances',
            'best_wc_result', 'squad_market_value', 'fan_support_count',
        ]

    def get_fan_support_count(self, obj):
        try:
            return obj.fan_support.total_supporters
        except FanSupport.DoesNotExist:
            return 0


class TeamDetailSerializer(serializers.ModelSerializer):
    players = PlayerListSerializer(many=True, read_only=True)
    wc_history = HistoricalWCSerializer(many=True, read_only=True)
    fan_support = FanSupportSerializer(read_only=True)

    class Meta:
        model = Team
        fields = '__all__'
