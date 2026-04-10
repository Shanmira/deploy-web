from google.cloud import bigquery
import json
import sys

client = bigquery.Client()

def run_query(sql):
    try:
        query_job = client.query(sql)
        results = query_job.result()

        rows = [dict(row) for row in results]
        print(json.dumps(rows))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    sql = sys.argv[1]
    run_query(sql)