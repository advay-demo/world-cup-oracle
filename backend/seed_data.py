import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Team, Player

# A list of 32 participating teams (mock data for top 32)
teams_data = [
    {"name": "Brazil", "fifa_rank": 1, "elo_rating": 2145, "recent_form": 8.5, "confederation": "CONMEBOL", "flag_url": "🇧🇷"},
    {"name": "France", "fifa_rank": 2, "elo_rating": 2110, "recent_form": 9.0, "confederation": "UEFA", "flag_url": "🇫🇷"},
    {"name": "Argentina", "fifa_rank": 3, "elo_rating": 2090, "recent_form": 8.2, "confederation": "CONMEBOL", "flag_url": "🇦🇷"},
    {"name": "England", "fifa_rank": 4, "elo_rating": 2050, "recent_form": 7.5, "confederation": "UEFA", "flag_url": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
    {"name": "Spain", "fifa_rank": 5, "elo_rating": 2020, "recent_form": 8.0, "confederation": "UEFA", "flag_url": "🇪🇸"},
    {"name": "Germany", "fifa_rank": 6, "elo_rating": 1980, "recent_form": 7.2, "confederation": "UEFA", "flag_url": "🇩🇪"},
    {"name": "Portugal", "fifa_rank": 7, "elo_rating": 1960, "recent_form": 8.8, "confederation": "UEFA", "flag_url": "🇵🇹"},
    {"name": "Netherlands", "fifa_rank": 8, "elo_rating": 1950, "recent_form": 7.0, "confederation": "UEFA", "flag_url": "🇳🇱"},
    {"name": "Italy", "fifa_rank": 9, "elo_rating": 1930, "recent_form": 7.8, "confederation": "UEFA", "flag_url": "🇮🇹"},
    {"name": "Croatia", "fifa_rank": 10, "elo_rating": 1910, "recent_form": 6.5, "confederation": "UEFA", "flag_url": "🇭🇷"},
    {"name": "USA", "fifa_rank": 11, "elo_rating": 1880, "recent_form": 7.4, "confederation": "CONCACAF", "flag_url": "🇺🇸"},
    {"name": "Mexico", "fifa_rank": 12, "elo_rating": 1850, "recent_form": 6.0, "confederation": "CONCACAF", "flag_url": "🇲🇽"},
    {"name": "Uruguay", "fifa_rank": 13, "elo_rating": 1840, "recent_form": 8.1, "confederation": "CONMEBOL", "flag_url": "🇺🇾"},
    {"name": "Colombia", "fifa_rank": 14, "elo_rating": 1820, "recent_form": 7.9, "confederation": "CONMEBOL", "flag_url": "🇨🇴"},
    {"name": "Senegal", "fifa_rank": 15, "elo_rating": 1800, "recent_form": 6.8, "confederation": "CAF", "flag_url": "🇸🇳"},
    {"name": "Japan", "fifa_rank": 16, "elo_rating": 1790, "recent_form": 8.4, "confederation": "AFC", "flag_url": "🇯🇵"},
    {"name": "Morocco", "fifa_rank": 17, "elo_rating": 1780, "recent_form": 7.6, "confederation": "CAF", "flag_url": "🇲🇦"},
    {"name": "Switzerland", "fifa_rank": 18, "elo_rating": 1760, "recent_form": 6.7, "confederation": "UEFA", "flag_url": "🇨🇭"},
    {"name": "Denmark", "fifa_rank": 19, "elo_rating": 1750, "recent_form": 6.2, "confederation": "UEFA", "flag_url": "🇩🇰"},
    {"name": "Iran", "fifa_rank": 20, "elo_rating": 1720, "recent_form": 7.1, "confederation": "AFC", "flag_url": "🇮🇷"},
    {"name": "South Korea", "fifa_rank": 21, "elo_rating": 1700, "recent_form": 7.0, "confederation": "AFC", "flag_url": "🇰🇷"},
    {"name": "Australia", "fifa_rank": 22, "elo_rating": 1690, "recent_form": 6.5, "confederation": "AFC", "flag_url": "🇦🇺"},
    {"name": "Ecuador", "fifa_rank": 23, "elo_rating": 1680, "recent_form": 7.2, "confederation": "CONMEBOL", "flag_url": "🇪🇨"},
    {"name": "Serbia", "fifa_rank": 24, "elo_rating": 1660, "recent_form": 6.1, "confederation": "UEFA", "flag_url": "🇷🇸"},
    {"name": "Poland", "fifa_rank": 25, "elo_rating": 1650, "recent_form": 5.8, "confederation": "UEFA", "flag_url": "🇵🇱"},
    {"name": "Sweden", "fifa_rank": 26, "elo_rating": 1640, "recent_form": 6.4, "confederation": "UEFA", "flag_url": "🇸🇪"},
    {"name": "Wales", "fifa_rank": 27, "elo_rating": 1620, "recent_form": 5.5, "confederation": "UEFA", "flag_url": "🏴󠁧󠁢󠁷󠁬󠁳󠁿"},
    {"name": "Cameroon", "fifa_rank": 28, "elo_rating": 1600, "recent_form": 6.0, "confederation": "CAF", "flag_url": "🇨🇲"},
    {"name": "Canada", "fifa_rank": 29, "elo_rating": 1590, "recent_form": 7.5, "confederation": "CONCACAF", "flag_url": "🇨🇦"},
    {"name": "Ghana", "fifa_rank": 30, "elo_rating": 1580, "recent_form": 5.9, "confederation": "CAF", "flag_url": "🇬🇭"},
    {"name": "Saudi Arabia", "fifa_rank": 31, "elo_rating": 1570, "recent_form": 6.6, "confederation": "AFC", "flag_url": "🇸🇦"},
    {"name": "Qatar", "fifa_rank": 32, "elo_rating": 1550, "recent_form": 6.2, "confederation": "AFC", "flag_url": "🇶🇦"},
]

# Seed teams
for t in teams_data:
    obj, created = Team.objects.update_or_create(
        name=t['name'], 
        defaults={
            'fifa_rank': t['fifa_rank'],
            'elo_rating': t['elo_rating'],
            'recent_form': t['recent_form'],
            'confederation': t['confederation'],
            'flag_url': t['flag_url']
        }
    )
    print(f"Updated Team: {obj.name}")

# Mock star players
players_data = {
    "Brazil": [
        {"name": "Vinicius Jr", "position": "Forward", "recent_form": 9.5},
        {"name": "Rodrygo", "position": "Forward", "recent_form": 8.8},
    ],
    "France": [
        {"name": "Kylian Mbappe", "position": "Forward", "recent_form": 9.2},
        {"name": "Antoine Griezmann", "position": "Midfielder", "recent_form": 8.5},
    ],
    "Argentina": [
        {"name": "Lionel Messi", "position": "Forward", "recent_form": 9.0},
        {"name": "Julian Alvarez", "position": "Forward", "recent_form": 8.3},
    ],
    "England": [
        {"name": "Jude Bellingham", "position": "Midfielder", "recent_form": 9.4},
        {"name": "Harry Kane", "position": "Forward", "recent_form": 8.9},
    ],
    "Portugal": [
        {"name": "Cristiano Ronaldo", "position": "Forward", "recent_form": 8.1},
        {"name": "Bruno Fernandes", "position": "Midfielder", "recent_form": 8.7},
    ]
}

# Seed players
for team_name, players in players_data.items():
    team = Team.objects.get(name=team_name)
    for p in players:
        Player.objects.update_or_create(
            name=p['name'],
            team=team,
            defaults={
                'position': p['position'],
                'recent_form': p['recent_form']
            }
        )
        print(f"Updated Player: {p['name']} ({team_name})")

print("Seeding complete!")
