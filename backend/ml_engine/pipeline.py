import random
import math
from scipy.stats import poisson


class WorldCupAIEngine:
    """
    V3 Meta-Learner AI Engine.
    Prediction factors:
    - ELO Rating (historical strength)
    - Recent Form (last 5 matches)
    - Squad Market Value (quality proxy)
    - World Cup Experience (tournament know-how)
    - Injury Impact (key player availability)
    - Star Player Form (top rated player momentum)
    - Continental Advantage modifier
    """

    def get_adjusted_strength(self, team_data: dict) -> float:
        base_elo = 1700.0
        elo = team_data.get('elo_rating', 1500)
        form = team_data.get('recent_form', 5.0)
        squad_value = team_data.get('squad_market_value', 200.0)
        wc_appearances = team_data.get('world_cup_appearances', 3)
        players = team_data.get('players', [])

        # ELO base strength (primary factor, ~60% weight)
        elo_strength = elo / base_elo

        # Form modifier: +/- 15% max based on 0-10 form scale
        form_modifier = 1.0 + ((form - 5.0) / 33.33)

        # Squad value modifier: +/- 10% based on €0-800M range
        value_modifier = 1.0 + (min(squad_value, 800) / 8000)

        # Experience modifier: +5% per 5 WC appearances, max +15%
        experience_modifier = 1.0 + min(0.15, wc_appearances * 0.01)

        # Injury penalty: each injured player loses 2% strength
        injured_count = sum(1 for p in players if p.get('injury_status', False))
        injury_modifier = max(0.85, 1.0 - (injured_count * 0.02))

        # Star player bonus: top form players add up to 8%
        if players:
            avg_form = sum(p.get('recent_form', 5.0) for p in players) / len(players)
            star_modifier = 1.0 + ((avg_form - 5.0) / 62.5)
        else:
            star_modifier = 1.0

        # News Sentiment modifier: +/- 5% based on -1.0 to 1.0 score
        news_sentiment = team_data.get('news_sentiment', 0.0)
        sentiment_modifier = 1.0 + (news_sentiment * 0.05)

        return elo_strength * form_modifier * value_modifier * experience_modifier * injury_modifier * star_modifier * sentiment_modifier

    def predict_match(self, home_data: dict, away_data: dict) -> dict:
        """Poisson-based match prediction using composite team strength."""
        home_strength = self.get_adjusted_strength(home_data)
        away_strength = self.get_adjusted_strength(away_data)

        # Base xG per match ~1.35 goals each (real-world WC average)
        base_xg = 1.35

        # Home advantage adds ~8% to attack
        xg_home = base_xg * (home_strength / away_strength) * 1.08
        xg_away = base_xg * (away_strength / home_strength)

        # Clamp to realistic range
        xg_home = round(max(0.3, min(xg_home, 3.5)), 2)
        xg_away = round(max(0.3, min(xg_away, 3.5)), 2)

        # Poisson probability matrix
        max_goals = 8
        home_pmf = [poisson.pmf(i, xg_home) for i in range(max_goals)]
        away_pmf = [poisson.pmf(i, xg_away) for i in range(max_goals)]

        win_prob = draw_prob = loss_prob = 0.0
        for i in range(max_goals):
            for j in range(max_goals):
                p = home_pmf[i] * away_pmf[j]
                if i > j:
                    win_prob += p
                elif i == j:
                    draw_prob += p
                else:
                    loss_prob += p

        total = win_prob + draw_prob + loss_prob

        # Confidence: higher when ELO gap is large
        elo_diff = abs(home_data.get('elo_rating', 1500) - away_data.get('elo_rating', 1500))
        confidence = min(0.97, 0.70 + (elo_diff / 2000))

        return {
            'win_prob': round(win_prob / total, 3),
            'draw_prob': round(draw_prob / total, 3),
            'loss_prob': round(loss_prob / total, 3),
            'xg_home': xg_home,
            'xg_away': xg_away,
            'ai_confidence': round(confidence, 2),
            'home_strength_index': round(home_strength, 3),
            'away_strength_index': round(away_strength, 3),
        }

    def simulate_tournament(self, teams: list, iterations: int = 1000) -> dict:
        """
        Monte Carlo tournament simulation.
        Each iteration randomly selects a winner weighted by adjusted strength.
        """
        # Pre-compute adjusted strengths
        strengths = {}
        for t in teams:
            strengths[t['name']] = self.get_adjusted_strength(t)

        total_strength = sum(strengths.values())
        wins = {t['name']: 0 for t in teams}
        team_flags = {t['name']: t.get('flag_emoji', '🌍') for t in teams}

        for _ in range(iterations):
            r = random.uniform(0, total_strength)
            cumulative = 0.0
            for name, strength in strengths.items():
                cumulative += strength
                if r <= cumulative:
                    wins[name] += 1
                    break

        results = sorted(
            [
                {
                    'team': name,
                    'flag': team_flags[name],
                    'prob': round(count / iterations, 4),
                    'wins': count,
                }
                for name, count in wins.items()
            ],
            key=lambda x: x['prob'],
            reverse=True
        )

        return {
            'iterations': iterations,
            'winner_probabilities': results,
            'top_contender': results[0]['team'] if results else None,
        }


# Singleton instance
ai_engine = WorldCupAIEngine()
