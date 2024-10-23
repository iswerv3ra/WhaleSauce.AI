import requests
import pandas as pd
from datetime import datetime
import os

# Fetch and prepare odds data
def download_odds(sport, selected_bookmaker='Bovada'):
    # Replace with your API endpoint and key
    api_key = '7fa2183601e4ace7e50d6e5966f7cb6b'
    url = f"https://api.the-odds-api.com/v4/sports/{sport}/odds/?apiKey={api_key}&regions=us&markets=h2h,spreads&oddsFormat=american"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"API request failed with status code {response.status_code}")

    result = response.json()
    all_matches = []

    for res in result:
        for books in res['bookmakers']:
            if books['title'] != selected_bookmaker:
                continue
            match = {
                'event_time': datetime.fromisoformat(res['commence_time'].replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S'),
                'bookmaker': books['title'],
                'Fighter': books['markets'][0]['outcomes'][0]['name'],
                'Opponent': books['markets'][0]['outcomes'][1]['name'],
                'odds_f1': books['markets'][0]['outcomes'][0]['price'],
                'odds_f2': books['markets'][0]['outcomes'][1]['price']
            }
            all_matches.append(match)

    return pd.DataFrame(all_matches)

# Function to save odds data to CSV
def save_odds_to_csv(sport, selected_bookmaker='Bovada', output_file=None):
    df = download_odds(sport, selected_bookmaker)
    
    # Define the output path
    if output_file is None:
        output_file = r'C:\Users\kelly\OneDrive\Documents\1.Notebooks\WhaleSauce.AI\ufc-analytics-web-app\public\data\bovada_fighters_odds.csv'

    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    df.to_csv(output_file, index=False)
    print(f"Odds data saved to {output_file}")

# Main script execution
if __name__ == "__main__":
    # Specify the sport and bookmakers as needed
    sport = 'mma_mixed_martial_arts'
    selected_bookmaker = 'Bovada'  # Only pull data from Bovada

    save_odds_to_csv(sport, selected_bookmaker)
