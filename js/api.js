/**
 * TerraTrade Marketplace - REST API & Intelligent Client Store
 * Communicates with Django REST Framework on /api/*, with seamless local data fallback
 */

const MockDB = {
  getInitialData() {
    return {
      users: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@terratrade.example.com',
          first_name: 'System',
          last_name: 'Administrator',
          is_seller: true,
          is_staff: true,
          is_superuser: true,
          is_active: true,
          phone_number: '+1 (555) 010-9999',
          company_name: 'TerraTrade Platform HQ',
          bio: 'Platform administrator and compliance moderator.',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: 2,
          username: 'sarah_land',
          email: 'sarah@greenacres.example.com',
          first_name: 'Sarah',
          last_name: 'Jenkins',
          is_seller: true,
          is_staff: false,
          is_superuser: false,
          is_active: true,
          phone_number: '+1 (541) 555-0144',
          company_name: 'Green Acres Farmland & Land Realty',
          license_number: 'OR-RE-884920',
          bio: 'Specializing in agricultural land, timber parcels, and certified organic acreage across the Pacific Northwest.',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: 3,
          username: 'david_realty',
          email: 'david@summitproperties.example.com',
          first_name: 'David',
          last_name: 'Vance',
          is_seller: true,
          is_staff: false,
          is_superuser: false,
          is_active: true,
          phone_number: '+1 (512) 555-0182',
          company_name: 'Summit Mountain & Commercial Properties',
          license_number: 'TX-BR-553198',
          bio: 'Over 18 years experience guiding buyers and developers through residential subdivisions, ranch estates, and commercial zoning.',
          avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: 4,
          username: 'alex_buyer',
          email: 'alex.morris@example.com',
          first_name: 'Alex',
          last_name: 'Morris',
          is_seller: false,
          is_staff: false,
          is_superuser: false,
          is_active: true,
          phone_number: '+1 (415) 555-0199',
          bio: 'Independent investor searching for rural acreage and homestead building plots.',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
        }
      ],
      properties: [
        {
          id: 1,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty', email: 'sarah@greenacres.example.com', phone_number: '+1 (541) 555-0144' },
          title: '50-Acre Certified Organic Farmland & Pasture',
          property_type: 'agricultural_land',
          property_type_display: 'Agricultural Farmland',
          status: 'published',
          price: 485000,
          area_acres: 50.0,
          area_sqft: 2178000,
          description: 'Exceptional 50-acre working agricultural property nestled in the fertile Willamette Valley. Boasts senior surface water irrigation rights, nutrient-dense silt loam soil, a 6,000 sq ft equipment barn, three-phase power on site, and perimeter cattle fencing. Ideal for organic vegetable production, vineyard expansion, or regenerative livestock grazing.',
          address: '8420 River Valley Road',
          city: 'Eugene',
          state: 'Oregon',
          zip_code: '97401',
          latitude: 44.0521,
          longitude: -123.0868,
          zoning_classification: 'EFU (Exclusive Farm Use)',
          road_access: true,
          water_rights: true,
          electricity: true,
          soil_type: 'Chehalis Silt Loam Class I',
          topography: 'Level valley floor with gentle southern slope',
          property_tax_annual: 2850,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          images: [
            { id: 101, display_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', caption: 'Aerial overview of pastures and barn' },
            { id: 102, display_url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80', caption: 'Green open pastures with mountain backdrop' },
            { id: 103, display_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80', caption: 'Farm soil and irrigation channel' }
          ]
        },
        {
          id: 2,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties', email: 'david@summitproperties.example.com', phone_number: '+1 (512) 555-0182' },
          title: 'Scenic 2.5-Acre Residential Building Parcel with Hill Country Views',
          property_type: 'residential_land',
          property_type_display: 'Residential Land / Plot',
          status: 'published',
          price: 165000,
          area_acres: 2.5,
          area_sqft: 108900,
          description: 'Pristine 2.5-acre wooded residential home site featuring panoramic sunset views of the Texas Hill Country. Mature live oaks, paved county road frontage, municipal water line at the boundary, and PEC electrical service ready to connect. Low HOA dues, minimal deed restrictions allowing custom single-family architectural builds and barndominiums.',
          address: '142 Skyline Ridge Trail',
          city: 'Austin',
          state: 'Texas',
          zip_code: '78738',
          latitude: 30.2672,
          longitude: -97.7431,
          zoning_classification: 'Rural Residential RR-1',
          road_access: true,
          water_rights: false,
          electricity: true,
          soil_type: 'Limestone / Clay Loam',
          topography: 'Gentle rolling knoll with elevated home site',
          property_tax_annual: 1420,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
          images: [
            { id: 201, display_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80', caption: 'Sunlight through mature oak canopy' },
            { id: 202, display_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80', caption: 'Cleared clearing ready for home foundation' }
          ]
        },
        {
          id: 3,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties', email: 'david@summitproperties.example.com', phone_number: '+1 (512) 555-0182' },
          title: 'Prime 3.8-Acre Commercial Development Parcel on Major Arterial',
          property_type: 'commercial_land',
          property_type_display: 'Commercial Land',
          status: 'published',
          price: 820000,
          area_acres: 3.8,
          area_sqft: 165528,
          description: 'High-profile commercial corner parcel with over 450 feet of highway frontage and average daily traffic count exceeding 32,000 vehicles. Zoned C-2 General Commercial, permitting retail centers, medical clinics, hotel hospitality, or mixed-use professional offices. Fully serviced with city sewer, high-volume water mains, and natural gas.',
          address: '9200 N Scottsdale Blvd',
          city: 'Scottsdale',
          state: 'Arizona',
          zip_code: '85258',
          latitude: 33.4942,
          longitude: -111.9261,
          zoning_classification: 'C-2 General Commercial',
          road_access: true,
          water_rights: true,
          electricity: true,
          soil_type: 'Engineered compacted gravel/desert loam',
          topography: '100% Flat and fully shovel-ready',
          property_tax_annual: 5600,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          images: [
            { id: 301, display_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', caption: 'Commercial parcel frontage view' }
          ]
        },
        {
          id: 4,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty', email: 'sarah@greenacres.example.com', phone_number: '+1 (541) 555-0144' },
          title: 'Modern Timber Craftsman Ranch on 12 Acres with Mountain Stream',
          property_type: 'house',
          property_type_display: 'House / Single Family',
          status: 'published',
          price: 795000,
          area_acres: 12.0,
          area_sqft: 522720,
          bedrooms: 4,
          bathrooms: 3.5,
          description: 'Stunning modern timber-framed custom home set on 12 private fenced acres overlooking the Bridger Mountain Range. Features 4 bedrooms, 3.5 bathrooms, cathedral ceilings, radiant floor heating, gourmet chef kitchen with soapstone countertops, and a 4-stall horse barn with heated tack room. Year-round trout stream traverses the eastern boundary.',
          address: '550 Bridger Canyon Road',
          city: 'Bozeman',
          state: 'Montana',
          zip_code: '59715',
          latitude: 45.6770,
          longitude: -111.0429,
          zoning_classification: 'A-1 Agricultural / Residential',
          road_access: true,
          water_rights: true,
          electricity: true,
          soil_type: 'Deep alluvium',
          topography: 'Pasture rolling gently to mountain creek',
          property_tax_annual: 4300,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          images: [
            { id: 401, display_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Craftsman home exterior with sweeping porch' },
            { id: 402, display_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', caption: 'Backyard view toward private mountain acreage' }
          ]
        },
        {
          id: 5,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty' },
          title: '10-Acre Blue Ridge Mountain Forest Retreat & Spring',
          property_type: 'residential_land',
          property_type_display: 'Residential Land',
          status: 'published',
          price: 145000,
          area_acres: 10.0,
          area_sqft: 435600,
          description: 'Heavily wooded 10-acre mountain parcel boasting hardwood forest, an active natural mountain spring, and multiple graded home building sites at 3,200 ft elevation. Unsurpassed privacy just 25 minutes from downtown Asheville.',
          address: '320 Whispering Pine Lane',
          city: 'Asheville',
          state: 'North Carolina',
          zip_code: '28801',
          latitude: 35.5951,
          longitude: -82.5515,
          zoning_classification: 'Conservation / Residential',
          road_access: true,
          water_rights: true,
          electricity: true,
          property_tax_annual: 850,
          is_featured: false,
          cover_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 501, display_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80', caption: 'Mountain forest canopy' }]
        },
        {
          id: 6,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties' },
          title: '4.2-Acre Lakefront Shoreline Parcel on Lake Champlain',
          property_type: 'residential_land',
          property_type_display: 'Residential Land',
          status: 'published',
          price: 325000,
          area_acres: 4.2,
          area_sqft: 182952,
          description: 'Direct waterfront paradise featuring 380 feet of clean shale beach on Lake Champlain. Enjoy unobstructed Adirondack mountain sunsets across the water. State-approved septic design in place, clean title, municipal electric available along private access driveway.',
          address: '780 Lakeshore Point Drive',
          city: 'Burlington',
          state: 'Vermont',
          zip_code: '05401',
          latitude: 44.4759,
          longitude: -73.2121,
          zoning_classification: 'Shoreland Protection District (SPD)',
          road_access: true,
          water_rights: true,
          electricity: true,
          property_tax_annual: 3100,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 601, display_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', caption: 'Waterfront view across calm bay' }]
        },
        {
          id: 7,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties' },
          title: '8.5-Acre Heavy Industrial Logistics Parcel with Rail Siding',
          property_type: 'industrial_land',
          property_type_display: 'Industrial Land',
          status: 'published',
          price: 1250000,
          area_acres: 8.5,
          area_sqft: 370260,
          description: 'Rare opportunity to acquire 8.5 acres zoned I-2 Heavy Industrial within minutes of major freight corridors I-35W and Loop 820. Includes active spur track connection rights, heavy-duty asphalt entrance, 480V 3-phase industrial power.',
          address: '4100 Railhead Industrial Parkway',
          city: 'Fort Worth',
          state: 'Texas',
          zip_code: '76106',
          latitude: 32.7555,
          longitude: -97.3308,
          zoning_classification: 'I-2 Heavy Industrial',
          road_access: true,
          water_rights: false,
          electricity: true,
          property_tax_annual: 8900,
          is_featured: false,
          cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 701, display_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', caption: 'Industrial logistics yard' }]
        },
        {
          id: 8,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty' },
          title: '18-Acre Prime St. Helena Boutique Vineyard & Olive Grove',
          property_type: 'agricultural_land',
          property_type_display: 'Agricultural Farmland',
          status: 'published',
          price: 1650000,
          area_acres: 18.0,
          area_sqft: 784080,
          description: 'Premier Napa Valley agricultural estate comprising 12 producing acres of premium Cabernet Sauvignon and 3 acres of historic Tuscan olive trees. Complete with high-yield ag well, automated drip irrigation, and estate building envelope.',
          address: '2450 Silverado Trail North',
          city: 'St. Helena',
          state: 'California',
          zip_code: '94574',
          latitude: 38.5052,
          longitude: -122.4703,
          zoning_classification: 'Agricultural Preserve (AP)',
          road_access: true,
          water_rights: true,
          electricity: true,
          property_tax_annual: 11200,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 801, display_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', caption: 'Vineyard rows bathed in morning sunshine' }]
        },
        {
          id: 9,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties' },
          title: 'Spacious 4-Bedroom Suburban Family Home on Half-Acre Lot',
          property_type: 'house',
          property_type_display: 'House / Single Family',
          status: 'published',
          price: 620000,
          area_acres: 0.5,
          area_sqft: 21780,
          bedrooms: 4,
          bathrooms: 3.0,
          description: 'Beautifully maintained 4-bedroom, 3-bathroom residence on a peaceful cul-de-sac. Features a bright open-concept layout, updated quartz countertops, finished walkout basement, attached 3-car garage, and an expansive fenced backyard.',
          address: '840 Crestview Terrace',
          city: 'Denver',
          state: 'Colorado',
          zip_code: '80202',
          latitude: 39.7392,
          longitude: -104.9903,
          zoning_classification: 'R-1 Single Family Residential',
          road_access: true,
          water_rights: false,
          electricity: true,
          property_tax_annual: 3650,
          is_featured: false,
          cover_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 901, display_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', caption: 'Front facade and lawn' }]
        },
        {
          id: 10,
          seller_id: 3,
          seller_name: 'David Vance',
          seller_company: 'Summit Mountain & Commercial Properties',
          seller: { id: 3, username: 'david_realty', full_name: 'David Vance', company_name: 'Summit Mountain & Commercial Properties' },
          title: '40-Acre Sun Valley Equestrian Ranch with 360 Mountain Views',
          property_type: 'ranch',
          property_type_display: 'Ranch / Acreage',
          status: 'published',
          price: 1450000,
          area_acres: 40.0,
          area_sqft: 1742400,
          bedrooms: 3,
          bathrooms: 2.0,
          description: 'A premier horseman’s paradise featuring 40 contiguous fenced acres, 8-stall MD Barn with wash rack, 120x240 outdoor riding arena, sub-irrigated horse pastures, and a 3-bedroom custom cedar ranch house. Direct BLM trail access.',
          address: '1290 Warm Springs Ranch Road',
          city: 'Ketchum',
          state: 'Idaho',
          zip_code: '83340',
          latitude: 43.6807,
          longitude: -114.3637,
          zoning_classification: 'A-40 Agricultural / Equestrian',
          road_access: true,
          water_rights: true,
          electricity: true,
          property_tax_annual: 5200,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 1001, display_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80', caption: 'Ranch mountain panorama' }]
        },
        {
          id: 11,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty' },
          title: '3.1-Acre Pacific Ocean Bluff Parcel with Private Cove Path',
          property_type: 'residential_land',
          property_type_display: 'Residential Land',
          status: 'published',
          price: 890000,
          area_acres: 3.1,
          area_sqft: 135036,
          description: 'Spectacular coastal bluff land offering unhindered 180-degree Pacific Ocean whitewater views. Witness migrating gray whales from your future living room. Coastal Commission coastal development permit preliminary review passed.',
          address: '45100 Coastal Highway 1',
          city: 'Mendocino',
          state: 'California',
          zip_code: '95460',
          latitude: 39.3077,
          longitude: -123.7995,
          zoning_classification: 'Coastal Zone Rural Residential (C-RR)',
          road_access: true,
          water_rights: true,
          electricity: true,
          property_tax_annual: 7400,
          is_featured: true,
          cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 1101, display_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', caption: 'Ocean bluff view' }]
        },
        {
          id: 12,
          seller_id: 2,
          seller_name: 'Sarah Jenkins',
          seller_company: 'Green Acres Farmland & Land Realty',
          seller: { id: 2, username: 'sarah_land', full_name: 'Sarah Jenkins', company_name: 'Green Acres Farmland & Land Realty' },
          title: 'Subdivided 1.2-Acre Residential Lot (Sold)',
          property_type: 'residential_land',
          property_type_display: 'Residential Land',
          status: 'sold',
          price: 110000,
          area_acres: 1.2,
          area_sqft: 52272,
          description: 'Previously listed residential lot in South Hills. Successfully sold and closed through TerraTrade marketplace.',
          address: '810 South Hills Way',
          city: 'Eugene',
          state: 'Oregon',
          zip_code: '97405',
          latitude: 44.0200,
          longitude: -123.1000,
          zoning_classification: 'R-1 Single Family',
          road_access: true,
          is_featured: false,
          cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          images: [{ id: 1201, display_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', caption: 'Sold lot' }]
        }
      ],
      cartItems: [
        { id: 1, user_id: 4, property_id: 1, notes: 'Senior water rights certificate verified, ready for escrow', offer_amount: 465000 },
        { id: 2, user_id: 4, property_id: 2, notes: 'Evaluating architectural soil test report', offer_amount: 158000 }
      ],
      favorites: [
        { id: 1, user_id: 4, property_id: 1 },
        { id: 2, user_id: 4, property_id: 4 },
        { id: 3, user_id: 4, property_id: 8 }
      ],
      conversations: [
        {
          id: 1,
          buyer_id: 4,
          seller_id: 2,
          property_id: 1,
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 600000).toISOString(),
          messages: [
            {
              id: 1,
              sender_id: 4,
              content: 'Hello Sarah! I noticed the 50-acre Willamette Valley farm listing. Could you share what year the water rights permit was adjudicated and if the equipment barn has a concrete floor?',
              is_read: true,
              created_at: new Date(Date.now() - 3600000 * 4).toISOString()
            },
            {
              id: 2,
              sender_id: 2,
              content: 'Hi Alex! Yes, the senior surface water certificate dates back to 1964 and has zero curtailment history. The 6,000 sq ft barn has a 6-inch reinforced concrete slab throughout, perfect for heavy farm implements.',
              is_read: true,
              created_at: new Date(Date.now() - 3600000 * 2).toISOString()
            },
            {
              id: 3,
              sender_id: 4,
              content: 'That sounds fantastic. I have added the parcel to my shortlist and would love to arrange an on-site soil and boundary inspection next Tuesday if you have availability.',
              is_read: false,
              created_at: new Date(Date.now() - 600000).toISOString()
            }
          ]
        },
        {
          id: 2,
          buyer_id: 4,
          seller_id: 3,
          property_id: 2,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          messages: [
            {
              id: 11,
              sender_id: 4,
              content: 'Hi David, does this 2.5-acre parcel in Austin require rainwater harvesting or is city water already stubbed at the street?',
              is_read: true,
              created_at: new Date(Date.now() - 3600000 * 12).toISOString()
            },
            {
              id: 12,
              sender_id: 3,
              content: 'Hello Alex! Municipal water main is already pressurized and capped right at the curb with a standard 3/4-inch meter ready to set. No rainwater catchment required.',
              is_read: false,
              created_at: new Date(Date.now() - 3600000 * 8).toISOString()
            }
          ]
        }
      ],
      reports: [
        {
          id: 1,
          reporter_id: 4,
          property_id: 3,
          reason: 'inaccurate_info',
          description: 'The listing mentions 450 feet of frontage, but county CAD GIS map shows approximately 380 feet. Please verify boundary markers.',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };
  },

  getData() {
    const raw = localStorage.getItem('terratrade_mock_db');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const initial = this.getInitialData();
    this.saveData(initial);
    return initial;
  },

  saveData(data) {
    localStorage.setItem('terratrade_mock_db', JSON.stringify(data));
  }
};

const API = {
  // Primary Django REST Framework API Base URL
  baseUrl: window.API_BASE_URL || '/api',
  useClientStore: false, // REAL DJANGO REST API IS THE DEFAULT
  backendActive: false,

  isExplicitDevMockEnabled() {
    return window.TERRATRADE_DEV_FALLBACK === true ||
      (typeof window.location !== 'undefined' && window.location.search.includes('dev_mock=true'));
  },

  async checkBackend() {
    const bannerEl = document.getElementById('backend-status-banner');
    const bannerUrlEl = document.getElementById('banner-api-url');
    if (bannerUrlEl) bannerUrlEl.textContent = this.baseUrl;

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.django_active) {
          this.backendActive = true;
          this.useClientStore = false;
          if (bannerEl) bannerEl.classList.add('d-none');
          console.log('[TerraTrade] Connected to active Django REST API + Channels ASGI backend');
          return true;
        }
      }
    } catch {
      // Endpoint unreachable
    }

    this.backendActive = false;

    // Check if explicitly configured for isolated offline developer mock
    if (this.isExplicitDevMockEnabled()) {
      this.useClientStore = true;
      if (bannerEl) {
        bannerEl.classList.remove('d-none');
        bannerEl.classList.replace('alert-warning', 'alert-info');
        bannerEl.innerHTML = `
          <div class="container-fluid px-lg-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="small">
              <i class="bi bi-info-circle-fill text-info me-2"></i>
              <strong>Developer Mode:</strong> Running with isolated MockDB fallback enabled via <code>?dev_mock=true</code>.
            </div>
            <button class="btn btn-sm btn-outline-dark py-0 px-2 small" onclick="API.retryBackendConnection()">
              <i class="bi bi-arrow-clockwise me-1"></i> Connect to Real Django API
            </button>
          </div>
        `;
      }
      console.warn('[TerraTrade] Running in explicit isolated mock development mode (?dev_mock=true)');
      return false;
    }

    // Normal application mode: Alert user that real Django server is expected
    if (bannerEl) bannerEl.classList.remove('d-none');
    this.useClientStore = false;
    return false;
  },

  async retryBackendConnection() {
    this.showToast('Checking connection to Django ASGI backend...', 'info');
    const active = await this.checkBackend();
    if (active) {
      this.showToast('Successfully connected to Django backend!', 'success');
      window.location.reload();
    } else {
      this.showToast('Django backend is still offline. Please run ./run_django.sh to start Daphne.', 'error');
    }
  },

  getToken() {
    const token = localStorage.getItem('terratrade_token');
    // Sanitize any stale or legacy mock tokens
    if (!token || token === 'demo_token_alex' || token === 'undefined' || token === 'null' || !token.trim()) {
      localStorage.removeItem('terratrade_token');
      return null;
    }
    return token.trim();
  },

  setToken(token) {
    if (token && token !== 'demo_token_alex') {
      localStorage.setItem('terratrade_token', token.trim());
    } else {
      localStorage.removeItem('terratrade_token');
    }
  },

  getHeaders(isJson = true) {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    // Only use MockDB if explicitly enabled for isolated UI testing
    if (this.useClientStore && this.isExplicitDevMockEnabled()) {
      return this.handleFallback(endpoint, options);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const isJson = !(options.body instanceof FormData);
    const headers = { ...this.getHeaders(isJson), ...(options.headers || {}) };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 204) return null;

      // Handle 401 Unauthorized / Invalid Token
      if (response.status === 401) {
        this.setToken(null);
        if (window.Auth) {
          window.Auth.currentUser = null;
          window.Auth.updateUI();
        }
        // If checking profile on startup, treat as unauthenticated guest
        if (endpoint.includes('/accounts/profile/')) {
          return null;
        }
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Django Server Error (${response.status}): ${text.substring(0, 150)}`);
        }
        return text;
      }

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data?.error || data?.detail || (typeof data === 'object' ? JSON.stringify(data) : 'Request failed');
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      // If dev mock is explicitly activated, allow fallback
      if (this.isExplicitDevMockEnabled()) {
        console.warn(`[TerraTrade Dev Mock] Falling back for ${endpoint}:`, err);
        return this.handleFallback(endpoint, options);
      }

      // Do not log error if this was a normal unauthenticated profile check
      if (endpoint.includes('/accounts/profile/') && (err.message?.includes('Invalid token') || err.message?.includes('credentials'))) {
        return null;
      }

      console.error(`[TerraTrade Django API Error] ${url}:`, err.message || err);
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Client-side deterministic store simulation
  handleFallback(endpoint, options = {}) {
    const db = MockDB.getData();
    const method = (options.method || 'GET').toUpperCase();
    const [pathOnly, queryString] = endpoint.split('?');
    const params = new URLSearchParams(queryString || '');
    let body = {};
    if (typeof options.body === 'string') {
      try { body = JSON.parse(options.body); } catch (e) {}
    }

    const currentUserId = Auth.currentUser?.id || 4; // default alex_buyer

    // 1. Auth Profile
    if (pathOnly === '/accounts/profile/' || pathOnly === '/accounts/profile') {
      const u = db.users.find(x => x.id === currentUserId) || db.users[3];
      if (method === 'PUT' || method === 'PATCH') {
        Object.assign(u, body);
        MockDB.saveData(db);
        return { message: 'Profile updated', user: u };
      }
      return u;
    }

    // 2. Auth Login
    if (pathOnly === '/accounts/login/' || pathOnly === '/accounts/login') {
      const user = db.users.find(u => u.username === body.username) || db.users[3];
      return { token: `token_${user.username}`, user };
    }

    // 3. Featured properties
    if (pathOnly === '/properties/featured/' || pathOnly === '/properties/featured') {
      return db.properties.filter(p => p.is_featured && p.status === 'published');
    }

    // 4. Properties Search & List
    if (pathOnly === '/properties/' || pathOnly === '/properties') {
      let list = [...db.properties.filter(p => p.status === 'published')];

      const q = params.get('q');
      if (q) {
        const lower = q.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower) || p.city.toLowerCase().includes(lower));
      }

      const pType = params.get('property_type');
      if (pType) list = list.filter(p => p.property_type === pType);

      const loc = params.get('location');
      if (loc) {
        const lower = loc.toLowerCase();
        list = list.filter(p => p.city.toLowerCase().includes(lower) || p.state.toLowerCase().includes(lower) || (p.zip_code && p.zip_code.includes(lower)));
      }

      const minP = parseFloat(params.get('min_price'));
      if (!isNaN(minP)) list = list.filter(p => p.price >= minP);

      const maxP = parseFloat(params.get('max_price'));
      if (!isNaN(maxP)) list = list.filter(p => p.price <= maxP);

      const minA = parseFloat(params.get('min_area'));
      if (!isNaN(minA)) list = list.filter(p => (p.area_acres || 0) >= minA);

      const maxA = parseFloat(params.get('max_area'));
      if (!isNaN(maxA)) list = list.filter(p => (p.area_acres || 0) <= maxA);

      const beds = parseInt(params.get('bedrooms'));
      if (!isNaN(beds)) list = list.filter(p => (p.bedrooms || 0) >= beds);

      const lat = parseFloat(params.get('lat'));
      const lng = parseFloat(params.get('lng'));
      if (!isNaN(lat) && !isNaN(lng)) {
        list.forEach(p => {
          if (p.latitude && p.longitude) {
            const dLat = (p.latitude - lat) * (Math.PI / 180);
            const dLng = (p.longitude - lng) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * (Math.PI / 180)) * Math.cos(p.latitude * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            p.distance_km = Math.round(6371 * c);
          } else {
            p.distance_km = null;
          }
        });
        list.sort((a, b) => (a.distance_km || 99999) - (b.distance_km || 99999));
      }

      const sortBy = params.get('sort_by');
      if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sortBy === 'area_desc') list.sort((a, b) => (b.area_acres || 0) - (a.area_acres || 0));

      return { count: list.length, results: list };
    }

    // 5. Property Detail
    const detailMatch = pathOnly.match(/^\/properties\/(\d+)\/?$/);
    if (detailMatch) {
      const pId = parseInt(detailMatch[1]);
      const p = db.properties.find(x => x.id === pId) || db.properties[0];
      return p;
    }

    // 6. Seller Listings
    if (pathOnly.startsWith('/properties/seller/listings/')) {
      const sub = pathOnly.replace('/properties/seller/listings/', '').replace(/\/$/, '');
      if (sub === '') {
        if (method === 'POST') {
          const newProp = {
            id: Date.now(),
            seller_id: currentUserId,
            seller_name: Auth.currentUser?.full_name || 'Seller',
            ...body,
            cover_image: (body.images_urls && body.images_urls[0]) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
            images: (body.images_urls || []).map((url, i) => ({ id: i + 1, display_url: url }))
          };
          db.properties.unshift(newProp);
          MockDB.saveData(db);
          return newProp;
        }
        return db.properties.filter(p => p.seller_id === currentUserId || Auth.currentUser?.is_seller);
      }

      const pId = parseInt(sub.split('/')[0]);
      const target = db.properties.find(x => x.id === pId);
      if (sub.endsWith('/publish/')) {
        if (target) target.status = 'published';
        MockDB.saveData(db);
        return { message: 'Listing published' };
      }
      if (sub.endsWith('/unpublish/')) {
        if (target) target.status = 'unpublished';
        MockDB.saveData(db);
        return { message: 'Listing unpublished' };
      }
      if (sub.endsWith('/mark_sold/')) {
        if (target) target.status = 'sold';
        MockDB.saveData(db);
        return { message: 'Listing marked as sold' };
      }
      if (method === 'DELETE') {
        db.properties = db.properties.filter(x => x.id !== pId);
        MockDB.saveData(db);
        return { message: 'Listing deleted' };
      }
      if (method === 'PUT' || method === 'PATCH') {
        if (target) Object.assign(target, body);
        MockDB.saveData(db);
        return target;
      }
      return target || db.properties[0];
    }

    // 7. Cart
    if (pathOnly === '/cart/' || pathOnly === '/cart') {
      const items = db.cartItems.map(item => {
        const p = db.properties.find(prop => prop.id === item.property_id) || db.properties[0];
        return { ...item, property: p };
      });
      const total = items.reduce((acc, curr) => acc + (curr.property?.price || 0), 0);
      return { item_count: items.length, total_value: total, items };
    }

    if (pathOnly === '/cart/items/' || pathOnly === '/cart/items') {
      const exists = db.cartItems.some(i => i.property_id === body.property_id);
      if (!exists) {
        db.cartItems.push({ id: Date.now(), user_id: currentUserId, property_id: body.property_id, notes: body.notes || '', offer_amount: body.offer_amount || null });
        MockDB.saveData(db);
      }
      return { message: exists ? 'Property is already in consideration cart' : 'Added to consideration cart' };
    }

    const cartItemMatch = pathOnly.match(/^\/cart\/items\/(\d+)\/?$/);
    if (cartItemMatch) {
      const id = parseInt(cartItemMatch[1]);
      if (method === 'DELETE') {
        db.cartItems = db.cartItems.filter(i => i.id !== id);
        MockDB.saveData(db);
        return { message: 'Removed from consideration cart' };
      }
      if (method === 'PATCH') {
        const item = db.cartItems.find(i => i.id === id);
        if (item) Object.assign(item, body);
        MockDB.saveData(db);
        return { message: 'Cart item updated' };
      }
    }

    if (pathOnly === '/cart/clear/' || pathOnly === '/cart/clear') {
      db.cartItems = [];
      MockDB.saveData(db);
      return { message: 'Cart cleared' };
    }

    if (pathOnly === '/cart/inquire/' || pathOnly === '/cart/inquire') {
      return { message: 'Inquiries sent to all shortlisted property sellers!' };
    }

    // 8. Favorites
    if (pathOnly === '/favorites/' || pathOnly === '/favorites') {
      return db.favorites.map(f => {
        const p = db.properties.find(prop => prop.id === f.property_id) || db.properties[0];
        return { id: f.id, property: p };
      });
    }

    if (pathOnly === '/favorites/toggle/' || pathOnly === '/favorites/toggle') {
      const idx = db.favorites.findIndex(f => f.property_id === body.property_id);
      let isFav = false;
      if (idx >= 0) {
        db.favorites.splice(idx, 1);
        isFav = false;
      } else {
        db.favorites.push({ id: Date.now(), user_id: currentUserId, property_id: body.property_id });
        isFav = true;
      }
      MockDB.saveData(db);
      return { is_favorite: isFav, message: isFav ? 'Saved to favorites' : 'Removed from favorites' };
    }

    const favCheckMatch = pathOnly.match(/^\/favorites\/check\/(\d+)\/?$/);
    if (favCheckMatch) {
      const pId = parseInt(favCheckMatch[1]);
      const isFav = db.favorites.some(f => f.property_id === pId);
      return { is_favorite: isFav };
    }

    // 9. Chat
    if (pathOnly === '/chat/conversations/' || pathOnly === '/chat/conversations') {
      if (method === 'POST') {
        const p = db.properties.find(x => x.id === body.property_id) || db.properties[0];
        const newConv = {
          id: Date.now(),
          buyer_id: currentUserId,
          seller_id: p.seller_id,
          property_id: p.id,
          created_at: new Date().toISOString(),
          messages: [
            { id: Date.now(), sender_id: currentUserId, content: body.message || 'Hello, I am interested in this listing.', is_read: false, created_at: new Date().toISOString() }
          ]
        };
        db.conversations.unshift(newConv);
        MockDB.saveData(db);
        return newConv;
      }

      return db.conversations.map(conv => {
        const otherId = conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;
        const other = db.users.find(u => u.id === otherId) || db.users[1];
        const prop = db.properties.find(p => p.id === conv.property_id);
        const lastMsg = conv.messages[conv.messages.length - 1];
        return {
          ...conv,
          other_participant: other,
          property: prop,
          last_message: lastMsg,
          unread_count: conv.messages.filter(m => !m.is_read && m.sender_id !== currentUserId).length
        };
      });
    }

    const convMsgMatch = pathOnly.match(/^\/chat\/conversations\/(\d+)\/messages\/?$/);
    if (convMsgMatch) {
      const convId = parseInt(convMsgMatch[1]);
      const conv = db.conversations.find(c => c.id === convId);
      if (conv) {
        if (method === 'POST') {
          const newMsg = {
            id: Date.now(),
            sender_id: currentUserId,
            content: body.content,
            is_read: false,
            created_at: new Date().toISOString(),
            is_me: true
          };
          conv.messages.push(newMsg);
          MockDB.saveData(db);
          return newMsg;
        }
        return conv.messages.map(m => ({ ...m, is_me: m.sender_id === currentUserId }));
      }
      return [];
    }

    // 10. Reports
    if (pathOnly === '/reports/' || pathOnly === '/reports') {
      db.reports.push({ id: Date.now(), reporter_id: currentUserId, reason: body.reason, description: body.description, property_id: body.property_id, status: 'pending' });
      MockDB.saveData(db);
      return { message: 'Report submitted successfully. Moderation team will review.' };
    }

    // 11. Admin
    if (pathOnly === '/admin/stats/' || pathOnly === '/admin/stats') {
      return {
        stats: {
          total_users: db.users.length,
          total_sellers: db.users.filter(u => u.is_seller).length,
          total_buyers: db.users.filter(u => !u.is_seller).length,
          total_properties: db.properties.length,
          active_properties: db.properties.filter(p => p.status === 'published').length,
          pending_properties: db.properties.filter(p => p.status === 'pending').length,
          sold_properties: db.properties.filter(p => p.status === 'sold').length,
          rejected_properties: db.properties.filter(p => p.status === 'rejected').length,
          total_reports: db.reports.length,
          pending_reports: db.reports.filter(r => r.status === 'pending').length,
          total_messages: 24
        },
        recent_users: db.users.slice(0, 5),
        recent_properties: db.properties.slice(0, 5),
        recent_reports: db.reports.slice(0, 5)
      };
    }

    if (pathOnly === '/admin/users/' || pathOnly === '/admin/users') {
      return db.users;
    }

    if (pathOnly === '/admin/properties/' || pathOnly === '/admin/properties') {
      return db.properties;
    }

    if (pathOnly === '/admin/reports/' || pathOnly === '/admin/reports') {
      return db.reports.map(r => ({
        ...r,
        property_data: db.properties.find(p => p.id === r.property_id),
        reporter: db.users.find(u => u.id === r.reporter_id)
      }));
    }

    const adminUserMatch = pathOnly.match(/^\/admin\/users\/(\d+)\/?$/);
    if (adminUserMatch) {
      const u = db.users.find(x => x.id === parseInt(adminUserMatch[1]));
      if (u && body.is_active !== undefined) u.is_active = body.is_active;
      MockDB.saveData(db);
      return { message: 'User updated' };
    }

    const adminPropMatch = pathOnly.match(/^\/admin\/properties\/(\d+)\/?$/);
    if (adminPropMatch) {
      const p = db.properties.find(x => x.id === parseInt(adminPropMatch[1]));
      if (method === 'DELETE') {
        db.properties = db.properties.filter(x => x.id !== parseInt(adminPropMatch[1]));
        MockDB.saveData(db);
        return { message: 'Property deleted' };
      }
      if (p) Object.assign(p, body);
      MockDB.saveData(db);
      return { message: 'Property updated' };
    }

    const adminReportMatch = pathOnly.match(/^\/admin\/reports\/(\d+)\/?$/);
    if (adminReportMatch) {
      const r = db.reports.find(x => x.id === parseInt(adminReportMatch[1]));
      if (r && body.status) r.status = body.status;
      MockDB.saveData(db);
      return { message: 'Report updated' };
    }

    return {};
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' : type === 'error' ? 'bg-danger text-white' : 'bg-primary text-white';
    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-octagon-fill' : 'bi-info-circle-fill';

    const html = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${icon}"></i>
            <span>${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
      const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
      toast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
  }
};

window.API = API;
