import os
import django
import random
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Team, Player

def generate_mock_heatmap():
    return json.dumps({
        "x": [random.randint(0, 100) for _ in range(10)],
        "y": [random.randint(0, 100) for _ in range(10)],
        "intensity": [random.uniform(0.1, 1.0) for _ in range(10)]
    })

teams_raw = {
    "North America": ["USA", "Mexico", "Canada", "Panama", "Haiti", "Curacao"],
    "South America": ["Argentina", "Brazil", "Uruguay", "Colombia", "Paraguay", "Ecuador"],
    "Europe": ["England", "France", "Spain", "Germany", "Portugal", "Netherlands", "Belgium", "Croatia", "Switzerland", "Austria", "Norway", "Scotland", "Sweden", "Czech Republic", "Turkey", "Bosnia and Herzegovina"],
    "Africa": ["Morocco", "Senegal", "Egypt", "Ghana", "Algeria", "Tunisia", "Ivory Coast", "South Africa", "DR Congo", "Cape Verde"],
    "Asia": ["Japan", "South Korea", "Iran", "Saudi Arabia", "Iraq", "Qatar", "Jordan", "Uzbekistan", "Australia"],
    "Oceania": ["New Zealand"]
}

# Assign mock flags, ELO, form, etc.
flags_map = {
    "USA": "🇺🇸", "Mexico": "🇲🇽", "Canada": "🇨🇦", "Panama": "🇵🇦", "Haiti": "🇭🇹", "Curacao": "🇨🇼",
    "Argentina": "🇦🇷", "Brazil": "🇧🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Paraguay": "🇵🇾", "Ecuador": "🇪🇨",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "France": "🇫🇷", "Spain": "🇪🇸", "Germany": "🇩🇪", "Portugal": "🇵🇹", "Netherlands": "🇳🇱", 
    "Belgium": "🇧🇪", "Croatia": "🇭🇷", "Switzerland": "🇨🇭", "Austria": "🇦🇹", "Norway": "🇳🇴", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", 
    "Sweden": "🇸🇪", "Czech Republic": "🇨🇿", "Turkey": "🇹🇷", "Bosnia and Herzegovina": "🇧🇦",
    "Morocco": "🇲🇦", "Senegal": "🇸🇳", "Egypt": "🇪🇬", "Ghana": "🇬🇭", "Algeria": "🇩🇿", "Tunisia": "🇹🇳", 
    "Ivory Coast": "🇨🇮", "South Africa": "🇿🇦", "DR Congo": "🇨🇩", "Cape Verde": "🇨🇻",
    "Japan": "🇯🇵", "South Korea": "🇰🇷", "Iran": "🇮🇷", "Saudi Arabia": "🇸🇦", "Iraq": "🇮🇶", "Qatar": "🇶🇦", 
    "Jordan": "🇯🇴", "Uzbekistan": "🇺🇿", "Australia": "🇦🇺",
    "New Zealand": "🇳🇿"
}

formations = ["4-3-3", "4-2-3-1", "3-5-2", "4-4-2", "3-4-3"]

def seed():
    print("Clearing old data...")
    Team.objects.all().delete()
    
    print("Seeding 48 teams...")
    elo_base = 2100
    rank = 1
    
    for confed, t_list in teams_raw.items():
        for t_name in t_list:
            elo = max(1300, elo_base - random.randint(0, 50))
            elo_base -= 15 # gradual decrease to simulate ranking spread
            
            form = round(random.uniform(5.0, 9.5), 1)
            formation = random.choice(formations)
            
            team = Team.objects.create(
                name=t_name,
                fifa_rank=rank,
                elo_rating=elo,
                recent_form=form,
                confederation=confed,
                flag_url=flags_map.get(t_name, "🌍"),
                tactical_formation=formation,
                strengths="High pressing, quick transitions, strong set pieces.",
                weaknesses="Vulnerable to counter-attacks, struggles against low blocks.",
                historical_performance="Consistent knockout stage appearances. Seeking championship glory."
            )
            rank += 1
            
            # Create 11 mock players per team
            positions = ["Goalkeeper"] + ["Defender"]*4 + ["Midfielder"]*3 + ["Forward"]*3
            for i, pos in enumerate(positions):
                Player.objects.create(
                    name=f"{t_name} Player {i+1}",
                    team=team,
                    position=pos,
                    club=f"FC Mock {random.randint(1,20)}",
                    national_appearances=random.randint(1, 120),
                    market_value=random.uniform(1.0, 150.0),
                    recent_form=round(random.uniform(5.0, 10.0), 1),
                    goals=random.randint(0, 50) if pos != "Goalkeeper" else 0,
                    assists=random.randint(0, 40) if pos != "Goalkeeper" else 0,
                    injury_status=random.choice([True, False, False, False]), # 25% injury chance
                    ai_rating=random.randint(70, 99),
                    heat_map_data=generate_mock_heatmap()
                )
    print("Seeding complete! Added 48 teams and their squads.")

if __name__ == '__main__':
    seed()
