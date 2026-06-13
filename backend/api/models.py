from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    fifa_rank = models.IntegerField(null=True, blank=True)
    elo_rating = models.FloatField(default=1500.0)
    recent_form = models.FloatField(default=5.0)
    confederation = models.CharField(max_length=50, null=True, blank=True)
    flag_url = models.URLField(null=True, blank=True)
    flag_emoji = models.CharField(max_length=20, null=True, blank=True)
    tactical_formation = models.CharField(max_length=50, null=True, blank=True)
    strengths = models.TextField(null=True, blank=True)
    weaknesses = models.TextField(null=True, blank=True)
    historical_performance = models.TextField(null=True, blank=True)
    # V3 new fields
    manager_name = models.CharField(max_length=150, null=True, blank=True)
    manager_nationality = models.CharField(max_length=100, null=True, blank=True)
    foundation_year = models.IntegerField(null=True, blank=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    home_stadium = models.CharField(max_length=200, null=True, blank=True)
    squad_market_value = models.FloatField(default=0.0)  # in millions EUR
    world_cup_appearances = models.IntegerField(default=0)
    best_wc_result = models.CharField(max_length=100, null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#FFFFFF')
    secondary_color = models.CharField(max_length=7, default='#000000')
    ai_outlook = models.TextField(null=True, blank=True)
    fan_support_count = models.BigIntegerField(default=0)
    qualification_path = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['fifa_rank']

    def __str__(self):
        return self.name


class Player(models.Model):
    POSITION_CHOICES = [
        ('GK', 'Goalkeeper'),
        ('CB', 'Centre-Back'),
        ('LB', 'Left-Back'),
        ('RB', 'Right-Back'),
        ('CDM', 'Defensive Midfielder'),
        ('CM', 'Central Midfielder'),
        ('CAM', 'Attacking Midfielder'),
        ('LM', 'Left Midfielder'),
        ('RM', 'Right Midfielder'),
        ('LW', 'Left Winger'),
        ('RW', 'Right Winger'),
        ('ST', 'Striker'),
        ('CF', 'Centre-Forward'),
    ]

    name = models.CharField(max_length=150)
    team = models.ForeignKey(Team, related_name='players', on_delete=models.CASCADE)
    position = models.CharField(max_length=50)
    position_code = models.CharField(max_length=5, null=True, blank=True)
    jersey_number = models.IntegerField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    height_cm = models.IntegerField(null=True, blank=True)
    preferred_foot = models.CharField(max_length=10, null=True, blank=True)
    club = models.CharField(max_length=150, null=True, blank=True)
    club_country = models.CharField(max_length=100, null=True, blank=True)
    national_appearances = models.IntegerField(default=0)
    market_value = models.FloatField(null=True, blank=True)  # in millions EUR
    recent_form = models.FloatField(default=5.0)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    minutes_played = models.IntegerField(default=0)
    injury_status = models.BooleanField(default=False)
    injury_detail = models.CharField(max_length=200, null=True, blank=True)
    ai_rating = models.IntegerField(default=75)
    heat_map_data = models.JSONField(null=True, blank=True)
    seasonal_stats = models.JSONField(null=True, blank=True)
    is_captain = models.BooleanField(default=False)
    photo_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-ai_rating']

    def __str__(self):
        return f"{self.name} ({self.team.name})"


class HistoricalWorldCup(models.Model):
    team = models.ForeignKey(Team, related_name='wc_history', on_delete=models.CASCADE)
    year = models.IntegerField()
    host_nation = models.CharField(max_length=100)
    stage_reached = models.CharField(max_length=100)
    final_placement = models.IntegerField(null=True, blank=True)
    goals_scored = models.IntegerField(default=0)
    goals_conceded = models.IntegerField(default=0)
    matches_played = models.IntegerField(default=0)
    top_scorer = models.CharField(max_length=150, null=True, blank=True)
    top_scorer_goals = models.IntegerField(default=0)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-year']
        unique_together = ['team', 'year']

    def __str__(self):
        return f"{self.team.name} - {self.year} World Cup ({self.stage_reached})"


class FanSupport(models.Model):
    team = models.OneToOneField(Team, related_name='fan_support', on_delete=models.CASCADE)
    total_supporters = models.BigIntegerField(default=0)
    supporters_today = models.BigIntegerField(default=0)
    supporters_this_week = models.BigIntegerField(default=0)
    last_support_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.team.name} Fan Support: {self.total_supporters}"


class Match(models.Model):
    home_team = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE)
    stage = models.CharField(max_length=100, null=True, blank=True)
    group = models.CharField(max_length=10, null=True, blank=True)
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    date = models.DateTimeField(null=True, blank=True)
    venue = models.CharField(max_length=200, null=True, blank=True)
    ai_commentary = models.TextField(null=True, blank=True)
    is_upset_alert = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.home_team.name} vs {self.away_team.name}"


class Prediction(models.Model):
    match = models.ForeignKey(Match, related_name='predictions', on_delete=models.CASCADE, null=True, blank=True)
    home_team = models.ForeignKey(Team, related_name='home_predictions', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_predictions', on_delete=models.CASCADE)
    win_prob = models.FloatField()
    draw_prob = models.FloatField()
    loss_prob = models.FloatField()
    xg_home = models.FloatField()
    xg_away = models.FloatField()
    ai_confidence = models.FloatField()
    ai_explanation = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction: {self.home_team.name} vs {self.away_team.name}"


class TournamentSimulation(models.Model):
    iterations = models.IntegerField()
    results = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Simulation ({self.iterations} iterations) at {self.created_at}"


class NewsArticle(models.Model):
    team = models.ForeignKey(Team, related_name='news', on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(Player, related_name='news', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=500)
    url = models.URLField(max_length=500)
    source = models.CharField(max_length=200, null=True, blank=True)
    snippet = models.TextField(null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    published_date = models.DateTimeField(null=True, blank=True)
    sentiment_score = models.FloatField(default=0.0) # -1.0 (very negative) to 1.0 (very positive)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_date', '-created_at']

    def __str__(self):
        return f"News: {self.title[:50]}"
