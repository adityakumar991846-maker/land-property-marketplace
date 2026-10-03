from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.properties.models import Property, PropertyImage
from apps.cart.models import Cart, CartItem
from apps.favorites.models import Favorite
from apps.chat.models import Conversation, Message
from apps.reports.models import Report

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic demo users, properties, cart items, favorites, and chat messages.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning database seeding...'))

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@terratrade.example.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
                'is_seller': True,
                'bio': 'TerraTrade platform administrator and content moderator.',
                'company_name': 'TerraTrade Marketplace HQ'
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        seller_sarah, _ = User.objects.get_or_create(
            username='sarah_land',
            defaults={
                'email': 'sarah@greenacres.example.com',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'is_seller': True,
                'phone_number': '+1 (541) 555-0144',
                'company_name': 'Green Acres Farmland & Land Realty',
                'license_number': 'OR-RE-884920',
                'bio': 'Specializing in agricultural land, timber parcels, and certified organic acreage across the Pacific Northwest.',
                'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
            }
        )
        seller_sarah.set_password('seller123')
        seller_sarah.save()

        seller_david, _ = User.objects.get_or_create(
            username='david_realty',
            defaults={
                'email': 'david@summitproperties.example.com',
                'first_name': 'David',
                'last_name': 'Vance',
                'is_seller': True,
                'phone_number': '+1 (512) 555-0182',
                'company_name': 'Summit Mountain & Commercial Properties',
                'license_number': 'TX-BR-553198',
                'bio': 'Over 18 years experience guiding buyers and developers through residential subdivisions, ranch estates, and commercial zoning.',
                'avatar_url': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
            }
        )
        seller_david.set_password('seller123')
        seller_david.save()

        buyer_alex, _ = User.objects.get_or_create(
            username='alex_buyer',
            defaults={
                'email': 'alex.morris@example.com',
                'first_name': 'Alex',
                'last_name': 'Morris',
                'is_seller': False,
                'phone_number': '+1 (415) 555-0199',
                'bio': 'Independent investor searching for rural acreage and homestead building plots.',
                'avatar_url': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
            }
        )
        buyer_alex.set_password('buyer123')
        buyer_alex.save()

        buyer_elena, _ = User.objects.get_or_create(
            username='elena_investor',
            defaults={
                'email': 'elena.rodriguez@example.com',
                'first_name': 'Elena',
                'last_name': 'Rodriguez',
                'is_seller': False,
                'phone_number': '+1 (303) 555-0177',
                'bio': 'Looking for vineyard acreage and sustainable regenerative farms.',
                'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
            }
        )
        buyer_elena.set_password('buyer123')
        buyer_elena.save()

        self.stdout.write(self.style.SUCCESS('Created demo users: admin, sarah_land, david_realty, alex_buyer, elena_investor'))

        # 2. Create Properties
        properties_data = [
            {
                'seller': seller_sarah,
                'title': '50-Acre Certified Organic Farmland & Pasture',
                'property_type': 'agricultural_land',
                'status': 'published',
                'price': 485000,
                'area_acres': 50.0,
                'area_sqft': 2178000,
                'description': 'Exceptional 50-acre working agricultural property nestled in the fertile Willamette Valley. Boasts senior surface water irrigation rights, nutrient-dense silt loam soil, a 6,000 sq ft equipment barn, three-phase power on site, and perimeter cattle fencing. Ideal for organic vegetable production, vineyard expansion, or regenerative livestock grazing.',
                'address': '8420 River Valley Road',
                'city': 'Eugene',
                'state': 'Oregon',
                'zip_code': '97401',
                'latitude': 44.0521,
                'longitude': -123.0868,
                'zoning_classification': 'EFU (Exclusive Farm Use)',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Chehalis Silt Loam Class I',
                'topography': 'Level valley floor with gentle southern slope',
                'property_tax_annual': 2850.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'Aerial overview of pastures and barn', True),
                    ('https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80', 'Green open pastures with mountain backdrop', False),
                    ('https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80', 'Farm soil and irrigation channel', False),
                ]
            },
            {
                'seller': seller_david,
                'title': 'Scenic 2.5-Acre Residential Building Parcel with Hill Country Views',
                'property_type': 'residential_land',
                'status': 'published',
                'price': 165000,
                'area_acres': 2.5,
                'area_sqft': 108900,
                'description': 'Pristine 2.5-acre wooded residential home site featuring panoramic sunset views of the Texas Hill Country. Mature live oaks, paved county road frontage, municipal water line at the boundary, and PEC electrical service ready to connect. Low HOA dues, minimal deed restrictions allowing custom single-family architectural builds and barndominiums.',
                'address': '142 Skyline Ridge Trail',
                'city': 'Austin',
                'state': 'Texas',
                'zip_code': '78738',
                'latitude': 30.2672,
                'longitude': -97.7431,
                'zoning_classification': 'Rural Residential RR-1',
                'road_access': True,
                'water_rights': False,
                'electricity': True,
                'soil_type': 'Limestone / Clay Loam',
                'topography': 'Gentle rolling knoll with elevated home site',
                'property_tax_annual': 1420.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80', 'Sunlight through mature oak canopy', True),
                    ('https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80', 'Cleared clearing ready for home foundation', False),
                ]
            },
            {
                'seller': seller_david,
                'title': 'Prime 3.8-Acre Commercial Development Parcel on Major Arterial',
                'property_type': 'commercial_land',
                'status': 'published',
                'price': 820000,
                'area_acres': 3.8,
                'area_sqft': 165528,
                'description': 'High-profile commercial corner parcel with over 450 feet of highway frontage and average daily traffic count exceeding 32,000 vehicles. Zoned C-2 General Commercial, permitting retail centers, medical clinics, hotel hospitality, or mixed-use professional offices. Fully serviced with city sewer, high-volume water mains, and natural gas.',
                'address': '9200 N Scottsdale Blvd',
                'city': 'Scottsdale',
                'state': 'Arizona',
                'zip_code': '85258',
                'latitude': 33.4942,
                'longitude': -111.9261,
                'zoning_classification': 'C-2 General Commercial',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Engineered compacted gravel/desert loam',
                'topography': '100% Flat and fully shovel-ready',
                'property_tax_annual': 5600.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'Commercial parcel frontage view', True),
                    ('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80', 'Infrastructure and paved intersection', False),
                ]
            },
            {
                'seller': seller_sarah,
                'title': 'Modern Timber Craftsman Ranch on 12 Acres with Creek',
                'property_type': 'house',
                'status': 'published',
                'price': 795000,
                'area_acres': 12.0,
                'area_sqft': 522720,
                'description': 'Stunning modern timber-framed custom home set on 12 private fenced acres overlooking the Bridger Mountain Range. Features 4 bedrooms, 3.5 bathrooms, cathedral ceilings, radiant floor heating, gourmet chef kitchen with soapstone countertops, and a 4-stall horse barn with heated tack room. Year-round trout stream traverses the eastern boundary.',
                'address': '550 Bridger Canyon Road',
                'city': 'Bozeman',
                'state': 'Montana',
                'zip_code': '59715',
                'latitude': 45.6770,
                'longitude': -111.0429,
                'bedrooms': 4,
                'bathrooms': 3.5,
                'zoning_classification': 'A-1 Agricultural / Residential',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Deep alluvium',
                'topography': 'Pasture rolling gently to mountain creek',
                'property_tax_annual': 4300.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Craftsman home exterior with sweeping porch', True),
                    ('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Backyard view toward private mountain acreage', False),
                    ('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80', 'High ceiling interior living room with stone fireplace', False),
                ]
            },
            {
                'seller': seller_sarah,
                'title': '10-Acre Blue Ridge Mountain Forest Retreat & Spring',
                'property_type': 'residential_land',
                'status': 'published',
                'price': 145000,
                'area_acres': 10.0,
                'area_sqft': 435600,
                'description': 'Heavily wooded 10-acre mountain parcel boasting hardwood forest (mature red oak, hickory, and mountain laurel), an active natural mountain spring, and multiple graded home building sites at 3,200 ft elevation. Unsurpassed privacy just 25 minutes from downtown Asheville arts district and restaurants.',
                'address': '320 Whispering Pine Lane',
                'city': 'Asheville',
                'state': 'North Carolina',
                'zip_code': '28801',
                'latitude': 35.5951,
                'longitude': -82.5515,
                'zoning_classification': 'Open Land Conservation / Residential',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Humus-rich forest loam',
                'topography': 'Moderate mountain ridge slope with leveled bench',
                'property_tax_annual': 850.00,
                'is_featured': False,
                'images': [
                    ('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80', 'Sunlight piercing through mountain forest canopy', True),
                    ('https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80', 'Lush timber vegetation and walking trail', False),
                ]
            },
            {
                'seller': seller_david,
                'title': '4.2-Acre Lakefront Shoreline Parcel on Lake Champlain',
                'property_type': 'residential_land',
                'status': 'published',
                'price': 325000,
                'area_acres': 4.2,
                'area_sqft': 182952,
                'description': 'Direct waterfront paradise featuring 380 feet of clean shale beach on Lake Champlain. Enjoy unobstructed Adirondack mountain sunsets across the water. State-approved septic design in place, clean title, municipal electric available along private access driveway. Perfect sanctuary for a custom lake home or seasonal retreat.',
                'address': '780 Lakeshore Point Drive',
                'city': 'Burlington',
                'state': 'Vermont',
                'zip_code': '05401',
                'latitude': 44.4759,
                'longitude': -73.2121,
                'zoning_classification': 'Shoreland Protection District (SPD)',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Gravelly sandy loam with excellent percolation',
                'topography': 'Gentle slope to lake shoreline',
                'property_tax_annual': 3100.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Waterfront view across calm bay', True),
                    ('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Lake shoreline and pebble beach', False),
                ]
            },
            {
                'seller': seller_david,
                'title': '8.5-Acre Heavy Industrial Logistics Parcel with Rail Siding',
                'property_type': 'industrial_land',
                'status': 'published',
                'price': 1250000,
                'area_acres': 8.5,
                'area_sqft': 370260,
                'description': 'Rare opportunity to acquire 8.5 acres zoned I-2 Heavy Industrial within minutes of major freight corridors I-35W and Loop 820. Includes active spur track connection rights, heavy-duty asphalt entrance, 480V 3-phase industrial power, and municipal storm detention pond already built. Suitable for distribution, fabrication, or equipment storage.',
                'address': '4100 Railhead Industrial Parkway',
                'city': 'Fort Worth',
                'state': 'Texas',
                'zip_code': '76106',
                'latitude': 32.7555,
                'longitude': -97.3308,
                'zoning_classification': 'I-2 Heavy Industrial',
                'road_access': True,
                'water_rights': False,
                'electricity': True,
                'soil_type': 'High load-bearing clay subgrade',
                'topography': '100% Graded and leveled pad',
                'property_tax_annual': 8900.00,
                'is_featured': False,
                'images': [
                    ('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', 'Industrial yard logistics and wide access road', True),
                ]
            },
            {
                'seller': seller_sarah,
                'title': '18-Acre Prime St. Helena Boutique Vineyard & Olive Grove',
                'property_type': 'agricultural_land',
                'status': 'published',
                'price': 1650000,
                'area_acres': 18.0,
                'area_sqft': 784080,
                'description': 'Premier Napa Valley agricultural estate comprising 12 producing acres of premium Cabernet Sauvignon and 3 acres of historic Tuscan olive trees. Award-winning grape contract history with local boutique wineries. Complete with high-yield ag well, automated drip irrigation, and estate building envelope with valley panoramic views.',
                'address': '2450 Silverado Trail North',
                'city': 'St. Helena',
                'state': 'California',
                'zip_code': '94574',
                'latitude': 38.5052,
                'longitude': -122.4703,
                'zoning_classification': 'Agricultural Preserve (AP)',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Volcanic loam and gravelly deposits',
                'topography': 'Gentle west-facing hillside rows',
                'property_tax_annual': 11200.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', 'Vineyard rows bathed in morning sunshine', True),
                    ('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', 'Vineyard grapes ripening on the vine', False),
                ]
            },
            {
                'seller': seller_david,
                'title': 'Spacious 4-Bedroom Suburban Family Home on Half-Acre Lot',
                'property_type': 'house',
                'status': 'published',
                'price': 620000,
                'area_acres': 0.5,
                'area_sqft': 21780,
                'description': 'Beautifully maintained 4-bedroom, 3-bathroom residence on a peaceful cul-de-sac. Features a bright open-concept layout, updated quartz countertops, finished walkout basement, attached 3-car garage, and an expansive fenced backyard with garden beds and shaded patio. Top-rated school district and close to transit.',
                'address': '840 Crestview Terrace',
                'city': 'Denver',
                'state': 'Colorado',
                'zip_code': '80202',
                'latitude': 39.7392,
                'longitude': -104.9903,
                'bedrooms': 4,
                'bathrooms': 3.0,
                'zoning_classification': 'R-1 Single Family Residential',
                'road_access': True,
                'water_rights': False,
                'electricity': True,
                'soil_type': 'Standard residential loam',
                'topography': 'Flat groomed landscaped lot',
                'property_tax_annual': 3650.00,
                'is_featured': False,
                'images': [
                    ('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', 'Modern suburban home front facade with lawn', True),
                    ('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', 'Contemporary interior bathroom and fixtures', False),
                ]
            },
            {
                'seller': seller_david,
                'title': '40-Acre Sun Valley Equestrian Ranch with 360 Mountain Views',
                'property_type': 'ranch',
                'status': 'published',
                'price': 1450000,
                'area_acres': 40.0,
                'area_sqft': 1742400,
                'description': 'A premier horseman’s paradise featuring 40 contiguous fenced acres, 8-stall MD Barn with wash rack, 120x240 outdoor riding arena, sub-irrigated horse pastures, and a 3-bedroom custom cedar ranch house. Unrivaled serenity, direct BLM trail access, and clear dark night skies.',
                'address': '1290 Warm Springs Ranch Road',
                'city': 'Ketchum',
                'state': 'Idaho',
                'zip_code': '83340',
                'latitude': 43.6807,
                'longitude': -114.3637,
                'bedrooms': 3,
                'bathrooms': 2.0,
                'zoning_classification': 'A-40 Agricultural / Equestrian',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Mountain valley sandy loam',
                'topography': 'Level pastures rising gently to sage foothills',
                'property_tax_annual': 5200.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80', 'Ranch acreage with mountain peaks in background', True),
                    ('https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80', 'Equestrian paddocks and fencing', False),
                ]
            },
            {
                'seller': seller_sarah,
                'title': '3.1-Acre Pacific Ocean Bluff Parcel with Private Cove Path',
                'property_type': 'residential_land',
                'status': 'published',
                'price': 890000,
                'area_acres': 3.1,
                'area_sqft': 135036,
                'description': 'Spectacular coastal bluff land offering unhindered 180-degree Pacific Ocean whitewater views. Witness migrating gray whales from your future living room. Coastal Commission coastal development permit preliminary review passed. Water district connection permit secured, power at edge of highway.',
                'address': '45100 Coastal Highway 1',
                'city': 'Mendocino',
                'state': 'California',
                'zip_code': '95460',
                'latitude': 39.3077,
                'longitude': -123.7995,
                'zoning_classification': 'Coastal Zone Rural Residential (C-RR)',
                'road_access': True,
                'water_rights': True,
                'electricity': True,
                'soil_type': 'Coastal terrace decomposed granite',
                'topography': 'Flat ocean terrace ending in dramatic sea bluff',
                'property_tax_annual': 7400.00,
                'is_featured': True,
                'images': [
                    ('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Breathtaking ocean bluff view and coastline', True),
                ]
            },
            {
                'seller': seller_sarah,
                'title': 'Subdivided 1.2-Acre Residential Lot (Under Contract)',
                'property_type': 'residential_land',
                'status': 'sold',
                'price': 110000,
                'area_acres': 1.2,
                'area_sqft': 52272,
                'description': 'Previously listed residential lot in South Hills. Successfully sold and closed through TerraTrade marketplace.',
                'address': '810 South Hills Way',
                'city': 'Eugene',
                'state': 'Oregon',
                'zip_code': '97405',
                'latitude': 44.0200,
                'longitude': -123.1000,
                'zoning_classification': 'R-1 Single Family',
                'road_access': True,
                'is_featured': False,
                'images': [
                    ('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'Sold residential parcel', True),
                ]
            }
        ]

        created_props = []
        for p_data in properties_data:
            images = p_data.pop('images', [])
            prop, created = Property.objects.get_or_create(
                title=p_data['title'],
                seller=p_data['seller'],
                defaults=p_data
            )
            if created:
                for img_url, caption, is_cov in images:
                    PropertyImage.objects.create(
                        property=prop,
                        image_url=img_url,
                        caption=caption,
                        is_cover=is_cov
                    )
            created_props.append(prop)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_props)} demo properties with photos and specs.'))

        # 3. Create Cart & Cart Items for alex_buyer
        buyer_cart, _ = Cart.objects.get_or_create(user=buyer_alex)
        if created_props:
            # Add 2 properties to Alex's cart
            CartItem.objects.get_or_create(
                cart=buyer_cart,
                property=created_props[0],
                defaults={'notes': 'Considering for organic hazelnut orchard expansion', 'offer_amount': 465000}
            )
            CartItem.objects.get_or_create(
                cart=buyer_cart,
                property=created_props[1],
                defaults={'notes': 'Inspected site on weekend, excellent hilltop orientation', 'offer_amount': 158000}
            )

        # 4. Create Favorites for alex_buyer
        if len(created_props) >= 4:
            Favorite.objects.get_or_create(user=buyer_alex, property=created_props[0])
            Favorite.objects.get_or_create(user=buyer_alex, property=created_props[3])
            Favorite.objects.get_or_create(user=buyer_alex, property=created_props[7])

        # 5. Create Sample Conversations & Messages
        if created_props:
            # Conversation 1: Alex <-> Sarah about 50-Acre Farm
            conv1, _ = Conversation.objects.get_or_create(
                buyer=buyer_alex,
                seller=seller_sarah,
                property=created_props[0]
            )
            if not conv1.messages.exists():
                Message.objects.create(
                    conversation=conv1,
                    sender=buyer_alex,
                    content="Hello Sarah! I noticed the 50-acre Willamette Valley farm listing. Could you share what year the water rights permit was adjudicated and if the equipment barn has a concrete floor?",
                    is_read=True
                )
                Message.objects.create(
                    conversation=conv1,
                    sender=seller_sarah,
                    content="Hi Alex! Thank you for reaching out. Yes, the senior surface water certificate dates back to 1964 and has zero curtailment history. The 6,000 sq ft barn has a 6-inch reinforced concrete slab throughout, perfect for heavy farm implements.",
                    is_read=True
                )
                Message.objects.create(
                    conversation=conv1,
                    sender=buyer_alex,
                    content="That sounds fantastic. I have added the parcel to my shortlist and would love to arrange an on-site soil and boundary inspection next Tuesday if you have availability.",
                    is_read=False
                )

            # Conversation 2: Alex <-> David about 2.5-Acre Austin lot
            conv2, _ = Conversation.objects.get_or_create(
                buyer=buyer_alex,
                seller=seller_david,
                property=created_props[1]
            )
            if not conv2.messages.exists():
                Message.objects.create(
                    conversation=conv2,
                    sender=buyer_alex,
                    content="Hi David, does this 2.5-acre parcel in Austin require rainwater harvesting or is city water already stubbed at the street?",
                    is_read=True
                )
                Message.objects.create(
                    conversation=conv2,
                    sender=seller_david,
                    content="Hello Alex! Municipal water main is already pressurized and capped right at the curb with a standard 3/4-inch meter ready to set. No rainwater catchment required.",
                    is_read=False
                )

        # 6. Create Sample Report for Admin Portal review
        if created_props:
            Report.objects.get_or_create(
                reporter=buyer_elena,
                property=created_props[2],
                reason='inaccurate_info',
                defaults={
                    'description': 'The listing mentions 450 feet of frontage, but looking at the county CAD GIS survey map it appears to be approximately 380 feet. Please verify boundary markers.',
                    'status': 'pending'
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully completed database seeding!'))
