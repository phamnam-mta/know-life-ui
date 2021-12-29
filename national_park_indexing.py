#!/usr/bin/env python
# Licensed to Elasticsearch B.V under one or more agreements.
# Elasticsearch B.V licenses this file to you under the Apache 2.0 License.
# See the LICENSE file in the project root for more information

"""Script that downloads a public dataset and streams it to an Elasticsearch cluster"""

import json
from os.path import abspath, join, dirname, exists
import tqdm
import urllib3
from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk


DATASET_PATH = join(dirname(abspath(__file__)), "data/national-es-bulk-index.json")

with open(DATASET_PATH, 'r') as open_file:
    data = json.load(open_file)


def create_index(client):
    """Creates an index in Elasticsearch if one isn't already there."""
    client.indices.create(
        index="national-parks",
        # body={
        #     "settings": {"number_of_shards": 1},
        #     "mappings": {
        #         "properties": {
        #             "name": {"type": "text"},
        #             "borough": {"type": "keyword"},
        #             "cuisine": {"type": "keyword"},
        #             "grade": {"type": "keyword"},
        #             "location": {"type": "geo_point"},
        #         }
        #     },
        # },
        ignore=400,
    )


def generate_actions():
    """Reads the file through csv.DictReader() and for each row
    yields a single document. This function is passed into the bulk()
    helper to create many documents in sequence.
    """
    for idx, row in enumerate(data):
        doc = {
            "_id": idx,
            "description": row["description"],
            "nps_link": row["nps_link"],
            "states": row["states"],
            "title": row["title"],
            "id": row["id"],
            "visitors": row["visitors"],
            "world_heritage_site": row["world_heritage_site"],
            "location": row["location"],
            "acres": row["acres"],
            "square_km": row["square_km"],
            "date_established": row["date_established"],
        }
        yield doc


def main():
    print("Loading dataset...")
    number_of_docs = len(data)

    client = Elasticsearch(
        # Add your cluster configuration here!
    )
    print("Creating an index...")
    create_index(client)

    print("Indexing documents...")
    progress = tqdm.tqdm(unit="docs", total=number_of_docs)
    successes = 0
    for ok, action in streaming_bulk(
        client=client, index="national-parks", actions=generate_actions(),
    ):
        progress.update(1)
        successes += ok
    print("Indexed %d/%d documents" % (successes, number_of_docs))


if __name__ == "__main__":
    main()