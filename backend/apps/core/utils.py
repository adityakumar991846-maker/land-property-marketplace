import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates great-circle distance between two geographic points on Earth in kilometers.
    """
    if None in (lat1, lon1, lat2, lon2):
        return None
    r = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)
