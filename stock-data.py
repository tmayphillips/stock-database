#%%
# Use polyenv 
import requests
import pandas as pd
import os
import math
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
import psycopg2
import matplotlib
from sqlalchemy import create_engine
from tqdm import tqdm_notebook

#%%
# Set constant variables

POLYGON_API_KEY_NEWS = 'e_utOCyEUkbpbTgaYfooP7RXuq1C8T5R'
POLYGON_API_KEY_ONE = 'vKlpDwCiXuBQit_iGLM3pdZirt4m8xjt'
POLYGON_API_KEY_TWO = 'x4S54nJ8Ct0C2XC6ZV2ltgHIGXqQ9Pe8'
POLYGON_API_KEY_THREE = 'pEC35aiLgX8BZFDj9QjjTGrzDsYgYgLK'
START_DATE = ['2021-01-01', '2021-01-11', '2021-01-18', '2021-01-25', '2021-02-01', '2021-02-08', '2021-02-15', '2021-02-22', '2021-03-01', '2021-03-08', '2021-03-15', '2021-03-22', '2021-03-29', '2021-04-05', '2021-04-12', '2021-04-19', '2021-04-26', '2021-05-03', '2021-05-10', '2021-05-17', '2021-05-24', '2021-05-31', '2021-06-07', '2021-06-14', '2021-06-21', '2021-06-28', '2021-07-05', '2021-07-12', '2021-07-19', '2021-07-26', '2021-08-02', '2021-08-09', '2021-08-16', '2021-08-23', '2021-08-30', '2021-09-06', '2021-09-13', '2021-09-20', '2021-09-27', '2021-10-04', '2021-10-11', '2021-10-18', '2021-10-25', '2021-11-01', '2021-11-08', '2021-11-15', '2021-11-22', '2021-11-29', '2021-12-06', '2021-12-13', '2021-12-20', '2021-12-27', '2022-01-03', '2022-01-10']
END_DATE = '2022-01-14'
#START_DATE = ['2021-01-01', '2021-01-11', '2021-01-18', '2021-01-25', '2021-02-01', '2021-02-08', '2021-02-15', '2021-02-22', '2021-03-01', '2021-03-08', '2021-03-15']
#START_DATE = ['2021-03-22', '2021-03-29', '2021-04-05', '2021-04-12', '2021-04-19', '2021-04-26', '2021-05-03', '2021-05-10', '2021-05-17', '2021-05-24', '2021-05-31']
#START_DATE = ['2021-06-07', '2021-06-14', '2021-06-21', '2021-06-28', '2021-07-05', '2021-07-12', '2021-07-19', '2021-07-26', '2021-08-02', '2021-08-09', '2021-08-16']
#START_DATE = ['2021-08-23', '2021-08-30', '2021-09-06', '2021-09-13', '2021-09-20', '2021-09-27', '2021-10-04', '2021-10-11', '2021-10-18', '2021-10-25', '2021-11-01']
#START_DATE = ['2021-11-08', '2021-11-15', '2021-11-22', '2021-11-29', '2021-12-06', '2021-12-13', '2021-12-20', '2021-12-27', '2022-01-03', '2022-01-10']

POLYGON_AGGS_URL_5MIN = 'https://api.polygon.io/v2/aggs/ticker/{}/range/5/minute/{}/{}?unadjusted=true&apiKey={}'
POLYGON_AGGS_URL_15MIN = 'https://api.polygon.io/v2/aggs/ticker/{}/range/15/minute/{}/{}?unadjusted=true&apiKey={}'
POLYGON_AGGS_URL_1HOUR = 'https://api.polygon.io/v2/aggs/ticker/{}/range/1/hour/{}/{}?unadjusted=true&apiKey={}'
POLYGON_AGGS_URL_1DAY = 'https://api.polygon.io/v2/aggs/ticker/{}/range/1/day/{}/{}?unadjusted=true&apiKey={}'

#%%
# Create a database connection
db_password = '8e2e84a5507c45cf3c54802e97948abd2ebb73ad29453ec3558f64cbe02469e7'
engine = create_engine('postgresql://vujwyosxlhitrw:{}@ec2-3-228-236-221.compute-1.amazonaws.com/djvd7ebilq70q'.format(db_password))

#%%
# # Define get bar data for the symbols, import to database
#symbols = ['AAPL','TSLA', 'NVDA', 'JPM', 'BAC']
symbols = ['NBR', 'GOOG', 'AXP', 'COF', 'WFC']
# symbols = ['MSFT', 'FB', 'AMZN', 'GS', 'MS']
# symbols = ['V', 'GME', 'NFLX', 'KO', 'JNJ']
# symbols = ['CRM', 'PYPL', 'XOM', 'HD', 'DIS']
# symbols = ['INTC', 'COP', 'CVX', 'SBUX', 'OXY']
# symbols = ['WMT', 'MPC', 'SLB', 'PSX', 'VLO']
def get_bars(symbolslist, outdir, start, end, url, key):

    session = requests.Session()
    # In case I run into issues, retry my connection
    retries = Retry(total=5, backoff_factor=0.1, status_forcelist=[ 500, 502, 503, 504 ])

    session.mount('http://', HTTPAdapter(max_retries=retries))
    count = 0
    
    barlog = open("barlog.txt", "w")
    
    for symbol in symbolslist:
        try:
            r = session.get(url.format(symbol, start, end, key))
            if r:
                data = r.json()
            
                # create a pandas dataframe from the information
                if data['queryCount'] > 1:
                    df = pd.DataFrame(data['results'])
                    df['date'] = pd.to_datetime(df['t'], unit='ms')
                    # df['date'] =  df['date'].dt.date.astype(str)
                    df.set_index('date', inplace=True)
                    df['symbol'] = symbol

                    df.drop(columns=['vw', 't', 'n'], inplace=True)
                    df.rename(columns={'v': 'volume', 'o': 'open', 'c': 'close', 'h': 'high', 'l': 'low'}, inplace=True)

                    df.to_csv('{}/{}.csv'.format(outdir, symbol), index=True)
                    count += 1

                    # Logging, I could write a short method for this to reuse
                    msg = (symbol + ' file created with record count ' + str(data['queryCount']))
                    print(msg)
                    barlog.write(msg)
                    barlog.write("\n")

                else:
                    msg = ('No data for symbol ' + str(symbol))
                    print(msg)
                    barlog.write(msg)
                    barlog.write("\n")
            else:
                msg = ('No response for symbol ' + str(symbol))
                print(msg)
                barlog.write(msg)
                barlog.write("\n")
        # Raise exception but continue           
        except:
            msg = ('****** exception raised for symbol ' + str(symbol))
            print(msg)
            barlog.write(msg)
            barlog.write("\n")
    
    barlog.close()
    return ('{} file were exported'.format(count))

def import_bar_file(symbol, bars_path, database):
    path = bars_path + '/{}.csv'.format(symbol)
    df = pd.read_csv(path, index_col=[0], parse_dates=[0])
    
    # First part of the insert statement
    insert_init = """INSERT INTO {}
                    (date, volume, open, close, high, low, symbol)
                    VALUES
                """.format(database)
                
    # Add values for all days to the insert statement
    vals = ",".join(["""('{}', '{}', '{}', '{}', '{}', '{}', '{}')""".format(
                     date,
                     row.volume,
                     row.open,
                     row.close,
                     row.high,
                     row.low,
                     symbol,
                     ) for date, row in df.iterrows()])
    
    # Handle duplicate values - Avoiding errors if you've already got some data in your table
    insert_end = """ ON CONFLICT (symbol, date) DO UPDATE 
                SET
                volume = EXCLUDED.volume,
                open = EXCLUDED.open,
                close = EXCLUDED.close,
                high = EXCLUDED.high,
                low = EXCLUDED.low
                """

    # Put together the query string
    query = insert_init + vals + insert_end
    
    # Fire insert statement
    engine.execute(query)

#get_bars(symbols, 'daily-data', '2021-01-01', END_DATE, POLYGON_AGGS_URL_1DAY, POLYGON_API_KEY_NEWS)


# This function will loop through all the files in the directory and process the CSV files
def process_symbols():
    
    for symbol in tqdm_notebook(symbols, desc='Importing...'):
        import_bar_file(symbol, '5min-data', 'min5_prices')
        import_bar_file(symbol, '15min-data', 'min15_prices')
        import_bar_file(symbol, '60min-data', 'hour_prices')
        import_bar_file(symbol, 'daily-data', 'daily_prices')

    return 'Process symbols complete'        
    

#%% 
# Get bar data for each symbol and week
for date in START_DATE:
    get_bars(symbols, '5min-data', date, END_DATE, POLYGON_AGGS_URL_5MIN, POLYGON_API_KEY_ONE)
    get_bars(symbols, '15min-data', date, END_DATE, POLYGON_AGGS_URL_15MIN, POLYGON_API_KEY_TWO)
    get_bars(symbols, '60min-data', date, END_DATE, POLYGON_AGGS_URL_1HOUR, POLYGON_API_KEY_THREE)
    process_symbols()
    engine = create_engine('postgresql://vujwyosxlhitrw:{}@ec2-3-228-236-221.compute-1.amazonaws.com/djvd7ebilq70q'.format(db_password))
    time.sleep(60)

get_bars(symbols, 'daily-data', '2021-01-01', END_DATE, POLYGON_AGGS_URL_1DAY, POLYGON_API_KEY_NEWS)
process_symbols()
# %%
