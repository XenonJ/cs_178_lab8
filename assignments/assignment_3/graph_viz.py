import kuzu
import networkx as nx

def process_graph_data(result):
    """
    implemented the processing function that transforms query result into a format suitable for frontend visualization
    """
    # print("Processing graph data")
    # print(result)
    graph = result.get_as_networkx(directed=False)
    # print("Graph data processed")
    # print(graph)
    # print(graph.nodes().data())
    #('User_2', {'_id': {'offset': 1, 'table': 1}, '_label': 'User', 'movieId': None, 'year': None, 'title': None, 'genres': None, 'userId': 2, 'User': True})
    #('Movie_89774', {'_id': {'offset': 6784, 'table': 0}, '_label': 'Movie', 'movieId': 89774, 'year': 2011, 'title': 'Warrior (2011)', 'genres': 'Drama', 'Movie': True}),
    
    return_data = {
            "nodes": [],
            "links": []
        }
    for node in graph.nodes().data():
        if node[1]['_label'] == 'User':
            # user
            node_data = {
                "id": node[0],
                "labels": "Person",
                "properties": {"userId": node[1]['userId']}
            }
        else:
            # movie
            node_data = {
                "id": node[0],
                "labels": [node[1]['_label']],
                "properties": {"title": node[1]['title'], "year": node[1]['year']}
            }
        return_data["nodes"].append(node_data)
    # print("return_data_nodes")
    # print(return_data["nodes"])

    # print(graph.edges(data=True))
    # ('User_15', 'Movie_143385', {'_src': {'offset': 14, 'table': 1}, '_dst': {'offset': 4638, 'table': 0}, '_label': 'Rating', '_id': {'offset': 1494, 'table': 2}, 'rating': 3.0, 'timestamp': 1510572581, 'tag': None})
    for edge in graph.edges(data=True):
        edge_data = {
            "source": edge[0],
            "target": edge[1],
            "type": edge[2]['_label'],
        }
        return_data["links"].append(edge_data)
    # print("return_data_links")
    # print(return_data["links"])
    # print("return_data")
    # print(return_data)
    return return_data
    # pos = nx.spring_layout(graph, seed=42)
    # print(pos)
    
    # Sample movie graph data with target output structure
    # sample_data = {
    #     "nodes": [
    #         {
    #             "id": "Movie_1",
    #             "labels": ["Movie"],
    #             "properties": {"title": "The Matrix", "year": 1999}
    #         },
    #         {
    #             "id": "Person_1",
    #             "labels": ["Person"],
    #             "properties": {"name": "Keanu Reeves"}
    #         }
    #     ],
    #     "links": [
    #         {
    #             "source": "Person_1",
    #             "target": "Movie_1",
    #             "type": "ACTED_IN"
    #         }
    #     ]
    # }
    
    # return sample_data

def construct_query(year=None, operator='>', limit=100):
    """
    Copy the parameterized query function from the previous part and make it work here
    """
    return f'MATCH (e)-[r]-(m:Movie) WHERE m.year {operator} {year} RETURN e, r, m LIMIT {limit}'